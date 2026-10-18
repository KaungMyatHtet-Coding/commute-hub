<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RideBookingController;
use App\Http\Controllers\RideController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', \App\Http\Controllers\WelcomeController::class)->name('home');

Route::get('/dashboard', App\Http\Controllers\DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    // Ride discovery (all authenticated users)
    Route::get('/rides', [RideController::class, 'index'])->name('rides.index');

    // KYC Protected routes: Ride creation, Ride booking, Driver application
    Route::middleware('kyc.completed')->group(function () {
        // Ride management (drivers) — must be before /{ride} wildcard
        Route::get('/rides/create', [RideController::class, 'create'])->name('rides.create');
        Route::post('/rides', [RideController::class, 'store'])->middleware('throttle:10,1')->name('rides.store');

        // Trip lifecycle (driver)
        Route::patch('/rides/{ride}/start', [\App\Http\Controllers\RideStatusController::class, 'start'])->name('rides.start');
        Route::patch('/rides/{ride}/complete', [\App\Http\Controllers\RideStatusController::class, 'complete'])->name('rides.complete');
        Route::patch('/rides/{ride}/cancel', [\App\Http\Controllers\RideStatusController::class, 'cancel'])->name('rides.cancel');

        // Booking management
        Route::post('/rides/{ride}/bookings', [RideBookingController::class, 'store'])->middleware('throttle:10,1')->name('rides.bookings.store');
        Route::patch('/bookings/{booking}/accept', [RideBookingController::class, 'accept'])->name('bookings.accept');
        Route::patch('/bookings/{booking}/reject', [RideBookingController::class, 'reject'])->name('bookings.reject');
        Route::patch('/bookings/{booking}/cancel', [RideBookingController::class, 'cancel'])->name('bookings.cancel');
        Route::delete('/bookings/{booking}', [RideBookingController::class, 'cancel'])->name('bookings.destroy');

        // Driver application (passenger view)
        Route::get('/driver-application', [\App\Http\Controllers\DriverApplicationController::class, 'create'])->name('driver-application.create');
        Route::post('/driver-application', [\App\Http\Controllers\DriverApplicationController::class, 'store'])->middleware('throttle:10,1')->name('driver-application.store');
    });

    // Ride detail — accessible for viewing
    Route::get('/rides/{ride}', [RideController::class, 'show'])->name('rides.show');

    // Mutual Reviews & Ratings
    Route::post('/bookings/{booking}/reviews', [\App\Http\Controllers\ReviewController::class, 'store'])->name('bookings.reviews.store');

    // My Trips (dual driver/passenger trips view)
    Route::get('/trips', [\App\Http\Controllers\BookingController::class, 'index'])->name('bookings.index');

    // In-App Notifications
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');
    Route::patch('/notifications/{notification}/read', [\App\Http\Controllers\NotificationController::class, 'markRead'])->name('notifications.read');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->middleware('throttle:10,1')->name('profile.update');
    Route::patch('/profile', [ProfileController::class, 'update'])->middleware('throttle:10,1');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Passcode Gate (protected by auth and role:admin)
Route::middleware(['auth', 'role:admin'])->prefix('admin/gate')->name('admin.gate.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\AdminGateController::class, 'show'])->name('show');
    Route::post('/', [\App\Http\Controllers\Admin\AdminGateController::class, 'verify'])->name('verify');
});

// Admin Governance Suite (protected by auth, role:admin, and secondary admin.passcode)
Route::middleware(['auth', 'role:admin', 'admin.passcode'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\AdminController::class, 'index'])->name('dashboard');
    Route::patch('/passcode', [\App\Http\Controllers\Admin\AdminGateController::class, 'updatePasscode'])->name('passcode.update');

    // User Governance & Inspection
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    Route::patch('/users/{user}/toggle-block', [\App\Http\Controllers\Admin\UserController::class, 'toggleBlock'])->name('users.toggle-block');

    // Ride History & PDF Export
    Route::get('/history', [\App\Http\Controllers\Admin\RideHistoryController::class, 'index'])->name('history.index');

    // Driver & KYC Verifications
    Route::get('/verifications', [\App\Http\Controllers\Admin\DriverVerificationController::class, 'index'])->name('verifications.index');
    Route::patch('/verifications/{user}/approve', [\App\Http\Controllers\Admin\DriverVerificationController::class, 'approve'])->name('verifications.approve');
    Route::patch('/verifications/{user}/reject', [\App\Http\Controllers\Admin\DriverVerificationController::class, 'reject'])->name('verifications.reject');
    Route::patch('/verifications/{user}/profile-approve', [\App\Http\Controllers\Admin\DriverVerificationController::class, 'approveProfileUpdate'])->name('verifications.profile.approve');
    Route::patch('/verifications/{user}/profile-reject', [\App\Http\Controllers\Admin\DriverVerificationController::class, 'rejectProfileUpdate'])->name('verifications.profile.reject');
});



require __DIR__.'/auth.php';
