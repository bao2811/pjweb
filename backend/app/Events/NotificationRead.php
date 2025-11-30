<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class NotificationRead implements ShouldBroadcast
{
    use SerializesModels;

    public $notificationId;
    public $userId;

    /**
     * Create a new event instance.
     */
    public function __construct(int $notificationId, int $userId)
    {
        $this->notificationId = $notificationId;
        $this->userId = $userId;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('notifications.' . $this->userId);
    }

    /**
     * Tên event được broadcast
     */
    public function broadcastAs(): string
    {
        return 'notification.read';
    }

    /**
     * Dữ liệu được broadcast
     */
    public function broadcastWith(): array
    {
        return [
            'notification_id' => $this->notificationId,
        ];
    }
}
