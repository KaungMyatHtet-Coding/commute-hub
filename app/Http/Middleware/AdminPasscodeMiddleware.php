<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminPasscodeMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only enforce for admin routes except the gate itself
        if ($request->routeIs('admin.gate.*')) {
            return $next($request);
        }

        if (!$request->session()->get('admin_passcode_verified', false)) {
            return redirect()->route('admin.gate.show');
        }

        return $next($request);
    }
}
