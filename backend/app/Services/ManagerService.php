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

    /**
     * Đánh dấu tình nguyện viên đã hoàn thành sự kiện
     */
    public function markUserAsCompleted($userId, $eventId, $managerId)
    {
        // Kiểm tra manager có quyền quản lý sự kiện này không
        $event = $this->eventRepo->findById($eventId);
        if ($event->author_id !== $managerId) {
            throw new Exception('Unauthorized: You are not the manager of this event');
        }

        return $this->joinEventRepo->markUserAsCompleted($userId, $eventId);
    }

    /**
     * Bỏ đánh dấu hoàn thành của tình nguyện viên
     */
    public function markUserAsIncomplete($userId, $eventId, $managerId)
    {
        // Kiểm tra manager có quyền quản lý sự kiện này không
        $event = $this->eventRepo->findById($eventId);
        if ($event->author_id !== $managerId) {
            throw new Exception('Unauthorized: You are not the manager of this event');
        }

        return $this->joinEventRepo->markUserAsIncomplete($userId, $eventId);
    }

    /**
     * Lấy báo cáo tình nguyện viên cho sự kiện
     */
    public function getEventReport($eventId, $managerId, $completed = null)
    {
        // Kiểm tra manager có quyền quản lý sự kiện này không
        $event = $this->eventRepo->findById($eventId);
        if ($event->author_id !== $managerId) {
            throw new Exception('Unauthorized: You are not the manager of this event');
        }

        return $this->joinEventRepo->getEventReport($eventId, $completed);
    }
}