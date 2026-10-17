<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ride extends Model
{
    use HasFactory;

    protected $fillable = ['driver_id', 'vehicle_id', 'departure_time', 'total_seats', 'available_seats', 'price_per_seat', 'status', 'notes'];

    protected function casts(): array
    {
        return ['departure_time' => 'datetime', 'price_per_seat' => 'decimal:2'];
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function stops()
    {
        return $this->hasMany(RideStop::class)->orderBy('stop_order');
    }

    public function bookings()
    {
        return $this->hasMany(RideBooking::class);
    }
}
