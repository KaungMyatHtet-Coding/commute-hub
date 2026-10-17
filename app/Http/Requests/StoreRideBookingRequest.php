<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRideBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'pickup_stop_id' => ['required', 'integer', 'exists:ride_stops,id'],
            'dropoff_stop_id' => ['required', 'integer', 'different:pickup_stop_id', 'exists:ride_stops,id'],
            'seats_booked' => ['required', 'integer', 'min:1', 'max:8'],
        ];
    }
}
