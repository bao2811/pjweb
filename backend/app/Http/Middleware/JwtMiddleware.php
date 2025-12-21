<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use App\Utils\JWTUtil;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\GenericUser;

/**
 * Middleware JwtMiddleware - Xác thực JWT token
 * 
 * Middleware này kiểm tra và validate JWT token từ header Authorization.
 * Nếu token hợp lệ, gán user vào request để các controller có thể truy cập.
 * 
 * @package App\Http\Middleware
 */
class JwtMiddleware
{
    /**
     * Xử lý request đến
     * 
     * Trích xuất và validate JWT token, sau đó gán user vào request.
     * Nếu token không hợp lệ, trả về lỗi 401.
     * 
     * @param Request $request Request đến
     * @param Closure $next Middleware tiếp theo
     * @return mixed Response
     */
    public function handle(Request $request, Closure $next)
    {
        Log::info('🔐 [JWT Middleware] Request received', [
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
            
            Log::info('✅ [JWT Middleware] Token validated successfully', [
                'user_id' => $user->id,
                'username' => $user->username,
            ]);
            
        } catch (Exception $e) {
           Log::error('❌ [JWT Middleware] Token validation failed', [
               'error' => $e->getMessage(),
               'trace' => $e->getTraceAsString(),
           ]);
           
           return response()->json([
                'error' => 'Invalid token: ' . $e->getMessage()
            ], 401);
        }

        return $next($request);
    }
    // public function handle(Request $request, Closure $next)
    // {
    //     Log::info('🔐 [JWT Middleware] Request received', [
    //         'path' => $request->path(),
    //         'method' => $request->method(),
    //         'has_auth_header' => $request->hasHeader('Authorization'),
    //         'auth_header' => $request->header('Authorization') ? 'Bearer ***' : 'NULL',
    //     ]);
        
    //     try {
    //         $token = JWTUtil::extractToken($request);
    //         $decoded = JWTUtil::validateToken($token);
    //         // Try to resolve a real Eloquent User model; fall back to a generic object
    //         $userModel = null;
    //         try {
    //             $userModel = User::find($decoded->sub);
    //         } catch (\Throwable $t) {
    //             // ignore model resolution errors, we'll fallback to generic user
    //         }

    //         if ($userModel) {
    //             // Set the authenticated user for the Auth facade and request user resolver
    //             Auth::setUser($userModel);
    //             $request->setUserResolver(function () use ($userModel) {
    //                 return $userModel;
    //             });
    //         } else {
    //             $attributes = [
    //                 'id' => $decoded->sub,
    //                 'email' => $decoded->email ?? null,
    //                 'username' => $decoded->username ?? null,
    //                 'role' => $decoded->role ?? null,
    //             ];
    //             $generic = new GenericUser($attributes);
    //             $request->setUserResolver(function () use ($generic) {
    //                 return $generic;
    //             });
    //             // Also set Auth user so auth()->id() and auth()->user() work
    //             Auth::setUser($generic);
    //         }

    //         $request->attributes->set('userId', $decoded->sub);
    //         $request->attributes->set('jwtPayload', $decoded);
            
    //         Log::info('✅ [JWT Middleware] Token validated successfully', [
    //             'user_id' => $decoded->sub,
    //             'username' => $decoded->username ?? null,
    //             'resolved_user_model' => $userModel ? true : false,
    //         ]);
            
    //     } catch (Exception $e) {
    //        Log::error('❌ [JWT Middleware] Token validation failed', [
    //            'error' => $e->getMessage(),
    //            'trace' => $e->getTraceAsString(),
    //        ]);
           
    //        return response()->json([
    //             'error' => 'Invalid token: ' . $e->getMessage()
    //         ], 401);
    //     }

    //     return $next($request);
    // }


}