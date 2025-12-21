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

    /**
     * Lấy channel theo ID
     *
     * @param int $id ID của channel
     * @return Channel|null
     */


    /**
     * Tạo channel mới
     *
     * @param array $data Dữ liệu channel
     * @return Channel Channel vừa tạo
     */
    public function createChannel($data) : Channel
    {
        return Channel::create($data);
    }

    /**
     * Cập nhật channel theo ID
     *
     * @param int $id ID của channel
     * @param array $data Dữ liệu cập nhật
     * @return Channel Channel sau khi cập nhật
     * @throws Exception Nếu channel không tồn tại
     */
    public function updateChannelById($id, $data) : Channel
    {
        $channel = $this->getChannelById($id);
        if (!$channel) {
            throw new Exception('Channel not found');
        }
        $channel->update($data);
        return $channel;
    }

    /**
     * Lấy tất cả channel
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function all()
    {
        return Channel::all();
    }

    /**
     * Xóa channel theo ID
     *
     * @param int $id ID của channel
     * @return bool true nếu xóa thành công
     * @throws Exception Nếu channel không tồn tại
     */
    public function deleteChannelById($id) : bool
    {
        $channel = $this->getChannelById($id);
        if (!$channel) {
            throw new Exception('Channel not found');
        }
        return $channel->delete();
    }
}