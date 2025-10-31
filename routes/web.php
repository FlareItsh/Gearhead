<?php

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

    // Optional admin route
    Route::middleware('role:admin')->group(function () {
        Route::resource('users', UserController::class);
    });
});

// Auth routes (register, login, etc.)
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
