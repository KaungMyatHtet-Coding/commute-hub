<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'make', 'model', 'color', 'manufacture_year', 'license_plate', 'seat_capacity', 'is_active', 'is_verified'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
        ];
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function rides()
    {
        return $this->hasMany(Ride::class);
    }
}
