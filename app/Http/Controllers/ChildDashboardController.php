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

        $dueCount    = $this->leitner->getDueCards($child->id)->count();
        $modeStats   = $this->leitner->getDrawerStatsByMode($child->id);

        $modes = [
            'multiple_choice' => ['label' => 'Auswählen',         'due' => $this->leitner->getDueCards($child->id, null, 'multiple_choice')->count()],
            'free_text'       => ['label' => 'Schreiben',         'due' => $this->leitner->getDueCards($child->id, null, 'free_text')->count()],
            'dictation'       => ['label' => 'Hören & Schreiben', 'due' => $this->leitner->getDueCards($child->id, null, 'dictation')->count()],
        ];

        return Inertia::render('Child/Home', [
            'child'           => $child->only('id', 'name', 'username', 'language_pair'),
            'mode_stats'      => $modeStats,
            'mode_meta'       => $modes,
            'due_count'       => $dueCount,
            'balance_gaming'  => $child->media_time_balance_gaming,
            'balance_youtube' => $child->media_time_balance_youtube,
        ]);
    }
}
