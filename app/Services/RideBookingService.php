<?php

namespace App\Services;

use App\Models\Ride;
use App\Models\RideBooking;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RideBookingService
{
    public function request(Ride $ride, User $passenger, int $pickupStopId, int $dropoffStopId, int $seats): RideBooking
    {
        return DB::transaction(function () use ($ride, $passenger, $pickupStopId, $dropoffStopId, $seats): RideBooking {
            $ride = Ride::query()->lockForUpdate()->findOrFail($ride->id);
            $this->validateStops($ride, $pickupStopId, $dropoffStopId);
            if ($ride->status !== 'scheduled' || $ride->departure_time->isPast()) {
                throw ValidationException::withMessages(['ride' => 'This ride is no longer accepting requests.']);
            }
            if ($seats < 1 || $seats > $ride->total_seats) {
                throw ValidationException::withMessages(['seats_booked' => 'Invalid number of seats requested.']);
            }

            // Check if passenger already has a booking for this ride
            $existing = RideBooking::query()
                ->where('ride_id', $ride->id)
                ->where('passenger_id', $passenger->id)
                ->first();

            if ($existing) {
                if (in_array($existing->status, ['pending', 'accepted'], true)) {
                    throw ValidationException::withMessages([
                        'seats'        => 'You have already submitted a booking request for this ride.',
                        'seats_booked' => 'You have already submitted a booking request for this ride.',
                    ]);
                }

                // If previously rejected or cancelled, reuse existing record to respect unique(['ride_id', 'passenger_id'])
                $existing->update([
                    'pickup_stop_id'  => $pickupStopId,
                    'dropoff_stop_id' => $dropoffStopId,
                    'seats_booked'    => $seats,
                    'price_per_seat'  => $ride->price_per_seat,
                    'status'          => 'pending',
                    'accepted_at'     => null,
                    'cancelled_at'    => null,
                ]);

                return $existing->fresh();
            }

            return RideBooking::create([
                'ride_id'         => $ride->id,
                'passenger_id'    => $passenger->id,
                'pickup_stop_id'  => $pickupStopId,
                'dropoff_stop_id' => $dropoffStopId,
                'seats_booked'    => $seats,
                'price_per_seat'  => $ride->price_per_seat,
                'status'          => 'pending',
            ]);
        }, attempts: 3);

    }

    public function accept(RideBooking $booking): RideBooking
    {
        return DB::transaction(function () use ($booking): RideBooking {
            $booking = RideBooking::query()->lockForUpdate()->findOrFail($booking->id);
            $ride = Ride::query()->lockForUpdate()->findOrFail($booking->ride_id);
            if ($booking->status !== 'pending') {
                throw ValidationException::withMessages(['booking' => 'Only pending bookings can be accepted.']);
            }
            if ($ride->status !== 'scheduled' || $ride->available_seats < $booking->seats_booked) {
                throw ValidationException::withMessages(['booking' => 'There are no longer enough seats available.']);
            }
            $booking->update(['status' => 'accepted', 'accepted_at' => now()]);
            $ride->decrement('available_seats', $booking->seats_booked);

            return $booking->fresh();
        }, attempts: 3);
    }

    public function reject(RideBooking $booking): RideBooking
    {
        return DB::transaction(function () use ($booking): RideBooking {
            $booking = RideBooking::query()->lockForUpdate()->findOrFail($booking->id);
            $ride = Ride::query()->lockForUpdate()->findOrFail($booking->ride_id);
            if (! in_array($booking->status, ['pending', 'accepted'], true)) {
                throw ValidationException::withMessages(['booking' => 'Only pending or accepted bookings can be rejected.']);
            }
            if ($booking->status === 'accepted') {
                $ride->increment('available_seats', $booking->seats_booked);
            }
            $booking->update(['status' => 'rejected', 'cancelled_at' => now()]);

            return $booking->fresh();
        }, attempts: 3);
    }

    public function cancel(RideBooking $booking): RideBooking
    {
        return DB::transaction(function () use ($booking): RideBooking {
            $booking = RideBooking::query()->lockForUpdate()->findOrFail($booking->id);
            $ride = Ride::query()->lockForUpdate()->findOrFail($booking->ride_id);
            if (! in_array($booking->status, ['pending', 'accepted'], true)) {
                throw ValidationException::withMessages(['booking' => 'This booking cannot be cancelled.']);
            }
            if ($booking->status === 'accepted') {
                $ride->increment('available_seats', $booking->seats_booked);
            }
            $booking->update(['status' => 'cancelled', 'cancelled_at' => now()]);

            return $booking->fresh();
        }, attempts: 3);
    }


    private function validateStops(Ride $ride, int $pickupStopId, int $dropoffStopId): void
    {
        $stops = $ride->stops()->whereIn('id', [$pickupStopId, $dropoffStopId])->get()->keyBy('id');
        if ($stops->count() !== 2 || $stops[$pickupStopId]->stop_order >= $stops[$dropoffStopId]->stop_order) {
            throw ValidationException::withMessages(['stops' => 'Pickup and drop-off must be ordered stops on this ride.']);
        }
    }
}
