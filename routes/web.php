<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Routes
Route::get('/', fn () => Inertia::render('welcome'))->name('home');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', fn () => Inertia::render('dashboard'))
        ->middleware('role:admin')
        ->name('dashboard');

    Route::get('homepage', fn () => Inertia::render('homepage/homepage'))
        ->name('homepage');

    // Optional admin route
    Route::middleware('role:admin')->group(function () {
        Route::resource('users', UserController::class);
    });
});

// Auth routes (register, login, etc.)
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
