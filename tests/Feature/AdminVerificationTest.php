<?php

namespace Tests\Feature;

use App\Models\Ride;
use App\Models\RideBooking;
use App\Models\RideStop;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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

    public function test_admin_is_redirected_to_gate_without_passcode_verification(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin');
        $response->assertRedirect('/admin/gate');
    }

    public function test_admin_can_verify_passcode_at_gate(): void
    {
        // View gate
        $this->actingAs($this->admin)
            ->get('/admin/gate')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Gate'));

        // Wrong passcode
        $wrongResponse = $this->actingAs($this->admin)
            ->post('/admin/gate', ['passcode' => 'wrongpasscode']);
        $wrongResponse->assertSessionHasErrors('passcode');

        // Correct default passcode ('admin1234')
        $successResponse = $this->actingAs($this->admin)
            ->post('/admin/gate', ['passcode' => 'admin1234']);
        $successResponse->assertRedirect('/admin');
        $this->assertTrue(session('admin_passcode_verified'));
    }

    public function test_admin_can_access_admin_dashboard_with_verified_passcode(): void
    {
        $response = $this->actingAs($this->admin)
            ->withSession(['admin_passcode_verified' => true])
            ->get('/admin');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->has('metrics')
                ->has('tripOutcomes')
                ->has('dailyUsage')
                ->has('topDrivers')
                ->has('lowRatedDrivers')
                ->has('recentUnified')
            );
    }

    public function test_admin_can_update_admin_passcode(): void
    {
        $response = $this->actingAs($this->admin)
            ->withSession(['admin_passcode_verified' => true])
            ->patch('/admin/passcode', [
                'current_passcode' => 'admin1234',
                'new_passcode' => 'newSecretPass99',
                'new_passcode_confirmation' => 'newSecretPass99',
            ]);

        $response->assertSessionHas('success');

        $setting = SystemSetting::where('key', 'admin_panel_passcode')->first();
        $this->assertTrue(Hash::check('newSecretPass99', $setting->value));
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
            ->withSession(['admin_passcode_verified' => true])
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
            ->withSession(['admin_passcode_verified' => true])
            ->patch("/admin/verifications/{$this->passenger->id}/reject", [
                'reason' => 'Expired driver license submitted.',
            ]);

        $response->assertSessionHas('success');

        $passenger = $this->passenger->fresh();
        $this->assertEquals('rejected', $passenger->driver_verification_status);
        $this->assertEquals('Expired driver license submitted.', $passenger->driver_rejection_reason);
        $this->assertFalse($passenger->hasRole('driver'));
    }

    public function test_admin_can_view_user_management_and_block_unblock_user(): void
    {
        $targetUser = User::factory()->create([
            'name' => 'Suspicious Commuter',
            'email' => 'suspicious@test.com',
            'is_blocked' => false,
        ]);
        $targetUser->assignRole('passenger');

        // Access users list
        $listResp = $this->actingAs($this->admin)
            ->withSession(['admin_passcode_verified' => true])
            ->get('/admin/users');

        $listResp->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Index')
                ->has('users.data')
                ->has('counts')
            );

        // Admin blocks user
        $blockResp = $this->actingAs($this->admin)
            ->withSession(['admin_passcode_verified' => true])
            ->patch("/admin/users/{$targetUser->id}/toggle-block", [
                'reason' => 'Multiple reported violations of safety guidelines.',
            ]);

        $blockResp->assertSessionHas('success');
        $this->assertTrue($targetUser->fresh()->is_blocked);
        $this->assertEquals('Multiple reported violations of safety guidelines.', $targetUser->fresh()->blocked_reason);

        // Blocked user attempting to access dashboard is logged out & redirected
        $blockedAttempt = $this->actingAs($targetUser->fresh())
            ->get('/dashboard');
        $blockedAttempt->assertRedirect('/login');
        $this->assertGuest();

        // Admin unblocks user
        $unblockResp = $this->actingAs($this->admin)
            ->withSession(['admin_passcode_verified' => true])
            ->patch("/admin/users/{$targetUser->id}/toggle-block");

        $unblockResp->assertSessionHas('success');
        $this->assertFalse($targetUser->fresh()->is_blocked);
        $this->assertNull($targetUser->fresh()->blocked_reason);
    }

    public function test_admin_can_view_ride_history_and_filters(): void
    {
        $response = $this->actingAs($this->admin)
            ->withSession(['admin_passcode_verified' => true])
            ->get('/admin/history?status=all&township=Kamayut');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/History/Index')
                ->has('rides.data')
                ->has('summary')
                ->has('townships')
            );
    }

    public function test_public_welcome_landing_page_renders_with_cached_metrics(): void
    {
        $response = $this->get('/');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Welcome')
                ->has('metrics')
                ->has('recentRides')
                ->has('townships')
            );
    }

    public function test_user_with_incomplete_kyc_is_redirected_to_profile(): void
    {
        $incompleteUser = User::factory()->create([
            'phone' => null,
            'nrc_number' => null,
            'kyc_status' => 'incomplete',
        ]);
        $incompleteUser->assignRole('passenger');

        $this->actingAs($incompleteUser)
            ->get('/rides/create')
            ->assertRedirect('/profile')
            ->assertSessionHas('warning');

        $this->actingAs($incompleteUser)
            ->get('/driver-application')
            ->assertRedirect('/profile')
            ->assertSessionHas('warning');
    }

    public function test_verified_user_exceeding_twice_per_month_limit_is_blocked(): void
    {
        $verifiedUser = User::factory()->create([
            'kyc_status' => 'verified',
            'profile_updates_this_month' => 2,
            'profile_update_reset_at' => now(),
        ]);

        $response = $this->actingAs($verifiedUser)
            ->patch('/profile', [
                'name' => 'Attempted Name',
                'email' => $verifiedUser->email,
                'phone' => '09123456789',
                'gender' => 'male',
                'nrc_number' => '12/LAMATA(N)999888',
                'emergency_contact_name' => 'Someone',
                'emergency_contact_phone' => '09111222333',
            ]);

        $response->assertSessionHasErrors('profile_limit');
    }

    public function test_verified_user_updates_are_stored_in_pending_profile_data_and_approved_by_admin(): void
    {
        $verifiedUser = User::factory()->create([
            'kyc_status' => 'verified',
            'profile_updates_this_month' => 0,
            'profile_update_reset_at' => now(),
        ]);

        // Submit update request
        $response = $this->actingAs($verifiedUser)
            ->patch('/profile', [
                'name' => 'New Name Request',
                'email' => $verifiedUser->email,
                'phone' => '09888777666',
                'gender' => 'female',
                'nrc_number' => '12/YAGANA(N)555444',
                'emergency_contact_name' => 'Jane Sister',
                'emergency_contact_phone' => '09444333222',
            ]);

        $response->assertSessionHas('success');

        $user = $verifiedUser->fresh();
        $this->assertEquals(1, $user->profile_updates_this_month);
        $this->assertNotNull($user->pending_profile_data);
        $this->assertEquals('New Name Request', $user->pending_profile_data['name']);

        // Admin approves profile update
        $adminResp = $this->actingAs($this->admin)
            ->withSession(['admin_passcode_verified' => true])
            ->patch("/admin/verifications/{$user->id}/profile-approve");

        $adminResp->assertSessionHas('success');

        $updated = $user->fresh();
        $this->assertEquals('New Name Request', $updated->name);
        $this->assertEquals('09888777666', $updated->phone);
        $this->assertNull($updated->pending_profile_data);
    }

    public function test_driver_application_persists_custom_seat_capacity_and_displays_on_verifications(): void
    {
        $response = $this->actingAs($this->passenger)->post('/driver-application', [
            'driver_license_number' => 'DL-333333',
            'make' => 'Honda',
            'model' => 'Fit',
            'color' => 'Silver',
            'manufacture_year' => 2018,
            'license_plate' => 'YGN-3C-3333',
            'seat_capacity' => 3,
        ]);

        $response->assertRedirect('/driver-application');

        $this->assertDatabaseHas('vehicles', [
            'user_id' => $this->passenger->id,
            'license_plate' => 'YGN-3C-3333',
            'seat_capacity' => 3,
        ]);

        $adminResponse = $this->actingAs($this->admin)
            ->withSession(['admin_passcode_verified' => true])
            ->get('/admin/verifications?status=pending');
        $adminResponse->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Verifications/Index')
                ->where('applications.data.0.vehicles.0.seat_capacity', 3)
            );
    }
}
