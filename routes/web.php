<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\PaymentController;
use App\Models\Bay;
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
        $bookingRepo = app(BookingRepository::class);

        return $customer->bookings($request, $bookingRepo);
    })->name('bookings');

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

    // * Admin Specific routes
    Route::get('/registry', [AdminController::class, 'registry'])
        ->name('admin.registry')
        ->middleware('role:admin');

    Route::get('/registry/{bayId}/select-services', function ($bayId) {
        // Get bay details from database
        $bay = Bay::find($bayId);
        if (! $bay) {
            abort(404, 'Bay not found');
        }

        return Inertia::render('Admin/RegistrySelectServices', [
            'bayId' => (int) $bayId,
            'bayNumber' => (int) $bay->bay_number,
        ]);
    })->name('admin.registry.select-services')->middleware('role:admin');

    // THIS IS THE ONLY LINE YOU NEED TO CHANGE
    Route::get('/registry/{id}/payment', function ($id) {
        return Inertia::render('Admin/RegistryPayment', [  // ← Added "Admin/"
            'bayId' => (int) $id,
        ]);
    })->name('admin.registry.payment')->middleware('role:admin');

    Route::get('/customers', [AdminController::class, 'customers'])
        ->name('admin.customers')
        ->middleware('role:admin');

    Route::get('/inventory', [AdminController::class, 'inventory'])
        ->name('admin.inventory')
        ->middleware('role:admin');

    Route::get('/pullout-requests-page', function () {
        return Inertia::render('Admin/PulloutRequests');
    })
        ->name('admin.pullout-requests')
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

// * Auth routes
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/api.php';
