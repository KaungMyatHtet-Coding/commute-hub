<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'gender',
        'nrc_number',
        'nrc_front_path',
        'nrc_back_path',
        'passport_photo_path',
        'emergency_contact_name',
        'emergency_contact_phone',
        'payment_qr_path',
        'kyc_status',
        'kyc_rejection_reason',
        'driver_license_number',
        'driver_license_document_path',
        'driver_license_photo_path',
        'driver_verification_status',
        'driver_rejection_reason',
        'driver_applied_at',
        'driver_verified_at',
        'driver_verified_by',
        'profile_updates_this_month',
        'profile_update_reset_at',
        'pending_profile_data',
        'is_blocked',
        'blocked_reason',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'driver_applied_at' => 'datetime',
            'driver_verified_at' => 'datetime',
            'profile_update_reset_at' => 'datetime',
            'pending_profile_data' => 'array',
            'profile_updates_this_month' => 'integer',
            'is_blocked' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function drivenRides()
    {
        return $this->hasMany(Ride::class, 'driver_id');
    }

    public function bookings()
    {
        return $this->hasMany(RideBooking::class, 'passenger_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function averageRating(): float
    {
        return round((float) ($this->reviewsReceived()->avg('rating') ?? 0.0), 1);
    }

    public function appNotifications()
    {
        return $this->hasMany(AppNotification::class)->latest();
    }
}

