<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DriverVerificationController extends Controller
{
    /**
     * List all driver applications.
     */
    public function index(Request $request): Response
    {
        $statusFilter = $request->input('status', 'pending');

        $query = User::query()
            ->with(['vehicles' => fn ($q) => $q->latest()])
            ->whereNotNull('driver_license_number');

        if ($statusFilter === 'pending') {
            $query->whereIn('driver_verification_status', ['pending', 'pending_verification']);
        } elseif ($statusFilter === 'verified') {
            $query->where('driver_verification_status', 'verified');
        } elseif ($statusFilter === 'rejected') {
            $query->where('driver_verification_status', 'rejected');
        }

        $applications = $query->latest('driver_applied_at')
            ->paginate(15)
            ->withQueryString();

        $counts = [
            'pending' => User::whereIn('driver_verification_status', ['pending', 'pending_verification'])->count(),
            'verified' => User::where('driver_verification_status', 'verified')->count(),
            'rejected' => User::where('driver_verification_status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Verifications/Index', [
            'applications' => $applications,
            'counts' => $counts,
            'currentFilter' => $statusFilter,
        ]);
    }

    /**
     * Approve driver application.
     */
    public function approve(Request $request, User $user): RedirectResponse
    {
        DB::transaction(function () use ($request, $user) {
            $user->update([
                'driver_verification_status' => 'verified',
                'driver_verified_at' => now(),
                'driver_verified_by' => $request->user()->id,
                'driver_rejection_reason' => null,
            ]);

            // Assign driver role to user
            if (! $user->hasRole('driver')) {
                $user->assignRole('driver');
            }

            // Mark user's vehicles as verified
            $user->vehicles()->update(['is_verified' => true]);
        });

        return back()->with('success', "Driver application for {$user->name} has been approved successfully.");
    }

    /**
     * Reject driver application.
     */
    public function reject(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($user, $validated) {
            $user->update([
                'driver_verification_status' => 'rejected',
                'driver_rejection_reason' => $validated['reason'],
                'driver_verified_at' => null,
                'driver_verified_by' => null,
            ]);

            // If user previously had driver role, remove it
            if ($user->hasRole('driver')) {
                $user->removeRole('driver');
            }

            // Un-verify vehicles
            $user->vehicles()->update(['is_verified' => false]);
        });

        return back()->with('success', "Driver application for {$user->name} has been rejected.");
    }
}
