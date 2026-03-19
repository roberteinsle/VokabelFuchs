<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ProfilesController extends Controller
{
    /**
     * Show the public profile selection screen (no login required).
     */
    public function index(Request $request): Response|RedirectResponse
    {
        // Already unlocked — redirect to the active area
        if ($request->user()) {
            if ($request->session()->get('parent_profile_unlocked')) {
                return redirect()->route('parent.dashboard');
            }
            if ($request->session()->get('child_id')) {
                return redirect()->route('child.home');
            }
        }

        $users = User::with(['children' => fn ($q) => $q->where('is_active', true)->orderBy('name')])->get();

        $profiles = [];
        foreach ($users as $user) {
            $profiles[] = [
                'type' => 'parent',
                'id' => $user->id,
                'name' => $user->name,
                'has_pin' => $user->hasPin(),
            ];
            foreach ($user->children as $child) {
                $profiles[] = [
                    'type' => 'child',
                    'id' => $child->id,
                    'name' => $child->name,
                ];
            }
        }

        return Inertia::render('Profiles/Select', [
            'profiles' => $profiles,
            'hasUsers' => $users->isNotEmpty(),
        ]);
    }

    /**
     * Show the PIN entry screen for a specific profile (public).
     */
    public function showPin(Request $request, string $type, int $id): Response|RedirectResponse
    {
        if ($type === 'parent') {
            $user = User::findOrFail($id);

            if (! $user->hasPin()) {
                Auth::login($user);
                $request->session()->regenerate();
                $request->session()->put('parent_profile_unlocked', true);

                return redirect()->route('parent.dashboard');
            }

            return Inertia::render('Profiles/Pin', [
                'type' => 'parent',
                'id' => $id,
                'profile_name' => $user->name,
            ]);
        }

        if ($type === 'child') {
            $child = Child::where('is_active', true)->findOrFail($id);

            return Inertia::render('Profiles/Pin', [
                'type' => 'child',
                'id' => $id,
                'profile_name' => $child->name,
            ]);
        }

        abort(404);
    }

    /**
     * Validate PIN and unlock profile — logs in the user if not already authenticated.
     */
    public function unlock(Request $request): RedirectResponse
    {
        $request->validate([
            'type' => ['required', 'in:parent,child'],
            'id' => ['required', 'integer'],
            'pin' => ['required', 'string', 'size:4'],
        ]);

        if ($request->type === 'parent') {
            $user = User::findOrFail($request->id);

            if (! Hash::check($request->pin, $user->pin)) {
                return back()->withErrors(['pin' => 'Falscher PIN.']);
            }

            Auth::login($user);
            $request->session()->regenerate();
            $request->session()->put('parent_profile_unlocked', true);
            $request->session()->forget('child_id');

            return redirect()->route('parent.dashboard');
        }

        if ($request->type === 'child') {
            $child = Child::where('is_active', true)->findOrFail($request->id);

            if (! Hash::check($request->pin, $child->pin)) {
                return back()->withErrors(['pin' => 'Falscher PIN.']);
            }

            Auth::login($child->parent);
            $request->session()->regenerate();
            $request->session()->put('child_id', $child->id);
            $request->session()->forget('parent_profile_unlocked');

            return redirect()->route('child.home');
        }

        abort(404);
    }

    /**
     * Lock the current profile — full logout and back to profile selection.
     */
    public function lock(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('profiles.index');
    }
}
