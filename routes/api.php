<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\SupplyController;
use App\Http\Controllers\SupplyPurchaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/payments/summary', [PaymentController::class, 'summary'])
        ->name('payments.summary');

    Route::get('/payments/monthly-revenue', [PaymentController::class, 'monthlyRevenueByYear'])
        ->name('payments.monthly-revenue');

    Route::get('/payments/financial-summary', [PaymentController::class, 'financialSummaryByDateRange'])
        ->name('payments.financial-summary');

    Route::get('/payments/average-booking-value', [PaymentController::class, 'averageBookingValueByDateRange'])
        ->name('payments.average-booking-value');

    Route::get('/payments/retention-rate', [PaymentController::class, 'customerRetentionRateByDateRange'])
        ->name('payments.retention-rate');

    Route::get('/supply-purchases/financial-summary', [SupplyPurchaseController::class, 'financialSummary'])
        ->name('admin.supply-purchases.financial-summary');

    // * Service CRUD routes (must come before specific service routes)
    Route::post('/services', [ServiceController::class, 'store'])
        ->name('services.store');
    Route::put('/services/{id}', [ServiceController::class, 'update'])
        ->name('services.update');
    Route::delete('/services/{id}', [ServiceController::class, 'destroy'])
        ->name('services.destroy');

    // * Admin-specific top selling services route
    Route::get('/services/top', [ServiceController::class, 'topServices'])
        ->name('admin.services.top-selling');

    // * Admin-specific top selling services with size for reports
    Route::get('/services/top-with-size', [ServiceController::class, 'topServicesWithSize'])
        ->name('admin.services.top-selling-with-size');

    // ⭐ Added: Search services using ?keyword=
    Route::get('/services/search', [ServiceController::class, 'search'])
        ->name('admin.services.search');

    // * Staff route for Rendering and Managing Staffs
    Route::get('/staffs', [EmployeeController::class, 'index'])
        ->name('admin.staffs');
    Route::post('/staffs', [EmployeeController::class, 'store'])
        ->name('admin.staffs.store');
    Route::put('/staffs/{id}', [EmployeeController::class, 'update'])
        ->name('admin.staffs.update');
    Route::delete('/staffs/{id}', [EmployeeController::class, 'destroy'])
        ->name('admin.staffs.delete');
    Route::get('/staffs/active-count', [EmployeeController::class, 'activeCount'])
        ->name('admin.staffs.active-count');

    Route::get('/service-orders/pending', [ServiceOrderController::class, 'pending'])
        ->name('api.service-orders.pending');

    Route::get('/service-orders/bookings', [ServiceOrderController::class, 'getBookings'])
        ->name('api.service-orders.bookings');

    Route::get('/supplies', [SupplyController::class, 'index'])
        ->name('supplies.index');
    Route::get('/supplies/{id}', [SupplyController::class, 'show'])
        ->name('supplies.show');
    Route::post('/supplies', [SupplyController::class, 'store'])
        ->name('supplies.store');
    Route::put('/supplies/{id}', [SupplyController::class, 'update'])
        ->name('supplies.update');
    Route::delete('/supplies/{id}', [SupplyController::class, 'destroy'])
        ->name('supplies.destroy');

    Route::get('/customers/index', [CustomerController::class, 'getCustomers'])
        ->name('admin.customers.index');
});

Route::middleware(['auth', 'verified', 'role:customer'])->group(function () {
    // * Payments API: return the current user's payments count
    Route::get('/payments/count', [PaymentController::class, 'countForCurrentUser'])
        ->name('payments.count');

    Route::get('/payments/user', [PaymentController::class, 'indexForCurrentUser'])
        ->name('payments.user');

    Route::get('/bookings/upcoming', [ServiceOrderController::class, 'upcoming'])
        ->name('bookings.upcoming');
    Route::post('/bookings', [ServiceOrderController::class, 'store'])
        ->name('bookings.store');
    Route::post('/bookings/book', [ServiceOrderController::class, 'book'])
        ->name('bookings.book');
    Route::post('/bookings/cancel/{id}', [CustomerController::class, 'cancelBooking'])
        ->name('bookings.cancel');
});
