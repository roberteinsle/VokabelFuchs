<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Services\LeitnerService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChildDashboardController extends Controller
{
    public function __construct(private LeitnerService $leitner) {}

    public function index(Request $request): Response
    {
        $child = Child::findOrFail($request->session()->get('child_id'));

        $drawerStats = $this->leitner->getDrawerStats($child->id);
        $dueCount = $this->leitner->getDueCards($child->id)->count();

        return Inertia::render('Child/Home', [
            'child'          => $child->only('id', 'name', 'username', 'language_pair'),
            'drawer_stats'   => $drawerStats,
            'due_count'      => $dueCount,
            'balance_gaming'  => $child->media_time_balance_gaming,
            'balance_youtube' => $child->media_time_balance_youtube,
        ]);
    }
}
