<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ride_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ride_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('stop_name', 150);
            $table->unsignedSmallInteger('stop_order');
            $table->dateTime('estimated_time')->nullable();
            $table->timestamps();

            $table->unique(['ride_id', 'stop_order']);
            $table->index(['ride_id', 'estimated_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ride_stops');
    }
};
