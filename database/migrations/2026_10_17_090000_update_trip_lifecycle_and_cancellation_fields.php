<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rides', function (Blueprint $table) {
            $table->string('status', 30)->default('scheduled')->change();
            if (! Schema::hasColumn('rides', 'cancellation_reason')) {
                $table->text('cancellation_reason')->nullable()->after('notes');
            }
        });

        Schema::table('ride_bookings', function (Blueprint $table) {
            $table->string('status', 30)->default('pending')->change();
            if (! Schema::hasColumn('ride_bookings', 'cancellation_reason')) {
                $table->text('cancellation_reason')->nullable()->after('cancelled_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('rides', function (Blueprint $table) {
            if (Schema::hasColumn('rides', 'cancellation_reason')) {
                $table->dropColumn('cancellation_reason');
            }
        });

        Schema::table('ride_bookings', function (Blueprint $table) {
            if (Schema::hasColumn('ride_bookings', 'cancellation_reason')) {
                $table->dropColumn('cancellation_reason');
            }
        });
    }
};
