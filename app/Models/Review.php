<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = ['booking_id', 'reviewer_id', 'reviewee_id', 'rating', 'comment'];

    protected function casts(): array
    {
        return [
            'booking_id' => 'integer',
            'reviewer_id' => 'integer',
            'reviewee_id' => 'integer',
            'rating' => 'integer',
        ];
    }

    public function booking()
    {
        return $this->belongsTo(RideBooking::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewee()
    {
        return $this->belongsTo(User::class, 'reviewee_id');
    }
}
