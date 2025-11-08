<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Middleware\JwtMiddleware;

Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::get('/getuser', [UserController::class, 'getUser']);
    Route::get('/getUserDetails/{id}', [UserController::class, 'getUserDetails']);
    Route::get('/updateUserProfile/{id}', [UserController::class, 'updateUserProfile']);
    Route::get('/leaveEvent/{id}', [UserController::class, 'leaveEvent']);
    Route::get('/joinEvent/{id}', [UserController::class, 'joinEvent']);
    
    // Push notification subscription routes
    Route::post('/push/subscribe', [PushSubscriptionController::class, 'subscribe']);
    Route::post('/push/unsubscribe', [PushSubscriptionController::class, 'unsubscribe']);
    Route::get('/push/subscriptions', [PushSubscriptionController::class, 'listSubscriptions']);
    Route::delete('/push/unsubscribe-all', [PushSubscriptionController::class, 'unsubscribeAll']);
});