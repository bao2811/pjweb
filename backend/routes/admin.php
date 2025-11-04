<?php

namespace App\Routes;

use App\Controllers\AdminController;
use App\Middleware\AdminMiddleware;
use App\Middleware\AuthMiddleware;
use App\Middleware\CsrfMiddleware;
use App\Middleware\LoggingMiddleware;
use App\Middleware\RoleMiddleware;
use App\Middleware\ValidationMiddleware;
use Framework\Routing\Route;

Route::group('/admin', function () {

    Route::get('/getAllUsers', [AdminController::class, 'getAllUser'])
        ->middleware([AuthMiddleware::class, AdminMiddleware::class, CsrfMiddleware::class, ValidationMiddleware::class]);

    Route::get('/getAllEvents', [AdminController::class, 'getAllEvents'])
        ->middleware([AuthMiddleware::class, AdminMiddleware::class, RoleMiddleware::class . ':superadmin', CsrfMiddleware::class]);
});