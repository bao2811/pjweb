<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            // Nạp thêm các file route tuỳ chỉnh với prefix 'api'
            Route::prefix('api')
                ->middleware('api')
                ->group(function () {
                    require __DIR__.'/../routes/admin.php';
                    require __DIR__.'/../routes/manager.php';
                    require __DIR__.'/../routes/user.php';
                });
        }
    )
    ->withMiddleware(function ($middleware) {
        // RateLimiter 'api' được đăng ký trong AppServiceProvider::boot()

        // Middleware toàn cục
        $global = [
            \App\Http\Middleware\TrustProxies::class,
            \App\Http\Middleware\PreventRequestsDuringMaintenance::class,
            \App\Http\Middleware\TrimStrings::class,
            \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
            \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
            \Illuminate\Http\Middleware\HandleCors::class,
        ];

        if (method_exists($middleware, 'middleware')) {
            $middleware->middleware($global);
        } elseif (method_exists($middleware, 'prepend')) {
            foreach ($global as $m) {
                $middleware->prepend($m);
            }
        }

        // Nhóm middleware
        $groups = [
            'web' => [
                \App\Http\Middleware\EncryptCookies::class,
                \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
                \Illuminate\Session\Middleware\StartSession::class,
                \Illuminate\View\Middleware\ShareErrorsFromSession::class,
                \App\Http\Middleware\VerifyCsrfToken::class,
                \Illuminate\Routing\Middleware\SubstituteBindings::class,
            ],
            'api' => [
                // ❌ BỎ JwtMiddleware - sẽ dùng ['jwt.auth'] trong routes thay vì auto-apply
                \Illuminate\Routing\Middleware\SubstituteBindings::class,
                \Illuminate\Routing\Middleware\ThrottleRequests::class . ':api',
            ],
            'admin' => [
                \App\Http\Middleware\JwtMiddleware::class,
                \Illuminate\Routing\Middleware\SubstituteBindings::class,
                \Illuminate\Routing\Middleware\ThrottleRequests::class . ':api',
            ],
        ];

        foreach ($groups as $name => $list) {
            if (method_exists($middleware, 'group')) {
                $middleware->group($name, $list);
            }
        }

        // Alias middleware
        if (method_exists($middleware, 'alias')) {
            $middleware->alias([
                'jwt.auth' => \App\Http\Middleware\JwtMiddleware::class,
                'check.role' => \App\Http\Middleware\CheckRole::class,
                'jwt' => \App\Http\Middleware\JwtMiddleware::class,
                'auth' => \App\Http\Middleware\Authenticate::class,
                'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
                'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
                'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
                'can' => \Illuminate\Auth\Middleware\Authorize::class,
                'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
                'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
                'precognitive' => \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
                'signed' => \App\Http\Middleware\ValidateSignature::class,
                'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
                'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
                'role' => \App\Http\Middleware\CheckRole::class,
            ]);
        }

    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Laravel 12 tự dùng App\Exceptions\Handler
    })
    ->create();
