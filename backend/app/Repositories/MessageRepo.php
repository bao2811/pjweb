<?php

namespace App\Repositories;

use App\Models\Message;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
class MessageRepo
{
    protected Message $messageModel;

    public function __construct(Message $messageModel)
    {
        $this->messageModel = $messageModel;
    }

    /**
     * MessageRepo constructor.
     *
     * @param Message $messageModel Model Message được inject
     */

    /**
     * Tạo message mới trong channel
     *
     * @param array $data Dữ liệu message (channel_id, author_id, content,...)
     * @return Message Message vừa tạo
     */
    public function createMessage(array $data): Message
    {
        return $this->messageModel->create($data);
    }

    /**
     * Xóa message theo ID
     *
     * @param int $id ID của message
     * @return bool True nếu xóa thành công
     * @throws ModelNotFoundException Nếu không tìm thấy message
     */
    public function deleteMessagebyId($id): bool
    {
        $message = $this->messageModel->find($id);
        if (!$message) {
            throw new ModelNotFoundException('Message not found');
        }
        return $message->delete();
    }

    /**
     * Lấy message đầu tiên theo user ID
     *
     * @param int $id ID của user
     * @return Message|null
     */
    public function getMessageByUserId($id): ?Message
    {
        return $this->messageModel->where('user_id', $id)->first();
    }

    /**
     * Lấy danh sách message theo channel ID
     *
     * @param int $channelId ID của channel
     * @return Collection
     */
    public function getMessagesByChannelId($channelId): Collection
    {
        return $this->messageModel->where('channel_id', $channelId)->get();
    }
}