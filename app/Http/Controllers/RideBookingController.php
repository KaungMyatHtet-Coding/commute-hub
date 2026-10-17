<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRideBookingRequest;
use App\Models\Ride;
use App\Models\RideBooking;
use App\Services\RideBookingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RideBookingController extends Controller
{
    public function store(StoreRideBookingRequest $request, Ride $ride, RideBookingService $bookings): RedirectResponse
    {
        // Prevent driver from booking their own ride.
        if ($ride->driver_id === $request->user()->id) {
            return back()->withErrors(['ride' => 'You cannot book your own ride.']);
        }

        $bookings->request(
            $ride,
            $request->user(),
            $request->integer('pickup_stop_id'),
            $request->integer('dropoff_stop_id'),
            $request->integer('seats_booked'),
        );

        // Redirect to My Trips if the route exists, else back with success message.
        $successMessage = 'Your booking request has been submitted successfully!';

        if (app('router')->has('bookings.index')) {
            return redirect()->route('bookings.index')->with('success', $successMessage);
        }

        return redirect()->route('dashboard')->with('success', $successMessage);
    }

    public function accept(Request $request, RideBooking $booking, RideBookingService $bookings): RedirectResponse
    {
        abort_unless($booking->ride()->value('driver_id') === $request->user()->id, 403);
        $bookings->accept($booking);

        return back()->with('success', 'Booking accepted.');
    }

    public function cancel(Request $request, RideBooking $booking, RideBookingService $bookings): RedirectResponse
    {
        $ride = $booking->ride()->firstOrFail();
        abort_unless(
            $booking->passenger_id === $request->user()->id || $ride->driver_id === $request->user()->id,
            403
        );
        $bookings->cancel($booking);

        return back()->with('success', 'Booking cancelled.');
    }
}
