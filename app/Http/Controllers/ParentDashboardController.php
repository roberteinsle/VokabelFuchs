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

            $lastSession = $child->trainingSessions()
                ->whereNotNull('ended_at')
                ->latest('ended_at')
                ->first();

            return [
                'id'             => $child->id,
                'name'           => $child->name,
                'language_pair'  => $child->language_pair?->label(),
                'drawer_counts'  => $drawerCounts,
                'total_cards'    => array_sum($drawerCounts),
                'mastered_cards' => $drawerCounts[5] ?? 0,
                'last_activity'  => $lastSession?->ended_at,
                'balance_gaming'  => $child->media_time_balance_gaming,
                'balance_youtube' => $child->media_time_balance_youtube,
            ];
        });

        return Inertia::render('Dashboard/Index', [
            'child_stats'       => $childStats,
            'vocabulary_count'  => $user->vocabularies()->count(),
            'tag_count'         => $user->tags()->count(),
        ]);
    }
}
