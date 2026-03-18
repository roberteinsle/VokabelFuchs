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
            'minutes_learn_per_gaming'   => 10,
            'minutes_gaming_per_learn'   => 15,
            'minutes_learn_per_youtube'  => 10,
            'minutes_youtube_per_learn'  => 10,
            'daily_cap_gaming'           => 60,
            'daily_cap_youtube'          => 45,
            'min_learn_for_unlock'       => 5,
        ]);

        return Inertia::render('Parent/MediaTimeRules', ['rule' => $rule]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'minutes_learn_per_gaming'   => ['required', 'integer', 'min:1', 'max:120'],
            'minutes_gaming_per_learn'   => ['required', 'integer', 'min:1', 'max:120'],
            'minutes_learn_per_youtube'  => ['required', 'integer', 'min:1', 'max:120'],
            'minutes_youtube_per_learn'  => ['required', 'integer', 'min:1', 'max:120'],
            'daily_cap_gaming'           => ['required', 'integer', 'min:0', 'max:480'],
            'daily_cap_youtube'          => ['required', 'integer', 'min:0', 'max:480'],
            'min_learn_for_unlock'       => ['required', 'integer', 'min:0', 'max:60'],
        ]);

        MediaTimeRule::updateOrCreate(
            ['parent_id' => $request->user()->id],
            $validated
        );

        return back()->with('success', 'Medienzeit-Regeln gespeichert.');
    }
}
