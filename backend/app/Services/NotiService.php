<?php

namespace App\Services;
use App\Repositories\NotiRepo;
use Exception;

class NotiService
{
    protected $notiRepo;

    public function __construct(NotiRepo $notiRepo)
    {
        $this->notiRepo = $notiRepo;
    }

    public function getNotificationsByUserId($userId)
    {
        try {
            return $this->notiRepo->findByUserId($userId);
        } catch (Exception $e) {
            return [];
        }
    }

    public function createNotification($data)
    {
        try {
            return $this->notiRepo->create($data);
        } catch (Exception $e) {
            return null;
        }
    }

    public function markAsRead($id)
    {
        try {
            return $this->notiRepo->markAsRead($id);
        } catch (Exception $e) {
            return null;
        }
    }

    public function markAllAsRead($userId)
    {
        try {
            $notifications = $this->notiRepo->findByUserId($userId);
            foreach ($notifications as $noti) {
                $noti->is_read = true;
                $noti->save();
            }
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public function deleteNotification($id)
    {
        try {
            return $this->notiRepo->delete($id);
        } catch (Exception $e) {
            return false;
        }
    }
}
