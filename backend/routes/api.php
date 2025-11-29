<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ManagerController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\JoinEventController;
use App\Http\Controllers\NotiController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PushSubscriptionController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/refresh', [AuthController::class, 'refresh']);
Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail']);

// Protected routes
Route::middleware(['jwt.auth'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Posts
    Route::group(['prefix' => 'posts'], function () {
        Route::get('/getAllPosts', [PostController::class, 'getAllPosts']);
        Route::get('/getPostDetails/{id}', [PostController::class, 'getPostDetails']);
        Route::post('/createPost', [PostController::class, 'createPost']);
        Route::put('/updatePostById/{id}', [PostController::class, 'updatePostById']);
        Route::delete('/deletePostById/{id}', [PostController::class, 'deletePostById']);
        Route::post('/searchPosts', [PostController::class, 'searchPosts']);
        Route::post('/addCommentOfPost', [PostController::class, 'addCommentOfPost']);
        Route::post('/getCommentsOfPost/{postId}', [PostController::class, 'getCommentsOfPost']);
        Route::post('/getPostsByEventId', [PostController::class, 'getPostsByEventId']);
        Route::post('/getPostsByUserId', [PostController::class, 'getPostsByUserId']);
        
        // Posts trong Channel
        Route::get('/channel/{channelId}', [PostController::class, 'getPostsByChannel']);
        Route::post('/channel', [PostController::class, 'addPostToChannel']);
    });

    // Likes - Post
    Route::group(['prefix' => 'likes/post'], function () {
        Route::post('/like/{id}', [LikeController::class, 'likePost']);
        Route::post('/unlike/{id}', [LikeController::class, 'unlikePost']);
        Route::get('/{postId}', [LikeController::class, 'getListLikeOfPost']);
    });

    // Likes - Event
    Route::group(['prefix' => 'likes/event'], function () {
        Route::post('/like/{id}', [LikeController::class, 'likeEvent']);
        Route::post('/unlike/{id}', [LikeController::class, 'unlikeEvent']);
        Route::get('/{eventId}', [LikeController::class, 'getListLikeOfEvent']);
    });

    // Events
    Route::group(['prefix' => 'events'], function () {
        Route::get('/getAllEvents', [EventController::class, 'getAllEvents']);
        Route::get('/getEventDetails/{id}', [EventController::class, 'getEventDetails']);
        Route::post('/createEvent', [EventController::class, 'createEvent']);
        Route::put('/updateEventById/{id}', [EventController::class, 'updateEventById']);
        Route::delete('/deleteEventById/{id}', [EventController::class, 'deleteEventById']);
        Route::post('/searchEvents', [EventController::class, 'searchEvents']);
        Route::get('/{id}/channel', [EventController::class, 'getEventChannel']);
    });

    // Join Events
    Route::post('/joinEvent/{eventId}', [JoinEventController::class, 'joinEvent']);
    Route::post('/leaveEvent/{eventId}', [JoinEventController::class, 'leaveEvent']);
    Route::get('/my-registrations', [JoinEventController::class, 'getMyRegistrations']);
    
    // Notifications
    Route::get('/notifications', [NotiController::class, 'getUserNotifications']);
    Route::post('/notifications/{id}/read', [NotiController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotiController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotiController::class, 'deleteNotification']);
    
    // Messages (Chat)
    Route::group(['prefix' => 'messages'], function () {
        Route::get('/channel/{channelId}', [MessageController::class, 'getMessagesByChannel']);
        Route::post('/send', [MessageController::class, 'sendMessage']);
        Route::delete('/{id}', [MessageController::class, 'deleteMessage']);
    });
    
    // Push Notifications
    Route::post('/sendEventNotification', [JoinEventController::class, 'sendEventNotification']);
    Route::post('/sendEventNotificationToAll', [JoinEventController::class, 'sendEventNotificationToAll']);
    
    // Push Subscription
    Route::post('/push/subscribe', [PushSubscriptionController::class, 'subscribe']);
    Route::post('/push/unsubscribe', [PushSubscriptionController::class, 'unsubscribe']);
});