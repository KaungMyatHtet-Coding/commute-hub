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

class AdminVerificationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $passenger;
    private User $driver;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'driver', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'passenger', 'guard_name' => 'web']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->passenger = User::factory()->create();
        $this->passenger->assignRole('passenger');

        $this->driver = User::factory()->create();
        $this->driver->assignRole('driver');
    }

    public function test_non_admin_cannot_access_admin_dashboard_or_verifications(): void
    {
        // Unauthenticated
        $this->get('/admin')->assertRedirect('/login');
        $this->get('/admin/verifications')->assertRedirect('/login');

        // Authenticated Passenger
        $this->actingAs($this->passenger)
            ->get('/admin')
            ->assertForbidden();

        $this->actingAs($this->passenger)
            ->get('/admin/verifications')
            ->assertForbidden();

        // Authenticated Driver
        $this->actingAs($this->driver)
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_admin_can_access_admin_dashboard_and_metrics(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->has('metrics')
                ->has('recentCancellations')
            );
    }

    public function test_passenger_can_submit_driver_application(): void
    {
        $response = $this->actingAs($this->passenger)->post('/driver-application', [
            'driver_license_number' => 'DL-998877',
            'make' => 'Mazda',
            'model' => 'Demio',
            'color' => 'Sky Blue',
            'manufacture_year' => 2017,
            'license_plate' => 'YGN-5P-9999',
            'seat_capacity' => 4,
        ]);

        $response->assertRedirect('/driver-application');

        $this->assertDatabaseHas('users', [
            'id' => $this->passenger->id,
            'driver_license_number' => 'DL-998877',
            'driver_verification_status' => 'pending_verification',
        ]);

        $this->assertDatabaseHas('vehicles', [
            'user_id' => $this->passenger->id,
            'make' => 'Mazda',
            'model' => 'Demio',
            'license_plate' => 'YGN-5P-9999',
            'seat_capacity' => 4,
            'is_verified' => false,
        ]);
    }

    public function test_admin_can_approve_driver_application(): void
    {
        // Passenger applies
        $this->actingAs($this->passenger)->post('/driver-application', [
            'driver_license_number' => 'DL-112233',
            'make' => 'Toyota',
            'model' => 'Axio',
            'color' => 'White',
            'manufacture_year' => 2019,
            'license_plate' => 'YGN-1A-1122',
            'seat_capacity' => 4,
        ]);

        $this->assertFalse($this->passenger->fresh()->hasRole('driver'));

        // Admin approves application
        $response = $this->actingAs($this->admin)
            ->patch("/admin/verifications/{$this->passenger->id}/approve");

        $response->assertSessionHas('success');

        $passenger = $this->passenger->fresh();
        $this->assertEquals('verified', $passenger->driver_verification_status);
        $this->assertTrue($passenger->hasRole('driver'));
        $this->assertEquals($this->admin->id, $passenger->driver_verified_by);

        // Check vehicle is marked as verified
        $this->assertTrue($passenger->vehicles()->first()->is_verified);
    }

    public function test_admin_can_reject_driver_application_with_reason(): void
    {
        // Passenger applies
        $this->actingAs($this->passenger)->post('/driver-application', [
            'driver_license_number' => 'DL-445566',
            'make' => 'Nissan',
            'model' => 'Note',
            'color' => 'Silver',
            'manufacture_year' => 2016,
            'license_plate' => 'YGN-2B-3344',
            'seat_capacity' => 4,
        ]);

        // Admin rejects application
        $response = $this->actingAs($this->admin)
            ->patch("/admin/verifications/{$this->passenger->id}/reject", [
                'reason' => 'Expired driver license submitted.',
            ]);

        $response->assertSessionHas('success');

        $passenger = $this->passenger->fresh();
        $this->assertEquals('rejected', $passenger->driver_verification_status);
        $this->assertEquals('Expired driver license submitted.', $passenger->driver_rejection_reason);
        $this->assertFalse($passenger->hasRole('driver'));
    }
}
