<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('ride_bookings')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('reviewee_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['booking_id', 'reviewer_id']);
            $table->index(['reviewee_id', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
