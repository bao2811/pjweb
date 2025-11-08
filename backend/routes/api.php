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
use App\Events\ChatMessage;
use Illuminate\Http\Request;


Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail']);


Route::get('/dashboard', function () {
})->middleware(['auth', 'verified']);

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
Route::group(['prefix' => 'posts'], function () {
    Route::post('/getAllPosts', [PostController::class, 'getAllPosts']);
    Route::get('/getPostDetails/{id}', [PostController::class, 'getPostDetails']);
    Route::post('/createPost', [PostController::class, 'createPost']);
    Route::put('/updatePostById/{id}', [PostController::class, 'updatePostById']);
    Route::delete('/deletePostById/{id}', [PostController::class, 'deletePostById']);
    Route::post('/searchPosts', [PostController::class, 'searchPosts']);
    Route::post('/addCommentOfPost', [PostController::class, 'addCommentOfPost']);
    Route::post('/getCommentsOfPost/{postId}', [PostController::class, 'getCommentsOfPost']);
    Route::post('/getPostsByEventId', [PostController::class, 'getPostsByEventId']);
    Route::post('/getPostsByUserId', [PostController::class, 'getPostsByUserId']);
});

// like
Route::group(['prefix' => 'likes'], function () {
    Route::post('/like/{id}', [LikeController::class, 'likePost']);
    Route::post('/unlike/{id}', [LikeController::class, 'unlikePost']);
    Route::get('/likes/{postId}', [LikeController::class, 'getListLikeOfPost']);
});

// Event
Route::group(['prefix' => 'events'], function () {
    Route::get('/getAllEvents', [EventController::class, 'getAllEvents']);
    Route::get('/getEventDetails/{id}', [EventController::class, 'getEventDetails']);
    Route::post('/createEvent', [EventController::class, 'createEvent']);
    Route::put('/updateEventById/{id}', [EventController::class, 'updateEventById']);
    Route::delete('/deleteEventById/{id}', [EventController::class, 'deleteEventById']);
    Route::post('/searchEvents', [EventController::class, 'searchEvents']);
});

Route::options('{any}', function (Request $request) {
    return response()->json([], 200);
})->where('any', '.*');