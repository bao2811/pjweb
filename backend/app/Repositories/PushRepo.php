<?php

namespace App\Repositories;

use App\Models\PushSubscription;

class PushRepo
{
    /**
     * Lấy tất cả subscriptions của users đã đăng ký WebPush theo batch (chunk)
     *
     * Callback nhận danh sách subscriptions, không phải chỉ user_id.
     *
     * @param int $chunkSize Số lượng record mỗi batch
     * @param callable $callback Hàm callback xử lý từng batch
     */
    public function getAllSubscriptionsInChunk(int $chunkSize = 100, callable $callback)
    {
        PushSubscription::select('*')
            ->chunk($chunkSize, $callback);
    }
    
    /**
     * Lấy tất cả subscriptions của một user cụ thể
     *
     * @param int $userId ID của user
     * @return \Illuminate\Database\Eloquent\Collection Danh sách PushSubscription
     */
    public function getSubscriptionsByUserId(int $userId)
    {
        return PushSubscription::where('user_id', $userId)->get();
    }
}
