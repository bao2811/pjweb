<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

/**
 * Event NotificationRead - Broadcast khi notification được đọc
 * 
 * Event này được broadcast khi user đánh dấu notification là đã đọc.
 * Giúp đồng bộ trạng thái đọc giữa các tab/devices của user.
 * 
 * @package App\Events
 */
class NotificationRead implements ShouldBroadcast
{
    use SerializesModels;

    /** @var int ID của notification đã đọc */
    public $notificationId;
    
    /** @var int ID của user */
    public $userId;

    /**
     * Khởi tạo event
     * 
     * @param int $notificationId ID của notification đã đọc
     * @param int $userId ID của user
     */
    public function __construct(int $notificationId, int $userId)
    {
        $this->notificationId = $notificationId;
        $this->userId = $userId;
    }

    /**
     * Xác định private channel để broadcast
     * 
     * @return PrivateChannel
     */
    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('notifications.' . $this->userId);
    }

    /**
     * Tên event được broadcast đến client
     * 
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'notification.read';
    }

    /**
     * Dữ liệu được broadcast đến client
     * 
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'notification_id' => $this->notificationId,
        ];
    }
}
