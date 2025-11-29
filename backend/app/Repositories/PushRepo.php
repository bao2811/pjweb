<?php

namespace App\Repositories;

use App\Models\PushSubscription;

class PushRepo
{
    /**
     * Lấy tất cả subscriptions của users đã đăng ký WebPush theo batch
     * Callback nhận danh sách subscriptions, không phải chỉ user_id
     */
    public function getAllSubscriptionsInChunk(int $chunkSize = 100, callable $callback)
    {
        PushSubscription::select('*')
            ->chunk($chunkSize, $callback);
    }
    
    /**
     * Lấy tất cả subscriptions của một user cụ thể
     */
    public function getSubscriptionsByUserId(int $userId)
    {
        return PushSubscription::where('user_id', $userId)->get();
    }
}
