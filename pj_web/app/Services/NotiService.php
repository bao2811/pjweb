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
            // Handle exception
            return [];
        }
    }

    public function createNotification($data)
    {
        try {
            return $this->notiRepo->create($data);
        } catch (Exception $e) {
            // Handle exception
            return null;
        }
    }
}