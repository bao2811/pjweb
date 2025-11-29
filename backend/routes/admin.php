<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\JwtMiddleware;

Route::middleware(['jwt', 'check.role:admin'])->prefix('admin')->group(function () {
    Route::post('/banUser/{id}', [AdminController::class, 'banUser']);
    Route::post('/unbanUser/{id}', [AdminController::class, 'unbanUser']);
    Route::delete('/deleteEvent/{id}', [AdminController::class, 'deleteEvent']);
    Route::delete('/deleteUser/{id}', [AdminController::class, 'deleteUser']);
    Route::post('/bulkLockUsers', [AdminController::class, 'bulkLockUsers']);
    Route::post('/bulkUnlockUsers', [AdminController::class, 'bulkUnlockUsers']);
    Route::post('acceptEvent/{id}', [AdminController::class, 'acceptEvent']);
    Route::post('rejectEvent/{id}', [AdminController::class, 'rejectEvent']);
    Route::post('/createManager', [AdminController::class, 'createManagerEvent']);
    Route::get('/getAllUsers', [AdminController::class, 'getAllUsers']);
    Route::get('/getAllEvents', [AdminController::class, 'getAllEvents']);
    Route::get('/getAllManagers', [AdminController::class, 'getAllManagers']);
});

