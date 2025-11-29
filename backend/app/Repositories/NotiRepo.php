<?php

namespace App\Repositories;

use App\Models\Noti;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NotiRepo
{
    /**
     * Tìm notification theo ID
     */
    public function findById($id): ?Noti
    {
        return Noti::find($id);
    }

    /**
     * Lấy tất cả notifications của một user
     */
    public function findByUserId($userId)
    {
        return Noti::where('receiver_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Tạo notification mới
     */
    public function create($data): Noti
    {
        return Noti::create($data);
    }

    /**
     * Đánh dấu tất cả notifications của user là đã đọc
     */
    public function markAllAsReadByUserId($userId): bool
    {
        return Noti::where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]) !== false;
    }

    /**
     * Xóa notification theo ID
     */
    public function deleteById($id): bool
    {
        $noti = $this->findById($id);
        if (!$noti) {
            return false;
        }
        return $noti->delete();
    }

    /**
     * Lấy số lượng notifications chưa đọc của user
     */
    public function getUnreadCountByUserId($userId): int
    {
        return Noti::where('receiver_id', $userId)
            ->where('is_read', false)
            ->count();
    }
}