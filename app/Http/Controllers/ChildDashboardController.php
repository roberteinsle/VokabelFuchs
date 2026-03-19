<?php

namespace App\Http\Controllers;

use App\Enums\MediaTimeType;
use App\Models\Child;
use App\Models\MediaTimeRule;
use App\Services\LeitnerService;
use App\Services\MediaTimeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChildDashboardController extends Controller
{
    public function __construct(
        private LeitnerService $leitner,
        private MediaTimeService $mediaTime,
    ) {}

    public function index(Request $request): Response
    {
        $child = Child::findOrFail($request->session()->get('child_id'));

        $dueCount = $this->leitner->getDueCards($child->id)->count();
        $modeStats = $this->leitner->getDrawerStatsByMode($child->id);

        $modes = [
            'multiple_choice' => ['label' => 'Auswählen',         'due' => $this->leitner->getDueCards($child->id, null, 'multiple_choice')->count()],
            'free_text' => ['label' => 'Schreiben',         'due' => $this->leitner->getDueCards($child->id, null, 'free_text')->count()],
            'dictation' => ['label' => 'Hören & Schreiben', 'due' => $this->leitner->getDueCards($child->id, null, 'dictation')->count()],
        ];

        $rule = MediaTimeRule::where('parent_id', $child->parent_id)->first();
        $dailyCapGaming = $rule?->daily_cap_gaming ?? 60;
        $dailyCapYoutube = $rule?->daily_cap_youtube ?? 45;

        $todayEarnedGaming = $this->mediaTime->getTodayEarned($child->id, MediaTimeType::GAMING);
        $todayEarnedYoutube = $this->mediaTime->getTodayEarned($child->id, MediaTimeType::YOUTUBE);

        $languagePairs = $child->tags()
            ->join('vocabulary_lists', 'tags.vocabulary_list_id', '=', 'vocabulary_lists.id')
            ->distinct()
            ->pluck('vocabulary_lists.language_pair')
            ->filter()
            ->values()
            ->map(fn ($lp) => is_string($lp) ? $lp : $lp->value)
            ->all();

        return Inertia::render('Child/Home', [
            'child' => $child->only('id', 'name', 'username', 'language_pair'),
            'language_pairs' => $languagePairs,
            'mode_stats' => $modeStats,
            'mode_meta' => $modes,
            'due_count' => $dueCount,
            'balance_gaming' => $child->media_time_balance_gaming,
            'balance_youtube' => $child->media_time_balance_youtube,
            'daily_cap_gaming' => $dailyCapGaming,
            'daily_cap_youtube' => $dailyCapYoutube,
            'today_earned_gaming' => $todayEarnedGaming,
            'today_earned_youtube' => $todayEarnedYoutube,
            'current_streak' => $child->current_streak ?? 0,
        ]);
    }
}
