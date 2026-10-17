<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RideBooking extends Model
{
    use HasFactory;

    protected $fillable = ['ride_id', 'passenger_id', 'pickup_stop_id', 'dropoff_stop_id', 'seats_booked', 'price_per_seat', 'status', 'accepted_at', 'cancelled_at'];

    protected function casts(): array
    {
        return ['price_per_seat' => 'decimal:2', 'accepted_at' => 'datetime', 'cancelled_at' => 'datetime'];
    }

    public function ride()
    {
        return $this->belongsTo(Ride::class);
    }

    public function passenger()
    {
        return $this->belongsTo(User::class, 'passenger_id');
    }

    public function pickupStop()
    {
        return $this->belongsTo(RideStop::class, 'pickup_stop_id');
    }

    public function dropoffStop()
    {
        return $this->belongsTo(RideStop::class, 'dropoff_stop_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'booking_id');
    }
}
