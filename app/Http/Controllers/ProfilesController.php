<?php

namespace App\Http\Controllers;

use App\Models\Child;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ProfilesController extends Controller
{
    /**
     * Show the profile selection screen.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $children = $user->children()->where('is_active', true)->get();

        return Inertia::render('Profiles/Select', [
            'parent' => [
                'id'      => $user->id,
                'name'    => $user->name,
                'has_pin' => $user->hasPin(),
            ],
            'children' => $children->map(fn($c) => [
                'id'   => $c->id,
                'name' => $c->name,
            ]),
        ]);
    }

    /**
     * Show the PIN entry screen for a specific profile.
     */
    public function showPin(Request $request, string $type, int $id): Response|RedirectResponse
    {
        $user = $request->user();

        if ($type === 'parent') {
            if ($user->id !== $id) abort(403);

            // No PIN set → unlock immediately
            if (! $user->hasPin()) {
                $request->session()->put('parent_profile_unlocked', true);
                return redirect()->route('parent.dashboard');
            }

            return Inertia::render('Profiles/Pin', [
                'type'        => 'parent',
                'id'          => $id,
                'profile_name' => $user->name,
            ]);
        }

        if ($type === 'child') {
            $child = Child::where('id', $id)
                ->where('parent_id', $user->id)
                ->where('is_active', true)
                ->firstOrFail();

            return Inertia::render('Profiles/Pin', [
                'type'        => 'child',
                'id'          => $id,
                'profile_name' => $child->name,
            ]);
        }

        abort(404);
    }

    /**
     * Validate PIN and unlock the selected profile.
     */
    public function unlock(Request $request): RedirectResponse
    {
        $request->validate([
            'type' => ['required', 'in:parent,child'],
            'id'   => ['required', 'integer'],
            'pin'  => ['required', 'string', 'size:4'],
        ]);

        $user = $request->user();

        if ($request->type === 'parent') {
            if ($user->id !== (int) $request->id) abort(403);

            if (! Hash::check($request->pin, $user->pin)) {
                return back()->withErrors(['pin' => 'Falscher PIN.']);
            }

            $request->session()->put('parent_profile_unlocked', true);
            $request->session()->forget('child_id');

            return redirect()->route('parent.dashboard');
        }

        if ($request->type === 'child') {
            $child = Child::where('id', $request->id)
                ->where('parent_id', $user->id)
                ->where('is_active', true)
                ->firstOrFail();

            if (! Hash::check($request->pin, $child->pin)) {
                return back()->withErrors(['pin' => 'Falscher PIN.']);
            }

            $request->session()->put('child_id', $child->id);
            $request->session()->forget('parent_profile_unlocked');

            return redirect()->route('child.home');
        }

        abort(404);
    }

    /**
     * Lock the current profile and return to profile selection.
     */
    public function lock(Request $request): RedirectResponse
    {
        $request->session()->forget(['parent_profile_unlocked', 'child_id']);
        return redirect()->route('profiles.index');
    }
}
