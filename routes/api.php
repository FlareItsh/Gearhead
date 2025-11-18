<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SupplyPurchaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/payments/summary', [PaymentController::class, 'summary'])
        ->name('payments.summary');

    Route::get('/supply-purchases/financial-summary', [SupplyPurchaseController::class, 'financialSummary'])->name('admin.supply-purchases.financial-summary');

    // * Admin-specific top selling services route
    Route::get('/services/top', [ServiceController::class, 'topServices'])->name('admin.services.top-selling')->middleware('role:admin');

    // * Staff route for Rendering and Managing Staffs
    Route::get('/staffs', [EmployeeController::class, 'index'])
        ->name('admin.staffs')->middleware('role:admin');
    Route::post('/staffs', [EmployeeController::class, 'store'])
        ->name('admin.staffs.store')->middleware('role:admin');
    Route::put('/staffs/{id}', [EmployeeController::class, 'update'])
        ->name('admin.staffs.update')->middleware('role:admin');
    Route::delete('/staffs/{id}', [EmployeeController::class, 'destroy'])
        ->name('admin.staffs.delete')->middleware('role:admin');
    Route::get('/staffs/active-count', [EmployeeController::class, 'activeCount'])
        ->name('admin.staffs.active-count')->middleware('role:admin');
});

Route::middleware(['auth', 'verified', 'role:customer'])->group(function () {
    // * Payments API: return the current user's payments count
    Route::get('/payments/count', [PaymentController::class, 'countForCurrentUser'])
        ->name('payments.count');

    Route::get('/payments/user', [PaymentController::class, 'indexForCurrentUser'])
        ->name('payments.user');

    Route::get('/bookings/upcoming', [ServiceOrderController::class, 'upcoming'])
        ->name('bookings.upcoming');
    Route::post('/bookings/cancel/{id}', [CustomerController::class, 'cancelBooking'])
        ->name('bookings.cancel');
});
