<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureKycCompleted
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Allow unauthenticated requests or admins to pass through
        if (! $user || $user->hasRole('admin')) {
            return $next($request);
        }

        // Check if user has completed KYC (not incomplete, and has phone, nrc_number)
        $isKycIncomplete = $user->kyc_status === 'incomplete' ||
            empty($user->phone) ||
            empty($user->nrc_number);

        if ($isKycIncomplete) {
            return redirect()->route('profile.edit')
                ->with('warning', 'Please complete your mandatory KYC profile details before booking or offering a ride.');
        }

        return $next($request);
    }
}
