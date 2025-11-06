<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ManagerController;
use App\Http\Middleware\JwtMiddleware;

Route::middleware(['checkRoleManager'])->prefix('manager')->group(function () {
    Route::get('/getListUserByEvent/{id}', [ManagerController::class, 'getListUserByEvent']);
    Route::get('/unbanacceptUserJoinEventUser/{id}', [ManagerController::class, 'acceptUserJoinEvent']);
    Route::get('/rejectUserJoinEvent/{id}', [ManagerController::class, 'rejectUserJoinEvent']);
    Route::post('/createEvent', [ManagerController::class, 'createEvent']);
});