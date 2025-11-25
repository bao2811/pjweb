<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handleCheckAdmin(Request $request, Closure $next): Response
    {
        $user = $request->user;

        if (!$user || !($user->role === 'admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return $next($request);
    }

    public function handleCheckManager(Request $request, Closure $next): Response
    {
        $user = $request->user;
        if (!$user || !($user->role === 'manager' || $user->role === 'admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        return $next($request);
    }
}
