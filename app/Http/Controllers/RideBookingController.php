<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRideBookingRequest;
use App\Models\Ride;
use App\Models\RideBooking;
use App\Services\RideBookingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RideBookingController extends Controller
{
    public function store(StoreRideBookingRequest $request, Ride $ride, RideBookingService $bookings): RedirectResponse
    {
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

        return redirect()->route('bookings.index')
            ->with('success', 'Your booking request has been submitted!');
    }

    public function accept(Request $request, RideBooking $booking, RideBookingService $bookings): RedirectResponse
    {
        abort_unless((int) $booking->ride()->value('driver_id') === (int) $request->user()->id, 403);
        $bookings->accept($booking);

        return back()->with('success', 'Booking accepted — seat reserved for passenger.');
    }

    public function reject(Request $request, RideBooking $booking, RideBookingService $bookings): RedirectResponse
    {
        $ride = $booking->ride()->firstOrFail();
        abort_unless((int) $ride->driver_id === (int) $request->user()->id, 403);

        $bookings->reject($booking);

        return back()->with('success', 'Booking rejected.');
    }


    public function cancel(Request $request, RideBooking $booking, RideBookingService $bookings): RedirectResponse
    {
        $ride = $booking->ride()->firstOrFail();
        abort_unless(
            (int) $booking->passenger_id === (int) $request->user()->id || (int) $ride->driver_id === (int) $request->user()->id,
            403
        );
        $reason = $request->input('reason', $request->input('cancellation_reason'));
        $bookings->cancel($booking, $reason);

        return back()->with('success', 'Booking cancelled.');
    }

}
