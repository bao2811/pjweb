<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Middleware\JwtMiddleware;

Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::get('/getUserDetails/{id}', [UserController::class, 'getUserDetails']);
    Route::get('/updateUserProfile/{id}', [UserController::class, 'updateUserProfile']);
    Route::get('/leaveEvent/{id}', [UserController::class, 'leaveEvent']);
    Route::get('/joinEvent/{id}', [UserController::class, 'joinEvent']);
});