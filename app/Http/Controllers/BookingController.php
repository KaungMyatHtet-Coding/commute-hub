<?php

namespace App\Http\Controllers;

use App\Models\Ride;
use App\Models\RideBooking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $now  = now();

        $base = RideBooking::query()
            ->with([
                'ride:id,driver_id,vehicle_id,departure_time,price_per_seat,available_seats,status,cancellation_reason',
                'ride.driver:id,name',
                'ride.vehicle:id,make,model,color,license_plate',
                'ride.stops',
                'pickupStop:id,stop_name,estimated_time',
                'dropoffStop:id,stop_name,estimated_time',
                'reviews',
            ])
            ->where('passenger_id', $user->id);

        $upcoming = (clone $base)
            ->whereHas('ride', fn ($q) => $q->whereIn('status', ['scheduled', 'in_progress'])->where('departure_time', '>=', $now))
            ->whereIn('status', ['pending', 'accepted'])
            ->latest()
            ->get();

        $past = (clone $base)
            ->where(function ($q) use ($now) {
                $q->whereHas('ride', fn ($r) => $r->where('departure_time', '<', $now)->orWhereIn('status', ['completed', 'cancelled']))
                  ->orWhereIn('status', ['cancelled', 'cancelled_by_driver', 'rejected', 'completed']);
            })
            ->latest()
            ->limit(20)
            ->get();

        $offeredRides = Ride::query()
            ->where('driver_id', $user->id)
            ->with([
                'vehicle:id,make,model,color,license_plate',
                'stops',
                'bookings.passenger:id,name,email',
                'bookings.pickupStop:id,stop_name',
                'bookings.dropoffStop:id,stop_name',
                'bookings.reviews',
            ])
            ->withCount([
                'bookings as pending_bookings_count' => fn ($q) => $q->where('status', 'pending'),
                'bookings as accepted_bookings_count' => fn ($q) => $q->where('status', 'accepted'),
            ])
            ->latest('departure_time')
            ->get();

        return Inertia::render('Bookings/Index', [
            'upcoming'     => $upcoming,
            'past'         => $past,
            'offeredRides' => $offeredRides,
        ]);
    }
}
