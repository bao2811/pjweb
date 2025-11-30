<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use App\Utils\JWTUtil;
use Illuminate\Http\Request;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        \Log::info('🔐 [JWT Middleware] Request received', [
            'path' => $request->path(),
            'method' => $request->method(),
            'has_auth_header' => $request->hasHeader('Authorization'),
            'auth_header' => $request->header('Authorization') ? 'Bearer ***' : 'NULL',
        ]);
        
        try {
            $token = JWTUtil::extractToken($request);
            $decoded = JWTUtil::validateToken($token);
            $user = (object) [
                'id' => $decoded->sub,
                'email' => $decoded->email,
                'username' => $decoded->username,
                'role' => $decoded->role,
            ];

            // Gán userResolver để request->user() trả về user này
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
            $request->attributes->set('userId', $decoded->sub);
            $request->attributes->set('jwtPayload', $decoded);
            
            \Log::info('✅ [JWT Middleware] Token validated successfully', [
                'user_id' => $user->id,
                'username' => $user->username,
            ]);
            
        } catch (Exception $e) {
           \Log::error('❌ [JWT Middleware] Token validation failed', [
               'error' => $e->getMessage(),
               'trace' => $e->getTraceAsString(),
           ]);
           
           return response()->json([
                'error' => 'Invalid token: ' . $e->getMessage()
            ], 401);
        }

        return $next($request);
    }
}