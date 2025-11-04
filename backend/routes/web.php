<?php

use Illuminate\Support\Facades\Route;

// Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('auth');
// Route::post('/login', [AuthController::class, 'login']);
// Route::post('/logout', [AuthController::class, 'logout']);


Route::get('/me', function (Request $request) {
    return [
        'user' => Auth::user(),
        'session_id' => $request->session()->getId(),
        'session_data' => $request->session()->all(),
    ];
});