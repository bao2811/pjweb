<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

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

    public function broadcastPrivate(): Channel
    {
        return new PrivateChannel('group.' . $this->groupId);

    }
}
