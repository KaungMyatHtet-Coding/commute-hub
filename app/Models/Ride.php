<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ride extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'vehicle_id',
        'departure_time',
        'total_seats',
        'available_seats',
        'price_per_seat',
        'status',
        'notes',
        'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'driver_id' => 'integer',
            'vehicle_id' => 'integer',
            'total_seats' => 'integer',
            'available_seats' => 'integer',
            'departure_time' => 'datetime',
            'price_per_seat' => 'decimal:2',
        ];
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

    public function reviews()
    {
        return $this->hasManyThrough(Review::class, RideBooking::class, 'ride_id', 'booking_id');
    }
}
