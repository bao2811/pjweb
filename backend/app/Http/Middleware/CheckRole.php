<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware CheckRole - Kiểm tra quyền truy cập theo role
 * 
 * Middleware này kiểm tra xem user hiện tại có role phù hợp
 * để truy cập route hay không.
 * 
 * @package App\Http\Middleware
 */
class CheckRole
{
    /**
     * Xử lý request đến
     * 
     * Kiểm tra role của user có nằm trong danh sách roles được phép hay không.
     * Nếu không, trả về lỗi 403 Unauthorized.
     * 
     * @param Request $request Request đến
     * @param Closure $next Middleware tiếp theo
     * @param string ...$roles Danh sách roles được phép (ví dụ: 'admin', 'manager')
     * @return Response
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, $roles)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
