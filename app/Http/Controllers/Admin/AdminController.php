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

        // 4. Platform Cancellation Rate (% of rides cancelled)
        $cancellationRate = $totalRides > 0
            ? round(($cancelledRides / $totalRides) * 100, 1)
            : 0.0;

        // 5. Trip Outcomes Breakdown for Donut Chart
        $driverCancelledCount = Ride::where('status', 'cancelled')->count();
        $passengerCancelledBookingsCount = RideBooking::where('status', 'cancelled')->count();
        $totalOutcomes = $completedRides + $driverCancelledCount + $passengerCancelledBookingsCount;

        $tripOutcomes = [
            'completed' => $completedRides,
            'completed_pct' => $totalOutcomes > 0 ? round(($completedRides / $totalOutcomes) * 100, 1) : 0,
            'driver_cancelled' => $driverCancelledCount,
            'driver_cancelled_pct' => $totalOutcomes > 0 ? round(($driverCancelledCount / $totalOutcomes) * 100, 1) : 0,
            'passenger_cancelled' => $passengerCancelledBookingsCount,
            'passenger_cancelled_pct' => $totalOutcomes > 0 ? round(($passengerCancelledBookingsCount / $totalOutcomes) * 100, 1) : 0,
            'total' => $totalOutcomes,
        ];

        // 6. Last 7 Days Daily Usage for Bar Chart
        $dailyUsage = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = now()->subDays($i);
            $dateString = $day->toDateString();
            $label = $day->format('M j');

            $driversActive = Ride::whereDate('created_at', $dateString)
                ->distinct('driver_id')
                ->count('driver_id');

            $passengersActive = RideBooking::whereDate('created_at', $dateString)
                ->distinct('passenger_id')
                ->count('passenger_id');

            $dailyUsage[] = [
                'date' => $dateString,
                'label' => $label,
                'drivers' => $driversActive,
                'passengers' => $passengersActive,
            ];
        }

        // Today's Live Snapshot
        $todayDrivers = Ride::whereDate('created_at', today())->distinct('driver_id')->count('driver_id');
        $todayPassengers = RideBooking::whereDate('created_at', today())->distinct('passenger_id')->count('passenger_id');

        // 7. Rating Leaderboards
        // Top 5 Rated Drivers (with min 1 review)
        $topDrivers = User::role('driver')
            ->whereHas('reviewsReceived')
            ->withCount(['drivenRides as completed_rides_count' => fn ($q) => $q->where('status', 'completed')])
            ->get()
            ->map(function ($d) {
                return [
                    'id' => $d->id,
                    'name' => $d->name,
                    'email' => $d->email,
                    'phone' => $d->phone,
                    'passport_photo_path' => $d->passport_photo_path,
                    'rating' => round((float) ($d->reviewsReceived()->avg('rating') ?? 0.0), 1),
                    'review_count' => $d->reviewsReceived()->count(),
                    'completed_rides_count' => $d->completed_rides_count,
                    'is_blocked' => (bool) $d->is_blocked,
                ];
            })
            ->sortByDesc('rating')
            ->take(5)
            ->values();

        // Lowest Rated / High Cancellation Drivers
        $lowRatedDrivers = User::role('driver')
            ->withCount([
                'drivenRides as cancelled_rides_count' => fn ($q) => $q->where('status', 'cancelled'),
                'drivenRides as total_offered_count',
            ])
            ->get()
            ->map(function ($d) {
                $avg = round((float) ($d->reviewsReceived()->avg('rating') ?? 0.0), 1);
                return [
                    'id' => $d->id,
                    'name' => $d->name,
                    'email' => $d->email,
                    'phone' => $d->phone,
                    'passport_photo_path' => $d->passport_photo_path,
                    'rating' => $avg,
                    'review_count' => $d->reviewsReceived()->count(),
                    'cancelled_rides_count' => $d->cancelled_rides_count,
                    'total_offered_count' => $d->total_offered_count,
                    'is_blocked' => (bool) $d->is_blocked,
                ];
            })
            ->filter(fn ($d) => $d['cancelled_rides_count'] > 0 || ($d['review_count'] > 0 && $d['rating'] <= 3.5))
            ->sortBy([
                ['rating', 'asc'],
                ['cancelled_rides_count', 'desc'],
            ])
            ->take(5)
            ->values();

        // 8. Recent 10 Unified Platform Records (both completed and cancelled)
        $recentUnified = Ride::query()
            ->with([
                'driver:id,name,email,phone',
                'vehicle:id,make,model,license_plate',
                'bookings.passenger:id,name,email',
            ])
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'route' => "{$r->origin_township} → {$r->destination_township}",
                    'driver_name' => $r->driver?->name ?? 'N/A',
                    'vehicle' => $r->vehicle ? "{$r->vehicle->make} {$r->vehicle->model} ({$r->vehicle->license_plate})" : 'N/A',
                    'departure_time' => $r->departure_time->toDayDateTimeString(),
                    'status' => $r->status,
                    'passengers_count' => $r->bookings->count(),
                    'seats_booked' => $r->total_seats - $r->available_seats,
                    'cancellation_reason' => $r->cancellation_reason,
                    'updated_at' => $r->updated_at->diffForHumans(),
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
                'today_drivers' => $todayDrivers,
                'today_passengers' => $todayPassengers,
            ],
            'tripOutcomes' => $tripOutcomes,
            'dailyUsage' => $dailyUsage,
            'topDrivers' => $topDrivers,
            'lowRatedDrivers' => $lowRatedDrivers,
            'recentUnified' => $recentUnified,
        ]);
    }
}
