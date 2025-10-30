<?php

use Illuminate\Support\Facades\Route;

Route::get('/users', [UserController::class, 'index'])->middleware('auth:api');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');
Route::post('/email/resend', [VerificationController::class, 'resend'])
    ->middleware('throttle:6,1')
    ->name('verification.resend');

Route::get('/dashboard', function () {
    // chỉ vào được khi email đã xác minh
})->middleware(['auth', 'verified']);
