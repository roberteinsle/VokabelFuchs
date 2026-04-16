<?php

namespace App\Http\Controllers;

use App\Enums\MediaTimeType;
use App\Models\Child;
use App\Models\MediaTimeRule;
use App\Services\MediaTimeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MediaTimeController extends Controller
{
    public function __construct(private MediaTimeService $mediaTime) {}

    public function index(Request $request): Response
    {
        $child = Child::findOrFail($request->session()->get('child_id'));
        $rule = MediaTimeRule::where('parent_id', $child->parent_id)->first();

        $logs = $child->mediaTimeLogs()
            ->latest()
            ->limit(20)
            ->get();

        return Inertia::render('Child/MediaTime', [
            'balance' => $child->media_time_balance,
            'daily_cap_gaming' => $rule?->daily_cap_gaming ?? 60,
            'daily_cap_youtube' => $rule?->daily_cap_youtube ?? 45,
            'today_spent_gaming' => $this->mediaTime->getTodaySpent($child->id, MediaTimeType::GAMING),
            'today_spent_youtube' => $this->mediaTime->getTodaySpent($child->id, MediaTimeType::YOUTUBE),
            'logs' => $logs,
        ]);
    }

    public function redeem(Request $request): RedirectResponse
    {
        $request->validate([
            'type' => ['required', 'string', 'in:gaming,youtube'],
            'minutes' => ['required', 'integer', 'min:1', 'max:300'],
        ]);

        $child = Child::findOrFail($request->session()->get('child_id'));
        $type = MediaTimeType::from($request->type);

        // Check daily cap
        $rule = MediaTimeRule::where('parent_id', $child->parent_id)->first();
        if ($rule) {
            $cap = $type === MediaTimeType::GAMING ? $rule->daily_cap_gaming : $rule->daily_cap_youtube;
            $spentToday = $this->mediaTime->getTodaySpent($child->id, $type);
            $remaining = max(0, $cap - $spentToday);
            if ($request->minutes > $remaining) {
                return back()->withErrors(['minutes' => "Tageslimit: noch {$remaining} Minuten {$type->label()} übrig."]);
            }
        }

        $success = $this->mediaTime->spend($child, $type, $request->minutes);

        if (! $success) {
            return back()->withErrors(['minutes' => 'Nicht genug Guthaben.']);
        }

        return back()->with('success', $request->minutes.' Minuten '.$type->label().' eingelöst!');
    }
}
