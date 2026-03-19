<?php

namespace App\Http\Controllers;

use App\Enums\MediaTimeType;
use App\Models\Child;
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

        $logs = $child->mediaTimeLogs()
            ->latest()
            ->limit(20)
            ->get();

        return Inertia::render('Child/MediaTime', [
            'balance_gaming' => $child->media_time_balance_gaming,
            'balance_youtube' => $child->media_time_balance_youtube,
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

        $success = $this->mediaTime->spend($child, $type, $request->minutes);

        if (! $success) {
            return back()->withErrors(['minutes' => 'Nicht genug Guthaben.']);
        }

        return back()->with('success', $request->minutes.' Minuten '.$type->label().' eingelöst!');
    }
}
