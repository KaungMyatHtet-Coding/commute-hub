<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ride;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RideHistoryController extends Controller
{
    /**
     * Display a comprehensive listing of all rides and bookings with date/status/township filtering.
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'all');
        $date = $request->input('date');
        $month = $request->input('month');
        $year = $request->input('year');
        $township = $request->input('township');

        $query = Ride::query()
            ->with([
                'driver:id,name,email,phone,gender,passport_photo_path',
                'vehicle:id,make,model,color,license_plate,seat_capacity',
                'stops' => fn ($q) => $q->orderBy('stop_order'),
                'bookings.passenger:id,name,email,phone',
                'bookings.pickupStop:id,stop_name',
                'bookings.dropoffStop:id,stop_name',
            ]);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($date) {
            $query->whereDate('departure_time', $date);
        }

        if ($month) {
            $query->whereMonth('departure_time', Carbon::parse($month)->month)
                  ->whereYear('departure_time', Carbon::parse($month)->year);
        }

        if ($year) {
            $query->whereYear('departure_time', $year);
        }

        if ($township) {
            $query->where(function ($q) use ($township) {
                $q->where('origin_township', $township)
                  ->orWhere('destination_township', $township);
            });
        }

        // Summary metrics for the filtered view
        $filteredCount = (clone $query)->count();
        $filteredSeatsTaken = (clone $query)->get()->sum(fn ($r) => $r->total_seats - $r->available_seats);
        $filteredRevenueEst = (clone $query)->get()->sum(fn ($r) => ($r->total_seats - $r->available_seats) * (float) $r->price_per_seat);

        $rides = $query->latest('departure_time')->paginate(20)->withQueryString()
            ->through(function ($r) {
                return [
                    'id' => $r->id,
                    'origin_township' => $r->origin_township,
                    'destination_township' => $r->destination_township,
                    'departure_time' => $r->departure_time->toISOString(),
                    'status' => $r->status,
                    'total_seats' => $r->total_seats,
                    'available_seats' => $r->available_seats,
                    'booked_seats' => $r->total_seats - $r->available_seats,
                    'price_per_seat' => $r->price_per_seat,
                    'ride_rules' => $r->ride_rules,
                    'cancellation_reason' => $r->cancellation_reason,
                    'driver' => [
                        'id' => $r->driver?->id,
                        'name' => $r->driver?->name ?? 'Unknown',
                        'email' => $r->driver?->email ?? '',
                        'phone' => $r->driver?->phone,
                        'gender' => $r->driver?->gender,
                        'passport_photo_path' => $r->driver?->passport_photo_path,
                    ],
                    'vehicle' => $r->vehicle ? [
                        'id' => $r->vehicle->id,
                        'make' => $r->vehicle->make,
                        'model' => $r->vehicle->model,
                        'color' => $r->vehicle->color,
                        'license_plate' => $r->vehicle->license_plate,
                    ] : null,
                    'stops' => $r->stops->map(fn ($s) => [
                        'id' => $s->id,
                        'stop_name' => $s->stop_name,
                        'stop_order' => $s->stop_order,
                        'estimated_time' => $s->estimated_time?->toISOString(),
                    ]),
                    'bookings' => $r->bookings->map(fn ($b) => [
                        'id' => $b->id,
                        'status' => $b->status,
                        'seats_booked' => $b->seats_booked,
                        'price_per_seat' => $b->price_per_seat,
                        'total_fare' => (float) $b->price_per_seat * $b->seats_booked,
                        'cancellation_reason' => $b->cancellation_reason,
                        'created_at' => $b->created_at->toISOString(),
                        'passenger' => [
                            'id' => $b->passenger?->id,
                            'name' => $b->passenger?->name ?? 'N/A',
                            'email' => $b->passenger?->email,
                            'phone' => $b->passenger?->phone,
                        ],
                        'pickup_stop' => $b->pickupStop?->stop_name,
                        'dropoff_stop' => $b->dropoffStop?->stop_name,
                    ]),
                ];
            });

        return Inertia::render('Admin/History/Index', [
            'rides' => $rides,
            'summary' => [
                'total_filtered_rides' => $filteredCount,
                'total_seats_taken' => $filteredSeatsTaken,
                'total_revenue_est' => $filteredRevenueEst,
                'exported_at' => now()->toFormattedDateString() . ' ' . now()->toTimeString(),
            ],
            'filters' => [
                'status' => $status,
                'date' => $date,
                'month' => $month,
                'year' => $year,
                'township' => $township,
            ],
            'townships' => config('townships.yangon', []),
        ]);
    }
}
