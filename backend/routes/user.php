<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::middleware(['jwt.auth', 'check.role:user'])->prefix('user')->group(function () {
    Route::get('/getUserDetails/{id}', [UserController::class, 'getUserDetails']);
    Route::get('/updateUserProfile/{id}', [UserController::class, 'updateUserProfile']);
    Route::get('/eventHistory', [UserController::class, 'getEventHistory']);
    // joinEvent và leaveEvent đã được xử lý trong routes/api.php bởi JoinEventController
});