<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use App\Utils\JWTUtil;
use App\Models\User;
use Illuminate\Http\Request;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $token = JWTUtil::extractToken($request);
            $decoded = JWTUtil::validateToken($token);
            
            // Lưu userId vào attributes
            $request->attributes->set('userId', $decoded->sub);
            
            // Load user từ database
            $user = User::find($decoded->sub);
            if (!$user) {
                return response()->json([
                    'error' => 'User not found'
                ], 404);
            }
            
            // Set user vào request để auth() helper hoạt động
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
            
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Invalid token: ' . $e->getMessage()
            ], 401);
        }

        return $next($request);
    }
}