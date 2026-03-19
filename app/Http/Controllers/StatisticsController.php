<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\FlashCard;
use App\Models\Tag;
use App\Models\TrainingSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StatisticsController extends Controller
{
    public function child(Request $request, string $childName): Response
    {
        $child = Child::where('parent_id', $request->user()->id)
            ->where('name', $childName)
            ->firstOrFail();

        return Inertia::render('Statistics/ChildProgress', [
            'child'           => $child->only('id', 'name'),
            'stats'           => $this->buildStats($child->id),
            'balance_gaming'  => $child->media_time_balance_gaming,
            'balance_youtube' => $child->media_time_balance_youtube,
        ]);
    }

    public function ownStats(Request $request): Response
    {
        $childId = $request->session()->get('child_id');
        $child = Child::findOrFail($childId);

        return Inertia::render('Statistics/OwnStats', [
            'child' => $child->only('id', 'name'),
            'stats' => $this->buildStats($childId),
        ]);
    }

    private function buildStats(int $childId): array
    {
        $sessions = TrainingSession::where('child_id', $childId)
            ->whereNotNull('ended_at')
            ->with('tag.vocabularyList')
            ->latest('ended_at')
            ->limit(50)
            ->get();

        $drawerCounts = FlashCard::where('child_id', $childId)
            ->selectRaw('drawer, COUNT(*) as count')
            ->groupBy('drawer')
            ->pluck('count', 'drawer')
            ->toArray();

        $drawerCountsByMode = FlashCard::where('child_id', $childId)
            ->selectRaw('training_mode, drawer, COUNT(*) as count')
            ->groupBy('training_mode', 'drawer')
            ->get()
            ->groupBy('training_mode')
            ->map(fn ($items) => $items->pluck('count', 'drawer')->toArray())
            ->toArray();

        $totalCards = array_sum($drawerCounts);
        $masteredCards = $drawerCounts[5] ?? 0;

        $totalMinutes = $sessions->sum(fn ($s) => $s->getDurationMinutes());
        $totalCorrect = $sessions->sum('cards_correct');
        $totalWrong = $sessions->sum('cards_wrong');
        $totalAnswers = $totalCorrect + $totalWrong;

        // Training log (most recent 30 sessions)
        $trainingLog = $sessions->take(30)->map(fn ($s) => [
            'date' => $s->ended_at->format('d.m.Y'),
            'start_time' => $s->started_at->format('H:i'),
            'end_time' => $s->ended_at->format('H:i'),
            'minutes' => $s->getDurationMinutes(),
            'correct' => $s->cards_correct,
            'wrong' => $s->cards_wrong,
            'cluster' => $s->tag?->name,
            'fach' => $s->tag?->vocabularyList?->name,
            'mode' => $s->training_mode,
        ]);

        // Per-cluster statistics
        $clusterStats = Tag::whereHas('children', fn ($q) => $q->where('child_id', $childId))
            ->with('vocabularyList:id,name')
            ->get()
            ->map(function (Tag $tag) use ($childId) {
                $tagSessions = TrainingSession::where('child_id', $childId)
                    ->where('tag_id', $tag->id)
                    ->whereNotNull('ended_at')
                    ->get();

                $correct = $tagSessions->sum('cards_correct');
                $wrong = $tagSessions->sum('cards_wrong');
                $total = $correct + $wrong;

                $cardCount = FlashCard::where('child_id', $childId)
                    ->whereHas('vocabulary.tags', fn ($q) => $q->where('tags.id', $tag->id))
                    ->count();

                return [
                    'tag_id' => $tag->id,
                    'tag_name' => $tag->name,
                    'fach_name' => $tag->vocabularyList?->name,
                    'sessions' => $tagSessions->count(),
                    'accuracy' => $total > 0 ? round(($correct / $total) * 100) : null,
                    'card_count' => $cardCount,
                    'last_trained' => $tagSessions->max('ended_at')?->format('d.m.Y'),
                ];
            });

        return [
            'drawer_counts' => $drawerCounts,
            'drawer_counts_by_mode' => $drawerCountsByMode,
            'total_cards' => $totalCards,
            'mastered_cards' => $masteredCards,
            'total_minutes' => $totalMinutes,
            'accuracy_percent' => $totalAnswers > 0 ? round(($totalCorrect / $totalAnswers) * 100) : 0,
            'sessions_count' => $sessions->count(),
            'recent_sessions' => $sessions->take(7)->map(fn ($s) => [
                'date' => $s->ended_at->format('d.m.'),
                'start_time' => $s->started_at->format('H:i'),
                'end_time' => $s->ended_at->format('H:i'),
                'minutes' => $s->getDurationMinutes(),
                'correct' => $s->cards_correct,
                'wrong' => $s->cards_wrong,
            ]),
            'training_log' => $trainingLog,
            'cluster_stats' => $clusterStats,
        ];
    }
}
