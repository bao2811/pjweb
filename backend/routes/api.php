<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\NotiController;
use App\Events\ChatMessage;
use Illuminate\Http\Request;
use App\Jobs\ExampleJob;

// Broadcasting auth route đã được chuyển sang routes/web.php
// để có URL /broadcasting/auth thay vì /api/broadcasting/auth

Route::get('/dispatch-job', function () {
    ExampleJob::dispatch(['user_id' => 123, 'action' => 'test']);
    return 'Job dispatched!';
});

Route::get('getAllLikes', [LikeController::class, 'getAllLikes']);
Route::get('getPostById/{id}', [PostController::class, 'getPostById']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('jwt');
Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail']);
Route::post('/refresh', [AuthController::class, 'refreshToken']);
Route::get('/me', [AuthController::class, 'getCurrentUser'])->middleware('jwt');

// Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
//     ->middleware(['signed', 'throttle:6,1'])
//     ->name('verification.verify');
// Route::post('/email/resend', [VerificationController::class, 'resend'])
//     ->middleware('throttle:6,1')
//     ->name('verification.resend');

Route::post('/groups/{id}/message', function (Request $request, $id) {
    $user = $request->input('user');
    $message = $request->input('message');

    broadcast(new ChatMessage($id, $user, $message));

    return response()->json(['status' => 'Message sent']);
});


// post
Route::group(['prefix' => 'posts', 'middleware' => 'jwt'], function () {
    Route::post('/getAllPosts', [PostController::class, 'getAllPosts']);
    Route::get('/getPostDetails/{id}', [PostController::class, 'getPostDetails']);
    Route::post('/createPost', [PostController::class, 'createPost']);
    Route::put('/updatePostById/{id}', [PostController::class, 'updatePostById']);
    Route::delete('/deletePostById/{id}', [PostController::class, 'deletePostById']);
    Route::post('/searchPosts', [PostController::class, 'searchPosts']);
    Route::post('/addCommentOfPost', [PostController::class, 'addCommentOfPost']);
    Route::post('/getCommentsOfPost/{postId}', [PostController::class, 'getCommentsOfPost']);
    Route::post('/getPostsByChannel/{channelId}', [PostController::class, 'getPostsByChannel']);
    Route::post('/getPostsByUserId/{userId}', [PostController::class, 'getPostsByUserId']);

    Route::get('/channel/{channelId}', [PostController::class, 'getPostsByChannel']);
    Route::post('/channel', [PostController::class, 'addPostToChannel']);
});

// like
Route::group(['prefix' => 'likes', 'middleware' => 'jwt'], function () {
    Route::post('/like/{id}', [LikeController::class, 'likePost']);
    Route::post('/unlike/{id}', [LikeController::class, 'unlikePost']);
    Route::get('/listlike/{postId}', [LikeController::class, 'getListLikeOfPost']);
});

// Event
Route::group(['prefix' => 'events', 'middleware' => 'jwt'], function () {
    Route::get('/getAllEvents', [EventController::class, 'getAllEvents']);
    Route::get('/getEventDetails/{id}', [EventController::class, 'getEventDetails']);
    Route::post('/createEvent', [EventController::class, 'createEvent']);
    Route::put('/updateEventById/{id}', [EventController::class, 'updateEventById']);
    Route::delete('/deleteEventById/{id}', [EventController::class, 'deleteEventById']);
    Route::post('/searchEvents', [EventController::class, 'searchEvents']);
    Route::get('/{id}/channel', [EventController::class, 'getEventChannel']);
});

 // Likes - Event
Route::group(['prefix' => 'likes/event', 'middleware' => 'jwt'], function () {
    Route::post('/like/{id}', [LikeController::class, 'likeEvent']);
    Route::post('/unlike/{id}', [LikeController::class, 'unlikeEvent']);
    Route::get('/{eventId}', [LikeController::class, 'getListLikeOfEvent']);
});

 // Messages (Chat)
Route::group(['prefix' => 'messages', 'middleware' => 'jwt'], function () {
    Route::get('/channel/{channelId}', [MessageController::class, 'getMessagesByChannel']);
    Route::post('/send', [MessageController::class, 'sendMessage']);
    Route::delete('/{id}', [MessageController::class, 'deleteMessage']);

});

// Notifications
Route::group(['prefix' => 'notifications', 'middleware' => 'jwt'], function () {
    // User notifications (lấy, đọc, xóa notifications của user hiện tại)
    Route::get('/', [NotiController::class, 'getUserNotifications']);
    Route::get('/unread-count', [NotiController::class, 'getUnreadCount']);
    Route::put('/{id}/read', [NotiController::class, 'markAsRead']);
    Route::put('/mark-all-read', [NotiController::class, 'markAllAsRead']);
    Route::delete('/{id}', [NotiController::class, 'deleteNotification']);
    
    // Admin/Manager: Gửi notifications (cần thêm middleware admin/manager nếu cần)
    Route::post('/send-test', [NotiController::class, 'sendNotification']); // Test gửi push
    Route::post('/send-to-all', [NotiController::class, 'sendToAllUsers']); // Gửi cho tất cả users
    Route::post('/send-to-event-participants', [NotiController::class, 'sendToEventParticipants']); // Gửi cho participants
    Route::post('/send-to-users', [NotiController::class, 'sendToSpecificUsers']); // Gửi cho users cụ thể
});

Route::options('{any}', function (Request $request) {
    return response()->json([], 200);
})->where('any', '.*');