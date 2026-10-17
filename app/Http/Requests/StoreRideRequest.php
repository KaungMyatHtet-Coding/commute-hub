<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        // Resolve the vehicle chosen by the user so we can validate seat capacity dynamically.
        $vehicle = $this->user()
            ->vehicles()
            ->where('is_active', true)
            ->find($this->input('vehicle_id'));

        $maxSeats = $vehicle?->seat_capacity ?? 8;

        return [
            // Vehicle must exist and belong to the authenticated user's active vehicles.
            'vehicle_id' => [
                'required',
                'integer',
                Rule::exists('vehicles', 'id')->where(function ($query) {
                    $query->where('user_id', $this->user()->id)
                          ->where('is_active', true);
                }),
            ],

            // Departure must be a valid datetime in the future.
            'departure_time' => ['required', 'date', 'after:now'],

            // Available seats must not exceed the selected vehicle's seat capacity.
            'available_seats' => ['required', 'integer', 'min:1', "max:{$maxSeats}"],

            // Price can be zero (free rides) but must be a non-negative number.
            'price_per_seat' => ['required', 'numeric', 'min:0'],

            // Optional notes field.
            'notes' => ['nullable', 'string', 'max:1000'],

            // Stops array is optional but each entry must be well-formed.
            'stops'                    => ['nullable', 'array'],
            'stops.*.stop_name'        => ['required_with:stops', 'string', 'max:150'],
            'stops.*.stop_order'       => ['required_with:stops', 'integer', 'min:1'],
            'stops.*.estimated_time'   => ['nullable', 'date', 'after_or_equal:departure_time'],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_id.exists'            => 'The selected vehicle does not belong to your account or is inactive.',
            'departure_time.after'         => 'Departure time must be in the future.',
            'available_seats.max'          => 'Available seats cannot exceed your vehicle\'s seating capacity.',
            'stops.*.stop_name.required_with'      => 'Each stop must have a name.',
            'stops.*.stop_order.required_with'     => 'Each stop must have an order number.',
            'stops.*.estimated_time.after_or_equal' => 'Stop estimated time must be on or after the departure time.',
        ];
    }
}
