<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use App\Models\Noti;

class NotificationSent implements ShouldBroadcast
{
    use SerializesModels;

    public $notification;
    public $userId;

    /**
     * Create a new event instance.
     *
     * @param Noti $notification
     * @param int $userId
     */
    public function __construct(Noti $notification, int $userId)
    {
        \Log::info("=== 📡 NotificationSent Event Created ===");
        \Log::info("User ID:", ['userId' => $userId]);
        \Log::info("Notification:", [
            'id' => $notification->id,
            'title' => $notification->title,
            'receiver_id' => $notification->receiver_id
        ]);
        
        $this->notification = $notification;
        $this->userId = $userId;
    }

    /**
     * Get the channels the event should broadcast on.
     * Mỗi user có 1 private channel riêng: notifications.{userId}
     *
     * @return \Illuminate\Broadcasting\Channel
     */
    public function broadcastOn(): PrivateChannel
    {
        $channel = 'notifications.' . $this->userId;
        \Log::info("📢 Broadcasting on channel:", ['channel' => $channel]);
        return new PrivateChannel($channel);
    }

    /**
     * Tên event được broadcast
     */
    public function broadcastAs(): string
    {
        return 'notification.new';
    }

    /**
     * Dữ liệu được broadcast
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
        
        \Log::info("📦 Broadcast data:", $data);
        return $data;
    }
}
