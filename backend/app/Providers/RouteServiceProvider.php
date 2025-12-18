<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{


    protected function configureRateLimiting(): void
    {
        RateLimiter::for('global', function ($request) {
            return Limit::perMinute(500)
                ->by($request->user()?->id ?: $request->ip());
        });
    }

    /**
     * Đăng ký route cho ứng dụng.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();

        $this->routes(function () {

            Route::middleware(['web', 'throttle:global'])
                ->group(base_path('routes/web.php'));

            Route::middleware(['api', 'throttle:global'])
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware(['web', 'auth', 'throttle:global'])
                ->prefix('admin')
                ->name('admin.')
                ->group(base_path('routes/admin.php'));

            Route::middleware(['web', 'auth', 'throttle:global'])
                ->prefix('manager')
                ->name('manager.')
                ->group(base_path('routes/manager.php'));

            Route::middleware(['web', 'auth', 'throttle:global'])
                ->prefix('user')
                ->name('user.')
                ->group(base_path('routes/user.php'));
        });
    }
}
