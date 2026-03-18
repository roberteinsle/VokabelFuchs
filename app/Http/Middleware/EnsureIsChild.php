<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsChild
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->has('child_id')) {
            return redirect()->route('child.login');
        }

        return $next($request);
    }
}
