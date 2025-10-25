<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// This group applies 'auth' and 'verified' middleware to all routes within it
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->middleware('role:admin')->name('dashboard');

    Route::get('homepage', function () {
        return Inertia::render('homepage/homepage');
    })->name('homepage'); // This is your redirect target for unauthorized users
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
