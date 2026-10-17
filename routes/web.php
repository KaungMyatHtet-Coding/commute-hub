<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RideBookingController;
use App\Http\Controllers\RideController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', App\Http\Controllers\DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    // Ride discovery (all authenticated users)
    Route::get('/rides', [RideController::class, 'index'])->name('rides.index');

    // Ride management (drivers) — must be before /{ride} wildcard
    Route::get('/rides/create', [RideController::class, 'create'])->name('rides.create');
    Route::post('/rides', [RideController::class, 'store'])->name('rides.store');

    // Ride detail — wildcard last so "create" isn't swallowed
    Route::get('/rides/{ride}', [RideController::class, 'show'])->name('rides.show');

    // Trip lifecycle (driver)
    Route::patch('/rides/{ride}/start', [\App\Http\Controllers\RideStatusController::class, 'start'])->name('rides.start');
    Route::patch('/rides/{ride}/complete', [\App\Http\Controllers\RideStatusController::class, 'complete'])->name('rides.complete');
    Route::patch('/rides/{ride}/cancel', [\App\Http\Controllers\RideStatusController::class, 'cancel'])->name('rides.cancel');

    // Booking management
    Route::post('/rides/{ride}/bookings', [RideBookingController::class, 'store'])->name('rides.bookings.store');
    Route::patch('/bookings/{booking}/accept', [RideBookingController::class, 'accept'])->name('bookings.accept');
    Route::patch('/bookings/{booking}/reject', [RideBookingController::class, 'reject'])->name('bookings.reject');
    Route::patch('/bookings/{booking}/cancel', [RideBookingController::class, 'cancel'])->name('bookings.cancel');
    Route::delete('/bookings/{booking}', [RideBookingController::class, 'cancel'])->name('bookings.destroy');

    // Mutual Reviews & Ratings
    Route::post('/bookings/{booking}/reviews', [\App\Http\Controllers\ReviewController::class, 'store'])->name('bookings.reviews.store');

    // My Trips (dual driver/passenger trips view)
    Route::get('/trips', [\App\Http\Controllers\BookingController::class, 'index'])->name('bookings.index');

    // Driver application (passenger view)
    Route::get('/driver-application', [\App\Http\Controllers\DriverApplicationController::class, 'create'])->name('driver-application.create');
    Route::post('/driver-application', [\App\Http\Controllers\DriverApplicationController::class, 'store'])->name('driver-application.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin routes protected by auth and Spatie role:admin middleware
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\AdminController::class, 'index'])->name('dashboard');
    Route::get('/verifications', [\App\Http\Controllers\Admin\DriverVerificationController::class, 'index'])->name('verifications.index');
    Route::patch('/verifications/{user}/approve', [\App\Http\Controllers\Admin\DriverVerificationController::class, 'approve'])->name('verifications.approve');
    Route::patch('/verifications/{user}/reject', [\App\Http\Controllers\Admin\DriverVerificationController::class, 'reject'])->name('verifications.reject');
});



require __DIR__.'/auth.php';
