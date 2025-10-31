<?php

use App\Http\Controllers\Customer\CustomerBookingsController;
use App\Http\Controllers\Customer\CustomerPaymentController;
use App\Http\Controllers\Customer\CustomerServicesController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Routes
Route::get('/', fn () => Inertia::render('welcome'))->name('home');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard is available to any authenticated and verified user
    Route::get('dashboard', fn () => Inertia::render('dashboard'))
        ->name('dashboard');

    // Customer-specific dashboard (separate page for customer users)
    Route::get('customer-dashboard', fn () => Inertia::render('Customer/CustomerDashboard'))
        ->name('customer.dashboard');

    Route::get('/bookings', [CustomerBookingsController::class, 'index'])->name('customer.bookings');
    Route::get('/services', [CustomerServicesController::class, 'index'])->name('customer.services');
    Route::get('/payment-history', [CustomerPaymentController::class, 'index'])->name('customer.payment-history');

    // Optional admin route
    Route::middleware('role:admin')->group(function () {
        Route::resource('users', UserController::class);
    });

    // Example admin-only route (uses controller with role middleware)
    // Route::get('admin-only', [\App\Http\Controllers\Admin\OnlyAdminController::class, 'index'])
    //     ->name('admin.only')
    //     ->middleware('role:admin');

    // Example customer-only route (uses controller with role middleware)
    // Route::get('customer-only', [\App\Http\Controllers\Customer\OnlyCustomerController::class, 'index'])
    //     ->name('customer.only')
    //     ->middleware('role:customer');
});

// Auth routes (register, login, etc.)
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
