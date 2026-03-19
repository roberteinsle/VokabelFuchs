<?php

namespace App\Http\Controllers;

use App\Models\FlashCard;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParentDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $children = $user->children()->with('flashCards')->orderBy('name')->get();

        $childStats = $children->map(function ($child) {
            $drawerCounts = FlashCard::where('child_id', $child->id)
                ->selectRaw('drawer, COUNT(*) as count')
                ->groupBy('drawer')
                ->pluck('count', 'drawer')
                ->toArray();

            $drawerCountsByMode = FlashCard::where('child_id', $child->id)
                ->selectRaw('training_mode, drawer, COUNT(*) as count')
                ->groupBy('training_mode', 'drawer')
                ->get()
                ->groupBy('training_mode')
                ->map(fn ($items) => $items->pluck('count', 'drawer')->toArray())
                ->toArray();

            $lastSession = $child->trainingSessions()
                ->whereNotNull('ended_at')
                ->latest('ended_at')
                ->first();

            return [
                'id' => $child->id,
                'name' => $child->name,
                'language_pair' => $child->language_pair?->label(),
                'drawer_counts' => $drawerCounts,
                'drawer_counts_by_mode' => $drawerCountsByMode,
                'total_cards' => array_sum($drawerCounts),
                'mastered_cards' => $drawerCounts[5] ?? 0,
                'last_activity' => $lastSession?->ended_at,
                'balance_gaming' => $child->media_time_balance_gaming,
                'balance_youtube' => $child->media_time_balance_youtube,
            ];
        });

        return Inertia::render('Dashboard/Index', [
            'child_stats' => $childStats,
            'vocabulary_count' => $user->vocabularies()->count(),
            'tag_count' => $user->tags()->count(),
        ]);
    }
}
