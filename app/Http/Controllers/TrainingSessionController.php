<?php

namespace App\Http\Controllers;

use App\Enums\LanguagePair;
use App\Enums\TrainingMode;
use App\Models\Child;
use App\Models\TrainingSession;
use App\Services\LevenshteinService;
use App\Services\LeitnerService;
use App\Services\MediaTimeService;
use App\Services\TrainingService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrainingSessionController extends Controller
{
    public function __construct(
        private LeitnerService $leitner,
        private TrainingService $training,
        private LevenshteinService $levenshtein,
        private MediaTimeService $mediaTime,
    ) {}

    public function index(Request $request): Response
    {
        $child = Child::findOrFail($request->session()->get('child_id'));

        // Get clusters the child is assigned to
        $assignedTags = $child->tags()->with('vocabularyList:id,name,language_pair')->get();

        $clusters = $assignedTags->map(function ($tag) use ($child) {
            $dueCount = $this->leitner->getDueCards($child->id, [$tag->id])->count();
            return [
                'tag_id'        => $tag->id,
                'tag_name'      => $tag->name,
                'fach_name'     => $tag->vocabularyList?->name,
                'language_pair' => $tag->vocabularyList?->language_pair?->value,
                'due_count'     => $dueCount,
            ];
        });

        $totalDue = $this->leitner->getDueCards($child->id)->count();

        return Inertia::render('Training/Index', [
            'child'          => $child,
            'due_count'      => $totalDue,
            'clusters'       => $clusters,
            'training_modes' => collect(TrainingMode::cases())->map(fn ($m) => [
                'value' => $m->value,
                'label' => $m->label(),
            ]),
        ]);
    }

    public function start(Request $request): RedirectResponse
    {
        $request->validate([
            'training_mode' => ['required', 'string', 'in:' . implode(',', array_column(TrainingMode::cases(), 'value'))],
            'tag_id'        => ['nullable', 'integer', 'exists:tags,id'],
        ]);

        $child = Child::findOrFail($request->session()->get('child_id'));

        // Derive language_pair from selected cluster's Fach, or fall back to child's setting
        $tagId = $request->input('tag_id');
        if ($tagId) {
            $tag = \App\Models\Tag::with('vocabularyList')->find($tagId);
            $languagePair = $tag?->vocabularyList?->language_pair?->value
                ?? $child->language_pair?->value
                ?? \App\Enums\LanguagePair::DE_EN->value;
        } else {
            $languagePair = $child->language_pair?->value ?? \App\Enums\LanguagePair::DE_EN->value;
        }

        $session = TrainingSession::create([
            'child_id'      => $child->id,
            'language_pair' => $languagePair,
            'training_mode' => $request->training_mode,
            'tag_id'        => $tagId,
            'started_at'    => now(),
        ]);

        return redirect()->route('child.training.show', $session->id);
    }

    public function show(Request $request, TrainingSession $session): Response|RedirectResponse
    {
        $childId = $request->session()->get('child_id');

        if ($session->child_id !== $childId) {
            abort(403);
        }

        if ($session->isFinished()) {
            return redirect()->route('child.training.summary', $session->id);
        }

        $tagFilter = $session->tag_id ? [$session->tag_id] : null;
        $dueCards = $this->leitner->getDueCards($childId, $tagFilter);

        // Exclude cards already answered in this session
        $answeredCardIds = $session->results()->pluck('flash_card_id')->toArray();
        $remaining = $dueCards->whereNotIn('id', $answeredCardIds)->values();

        if ($remaining->isEmpty()) {
            return redirect()->route('child.training.finish', $session->id)
                ->withMethod('POST');
        }

        $currentCard = $remaining->first();
        $langPair    = $session->language_pair;
        $question    = $this->training->buildQuestion(
            $currentCard,
            $langPair->sourceLang(),
            $langPair->targetLang(),
            $session->training_mode->value,
        );

        return Inertia::render('Training/Session', [
            'session'         => $session->only('id', 'training_mode', 'started_at', 'cards_correct', 'cards_wrong'),
            'question'        => $question,
            'cards_remaining' => $remaining->count(),
            'cards_total'     => $dueCards->count(),
        ]);
    }

    public function answer(Request $request, TrainingSession $session): RedirectResponse
    {
        $childId = $request->session()->get('child_id');

        if ($session->child_id !== $childId || $session->isFinished()) {
            abort(403);
        }

        $request->validate([
            'flash_card_id' => ['required', 'integer'],
            'answer'        => ['nullable', 'string', 'max:255'],
            'mode'          => ['required', 'string'],
            'target_lang'   => ['required', 'string', 'in:en,fr'],
        ]);

        $card = \App\Models\FlashCard::where('id', $request->flash_card_id)
            ->where('child_id', $childId)
            ->firstOrFail();

        $correctAnswer = $card->vocabulary->getWordForLang($request->target_lang);
        $userAnswer    = $request->answer ?? '';

        $isCorrect = match ($request->mode) {
            'multiple_choice' => mb_strtolower(trim($userAnswer)) === mb_strtolower(trim($correctAnswer ?? '')),
            'free_text'       => $this->levenshtein->isAcceptable($userAnswer, $correctAnswer ?? ''),
            default           => false,
        };

        $drawerBefore = $card->drawer;
        $drawerAfter  = $this->leitner->moveCard($card, $isCorrect);

        $session->results()->create([
            'flash_card_id' => $card->id,
            'was_correct'   => $isCorrect,
            'answer_given'  => $userAnswer,
            'drawer_before' => $drawerBefore,
            'drawer_after'  => $drawerAfter,
        ]);

        if ($isCorrect) {
            $session->increment('cards_correct');
        } else {
            $session->increment('cards_wrong');
        }

        return redirect()->route('child.training.show', $session->id)->with([
            'last_answer_correct'  => $isCorrect,
            'last_correct_answer'  => $correctAnswer,
            'last_answer_given'    => $userAnswer,
        ]);
    }

    public function finish(Request $request, TrainingSession $session): RedirectResponse
    {
        $childId = $request->session()->get('child_id');

        if ($session->child_id !== $childId) {
            abort(403);
        }

        if (! $session->isFinished()) {
            $session->update(['ended_at' => now()]);

            // Credit media time
            $credited = $this->mediaTime->creditFromSession($session->fresh()->load('child'));
            $session->update([
                'media_time_earned_gaming'  => $credited['gaming'],
                'media_time_earned_youtube' => $credited['youtube'],
            ]);
        }

        return redirect()->route('child.training.summary', $session->id);
    }

    public function summary(Request $request, TrainingSession $session): Response
    {
        $childId = $request->session()->get('child_id');

        if ($session->child_id !== $childId) {
            abort(403);
        }

        $session->load('results.flashCard.vocabulary');

        return Inertia::render('Training/Summary', [
            'session' => [
                'id'                         => $session->id,
                'cards_correct'              => $session->cards_correct,
                'cards_wrong'                => $session->cards_wrong,
                'duration_minutes'           => $session->getDurationMinutes(),
                'media_time_earned_gaming'   => $session->media_time_earned_gaming,
                'media_time_earned_youtube'  => $session->media_time_earned_youtube,
            ],
        ]);
    }
}
