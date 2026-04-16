<?php

namespace App\Http\Controllers;

use App\Models\MediaTimeRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MediaTimeRuleController extends Controller
{
    public function edit(Request $request): Response
    {
        $rule = $request->user()->mediaTimeRule ?? new MediaTimeRule([
            'daily_cap_gaming' => 60,
            'daily_cap_youtube' => 45,
            'base_minutes_per_correct' => 0.50,
            'multiplier_multiple_choice' => 1.00,
            'multiplier_free_text' => 1.50,
            'multiplier_dictation' => 2.00,
            'streak_bonus_days' => 7,
            'streak_bonus_minutes' => 15,
        ]);

        return Inertia::render('Parent/MediaTimeRules', ['rule' => $rule]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'daily_cap_gaming' => ['required', 'integer', 'min:0', 'max:480'],
            'daily_cap_youtube' => ['required', 'integer', 'min:0', 'max:480'],
            'base_minutes_per_correct' => ['required', 'numeric', 'min:0.1', 'max:10'],
            'multiplier_multiple_choice' => ['required', 'numeric', 'min:0.1', 'max:5'],
            'multiplier_free_text' => ['required', 'numeric', 'min:0.1', 'max:5'],
            'multiplier_dictation' => ['required', 'numeric', 'min:0.1', 'max:5'],
            'streak_bonus_days' => ['required', 'integer', 'min:1', 'max:365'],
            'streak_bonus_minutes' => ['required', 'integer', 'min:0', 'max:120'],
        ]);

        MediaTimeRule::updateOrCreate(
            ['parent_id' => $request->user()->id],
            $validated
        );

        return back()->with('success', 'Medienzeit-Regeln gespeichert.');
    }
}
