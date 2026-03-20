<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'hasPin' => $user->hasPin(),
            'hasElevenLabsKey' => ! empty($user->elevenlabs_api_key),
            'elevenLabsVoices' => $user->elevenLabsVoices->keyBy('language')->map(fn ($v) => [
                'voice_id' => $v->voice_id,
                'voice_name' => $v->voice_name,
            ]),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('parent.profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function updatePin(Request $request): RedirectResponse
    {
        $request->validate([
            'pin' => ['required', 'string', 'size:4', 'regex:/^\d{4}$/', 'confirmed'],
            'pin_confirmation' => ['required'],
        ]);

        $request->user()->update(['pin' => $request->pin]);

        return back()->with('status', 'pin-updated');
    }

    public function removePin(Request $request): RedirectResponse
    {
        $request->user()->update(['pin' => null]);

        return back()->with('status', 'pin-removed');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
