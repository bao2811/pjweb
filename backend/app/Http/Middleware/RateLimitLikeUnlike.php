<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Redis;

class RateLimitLikeUnlike
{
    // $limit: số lượt tối đa, $seconds: khoảng thời gian
    protected $limit = 10;
    protected $seconds = 60;

    public function handle($request, Closure $next)
    {
        $userId = $request->user()->id; // lấy user hiện tại
        $key = "like_unlike_sliding:$userId";
        $now = time();

        // Xóa các thao tác cũ hơn $seconds giây
        Redis::zremrangebyscore($key, 0, $now - $this->seconds);

        // Lấy số thao tác còn lại
        $count = Redis::zcard($key);

        if ($count >= $this->limit) {
            return response()->json([
                'error' => 'Bạn thao tác quá nhanh, chờ một chút nhé!'
            ], 429);
        }

        // Thêm thao tác mới
        Redis::zadd($key, $now, $now);
        Redis::expire($key, $this->seconds);

        return $next($request);
    }
}
