<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('users')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->dateTime('departure_time')->index();
            $table->unsignedTinyInteger('total_seats');
            $table->unsignedTinyInteger('available_seats');
            $table->decimal('price_per_seat', 10, 2);
            $table->enum('status', ['scheduled', 'active', 'completed', 'cancelled'])->default('scheduled')->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['driver_id', 'status']);
            $table->index(['status', 'departure_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rides');
    }
};
