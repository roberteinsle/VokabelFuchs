<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Services\LeitnerService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FlashCardController extends Controller
{
    public function __construct(private LeitnerService $leitner) {}

    public function drawers(Request $request): Response
    {
        $child = Child::findOrFail($request->session()->get('child_id'));

        $drawerStats = $this->leitner->getDrawerStats($child->id);
        $dueCount    = $this->leitner->getDueCards($child->id)->count();
        $intervals   = config('leitner.intervals');

        return Inertia::render('Child/Drawers', [
            'drawer_stats' => $drawerStats,
            'due_count'    => $dueCount,
            'intervals'    => $intervals,
        ]);
    }
}
