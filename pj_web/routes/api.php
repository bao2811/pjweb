<?php

use Illuminate\Support\Facades\Route;

Route::get('/users', [UserController::class, 'index']);
Route::post('/login', [ApiAuthController::class, 'login']);
Route::get('/profile', [ApiAuthController::class, 'profile'])->middleware('auth:api');
