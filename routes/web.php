<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CustomerController;
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

    // Customer-specific routes
    Route::get('/bookings', [CustomerController::class, 'bookings'])
        ->name('customer.bookings')
        ->middleware('role:customer');
    Route::get('/services', [CustomerController::class, 'services'])
        ->name('customer.services')
        ->middleware('role:customer');
    Route::get('/payment-history', [CustomerController::class, 'payments'])
        ->name('customer.payment-history')
        ->middleware('role:customer');

    // Admin Specific routes
    Route::get('/registry', [AdminController::class, 'registry'])
        ->name('registry')
        ->middleware('role:admin');
    Route::get('/bookings', [AdminController::class, 'bookings'])
        ->name('bookings')
        ->middleware('role:admin');
    Route::get('/customers', [AdminController::class, 'customers'])
        ->name('customers')
        ->middleware('role:admin');
    Route::get('/services', [AdminController::class, 'services'])
        ->name('services')
        ->middleware('role:admin');
    Route::get('/staffs', [AdminController::class, 'staffs'])
        ->name('staffs')
        ->middleware('role:admin');
    Route::get('/inventory', [AdminController::class, 'inventory'])
        ->name('inventory')
        ->middleware('role:admin');
    Route::get('/transactions', [AdminController::class, 'transactions'])
        ->name('transactions')
        ->middleware('role:admin');
    Route::get('/reports', [AdminController::class, 'reports'])
        ->name('reports')
        ->middleware('role:admin');
    Route::get('/bays', [AdminController::class, 'bays'])
        ->name('bays')
        ->middleware('role:admin');

});

// Auth routes (register, login, etc.)
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
