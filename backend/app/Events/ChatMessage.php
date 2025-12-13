<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;

class ChatMessage implements ShouldBroadcast
{
    use SerializesModels;

    public int $groupId;
    public string $user;
    public string $message;

    public function __construct(int $groupId, string $user, string $message)
    {
        $this->groupId = $groupId;
        $this->user = $user;
        $this->message = $message;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('chat.' . $this->groupId);
    }

    public function broadcastPrivate(): PrivateChannel
    {
        return new PrivateChannel('group.' . $this->groupId);
    }

    public function broadcastWith(): array
    {
        return [
            'user' => $this->user,
            'message' => $this->message,
        ];
    }
}
