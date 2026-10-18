<?php

namespace App\Http\Controllers;

use App\Models\Ride;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    /**
     * Display the public landing page with live cached metrics and recent rides preview.
     */
    public function __invoke(Request $request): Response
    {
        $metrics = Cache::remember('welcome_landing_metrics', 60, function () {
            return [
                'verified_drivers' => User::role('driver')->where('driver_verification_status', 'verified')->count(),
                'registered_commuters' => User::count(),
                'completed_rides' => Ride::where('status', 'completed')->count(),
                'active_routes' => Ride::whereIn('status', ['scheduled', 'in_progress'])->count(),
                'townships_count' => count(config('townships.yangon', [])),
            ];
        });

        // 4 latest available scheduled rides
        $recentRides = Ride::where('status', 'scheduled')
            ->where('departure_time', '>', now())
            ->where('available_seats', '>', 0)
            ->with([
                'driver:id,name,phone,gender,passport_photo_path',
                'vehicle:id,make,model,color,license_plate',
                'stops' => fn ($q) => $q->orderBy('stop_order'),
            ])
            ->orderBy('departure_time')
            ->take(4)
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'origin_township' => $r->origin_township,
                    'destination_township' => $r->destination_township,
                    'departure_time' => $r->departure_time->toDayDateTimeString(),
                    'price_per_seat' => $r->price_per_seat,
                    'available_seats' => $r->available_seats,
                    'total_seats' => $r->total_seats,
                    'ride_rules' => $r->ride_rules,
                    'driver' => [
                        'name' => $r->driver?->name ?? 'Verified Driver',
                        'gender' => $r->driver?->gender,
                        'passport_photo_path' => $r->driver?->passport_photo_path,
                    ],
                    'vehicle' => $r->vehicle ? [
                        'make' => $r->vehicle->make,
                        'model' => $r->vehicle->model,
                    ] : null,
                ];
            });

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'metrics' => $metrics,
            'recentRides' => $recentRides,
            'townships' => config('townships.yangon', []),
        ]);
    }
}
