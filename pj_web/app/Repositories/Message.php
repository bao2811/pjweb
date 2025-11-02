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

    public function createMessage(array $data): Message
    {
        return $this->messageModel->create($data);
    }

    public function deleteMessagebyId($id): bool
    {
        $message = $this->messageModel->find($id);
        if (!$message) {
            throw new ModelNotFoundException('Message not found');
        }
        return $message->delete();
    }

    public function getMessageByUserId($id): ?Message
    {
        return $this->messageModel->where('user_id', $id)->first();
    }

    public function getMessagesByChannelId($channelId): Collection
    {
        return $this->messageModel->where('channel_id', $channelId)->get();
    }
}