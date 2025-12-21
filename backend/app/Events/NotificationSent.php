<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use App\Models\Noti;
use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * Event NotificationSent - Broadcast thông báo mới đến user
 * 
 * Event này được broadcast khi có notification mới được tạo.
 * Mỗi user có một private channel riêng: notifications.{userId}
 * 
 * @package App\Events
 */
class NotificationSent implements ShouldBroadcast
{
    use SerializesModels;

    /** @var Noti Notification được gửi */
    public $notification;
    
    /** @var int ID của user nhận */
    public $userId;

    /**
     * Khởi tạo event với notification và userId
     *
     * @param Noti $notification Notification cần broadcast
     * @param int $userId ID của user nhận notification
     */
    public function __construct(Noti $notification, int $userId)
    {
        
        $this->notification = $notification;
        $this->userId = $userId;
    }

    /**
     * Xác định private channel để broadcast
     * 
     * Mỗi user có 1 private channel riêng: notifications.{userId}
     *
     * @return PrivateChannel
     */
    public function broadcastOn(): PrivateChannel
    {
        $channel = 'notifications.' . $this->userId;
        Log::info("📢 Broadcasting on channel:", ['channel' => $channel]);
        return new PrivateChannel($channel);
    }

    /**
     * Tên event được broadcast đến client
     * 
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'notification.new';
    }

    /**
     * Dữ liệu notification được broadcast đến client
     * 
     * @return array
     */
    public function broadcastWith(): array
    {
        $data = [
            'id' => $this->notification->id,
            'title' => $this->notification->title,
            'message' => $this->notification->message,
            'type' => $this->notification->type,
            'data' => $this->notification->data,
            'is_read' => $this->notification->is_read,
            'created_at' => $this->notification->created_at->toIso8601String(),
            'sender_id' => $this->notification->sender_id,
        ];
        if ($this->notification->is_read) {
            $data['read_at'] = $this->notification->updated_at->toIso8601String();
        }
        return $data;
    }
}
