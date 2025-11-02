<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Đăng ký route cho ứng dụng.
     */
    public function boot(): void
    {
        $this->routes(function () {
            // Route web chính
            Route::middleware('web')
                ->group(base_path('routes/web.php'));

            // Route API
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            // ⚡ Route cho admin
            Route::middleware(['web', 'auth'])
                ->prefix('admin')
                ->name('admin.')
                ->group(base_path('routes/admin.php'));
                
            Route::middleware(['web', 'auth'])
                ->prefix('manager')
                ->name('manager.')
                ->group(base_path('routes/manager.php'));

            Route::middleware(['web', 'auth'])
                ->prefix('user')
                ->name('user.')
                ->group(base_path('routes/user.php'));
        });
    }
}
