<?php

namespace Tests\Feature;

use App\Models\Ride;
use App\Models\RideBooking;
use App\Models\RideStop;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RideWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $driver;
    private User $passenger;
    private Vehicle $vehicle;
    private Ride $ride;
    private RideStop $pickupStop;
    private RideStop $dropoffStop;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'driver', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'passenger', 'guard_name' => 'web']);

        $this->driver = User::factory()->create();
        $this->driver->assignRole('driver');

        $this->passenger = User::factory()->create();
        $this->passenger->assignRole('passenger');

        $this->vehicle = Vehicle::create([
            'user_id' => $this->driver->id,
            'make' => 'Toyota',
            'model' => 'Prius',
            'color' => 'White',
            'manufacture_year' => 2020,
            'license_plate' => 'ABC-1234',
            'seat_capacity' => 4,
            'is_active' => true,
        ]);

        $this->ride = Ride::create([
            'driver_id' => $this->driver->id,
            'vehicle_id' => $this->vehicle->id,
            'departure_time' => now()->addDays(2),
            'total_seats' => 4,
            'available_seats' => 4,
            'price_per_seat' => 10.00,
            'status' => 'scheduled',
            'notes' => 'No smoking please',
        ]);

        $this->pickupStop = RideStop::create([
            'ride_id' => $this->ride->id,
            'stop_name' => 'Hledan Center',
            'stop_order' => 1,
            'estimated_time' => now()->addDays(2),
        ]);

        $this->dropoffStop = RideStop::create([
            'ride_id' => $this->ride->id,
            'stop_name' => 'Downtown Sule',
            'stop_order' => 2,
            'estimated_time' => now()->addDays(2)->addHours(1),
        ]);
    }

    public function test_driver_sees_offered_rides_and_pending_counts_on_trips_page(): void
    {
        RideBooking::create([
            'ride_id' => $this->ride->id,
            'passenger_id' => $this->passenger->id,
            'pickup_stop_id' => $this->pickupStop->id,
            'dropoff_stop_id' => $this->dropoffStop->id,
            'seats_booked' => 1,
            'price_per_seat' => 10.00,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->driver)->get('/trips');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Bookings/Index')
            ->has('offeredRides', 1)
            ->where('offeredRides.0.pending_bookings_count', 1)
        );
    }

    public function test_dashboard_renders_metrics_and_recent_activity_for_driver_and_passenger(): void
    {
        RideBooking::create([
            'ride_id' => $this->ride->id,
            'passenger_id' => $this->passenger->id,
            'pickup_stop_id' => $this->pickupStop->id,
            'dropoff_stop_id' => $this->dropoffStop->id,
            'seats_booked' => 1,
            'price_per_seat' => 10.00,
            'status' => 'pending',
        ]);

        // Driver Dashboard
        $driverResponse = $this->actingAs($this->driver)->get('/dashboard');
        $driverResponse->assertOk();
        $driverResponse->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('stats.rides_offered', 1)
            ->has('recentBookings', 1)
        );

        // Passenger Dashboard
        $passengerResponse = $this->actingAs($this->passenger)->get('/dashboard');
        $passengerResponse->assertOk();
        $passengerResponse->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('recentBookings', 1)
        );
    }

    public function test_driver_can_accept_and_reject_booking_and_seats_are_restored(): void
    {
        $this->assertEquals(4, $this->ride->available_seats);

        $booking = RideBooking::create([
            'ride_id' => $this->ride->id,
            'passenger_id' => $this->passenger->id,
            'pickup_stop_id' => $this->pickupStop->id,
            'dropoff_stop_id' => $this->dropoffStop->id,
            'seats_booked' => 1,
            'price_per_seat' => 10.00,
            'status' => 'pending',
        ]);

        // Accept (decrements available seats from 4 to 3)
        $acceptResponse = $this->actingAs($this->driver)->patch("/bookings/{$booking->id}/accept");
        $acceptResponse->assertRedirect();
        $this->assertEquals('accepted', $booking->fresh()->status);
        $this->assertEquals(3, $this->ride->fresh()->available_seats);

        // Reject (restores available seats from 3 back to 4)
        $rejectResponse = $this->actingAs($this->driver)->patch("/bookings/{$booking->id}/reject");
        $rejectResponse->assertRedirect();
        $this->assertEquals('rejected', $booking->fresh()->status);
        $this->assertEquals(4, $this->ride->fresh()->available_seats);
    }

    public function test_passenger_can_cancel_their_accepted_booking(): void
    {
        $booking = RideBooking::create([
            'ride_id' => $this->ride->id,
            'passenger_id' => $this->passenger->id,
            'pickup_stop_id' => $this->pickupStop->id,
            'dropoff_stop_id' => $this->dropoffStop->id,
            'seats_booked' => 1,
            'price_per_seat' => 10.00,
            'status' => 'accepted',
        ]);
        $this->ride->update(['available_seats' => 3]);

        $response = $this->actingAs($this->passenger)->patch("/bookings/{$booking->id}/cancel");
        $response->assertRedirect();
        $this->assertEquals('cancelled', $booking->fresh()->status);
        $this->assertEquals(4, $this->ride->fresh()->available_seats);
    }
}
