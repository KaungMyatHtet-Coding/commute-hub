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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->timestamps();
        });

        // Seed default passcode 'admin1234'
        \Illuminate\Support\Facades\DB::table('system_settings')->insert([
            'key' => 'admin_panel_passcode',
            'value' => \Illuminate\Support\Facades\Hash::make('admin1234'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_blocked')->default(false)->after('kyc_rejection_reason');
            $table->string('blocked_reason')->nullable()->after('is_blocked');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_blocked', 'blocked_reason']);
        });

        Schema::dropIfExists('system_settings');
    }
};
