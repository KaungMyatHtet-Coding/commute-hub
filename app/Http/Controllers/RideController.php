<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRideRequest;
use App\Models\Ride;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RideController extends Controller
{
    /**
     * Show the "Offer a Ride" creation form.
     * Only drivers with at least one active vehicle can access this.
     */
    public function create(): Response
    {
        $vehicles = auth()->user()
            ->vehicles()
            ->where('is_active', true)
            ->select(['id', 'make', 'model', 'color', 'manufacture_year', 'license_plate', 'seat_capacity'])
            ->orderBy('make')
            ->get();

        return Inertia::render('Rides/Create', [
            'vehicles' => $vehicles,
        ]);
    }

    /**
     * Persist the new ride and its stops inside a single DB transaction.
     */
    public function store(StoreRideRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            /** @var Vehicle $vehicle */
            $vehicle = Vehicle::findOrFail($validated['vehicle_id']);

            $ride = Ride::create([
                'driver_id'       => $request->user()->id,
                'vehicle_id'      => $validated['vehicle_id'],
                'departure_time'  => $validated['departure_time'],
                'total_seats'     => $vehicle->seat_capacity,
                'available_seats' => $validated['available_seats'],
                'price_per_seat'  => $validated['price_per_seat'],
                'notes'           => $validated['notes'] ?? null,
                'status'          => 'scheduled',
            ]);

            // Persist optional stops.
            if (!empty($validated['stops'])) {
                $stops = array_map(fn ($stop) => [
                    'ride_id'        => $ride->id,
                    'stop_name'      => $stop['stop_name'],
                    'stop_order'     => $stop['stop_order'],
                    'estimated_time' => $stop['estimated_time'] ?? null,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ], $validated['stops']);

                \App\Models\RideStop::insert($stops);
            }
        });

        return redirect()
            ->route('dashboard')
            ->with('success', 'Your ride has been posted successfully!');
    }
}
