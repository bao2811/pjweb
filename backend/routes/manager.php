<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ManagerController;
use App\Http\Middleware\JwtMiddleware;

Route::middleware(['jwt', 'check.role:manager'])->prefix('manager')->group(function () {
    Route::get('/my-events', [ManagerController::class, 'getMyEvents']);
    Route::get('/getListUserByEvent/{id}', [ManagerController::class, 'getListUserByEvent']);
    Route::post('/acceptUserJoinEvent', [ManagerController::class, 'acceptUserJoinEvent']);
    Route::post('/rejectUserJoinEvent', [ManagerController::class, 'rejectUserJoinEvent']);
    Route::post('/createEvent', [ManagerController::class, 'createEvent']);
    Route::post('/markUserAsCompleted', [ManagerController::class, 'markUserAsCompleted']);
    Route::post('/markUserAsIncomplete', [ManagerController::class, 'markUserAsIncomplete']);
    Route::get('/getEventReport/{eventId}', [ManagerController::class, 'getEventReport']);
});