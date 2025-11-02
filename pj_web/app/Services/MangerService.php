<?php

namespace App\Services;

use App\Repositories\JoinEventRepo;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Repositories\EventRepo;

class JoinEventService {
    protected $joinEventRepo;
    protected $eventRepo;

    public function __construct(JoinEventRepo $joinEventRepo, EventRepo $eventRepo) {
        $this->joinEventRepo = $joinEventRepo;
        $this->eventRepo = $eventRepo;
    }

    public function getListUserByEvent($eventId) {
        return $this->joinEventRepo->getListUserByEvent($eventId);
    }

    public function acceptUserJoinEvent($user, $eventId) {
        return $this->joinEventRepo->acceptUserJoinEvent($user, $eventId);
    }

    public function rejectUserJoinEvent($eventId) {
        return $this->joinEventRepo->rejectUserJoinEvent($eventId);
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
}