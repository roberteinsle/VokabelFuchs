<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsParent
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        $user = $request->user();

        // If parent has a PIN, they must have unlocked their profile
        if ($user->hasPin() && ! $request->session()->get('parent_profile_unlocked')) {
            return redirect()->route('profiles.index');
        }

        // If parent has no PIN, auto-unlock
        if (! $user->hasPin() && ! $request->session()->get('parent_profile_unlocked')) {
            $request->session()->put('parent_profile_unlocked', true);
        }

        return $next($request);
    }
}
