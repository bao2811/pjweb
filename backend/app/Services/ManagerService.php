<?php

namespace App\Services;

use App\Repositories\JoinEventRepo;
use App\Repositories\ChannelRepo;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Repositories\EventRepo;

class ManagerService {
    protected $joinEventRepo;
    protected $eventRepo;
    protected $channelRepo;

    public function __construct(JoinEventRepo $joinEventRepo, EventRepo $eventRepo, ChannelRepo $channelRepo) {
        $this->joinEventRepo = $joinEventRepo;
        $this->eventRepo = $eventRepo;
        $this->channelRepo = $channelRepo;
    }

    public function getListUserByEvent($eventId) {
        return $this->joinEventRepo->getListUserByEvent($eventId);
    }

    public function acceptUserJoinEvent($userId, $eventId, $managerId) {
        return $this->joinEventRepo->acceptUserJoinEvent($userId, $eventId, $managerId);
    }

    public function rejectUserJoinEvent($eventId, $userId, $managerId) {
        return $this->joinEventRepo->rejectUserJoinEvent($eventId, $userId, $managerId);
    }

    public function createEvent(array $data, array $comanager = [])
    {
        try {
            DB::beginTransaction();
            $event = $this->eventRepo->createEvent($data, $comanager);
            
            // Tạo kênh sự kiện
            $this->channelRepo->createChannel([
                'event_id' => $event->id,
                'title' => 'Kênh sự kiện: ' . $event->title,
                'created_at' => Carbon::now(),
            ]);
            
            DB::commit();
            return $event;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('ManagerService createEvent error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Lấy danh sách events của một manager cụ thể
     */
    public function getEventsByManagerId($managerId)
    {
        return $this->eventRepo->getEventsByManagerId($managerId);
    }
}