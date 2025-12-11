<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\NotiController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Middleware\VerifyEmailMiddleware;

Route::middleware(['jwt'])->prefix('user')->group(function () {
    Route::get('/getuser', [UserController::class, 'getUser']);
    Route::get('/getUserDetails/{id}', [UserController::class, 'getUserDetails']);
    Route::get('/updateUserProfile/{id}', [UserController::class, 'updateUserProfile']);
    Route::post('/leaveEvent/{id}', [UserController::class, 'leaveEvent']);
    Route::post('/joinEvent/{id}', [UserController::class, 'joinEvent']);
    Route::get('/getEventHistory', [UserController::class, 'getEventHistory']);
    Route::get('/eventHistory', [UserController::class, 'getEventHistory']);
    Route::get('/my-registrations', [UserController::class, 'getMyRegistrations']);
    
    // Push notification subscription routes
    Route::post('/push/subscribe', [PushSubscriptionController::class, 'subscribe']);
    Route::post('/push/unsubscribe', [PushSubscriptionController::class, 'unsubscribe']);
    Route::get('/push/subscriptions', [PushSubscriptionController::class, 'listSubscriptions']);
    Route::delete('/push/unsubscribe-all', [PushSubscriptionController::class, 'unsubscribeAll']);
    
    // Notification routes
    Route::get('/notifications', [NotiController::class, 'getUserNotifications']);
    Route::post('/notifications/{id}/read', [NotiController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotiController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotiController::class, 'getUnreadCount']);
    Route::delete('/notifications/{id}', [NotiController::class, 'deleteNotification']);
});