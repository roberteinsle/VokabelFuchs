<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\FlashCard;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StatisticsController extends Controller
{
    public function child(Request $request, Child $child): Response
    {
        if ($child->parent_id !== $request->user()->id) {
            abort(403);
        }

        return Inertia::render('Statistics/ChildProgress', [
            'child'      => $child->only('id', 'name'),
            'stats'      => $this->buildStats($child->id),
        ]);
    }

    public function ownStats(Request $request): Response
    {
        $childId = $request->session()->get('child_id');
        $child   = Child::findOrFail($childId);

        return Inertia::render('Statistics/OwnStats', [
            'child' => $child->only('id', 'name'),
            'stats' => $this->buildStats($childId),
        ]);
    }

    private function buildStats(int $childId): array
    {
        $sessions = \App\Models\TrainingSession::where('child_id', $childId)
            ->whereNotNull('ended_at')
            ->latest('ended_at')
            ->limit(30)
            ->get();

        $drawerCounts = FlashCard::where('child_id', $childId)
            ->selectRaw('drawer, COUNT(*) as count')
            ->groupBy('drawer')
            ->pluck('count', 'drawer')
            ->toArray();

        $totalCards    = array_sum($drawerCounts);
        $masteredCards = $drawerCounts[5] ?? 0;

        $totalMinutes = $sessions->sum(fn ($s) => $s->getDurationMinutes());
        $totalCorrect = $sessions->sum('cards_correct');
        $totalWrong   = $sessions->sum('cards_wrong');
        $totalAnswers = $totalCorrect + $totalWrong;

        return [
            'drawer_counts'       => $drawerCounts,
            'total_cards'         => $totalCards,
            'mastered_cards'      => $masteredCards,
            'total_minutes'       => $totalMinutes,
            'accuracy_percent'    => $totalAnswers > 0 ? round(($totalCorrect / $totalAnswers) * 100) : 0,
            'sessions_count'      => $sessions->count(),
            'recent_sessions'     => $sessions->take(7)->map(fn ($s) => [
                'date'    => $s->ended_at->format('d.m.'),
                'minutes' => $s->getDurationMinutes(),
                'correct' => $s->cards_correct,
                'wrong'   => $s->cards_wrong,
            ]),
        ];
    }
}
