<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('driver_verification_status', 30)->default('not_applied')->change();
            $table->text('driver_rejection_reason')->nullable()->after('driver_verification_status');
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->boolean('is_verified')->default(false)->after('is_active')->index();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('driver_rejection_reason');
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn('is_verified');
        });
    }
};
