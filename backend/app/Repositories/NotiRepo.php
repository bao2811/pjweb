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
     *
     * @param int $id ID của notification
     * @return Noti|null
     */
    public function findById($id): ?Noti
    {
        return Noti::find($id);
    }

    /**
     * Lấy tất cả notifications của một user (kèm thông tin người gửi)
     *
     * @param int $userId ID của user nhận
     * @return \Illuminate\Support\Collection Danh sách notifications
     */
    public function findByUserId($userId)
    {
        $notifications = DB::table('notis')
            ->leftJoin('users as sender', 'notis.sender_id', '=', 'sender.id')
            ->where('notis.receiver_id', $userId)
            ->select(
                'notis.*',
                'sender.username as sender_username',
                'sender.email as sender_email',
                'sender.image as sender_image',
                'sender.role as sender_role'
            )
            ->orderBy('notis.created_at', 'desc')
            ->get();
        
        // Parse JSON data field
        return $notifications->map(function ($noti) {
            if (is_string($noti->data)) {
                $noti->data = json_decode($noti->data, true) ?? [];
            }
            return $noti;
        });
    }

    /**
     * Tạo notification mới
     *
     * @param array $data Dữ liệu notification
     * @return Noti Notification vừa tạo
     */
    public function create($data): Noti
    {
        return Noti::create($data);
    }

    /**
     * Đánh dấu tất cả notifications của user là đã đọc
     *
     * @param int $userId ID của user
     * @return bool True nếu cập nhật thành công
     */
    public function markAllAsReadByUserId($userId): bool
    {
        return Noti::where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]) !== false;
    }

    /**
     * Xóa notification theo ID
     *
     * @param int $id ID của notification
     * @return bool True nếu xóa thành công
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
     *
     * @param int $userId ID của user
     * @return int Số lượng chưa đọc
     */
    public function getUnreadCountByUserId($userId): int
    {
        return Noti::where('receiver_id', $userId)
            ->where('is_read', false)
            ->count();
    }
}