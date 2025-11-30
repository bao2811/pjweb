<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Broadcasting auth route được tự động đăng ký trong routes/channels.php
// thông qua Broadcast::routes(['middleware' => ['jwt']])

Auth::routes(['verify' => true]);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Gửi link xác minh
Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');

// Link trong email sẽ trỏ về route này
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill(); // Gọi markEmailAsVerified()
    return redirect('/home');
})->middleware(['auth', 'signed'])->name('verification.verify');

// Gửi lại link xác minh nếu cần
Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return back()->with('message', 'Link xác nhận đã được gửi lại!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');

Auth::routes();
Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');