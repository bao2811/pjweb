<?php

namespace App\Providers;

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
            return new UserService($app->make(UserRepo::class));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
