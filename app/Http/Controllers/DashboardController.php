<?php

namespace App\Http\Controllers;

use App\Models\Ride;
use App\Models\RideBooking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        // Passenger stats
        $ridesTaken = RideBooking::where('passenger_id', $user->id)
            ->whereIn('status', ['accepted', 'completed'])
            ->count();

        // Driver stats
        $ridesOffered = Ride::where('driver_id', $user->id)->count();

        // Recent activity — latest 5 bookings where user is passenger or driver
        $recentBookings = RideBooking::query()
            ->with([
                'ride:id,driver_id,vehicle_id,departure_time,price_per_seat',
                'ride.driver:id,name',
                'ride.vehicle:id,make,model,color,license_plate',
                'ride.stops' => fn ($q) => $q->orderBy('stop_order'),
                'pickupStop:id,stop_name',
                'dropoffStop:id,stop_name',
                'passenger:id,name',
            ])


            ->where(function ($q) use ($user) {
                $q->where('passenger_id', $user->id)
                  ->orWhereHas('ride', fn ($r) => $r->where('driver_id', $user->id));
            })
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'rides_taken'   => $ridesTaken,
                'rides_offered' => $ridesOffered,
            ],
            'recentBookings' => $recentBookings,
        ]);
    }
}
