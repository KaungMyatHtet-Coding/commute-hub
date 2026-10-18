<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        Role::firstOrCreate(['name' => 'driver', 'guard_name' => 'web']);

        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
