<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRideRequest;
use App\Models\Ride;
use App\Models\RideStop;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RideController extends Controller
{
    /**
     * List available rides with optional filters.
     */
    public function index(Request $request): Response
    {
        $query = Ride::query()
            ->with([
                'driver:id,name',
                'vehicle:id,make,model,color,license_plate',
                'stops' => fn ($q) => $q->orderBy('stop_order'),
            ])
            ->where('status', 'scheduled')
            ->where('available_seats', '>', 0)
            ->where('departure_time', '>', now());

        // Filter: pickup stop name
        if ($request->filled('pickup')) {
            $pickup = $request->string('pickup')->trim()->value();
            $query->whereHas('stops', fn ($q) => $q->where('stop_name', 'like', "%{$pickup}%"));
        }

        // Filter: dropoff stop name
        if ($request->filled('dropoff')) {
            $dropoff = $request->string('dropoff')->trim()->value();
            $query->whereHas('stops', fn ($q) => $q->where('stop_name', 'like', "%{$dropoff}%"));
        }

        // Filter: departure date (YYYY-MM-DD)
        if ($request->filled('date')) {
            $query->whereDate('departure_time', $request->input('date'));
        }

        $rides = $query->orderBy('departure_time')->paginate(15)->withQueryString();

        // Collect distinct stop names for autocomplete hints
        $stopNames = RideStop::query()
            ->select('stop_name')
            ->distinct()
            ->orderBy('stop_name')
            ->pluck('stop_name');

        return Inertia::render('Rides/Index', [
            'rides'     => $rides,
            'stopNames' => $stopNames,
            'filters'   => $request->only(['pickup', 'dropoff', 'date']),
        ]);
    }

    /**
     * Show a single ride's details.
     * Also loads passenger bookings when the viewer is the driver.
     */
    public function show(Request $request, Ride $ride): Response
    {
        $ride->load([
            'driver:id,name,email',
            'vehicle:id,make,model,color,license_plate,seat_capacity',
            'stops' => fn ($q) => $q->orderBy('stop_order'),
        ]);

        $isDriver = (int) $request->user()->id === (int) $ride->driver_id;


        // If the logged-in user is a passenger, fetch their existing booking on this ride (if any)
        $existingBooking = ! $isDriver
            ? $ride->bookings()
                ->where('passenger_id', $request->user()->id)
                ->with([
                    'pickupStop:id,stop_name',
                    'dropoffStop:id,stop_name',
                ])
                ->first()
            : null;

        // Load bookings only for the driver — avoids leaking passenger data to others.
        $bookings = $isDriver
            ? $ride->bookings()
                ->with([
                    'passenger:id,name,email',
                    'pickupStop:id,stop_name',
                    'dropoffStop:id,stop_name',
                ])
                ->orderBy('created_at', 'desc')
                ->get()
            : collect();

        return Inertia::render('Rides/Show', [
            'ride'            => $ride,
            'isDriver'        => $isDriver,
            'bookings'        => $bookings,
            'existingBooking' => $existingBooking,
        ]);

    }

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

        $ride = DB::transaction(function () use ($validated, $request) {
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

                RideStop::insert($stops);
            }

            return $ride;
        });

        return redirect()
            ->route('rides.show', $ride)
            ->with('success', 'Your ride has been posted successfully!');
    }
}

