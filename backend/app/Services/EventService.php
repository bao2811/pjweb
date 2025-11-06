<?php

namespace App\Services;

use App\Repositories\UserRepo;
use App\Repositories\EventRepo;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EventService
{
    protected $eventRepo;

    public function __construct(EventRepo $eventRepo)
    {
        $this->eventRepo = $eventRepo;
    }

    public function getAllEvents()
    {
        return $this->eventRepo->getAllEvents();
    }

    public function createEvent($data, $userId)
    {
        // Thêm author_id và status mặc định
        $data['author_id'] = $userId;
        $data['status'] = 'upcoming'; // Sự kiện sắp diễn ra

        return $this->eventRepo->createEvent($data);
    }

    public function deleteEvent($id)
    {
        $result = $this->eventRepo->deleteEventById($id);
        if (!$result) {
            throw new Exception('Failed to delete event');
        }
        return $result;
    }

    public function acceptEvent($id)
    {
        $result = $this->eventRepo->acceptEvent($id);
        if (!$result) {
            throw new Exception('Failed to accept event');
        }
        return $result;
    }

    public function rejectEvent($id)
    {
        $result = $this->eventRepo->rejectEvent($id);
        if (!$result) {
            throw new Exception('Failed to reject event');
        }
        return $result;
    }
}