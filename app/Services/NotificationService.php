<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\Ride;
use App\Models\RideBooking;
use App\Models\User;

class NotificationService
{
    /**
     * Create and deliver an in-app notification.
     */
    public function send(int|User $user, string $title, string $message, string $type, ?string $actionUrl = null): AppNotification
    {
        $userId = $user instanceof User ? $user->id : $user;

        return AppNotification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'action_url' => $actionUrl,
        ]);
    }

    /**
     * Notify driver when a passenger submits a booking request.
     */
    public function bookingRequested(RideBooking $booking): AppNotification
    {
        $booking->loadMissing(['ride', 'passenger']);

        $origin = $booking->ride->origin_township ?? 'Trip';
        $destination = $booking->ride->destination_township ?? 'Destination';
        $passengerName = $booking->passenger->name ?? 'A passenger';

        return $this->send(
            user: $booking->ride->driver_id,
            title: 'New Booking Request',
            message: "{$passengerName} requested {$booking->seats_booked} seat(s) for your trip ({$origin} → {$destination}).",
            type: 'booking_requested',
            actionUrl: route('rides.show', $booking->ride_id)
        );
    }

    /**
     * Notify passenger when driver accepts their booking.
     */
    public function bookingAccepted(RideBooking $booking): AppNotification
    {
        $booking->loadMissing(['ride.driver', 'passenger']);

        $origin = $booking->ride->origin_township ?? 'Trip';
        $destination = $booking->ride->destination_township ?? 'Destination';
        $driverName = $booking->ride->driver->name ?? 'The driver';

        return $this->send(
            user: $booking->passenger_id,
            title: 'Booking Confirmed!',
            message: "Your booking for {$booking->seats_booked} seat(s) on trip ({$origin} → {$destination}) has been accepted by {$driverName}.",
            type: 'booking_accepted',
            actionUrl: route('rides.show', $booking->ride_id)
        );
    }

    /**
     * Notify passenger when driver rejects their booking.
     */
    public function bookingRejected(RideBooking $booking): AppNotification
    {
        $booking->loadMissing(['ride', 'passenger']);

        $origin = $booking->ride->origin_township ?? 'Trip';
        $destination = $booking->ride->destination_township ?? 'Destination';

        return $this->send(
            user: $booking->passenger_id,
            title: 'Booking Request Declined',
            message: "Your booking request for {$booking->seats_booked} seat(s) on trip ({$origin} → {$destination}) was declined.",
            type: 'booking_rejected',
            actionUrl: route('bookings.index')
        );
    }

    /**
     * Notify driver when passenger cancels their booking.
     */
    public function bookingCancelledByPassenger(RideBooking $booking, string $reason = ''): AppNotification
    {
        $booking->loadMissing(['ride', 'passenger']);

        $origin = $booking->ride->origin_township ?? 'Trip';
        $destination = $booking->ride->destination_township ?? 'Destination';
        $passengerName = $booking->passenger->name ?? 'A passenger';

        $reasonText = !empty($reason) ? " Reason: {$reason}" : '';

        return $this->send(
            user: $booking->ride->driver_id,
            title: 'Booking Cancelled',
            message: "{$passengerName} cancelled their booking for {$booking->seats_booked} seat(s) on trip ({$origin} → {$destination}).{$reasonText}",
            type: 'booking_cancelled',
            actionUrl: route('rides.show', $booking->ride_id)
        );
    }

    /**
     * Notify all passengers when driver cancels the entire ride.
     */
    public function rideCancelledByDriver(Ride $ride, string $reason = ''): void
    {
        $ride->loadMissing('bookings');

        $origin = $ride->origin_township ?? 'Trip';
        $destination = $ride->destination_township ?? 'Destination';
        $departure = $ride->departure_time ? $ride->departure_time->format('M d, H:i') : 'Scheduled time';

        $reasonText = !empty($reason) ? " Reason: {$reason}" : '';

        $affectedBookings = $ride->bookings->whereIn('status', ['pending', 'accepted', 'cancelled']);

        foreach ($affectedBookings as $booking) {
            $this->send(
                user: $booking->passenger_id,
                title: 'Trip Cancelled by Driver',
                message: "The trip on {$departure} ({$origin} → {$destination}) was cancelled by the driver.{$reasonText}",
                type: 'trip_cancelled',
                actionUrl: route('bookings.index')
            );
        }
    }

    /**
     * Notify user when their driver application is approved.
     */
    public function driverApplicationApproved(User $applicant): AppNotification
    {
        return $this->send(
            user: $applicant,
            title: 'Driver Application Approved! 🎉',
            message: 'Congratulations! Your driver application and vehicle have been verified. You can now post rides on CommuteHub.',
            type: 'application_approved',
            actionUrl: route('rides.create')
        );
    }

    /**
     * Notify user when their driver application is rejected.
     */
    public function driverApplicationRejected(User $applicant, string $reason): AppNotification
    {
        return $this->send(
            user: $applicant,
            title: 'Driver Application Update',
            message: "Your driver application was not approved. Reason: {$reason}",
            type: 'application_rejected',
            actionUrl: route('driver-application.create')
        );
    }

    /**
     * Notify user when their profile update is approved.
     */
    public function profileUpdateApproved(User $user): AppNotification
    {
        return $this->send(
            user: $user,
            title: 'Profile Update Approved',
            message: 'Your requested KYC profile changes have been verified and applied to your account.',
            type: 'profile_approved',
            actionUrl: route('profile.edit')
        );
    }

    /**
     * Notify user when their profile update is rejected.
     */
    public function profileUpdateRejected(User $user, string $reason): AppNotification
    {
        return $this->send(
            user: $user,
            title: 'Profile Update Declined',
            message: "Your profile update request was not approved. Reason: {$reason}",
            type: 'profile_rejected',
            actionUrl: route('profile.edit')
        );
    }
}
