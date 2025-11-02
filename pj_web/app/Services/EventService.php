<?php

namespace App\Services;

use App\Repositories\UserRepo;
use App\Repositories\EventRepo;
use App\Managements\EventManagementRepo;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EventService
{
    protected $eventRepo;
    protected $eventManagementRepo;

    public function __construct(EventRepo $eventRepo, EventManagementRepo $eventManagementRepo)
    {
        $this->eventRepo = $eventRepo;
        $this->eventManagementRepo = $eventManagementRepo;
    }

    public function getAllEvents()
    {
        return $this->eventRepo->getAllEvents();
    }

    public function createEvent(array $data, array $comanager = [])
    {
        try {
            DB::beginTransaction();
            $event = $this->eventRepo->createEvent($data);
            $this->eventManagementRepo->addComanagerByEventId($event->id, $comanager);
            // tạo kênh sự kiện nữa
            DB::commit();
    return $event;
        } catch (Exception $e) {
            // Handle exception
            DB::rollBack();
            return null;
        }
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