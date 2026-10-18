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
            $table->string('gender', 20)->nullable()->after('phone');
            $table->string('nrc_number', 50)->nullable()->index()->after('gender');
            $table->string('nrc_front_path')->nullable()->after('nrc_number');
            $table->string('nrc_back_path')->nullable()->after('nrc_front_path');
            $table->string('passport_photo_path')->nullable()->after('nrc_back_path');
            $table->string('emergency_contact_name', 100)->nullable()->after('passport_photo_path');
            $table->string('emergency_contact_phone', 30)->nullable()->after('emergency_contact_name');
            $table->string('payment_qr_path')->nullable()->after('emergency_contact_phone');
            $table->string('kyc_status', 30)->default('incomplete')->index()->after('payment_qr_path');
            $table->text('kyc_rejection_reason')->nullable()->after('kyc_status');
            $table->string('driver_license_photo_path')->nullable()->after('driver_license_document_path');
            $table->unsignedTinyInteger('profile_updates_this_month')->default(0)->after('kyc_rejection_reason');
            $table->timestamp('profile_update_reset_at')->nullable()->after('profile_updates_this_month');
            $table->json('pending_profile_data')->nullable()->after('profile_update_reset_at');
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('vehicle_photo_path')->nullable()->after('is_verified');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'gender',
                'nrc_number',
                'nrc_front_path',
                'nrc_back_path',
                'passport_photo_path',
                'emergency_contact_name',
                'emergency_contact_phone',
                'payment_qr_path',
                'kyc_status',
                'kyc_rejection_reason',
                'driver_license_photo_path',
                'profile_updates_this_month',
                'profile_update_reset_at',
                'pending_profile_data',
            ]);
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn('vehicle_photo_path');
        });
    }
};
