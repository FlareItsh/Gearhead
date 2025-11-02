<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CustomerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Routes
Route::get('/', fn () => Inertia::render('welcome'))->name('home');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard is available to any authenticated and verified user
    Route::get('dashboard', fn () => Inertia::render('dashboard'))
        ->name('dashboard');

    Route::get('customer-dashboard', [CustomerController::class, 'dashboard'])
        ->name('customer.dashboard');

    // Role-aware shared routes (avoid duplicate URIs)
    // These delegate to the appropriate controller based on the authenticated user's role.
    Route::get('/bookings', function (Request $request, AdminController $admin, CustomerController $customer) {
        $user = $request->user();
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            return $admin->bookings($request);
        }

        return $customer->bookings($request);
    })->name('bookings');

    Route::get('/services', function (Request $request, AdminController $admin, CustomerController $customer) {
        $user = $request->user();
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            return $admin->services($request);
        }

        return $customer->services($request);
    })->name('services');

    // Customer-specific routes
    Route::get('/payments', [CustomerController::class, 'payments'])
        ->name('customer.payments')
        ->middleware('role:customer');

    // Payments API: return the current user's payments count
    Route::get('/payments/count', [\App\Http\Controllers\PaymentController::class, 'countForCurrentUser'])
        ->name('payments.count')
        ->middleware(['auth', 'role:customer']);

    // Admin Specific routes (fixed controller method references and unique names)
    Route::get('/registry', [AdminController::class, 'registry'])
        ->name('admin.registry')
        ->middleware('role:admin');
    Route::get('/customers', [AdminController::class, 'customers'])
        ->name('admin.customers')
        ->middleware('role:admin');
    Route::get('/staffs', [AdminController::class, 'staffs'])
        ->name('admin.staffs')
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

// Auth routes (register, login, etc.)
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
