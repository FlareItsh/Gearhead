<?php

use App\Http\Controllers\BayController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SupplyController;
use App\Http\Controllers\SupplyPurchaseController;
use App\Http\Controllers\SupplyPurchaseDetailController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/payments/summary', [PaymentController::class, 'summary'])
        ->name('payments.summary');

    // * Bay CRUD routes
    Route::get('/bays', [BayController::class, 'index'])
        ->name('bays.index');
    Route::get('/bays/{id}', [BayController::class, 'show'])
        ->name('bays.show');
    Route::post('/bays', [BayController::class, 'store'])
        ->name('bays.store');
    Route::put('/bays/{id}', [BayController::class, 'update'])
        ->name('bays.update');
    Route::delete('/bays/{id}', [BayController::class, 'destroy'])
        ->name('bays.destroy');
    Route::get('/bays/available', [BayController::class, 'available'])
        ->name('bays.available');

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

    Route::get('/supply-purchases/detailed', [SupplyPurchaseController::class, 'detailedPurchases'])
        ->name('supply-purchases.detailed');

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

    Route::get('/suppliers', [SupplierController::class, 'index'])
        ->name('suppliers.index');
    Route::get('/suppliers/{id}', [SupplierController::class, 'show'])
        ->name('suppliers.show');
    Route::post('/suppliers', [SupplierController::class, 'store'])
        ->name('suppliers.store');
    Route::put('/suppliers/{id}', [SupplierController::class, 'update'])
        ->name('suppliers.update');
    Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy'])
        ->name('suppliers.destroy');

    Route::get('/supply-purchases', [SupplyPurchaseController::class, 'index'])
        ->name('supply-purchases.index');
    Route::get('/supply-purchases/{id}', [SupplyPurchaseController::class, 'show'])
        ->name('supply-purchases.show');
    Route::post('/supply-purchases', [SupplyPurchaseController::class, 'store'])
        ->name('supply-purchases.store');
    Route::put('/supply-purchases/{id}', [SupplyPurchaseController::class, 'update'])
        ->name('supply-purchases.update');
    Route::delete('/supply-purchases/{id}', [SupplyPurchaseController::class, 'destroy'])
        ->name('supply-purchases.destroy');

    Route::get('/supply-purchase-details', [SupplyPurchaseDetailController::class, 'index'])
        ->name('supply-purchase-details.index');
    Route::get('/supply-purchase-details/{id}', [SupplyPurchaseDetailController::class, 'show'])
        ->name('supply-purchase-details.show');
    Route::post('/supply-purchase-details', [SupplyPurchaseDetailController::class, 'store'])
        ->name('supply-purchase-details.store');
    Route::put('/supply-purchase-details/{id}', [SupplyPurchaseDetailController::class, 'update'])
        ->name('supply-purchase-details.update');
    Route::delete('/supply-purchase-details/{id}', [SupplyPurchaseDetailController::class, 'destroy'])
        ->name('supply-purchase-details.destroy');

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
