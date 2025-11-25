<?php

namespace App\Repositories;

use App\Models\PushSubscription;

class PushRepo
{
    /**
     * Lấy tất cả user đã đăng ký WebPush theo batch
     */
    public function getAllUserIdsInChunk(int $chunkSize = 100, callable $callback)
    {
        PushSubscription::select('user_id')
            ->distinct()
            ->chunk($chunkSize, $callback);
    }
}
