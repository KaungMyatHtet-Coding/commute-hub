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
        $rides = \App\Models\Ride::with(['stops' => fn ($q) => $q->orderBy('stop_order')])->get();

        foreach ($rides as $ride) {
            $stops = $ride->stops;
            if ($stops->count() === 0) {
                // Add Origin and Destination stops
                \App\Models\RideStop::create([
                    'ride_id' => $ride->id,
                    'stop_name' => $ride->origin_township . ' (Start)',
                    'stop_order' => 1,
                    'estimated_time' => $ride->departure_time,
                ]);

                \App\Models\RideStop::create([
                    'ride_id' => $ride->id,
                    'stop_name' => $ride->destination_township . ' (End)',
                    'stop_order' => 2,
                    'estimated_time' => $ride->departure_time ? \Carbon\Carbon::parse($ride->departure_time)->addMinutes(45) : null,
                ]);
            } elseif ($stops->count() === 1) {
                $singleStop = $stops->first();
                // Determine whether singleStop is nearer origin or destination
                $originName = $ride->origin_township;
                $destName = $ride->destination_township;

                if (stripos($singleStop->stop_name, $destName) !== false) {
                    // It's the destination, prepend origin
                    $singleStop->update(['stop_order' => 2]);
                    \App\Models\RideStop::create([
                        'ride_id' => $ride->id,
                        'stop_name' => $originName . ' (Start)',
                        'stop_order' => 1,
                        'estimated_time' => $ride->departure_time,
                    ]);
                } else {
                    // Assume single stop is pickup or intermediate; ensure it's order 1, append destination as order 2
                    $singleStop->update(['stop_order' => 1]);
                    \App\Models\RideStop::create([
                        'ride_id' => $ride->id,
                        'stop_name' => $destName . ' (End)',
                        'stop_order' => 2,
                        'estimated_time' => $singleStop->estimated_time
                            ? \Carbon\Carbon::parse($singleStop->estimated_time)->addMinutes(30)
                            : ($ride->departure_time ? \Carbon\Carbon::parse($ride->departure_time)->addMinutes(45) : null),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No destructive reverse needed for backfilled stops
    }
};
