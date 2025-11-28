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
            
        } catch (Exception $e) {
           return response()->json([
                'error' => 'Invalid token: ' . $e->getMessage()
            ], 401);
        }

        return $next($request);
    }
}