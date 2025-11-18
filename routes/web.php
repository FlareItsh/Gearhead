<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CustomerController;
use App\Repositories\BookingRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// * Public Routes
Route::get('/', fn () => Inertia::render('welcome'))->name('home');

// * Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function (Request $request, AdminController $admin, CustomerController $customer) {
        $user = $request->user();
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('customer')) {
            return $customer->dashboard($request);
        }

        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('customer-dashboard', [CustomerController::class, 'dashboard'])
        ->name('customer.dashboard');

    // * Role-aware shared routes
    Route::get('/bookings', function (Request $request, AdminController $admin, CustomerController $customer) {
        $user = $request->user();

        if ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            return $admin->bookings($request);
        }

        $bookingRepo = app(BookingRepository::class); // manually resolve

        return $customer->bookings($request, $bookingRepo);
    })->name('bookings');

    // * Role specific services route
    Route::get('/services', function (Request $request, AdminController $admin, CustomerController $customer) {
        $user = $request->user();
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            return $admin->services($request);
        }

        return $customer->services($request);
    })->name('services');

    // * Customer-specific routes
    Route::get('/payments', [CustomerController::class, 'payments'])
        ->name('customer.payments')
        ->middleware('auth', 'role:customer');

    // * Admin Specific routes (fixed controller method references and unique names)
    Route::get('/registry', [AdminController::class, 'registry'])
        ->name('admin.registry')
        ->middleware('role:admin');
    Route::get('/customers', [AdminController::class, 'customers'])
        ->name('admin.customers')
        ->middleware('role:admin');

    Route::get('/inventory', [AdminController::class, 'inventory'])
        ->name('admin.inventory')
        ->middleware('role:admin');
    Route::get('/transactions', [AdminController::class, 'transactions'])
        ->name('admin.transactions')
        ->middleware('role:admin');
    Route::get('/reports', [AdminController::class, 'reports'])
        ->name('admin.reports')
        ->middleware('role:admin');
    Route::get('/bays', [AdminController::class, 'bays'])
        ->name('admin.bays')
        ->middleware('role:admin');

});

// * Auth routes (register, login, etc.)
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/api.php';
