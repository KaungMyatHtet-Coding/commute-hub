<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDriverApplicationRequest;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DriverApplicationController extends Controller
{
    /**
     * Show the "Become a Driver" application page.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // If the user is already a driver, redirect them to offer a ride or dashboard
        if ($user->hasRole('driver')) {
            return redirect()->route('dashboard')->with('info', 'You are already an approved driver!');
        }

        $latestVehicle = $user->vehicles()->latest()->first();

        return Inertia::render('DriverApplication/Create', [
            'status' => $user->driver_verification_status ?? 'not_applied',
            'rejectionReason' => $user->driver_rejection_reason,
            'existingVehicle' => $latestVehicle,
            'driverLicenseNumber' => $user->driver_license_number,
        ]);
    }

    /**
     * Submit driver & vehicle details for verification.
     */
    public function store(StoreDriverApplicationRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        DB::transaction(function () use ($user, $validated) {
            // Update user's driver verification status and license number
            $user->update([
                'driver_license_number' => $validated['driver_license_number'],
                'driver_verification_status' => 'pending_verification',
                'driver_applied_at' => now(),
                'driver_rejection_reason' => null,
            ]);

            // Create or update vehicle associated with user
            Vehicle::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'license_plate' => strtoupper(trim($validated['license_plate'])),
                ],
                [
                    'make' => $validated['make'],
                    'model' => $validated['model'],
                    'color' => $validated['color'] ?? null,
                    'manufacture_year' => $validated['manufacture_year'] ?? null,
                    'seat_capacity' => $validated['seat_capacity'],
                    'is_active' => true,
                    'is_verified' => false,
                ]
            );
        });

        return redirect()->route('driver-application.create')
            ->with('success', 'Your driver application has been submitted successfully and is pending admin verification.');
    }
}
