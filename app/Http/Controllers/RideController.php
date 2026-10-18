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
    /**
     * List available rides with optional filters.
     */
    public function index(Request $request): Response
    {
        $query = Ride::query()
            ->with([
                'driver' => fn ($q) => $q->select('id', 'name', 'gender', 'phone', 'passport_photo_path', 'driver_license_number')
                    ->withAvg('reviewsReceived as average_rating', 'rating')
                    ->withCount('reviewsReceived'),
                'vehicle:id,make,model,color,license_plate,vehicle_photo_path',
                'stops' => fn ($q) => $q->orderBy('stop_order'),
            ])
            ->where('status', 'scheduled')
            ->where('available_seats', '>', 0)
            ->where('departure_time', '>', now());

        // Filter: origin township
        if ($request->filled('origin_township')) {
            $query->where('origin_township', $request->input('origin_township'));
        }

        // Filter: destination township
        if ($request->filled('destination_township')) {
            $query->where('destination_township', $request->input('destination_township'));
        }

        // Filter: ladies only
        if ($request->boolean('ladies_only')) {
            $query->whereJsonContains('ride_rules', 'ladies_only');
        }

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
            'townships' => config('townships.yangon', []),
            'filters'   => $request->only(['origin_township', 'destination_township', 'pickup', 'dropoff', 'date', 'ladies_only']),
        ]);
    }

    /**
     * Show a single ride's details.
     * Also loads passenger bookings when the viewer is the driver.
     */
    public function show(Request $request, Ride $ride): Response
    {
        $ride->load([
            'driver:id,name,email,phone,gender,passport_photo_path,payment_qr_path,driver_license_number',
            'vehicle:id,make,model,color,license_plate,seat_capacity,manufacture_year,vehicle_photo_path',
            'stops' => fn ($q) => $q->orderBy('stop_order'),
        ]);

        // Defensive backfill: if ride has fewer than 2 stops, ensure start and end stops exist
        if ($ride->stops->count() < 2) {
            DB::transaction(function () use ($ride) {
                $stops = $ride->stops;
                if ($stops->count() === 0) {
                    RideStop::create([
                        'ride_id' => $ride->id,
                        'stop_name' => $ride->origin_township . ' (Start)',
                        'stop_order' => 1,
                        'estimated_time' => $ride->departure_time,
                    ]);
                    RideStop::create([
                        'ride_id' => $ride->id,
                        'stop_name' => $ride->destination_township . ' (End)',
                        'stop_order' => 2,
                        'estimated_time' => $ride->departure_time ? \Carbon\Carbon::parse($ride->departure_time)->addMinutes(45) : null,
                    ]);
                } elseif ($stops->count() === 1) {
                    $single = $stops->first();
                    if (stripos($single->stop_name, $ride->destination_township) !== false) {
                        $single->update(['stop_order' => 2]);
                        RideStop::create([
                            'ride_id' => $ride->id,
                            'stop_name' => $ride->origin_township . ' (Start)',
                            'stop_order' => 1,
                            'estimated_time' => $ride->departure_time,
                        ]);
                    } else {
                        $single->update(['stop_order' => 1]);
                        RideStop::create([
                            'ride_id' => $ride->id,
                            'stop_name' => $ride->destination_township . ' (End)',
                            'stop_order' => 2,
                            'estimated_time' => $single->estimated_time
                                ? \Carbon\Carbon::parse($single->estimated_time)->addMinutes(30)
                                : ($ride->departure_time ? \Carbon\Carbon::parse($ride->departure_time)->addMinutes(45) : null),
                        ]);
                    }
                }
            });

            $ride->load(['stops' => fn ($q) => $q->orderBy('stop_order')]);
        }

        $isDriver = (int) $request->user()->id === (int) $ride->driver_id;

        $driverRating = round((float) ($ride->driver->reviewsReceived()->avg('rating') ?? 0.0), 1);
        $driverReviewCount = $ride->driver->reviewsReceived()->count();

        // Masked license badge for trust and anti-spoofing
        $maskedLicense = null;
        if ($ride->driver->driver_license_number) {
            $lic = $ride->driver->driver_license_number;
            $len = strlen($lic);
            if ($len > 4) {
                $maskedLicense = substr($lic, 0, 2) . '****' . substr($lic, -3);
            } else {
                $maskedLicense = '****';
            }
        }

        // If the logged-in user is a passenger, fetch their existing booking on this ride (if any)
        $existingBooking = ! $isDriver
            ? $ride->bookings()
                ->where('passenger_id', $request->user()->id)
                ->with([
                    'pickupStop:id,stop_name',
                    'dropoffStop:id,stop_name',
                    'reviews',
                ])
                ->first()
            : null;

        // Load bookings only for the driver — avoids leaking passenger data to others.
        $bookings = $isDriver
            ? $ride->bookings()
                ->with([
                    'passenger:id,name,email,phone,passport_photo_path,gender',
                    'pickupStop:id,stop_name',
                    'dropoffStop:id,stop_name',
                    'reviews',
                ])
                ->orderBy('created_at', 'desc')
                ->get()
            : collect();

        return Inertia::render('Rides/Show', [
            'ride'              => $ride,
            'isDriver'          => $isDriver,
            'bookings'          => $bookings,
            'existingBooking'   => $existingBooking,
            'driverRating'      => $driverRating,
            'driverReviewCount' => $driverReviewCount,
            'maskedLicense'     => $maskedLicense,
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
            ->select(['id', 'make', 'model', 'color', 'manufacture_year', 'license_plate', 'seat_capacity', 'vehicle_photo_path'])
            ->orderBy('make')
            ->get();

        return Inertia::render('Rides/Create', [
            'vehicles'  => $vehicles,
            'townships' => config('townships.yangon', []),
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
                'driver_id'            => $request->user()->id,
                'vehicle_id'           => $validated['vehicle_id'],
                'origin_township'      => $validated['origin_township'],
                'destination_township' => $validated['destination_township'],
                'departure_time'       => $validated['departure_time'],
                'total_seats'          => $vehicle->seat_capacity,
                'available_seats'      => $validated['available_seats'],
                'price_per_seat'       => $validated['price_per_seat'],
                'notes'                => $validated['notes'] ?? null,
                'ride_rules'           => $validated['ride_rules'] ?? [],
                'status'               => 'scheduled',
            ]);

            // Build raw stops from request, or default to empty
            $rawStops = $validated['stops'] ?? [];

            // If submitted stops has fewer than 2 stops, automatically include Origin and Destination
            if (count($rawStops) === 0) {
                $rawStops = [
                    [
                        'stop_name'      => $validated['origin_township'] . ' (Start)',
                        'stop_order'     => 1,
                        'estimated_time' => $validated['departure_time'],
                    ],
                    [
                        'stop_name'      => $validated['destination_township'] . ' (End)',
                        'stop_order'     => 2,
                        'estimated_time' => \Carbon\Carbon::parse($validated['departure_time'])->addMinutes(45)->toDateTimeString(),
                    ],
                ];
            } elseif (count($rawStops) === 1) {
                $single = $rawStops[0];
                if (stripos($single['stop_name'], $validated['destination_township']) !== false) {
                    $rawStops = [
                        [
                            'stop_name'      => $validated['origin_township'] . ' (Start)',
                            'stop_order'     => 1,
                            'estimated_time' => $validated['departure_time'],
                        ],
                        [
                            'stop_name'      => $single['stop_name'],
                            'stop_order'     => 2,
                            'estimated_time' => $single['estimated_time'] ?? \Carbon\Carbon::parse($validated['departure_time'])->addMinutes(45)->toDateTimeString(),
                        ],
                    ];
                } else {
                    $rawStops = [
                        [
                            'stop_name'      => $single['stop_name'],
                            'stop_order'     => 1,
                            'estimated_time' => $single['estimated_time'] ?? $validated['departure_time'],
                        ],
                        [
                            'stop_name'      => $validated['destination_township'] . ' (End)',
                            'stop_order'     => 2,
                            'estimated_time' => !empty($single['estimated_time'])
                                ? \Carbon\Carbon::parse($single['estimated_time'])->addMinutes(30)->toDateTimeString()
                                : \Carbon\Carbon::parse($validated['departure_time'])->addMinutes(45)->toDateTimeString(),
                        ],
                    ];
                }
            } else {
                // Ensure correct sequential stop_order
                $rawStops = array_values($rawStops);
                foreach ($rawStops as $idx => &$stopItem) {
                    $stopItem['stop_order'] = $idx + 1;
                }
                unset($stopItem);
            }

            $stopsToInsert = array_map(fn ($stop) => [
                'ride_id'        => $ride->id,
                'stop_name'      => $stop['stop_name'],
                'stop_order'     => $stop['stop_order'],
                'estimated_time' => $stop['estimated_time'] ?? null,
                'created_at'     => now(),
                'updated_at'     => now(),
            ], $rawStops);

            RideStop::insert($stopsToInsert);

            return $ride;
        });

        return redirect()
            ->route('rides.show', $ride)
            ->with('success', 'Your ride has been posted successfully!');
    }
}

