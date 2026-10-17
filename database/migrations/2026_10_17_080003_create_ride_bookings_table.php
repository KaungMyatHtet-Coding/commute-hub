<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ride_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ride_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('passenger_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('pickup_stop_id')->constrained('ride_stops')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('dropoff_stop_id')->constrained('ride_stops')->cascadeOnUpdate()->restrictOnDelete();
            $table->unsignedTinyInteger('seats_booked');
            $table->decimal('price_per_seat', 10, 2);
            $table->enum('status', ['pending', 'accepted', 'rejected', 'cancelled'])->default('pending')->index();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->unique(['ride_id', 'passenger_id']);
            $table->index(['ride_id', 'status']);
            $table->index(['passenger_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ride_bookings');
    }
};
