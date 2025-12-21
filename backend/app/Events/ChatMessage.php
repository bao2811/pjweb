<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Event ChatMessage - Broadcast tin nhắn chat trong channel
 * 
 * Event này được broadcast khi có tin nhắn mới trong group chat.
 * Sử dụng Laravel Broadcasting để gửi realtime đến clients.
 * 
 * @package App\Events
 */
class ChatMessage implements ShouldBroadcast
{
    use SerializesModels;

    /** @var int ID của group/channel chat */
    public int $groupId;
    
    /** @var string Tên người gửi */
    public string $user;
    
    /** @var string Nội dung tin nhắn */
    public string $message;

    /**
     * Khởi tạo event với thông tin tin nhắn
     * 
     * @param int $groupId ID của group chat
     * @param string $user Tên người gửi
     * @param string $message Nội dung tin nhắn
     */
    public function __construct(int $groupId, string $user, string $message)
    {
        $this->groupId = $groupId;
        $this->user = $user;
        $this->message = $message;
    }

    /**
     * Xác định channel broadcast (public)
     * 
     * @return Channel
     */
    public function broadcastOn(): Channel
    {
        return new Channel('chat.' . $this->groupId);
    }

    /**
     * Xác định private channel broadcast
     * 
     * @return PrivateChannel
     */
    public function broadcastPrivate(): PrivateChannel
    {
        return new PrivateChannel('group.' . $this->groupId);
    }

    /**
     * Dữ liệu được gửi kèm khi broadcast
     * 
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'user' => $this->user,
            'message' => $this->message,
        ];
    }
}
