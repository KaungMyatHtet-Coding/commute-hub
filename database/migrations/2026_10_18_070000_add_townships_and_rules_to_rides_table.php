<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rides', function (Blueprint $table) {
            $table->string('origin_township', 80)->default('Kamayut')->after('vehicle_id');
            $table->string('destination_township', 80)->default('Kyauktada')->after('origin_township');
            $table->json('ride_rules')->nullable()->after('notes');

            $table->index(['origin_township', 'destination_township', 'status', 'departure_time'], 'rides_townships_status_departure_idx');
        });
    }

    public function down(): void
    {
        Schema::table('rides', function (Blueprint $table) {
            $table->dropIndex('rides_townships_status_departure_idx');
            $table->dropColumn(['origin_township', 'destination_township', 'ride_rules']);
        });
    }
};
