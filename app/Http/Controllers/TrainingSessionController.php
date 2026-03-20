<?php

namespace App\Http\Controllers;

use App\Enums\LanguagePair;
use App\Enums\TrainingMode;
use App\Models\Child;
use App\Models\FlashCard;
use App\Models\Tag;
use App\Models\TrainingSession;
use App\Services\LeitnerService;
use App\Services\LevenshteinService;
use App\Services\MediaTimeService;
use App\Services\TrainingService;
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
        $modes = array_column(TrainingMode::cases(), 'value');

        $clusters = $assignedTags->map(function ($tag) use ($child, $modes) {
            $dueByMode = collect($modes)->mapWithKeys(fn ($m) => [$m => $this->leitner->getDueCards($child->id, [$tag->id], $m)->count()]
            )->toArray();

            return [
                'tag_id' => $tag->id,
                'tag_name' => $tag->name,
                'fach_name' => $tag->vocabularyList?->name,
                'language_pair' => $tag->vocabularyList?->language_pair?->value,
                'due_by_mode' => $dueByMode,
            ];
        });

        $totalDueByMode = collect($modes)->mapWithKeys(fn ($m) => [$m => $this->leitner->getDueCards($child->id, null, $m)->count()]
        )->toArray();

        return Inertia::render('Training/Index', [
            'child' => $child,
            'due_by_mode' => $totalDueByMode,
            'clusters' => $clusters,
            'training_modes' => collect(TrainingMode::cases())->map(fn ($m) => [
                'value' => $m->value,
                'label' => $m->label(),
            ]),
        ]);
    }

    public function start(Request $request): RedirectResponse
    {
        $request->validate([
            'training_mode' => ['required', 'string', 'in:'.implode(',', array_column(TrainingMode::cases(), 'value'))],
            'tag_id' => ['nullable', 'integer', 'exists:tags,id'],
            'direction' => ['nullable', 'string', 'in:forward,backward'],
            'drawers' => ['nullable', 'array'],
            'drawers.*' => ['integer', 'between:1,5'],
        ]);

        $child = Child::findOrFail($request->session()->get('child_id'));

        // Derive language_pair from selected cluster's Fach, or fall back to child's setting
        $tagId = $request->input('tag_id');
        if ($tagId) {
            $tag = Tag::with('vocabularyList')->find($tagId);
            $languagePair = $tag?->vocabularyList?->language_pair?->value
                ?? $child->language_pair?->value
                ?? LanguagePair::DE_EN->value;
        } else {
            $languagePair = $child->language_pair?->value ?? LanguagePair::DE_EN->value;
        }

        $session = TrainingSession::create([
            'child_id' => $child->id,
            'language_pair' => $languagePair,
            'training_mode' => $request->training_mode,
            'tag_id' => $tagId,
            'direction' => $request->input('direction', 'forward'),
            'started_at' => now(),
        ]);

        $drawers = array_filter(array_map('intval', $request->input('drawers', [])));
        $request->session()->put("training_drawers_{$session->id}", array_values($drawers));

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
        $mode = $session->training_mode->value;
        $drawers = $request->session()->get("training_drawers_{$session->id}", []);
        $dueCards = $this->leitner->getDueCards($childId, $tagFilter, $mode, ! empty($drawers) ? $drawers : null);

        // Exclude cards already answered or skipped in this session
        $answeredCardIds = $session->results()->pluck('flash_card_id')->toArray();
        $skippedCardIds = $request->session()->get("training_skipped_{$session->id}", []);
        $remaining = $dueCards->whereNotIn('id', array_merge($answeredCardIds, $skippedCardIds))->values();

        if ($remaining->isEmpty()) {
            if (! $session->isFinished()) {
                $session->update(['ended_at' => now()]);
                $freshSession = $session->fresh()->load('child');
                $credited = $this->mediaTime->creditFromSession($freshSession);
                $session->update([
                    'media_time_earned_gaming' => $credited['gaming'],
                    'media_time_earned_youtube' => $credited['youtube'],
                ]);

                // Update streak
                $this->mediaTime->updateStreak($freshSession->child);
            }

            return redirect()->route('child.training.summary', $session->id);
        }

        $currentCard = $remaining->first();
        $langPair = $session->language_pair;
        $backward = ($session->direction ?? 'forward') === 'backward';
        $sourceLang = $backward ? $langPair->targetLang() : $langPair->sourceLang();
        $targetLang = $backward ? $langPair->sourceLang() : $langPair->targetLang();

        $question = $this->training->buildQuestion(
            $currentCard,
            $sourceLang,
            $targetLang,
            $session->training_mode->value,
        );

        return Inertia::render('Training/Session', [
            'session' => $session->only('id', 'training_mode', 'started_at', 'cards_correct', 'cards_wrong'),
            'question' => $question,
            'cards_remaining' => $remaining->count(),
            'cards_total' => $dueCards->count(),
            'last_result' => session()->has('last_answer_correct') ? [
                'correct' => session('last_answer_correct'),
                'correct_answer' => session('last_correct_answer'),
                'given_answer' => session('last_answer_given'),
            ] : null,
            'media_per_answer' => session('media_per_answer'),
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
            'answer' => ['nullable', 'string', 'max:255'],
            'mode' => ['required', 'string'],
            'target_lang' => ['required', 'string', 'in:de,en,fr'],
            'source_lang' => ['nullable', 'string', 'in:de,en,fr'],
        ]);

        $card = FlashCard::where('id', $request->flash_card_id)
            ->where('child_id', $childId)
            ->firstOrFail();

        $userAnswer = $request->answer ?? '';

        $correctAnswer = $card->vocabulary->getWordForLang($request->target_lang);

        $isCorrect = match ($request->mode) {
            'multiple_choice' => mb_strtolower(trim($userAnswer)) === mb_strtolower(trim($correctAnswer ?? '')),
            'free_text', 'dictation' => $this->levenshtein->isAcceptable($userAnswer, $correctAnswer ?? ''),
            default => false,
        };

        $drawerBefore = $card->drawer;
        $drawerAfter = $this->leitner->moveCard($card, $isCorrect);

        $session->results()->create([
            'flash_card_id' => $card->id,
            'was_correct' => $isCorrect,
            'answer_given' => $userAnswer,
            'drawer_before' => $drawerBefore,
            'drawer_after' => $drawerAfter,
        ]);

        if ($isCorrect) {
            $session->increment('cards_correct');
        } else {
            $session->increment('cards_wrong');
        }

        $mediaPerAnswer = null;
        if ($isCorrect) {
            $mediaPerAnswer = $this->mediaTime->previewPerAnswer($request->mode, $session->child->parent_id);
        }

        return redirect()->route('child.training.show', $session->id)->with([
            'last_answer_correct' => $isCorrect,
            'last_correct_answer' => $correctAnswer,
            'last_answer_given' => $userAnswer,
            'media_per_answer' => $mediaPerAnswer,
        ]);
    }

    public function resetMode(Request $request): RedirectResponse
    {
        $childId = $request->session()->get('child_id');
        $request->validate(['mode' => ['required', 'string', 'in:multiple_choice,free_text,dictation']]);
        $this->leitner->resetToDrawer1($childId, $request->mode);

        return back()->with('success', 'Karteikasten zurückgesetzt.');
    }

    public function skip(Request $request, TrainingSession $session): RedirectResponse
    {
        $childId = $request->session()->get('child_id');

        if ($session->child_id !== $childId || $session->isFinished()) {
            abort(403);
        }

        $request->validate(['flash_card_id' => ['required', 'integer']]);

        $key = "training_skipped_{$session->id}";
        $skipped = $request->session()->get($key, []);
        $skipped[] = (int) $request->flash_card_id;
        $request->session()->put($key, array_unique($skipped));

        return redirect()->route('child.training.show', $session->id);
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
                'media_time_earned_gaming' => $credited['gaming'],
                'media_time_earned_youtube' => $credited['youtube'],
            ]);

            // Update streak
            $this->mediaTime->updateStreak($session->child);
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
                'id' => $session->id,
                'cards_correct' => $session->cards_correct,
                'cards_wrong' => $session->cards_wrong,
                'duration_minutes' => $session->getDurationMinutes(),
                'media_time_earned_gaming' => $session->media_time_earned_gaming,
                'media_time_earned_youtube' => $session->media_time_earned_youtube,
            ],
        ]);
    }
}
