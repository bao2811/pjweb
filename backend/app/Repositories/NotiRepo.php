<?php

namespace App\Repositories;

use App\Models\Noti;

class NotiRepo
{
    public function findByUserId($userId)
    {
        return Noti::where('user_id', $userId)
                   ->orderBy('created_at', 'desc')
                   ->get();
    }

    public function create($data)
    {
        return Noti::create($data);
    }

    public function markAsRead($id)
    {
        $noti = Noti::find($id);
        if ($noti) {
            $noti->is_read = true;
            $noti->save();
            return $noti;
        }
        return null;
    }

    public function delete($id)
    {
        $noti = Noti::find($id);
        if ($noti) {
            return $noti->delete();
        }
        return false;
    }
}
