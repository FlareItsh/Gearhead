<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Bay;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/bays', function () {
    return Bay::all();
});

// Route::post('/bays', function (Request $request) {
//     return Bay::add([
//         'bay_number' => $request->bay_number,
//         'bay_type' => $request->bay_type,
//         'status' => $request->status ?? 'available',
//     ]);
// });

// Route::post('/bays', function (\Illuminate\Http\Request $request) {
//     return Bay::add([
//         'bay_number' => $request->bay_number,
//         'bay_type' => $request->bay_type,
//         'status' => $request->status,
//     ]);
// });