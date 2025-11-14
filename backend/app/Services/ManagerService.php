<?php

namespace App\Services;

use App\Repositories\JoinEventRepo;
use App\Repositories\EventManagementRepo;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Repositories\EventRepo;

class ManagerService {
    protected $joinEventRepo;
    protected $eventRepo;
    protected $eventManagementRepo;

    public function __construct(
        JoinEventRepo $joinEventRepo, 
        EventRepo $eventRepo,
        EventManagementRepo $eventManagementRepo
    ) {
        $this->joinEventRepo = $joinEventRepo;
        $this->eventRepo = $eventRepo;
        $this->eventManagementRepo = $eventManagementRepo;
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
            
            // Nếu có comanager, thêm vào event_managements
            if (!empty($comanager)) {
                $this->eventManagementRepo->addComanagerByEventId($event->id, $comanager);
            }
            
            // TODO: Tạo kênh sự kiện (channel)
            
            DB::commit();
            return $event;
            
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('ManagerService::createEvent failed: ' . $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Re-throw để controller xử lý
        }
    }
}
