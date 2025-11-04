<?php

namespace App\Providers;

use App\Repositories\UserRepo;
use App\Repositories\JoinEventRepo;
use App\Services\UserService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(UserRepo::class, function ($app) {
            return new UserRepo();
        });
        $this->app->singleton(UserService::class, function ($app) {
            return new UserService(
                $app->make(UserRepo::class),
                $app->make(JoinEventRepo::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Đăng ký rate limiter 'api' để dùng với throttle:api
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}
