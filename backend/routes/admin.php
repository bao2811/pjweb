<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\JwtMiddleware;

Route::middleware(['checkRoleAdmin'])->prefix('admin')->group(function () {
    Route::get('/banUser', [AdminController::class, 'banUser']);
    Route::get('/unbanUser', [AdminController::class, 'unbanUser']);
    Route::get('/deleteEvent/{id}', [AdminController::class, 'deleteEvent']);
    Route::delete('acceptEvent/{id}', [AdminController::class, 'acceptEvent']);
    Route::delete('rejectEvent/{id}', [AdminController::class, 'rejectEvent']);
    Route::get('/createManager', [AdminController::class, 'createMangerEvent']);
    Route::get('/getAllUsers', [AdminController::class, 'getAllUsers']);
    Route::get('/getAllEvents', [AdminController::class, 'getAllEvents']);
    Route::get('/getAllManagers', [AdminController::class, 'getAllManagers']);
});