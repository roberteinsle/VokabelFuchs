<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Child;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ChildPinController extends Controller
{
    public function show(Request $request): Response
    {
        // If parent is logged in, show their children
        $children = [];
        if ($request->user()) {
            $children = $request->user()
                ->children()
                ->where('is_active', true)
                ->select('id', 'name', 'username')
                ->get();
        }

        return Inertia::render('Auth/ChildPinLogin', [
            'children' => $children,
        ]);
    }

    public function authenticate(Request $request): RedirectResponse
    {
        $request->validate([
            'child_id' => ['required', 'integer', 'exists:children,id'],
            'pin' => ['required', 'string', 'size:4', 'regex:/^\d{4}$/'],
        ]);

        $child = Child::find($request->child_id);

        if (! $child || ! $child->is_active || ! Hash::check($request->pin, $child->pin)) {
            return back()->withErrors(['pin' => 'Die PIN ist falsch. Bitte versuche es erneut.']);
        }

        $request->session()->put('child_id', $child->id);
        $request->session()->put('child_parent_id', $child->parent_id);

        return redirect()->route('child.home');
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget(['child_id', 'child_parent_id']);

        return redirect()->route('child.login');
    }
}
