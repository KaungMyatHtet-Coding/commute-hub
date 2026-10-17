<?php

namespace App\Http\Controllers;

use App\Models\Ride;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RideStatusController extends Controller
{
    /**
     * Driver starts the trip (transitions from scheduled to in_progress).
     */
    public function start(Request $request, Ride $ride): RedirectResponse
    {
        abort_unless((int) $ride->driver_id === (int) $request->user()->id, 403);

        if (in_array($ride->status, ['in_progress', 'completed', 'cancelled'], true)) {
            return back()->withErrors(['error' => 'This trip cannot be started in its current status.']);
        }

        $ride->update(['status' => 'in_progress']);

        return back()->with('success', 'Trip started! Have a safe commute.');
    }

    /**
     * Driver completes the trip (transitions to completed and marks accepted bookings completed).
     */
    public function complete(Request $request, Ride $ride): RedirectResponse
    {
        abort_unless((int) $ride->driver_id === (int) $request->user()->id, 403);

        if (in_array($ride->status, ['completed', 'cancelled'], true)) {
            return back()->withErrors(['error' => 'This trip cannot be completed in its current status.']);
        }

        DB::transaction(function () use ($ride) {
            $ride->update(['status' => 'completed']);
            $ride->bookings()->where('status', 'accepted')->update(['status' => 'completed']);
        });

        return back()->with('success', 'Trip completed successfully! You and your passengers can now exchange reviews.');
    }

    /**
     * Driver cancels the trip with a required reason.
     * Transitions ride to cancelled and all pending/accepted bookings to cancelled_by_driver.
     */
    public function cancel(Request $request, Ride $ride): RedirectResponse
    {
        abort_unless((int) $ride->driver_id === (int) $request->user()->id, 403);

        if (in_array($ride->status, ['in_progress', 'completed'], true)) {
            return back()->withErrors(['error' => 'Cannot cancel a trip that is already in progress or completed.']);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($ride, $validated) {
            $ride->update([
                'status'              => 'cancelled',
                'cancellation_reason' => $validated['reason'],
            ]);

            $ride->bookings()
                ->whereIn('status', ['pending', 'accepted'])
                ->update([
                    'status'              => 'cancelled_by_driver',
                    'cancelled_at'        => now(),
                    'cancellation_reason' => $validated['reason'],
                ]);
        });

        return back()->with('success', 'Trip has been cancelled and passengers have been notified.');
    }
}
