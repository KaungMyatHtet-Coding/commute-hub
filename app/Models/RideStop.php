<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RideStop extends Model
{
    use HasFactory;

    protected $fillable = ['ride_id', 'stop_name', 'stop_order', 'estimated_time'];

    protected function casts(): array
    {
        return ['estimated_time' => 'datetime'];
    }

    public function ride()
    {
        return $this->belongsTo(Ride::class);
    }
}
