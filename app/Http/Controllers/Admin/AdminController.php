<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ride;
use App\Models\RideBooking;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display admin overview metrics and recent cancellations.
     */
    public function index(Request $request): Response
    {
        // 1. User counts
        $totalUsers = User::count();
        $driversCount = User::role('driver')->count();
        $passengersCount = User::role('passenger')->count();
        $pendingVerificationsCount = User::whereIn('driver_verification_status', ['pending', 'pending_verification'])->count();

        // 2. Ride metrics
        $activeRides = Ride::whereIn('status', ['scheduled', 'in_progress'])->count();
        $completedRides = Ride::where('status', 'completed')->count();
        $cancelledRides = Ride::where('status', 'cancelled')->count();
        $totalRides = Ride::count();

        // 3. Booking metrics
        $successfulBookings = RideBooking::whereIn('status', ['accepted', 'completed'])->count();
        $cancelledBookings = RideBooking::whereIn('status', ['cancelled', 'cancelled_by_driver'])->count();
        $totalBookings = RideBooking::count();

        // 4. Platform Cancellation Rate (% of rides or bookings cancelled)
        $cancellationRate = $totalRides > 0
            ? round(($cancelledRides / $totalRides) * 100, 1)
            : 0.0;

        // 5. Recent cancellations table (latest 10)
        $recentCancellations = RideBooking::query()
            ->whereIn('status', ['cancelled', 'cancelled_by_driver'])
            ->with([
                'passenger:id,name,email',
                'ride:id,driver_id,departure_time,status,cancellation_reason',
                'ride.driver:id,name,email',
                'ride.vehicle:id,make,model,license_plate',
                'pickupStop:id,stop_name',
                'dropoffStop:id,stop_name',
            ])
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'ride_id' => $booking->ride_id,
                    'type' => $booking->status === 'cancelled_by_driver' ? 'Driver Cancelled' : 'Passenger Cancelled',
                    'passenger_name' => $booking->passenger?->name ?? 'N/A',
                    'passenger_email' => $booking->passenger?->email ?? 'N/A',
                    'driver_name' => $booking->ride?->driver?->name ?? 'N/A',
                    'vehicle' => $booking->ride?->vehicle ? "{$booking->ride->vehicle->make} {$booking->ride->vehicle->model} ({$booking->ride->vehicle->license_plate})" : 'N/A',
                    'route' => ($booking->pickupStop?->stop_name ?? 'Origin') . ' → ' . ($booking->dropoffStop?->stop_name ?? 'Destination'),
                    'reason' => $booking->status === 'cancelled_by_driver'
                        ? ($booking->ride?->cancellation_reason ?? $booking->cancellation_reason ?? 'No reason specified')
                        : ($booking->cancellation_reason ?? 'No reason specified'),
                    'cancelled_at' => $booking->cancelled_at ?? $booking->updated_at,
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_users' => $totalUsers,
                'drivers_count' => $driversCount,
                'passengers_count' => $passengersCount,
                'pending_verifications' => $pendingVerificationsCount,
                'active_rides' => $activeRides,
                'completed_rides' => $completedRides,
                'cancelled_rides' => $cancelledRides,
                'successful_bookings' => $successfulBookings,
                'cancellation_rate' => $cancellationRate,
            ],
            'recentCancellations' => $recentCancellations,
        ]);
    }
}
