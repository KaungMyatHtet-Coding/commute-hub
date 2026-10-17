<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\RideBooking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    /**
     * Store a mutual review and rating for a completed trip booking.
     */
    public function store(Request $request, RideBooking $booking): RedirectResponse
    {
        $user = $request->user();
        $ride = $booking->ride()->firstOrFail();

        $isPassenger = (int) $booking->passenger_id === (int) $user->id;
        $isDriver    = (int) $ride->driver_id === (int) $user->id;

        abort_unless($isPassenger || $isDriver, 403, 'You are not authorized to review this trip.');

        // Trip or booking must be completed
        if ($booking->status !== 'completed' && $ride->status !== 'completed') {
            throw ValidationException::withMessages([
                'rating' => 'You can only leave a review for a completed trip.',
            ]);
        }

        // Prevent duplicate review for the same booking by this reviewer
        $alreadyReviewed = Review::query()
            ->where('booking_id', $booking->id)
            ->where('reviewer_id', $user->id)
            ->exists();

        if ($alreadyReviewed) {
            throw ValidationException::withMessages([
                'rating' => 'You have already submitted a review for this trip.',
            ]);
        }

        $validated = $request->validate([
            'rating'  => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $revieweeId = $isPassenger ? (int) $ride->driver_id : (int) $booking->passenger_id;

        Review::create([
            'booking_id'  => $booking->id,
            'reviewer_id' => $user->id,
            'reviewee_id' => $revieweeId,
            'rating'      => $validated['rating'],
            'comment'     => $validated['comment'] ?? null,
        ]);

        return back()->with('success', 'Thank you! Your review and rating have been recorded.');
    }
}
