<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Redis;

/**
 * Middleware RateLimitLikeUnlike - Giới hạn tần suất like/unlike
 * 
 * Sử dụng Redis Sorted Set để implement sliding window rate limiting.
 * Mặc định cho phép tối đa 10 thao tác trong 60 giây.
 * 
 * @package App\Http\Middleware
 */
class RateLimitLikeUnlike
{
    /** @var int Số lượt tối đa trong khoảng thời gian */
    protected $limit = 10;
    
    /** @var int Khoảng thời gian tính bằng giây */
    protected $seconds = 60;

    /**
     * Xử lý request đến
     * 
     * Kiểm tra số lượng thao tác like/unlike của user trong khoảng thời gian.
     * Nếu vượt quá giới hạn, trả về lỗi 429 Too Many Requests.
     * 
     * @param \Illuminate\Http\Request $request Request đến
     * @param Closure $next Middleware tiếp theo
     * @return mixed Response
     */
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
