<?php

namespace App\Repositories;

use App\Models\Channel;
use Exception;

class ChannelRepo
{
    public function getChannelById($id) : ?Channel
    {
        return Channel::find($id);
    }

    public function createChannel($data) : Channel
    {
        return Channel::create($data);
    }

    public function updateChannelById($id, $data) : Channel
    {
        $channel = $this->getChannelById($id);
        if (!$channel) {
            throw new Exception('Channel not found');
        }
        $channel->update($data);
        return $channel;
    }

    public function all()
    {
        return Channel::all();
    }

    public function deleteChannelById($id) : bool
    {
        $channel = $this->getChannelById($id);
        if (!$channel) {
            throw new Exception('Channel not found');
        }
        return $channel->delete();
    }
}