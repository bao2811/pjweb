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

    public function __construct(JoinEventRepo $joinEventRepo, EventRepo $eventRepo)
    {
        $this->joinEventRepo = $joinEventRepo;
        $this->eventRepo = $eventRepo;
    }

    public function joinEvent($userId, $eventId)
    {
        $event =  $this->eventRepo->getEventById($eventId);
            if (!$event) {
                return [
                    'success' => false,
                    'message' => 'Event not found',
                    'data' => null
                ];
            }
            if ($event->current_participants >= $event->max_participants) {
                return [
                    'success' => false,
                    'message' => 'Event is full',
                    'data' => null
                ];
            }
            if ($event->start_time <= Carbon::now()) {
                return [
                    'success' => false,
                    'message' => 'Cannot join event that has already started',
                    'data' => null
                ];
            }
        $result =  $this->joinEventRepo->joinEvent($userId, $eventId);

        if ($result) {
            return [
                'success' => true,
                'message' => 'Joined event successfully',
                'data' => $result
            ];
        } else {
            return false;
        }
    }

    public function leaveEvent($userId, $eventId)
    {

       $event =  $this->eventRepo->getEventById($eventId);
       if (!$event) {
           return [
               'success' => false,
               'message' => 'Event not found',
               'data' => null
           ];
       }
       if ($event->start_time <= Carbon::now()) {
           return [
               'success' => false,
               'message' => 'Cannot leave event that has already started',
               'data' => null
           ];
       }
       $result = $this->joinEventRepo->leaveEvent($userId, $eventId);

        // kiểm tra check điều kiện để  rời và đăng ký sự kiện
        if ($result) {
            return [
                'success' => true,
                'message' => 'Left event successfully',
                'data' => $result
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Failed to leave event',
                'data' => null
            ];
        }
    }

    public function getMyRegistrations($userId)
    {
        return $this->joinEventRepo->getMyRegistrations($userId);
    }

}