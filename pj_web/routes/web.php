<?php

use Illuminate\Support\Facades\Route;

Auth::routes(['verify' => true]);

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('auth');
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



Route::get('/me', function (Request $request) {
    return [
        'user' => Auth::user(),
        'session_id' => $request->session()->getId(),
        'session_data' => $request->session()->all(),
    ];
});