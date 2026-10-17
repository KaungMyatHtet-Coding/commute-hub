<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDriverApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'driver_license_number' => ['required', 'string', 'max:50'],
            'make' => ['required', 'string', 'max:80'],
            'model' => ['required', 'string', 'max:80'],
            'color' => ['nullable', 'string', 'max:50'],
            'manufacture_year' => ['nullable', 'integer', 'min:1990', 'max:' . (date('Y') + 1)],
            'license_plate' => ['required', 'string', 'max:30'],
            'seat_capacity' => ['required', 'integer', 'min:1', 'max:8'],
        ];
    }

    public function messages(): array
    {
        return [
            'driver_license_number.required' => 'Please provide your driver license or NID number.',
            'license_plate.required' => 'Vehicle license plate number is required.',
            'seat_capacity.required' => 'Passenger seat capacity is required.',
        ];
    }
}
