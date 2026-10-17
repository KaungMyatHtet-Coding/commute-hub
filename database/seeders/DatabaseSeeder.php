<?php

namespace Database\Seeders;

use App\Models\Ride;
use App\Models\RideBooking;
use App\Models\RideStop;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            foreach (['admin', 'driver', 'passenger'] as $role) {
                Role::findOrCreate($role, 'web');
            }

            $admin = User::factory()->create(['name' => 'System Administrator', 'email' => 'admin@commutehub.test']);
            $admin->assignRole('admin');
            $aung = $this->driver('Aung Min', 'aung.min@commutehub.test', 'MM-YGN-DR-10001', $admin->id);
            $susu = $this->driver('Su Su Win', 'susu.win@commutehub.test', 'MM-YGN-DR-10002', $admin->id);

            $passengers = collect([
                User::factory()->create(['name' => 'Ko Htet', 'email' => 'ko.htet@commutehub.test']),
                User::factory()->create(['name' => 'May Zin', 'email' => 'may.zin@commutehub.test']),
                User::factory()->create(['name' => 'Thiri Aye', 'email' => 'thiri.aye@commutehub.test']),
            ]);
            $passengers->each->assignRole('passenger');

            $rideOne = $this->ride($aung, ['make' => 'Toyota', 'model' => 'Probox', 'color' => 'White', 'manufacture_year' => 2018, 'license_plate' => 'YGN-7K-1234', 'seat_capacity' => 4], now()->addDay()->setTime(7, 30), 4, 2500, ['Hledan Junction', 'Myaynigone', 'Sule Pagoda', 'Downtown Yangon']);
            $rideTwo = $this->ride($susu, ['make' => 'Honda', 'model' => 'Fit', 'color' => 'Silver', 'manufacture_year' => 2019, 'license_plate' => 'YGN-3M-5678', 'seat_capacity' => 3], now()->addDay()->setTime(8, 0), 3, 3000, ['Insein Road', 'Junction Square', 'Shwedagon Pagoda', 'Bahan Township']);

            $this->acceptedBooking($rideOne, $passengers[0], 0, 3, 1);
            $this->acceptedBooking($rideOne, $passengers[1], 1, 3, 1);
            $this->acceptedBooking($rideTwo, $passengers[2], 0, 3, 2);
        });
    }

    private function driver(string $name, string $email, string $license, int $verifiedBy): User
    {
        $driver = User::factory()->create(['name' => $name, 'email' => $email, 'driver_license_number' => $license, 'driver_verification_status' => 'verified', 'driver_applied_at' => now()->subDays(14), 'driver_verified_at' => now()->subDays(12), 'driver_verified_by' => $verifiedBy]);
        $driver->assignRole('driver');

        return $driver;
    }

    private function ride(User $driver, array $vehicleData, $departure, int $seats, int $price, array $stopNames): Ride
    {
        $vehicle = Vehicle::create(['user_id' => $driver->id, ...$vehicleData, 'is_active' => true]);
        $ride = Ride::create(['driver_id' => $driver->id, 'vehicle_id' => $vehicle->id, 'departure_time' => $departure, 'total_seats' => $seats, 'available_seats' => $seats, 'price_per_seat' => $price, 'status' => 'scheduled', 'notes' => 'Weekday morning commute.']);
        foreach ($stopNames as $order => $name) {
            RideStop::create(['ride_id' => $ride->id, 'stop_name' => $name, 'stop_order' => $order + 1, 'estimated_time' => $departure->copy()->addMinutes($order * 15)]);
        }

        return $ride->load('stops');
    }

    private function acceptedBooking(Ride $ride, User $passenger, int $pickup, int $dropoff, int $seats): void
    {
        RideBooking::create(['ride_id' => $ride->id, 'passenger_id' => $passenger->id, 'pickup_stop_id' => $ride->stops[$pickup]->id, 'dropoff_stop_id' => $ride->stops[$dropoff]->id, 'seats_booked' => $seats, 'price_per_seat' => $ride->price_per_seat, 'status' => 'accepted', 'accepted_at' => now()]);
        $ride->decrement('available_seats', $seats);
    }
}
