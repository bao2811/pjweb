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

    /**
     * Lấy danh sách users với kiểm tra quyền Manager
     */
    public function getListUserByEvent($eventId, $managerId) {
        // Kiểm tra Manager có quyền xem event này không
        $event = $this->eventRepo->getEventById($eventId);
        
        if (!$event) {
            throw new Exception('Event not found');
        }

        // Check ownership
        $isAuthor = $event->author_id === $managerId;
        $isComanager = $event->comanagers()->where('user_id', $managerId)->exists();
        
        if (!$isAuthor && !$isComanager) {
            throw new Exception('You do not have permission to view this event');
        }

        return $this->joinEventRepo->getListUserByEvent($eventId);
    }

    /**
     * Delete event với kiểm tra quyền sở hữu
     */
    public function deleteEvent($eventId, $managerId) {
        $event = $this->eventRepo->getEventById($eventId);
        
        if (!$event) {
            return false;
        }

        // Check ownership - chỉ author mới được xóa (không phải comanager)
        if ($event->author_id !== $managerId) {
            throw new Exception('Only the event creator can delete this event');
        }

        // Không cho xóa event đã kết thúc hoặc đang diễn ra
        if (now()->gte($event->start_time)) {
            throw new Exception('Cannot delete event that has started or completed');
        }

        return $this->eventRepo->deleteEventById($eventId);
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
     * Get event by ID for manager
     */
    public function getEventById($eventId, $managerId)
    {
        $event = $this->eventRepo->getEventById($eventId);
        
        if (!$event) {
            return null;
        }

        // Check if manager owns this event
        if ($event->author_id !== $managerId) {
            $isComanager = $event->comanagers()->where('user_id', $managerId)->exists();
            if (!$isComanager) {
                return null;
            }
        }

        return $event;
    }

    /**
     * Update event and notify admin
     * FIX #8: Thêm kiểm tra lifecycle - không cho sửa event đã bắt đầu/kết thúc
     */
    public function updateEvent($eventId, $managerId, array $eventData)
    {
        try {
            DB::beginTransaction();

            $event = $this->eventRepo->getEventById($eventId);
            
            if (!$event) {
                return null;
            }

            // FIX #8: Không cho sửa event đã bắt đầu hoặc kết thúc
            if (now()->gte($event->start_time)) {
                throw new Exception('Cannot edit event that has already started or completed');
            }

            // Check authorization
            $isAuthor = $event->author_id === $managerId;
            $isComanager = $event->comanagers()->where('user_id', $managerId)->exists();
            
            if (!$isAuthor && !$isComanager) {
                return null;
            }

            // Update event - sử dụng đúng tên method updateEventById
            $updated = $this->eventRepo->updateEventById($eventId, $eventData);

            // Notify all admins about the update
            $this->notifyAdminsAboutEventUpdate($event, $managerId);

            DB::commit();
            return $updated;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('ManagerService updateEvent error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send notification to all admins when event is updated
     */
    private function notifyAdminsAboutEventUpdate($event, $managerId)
    {
        try {
            // Get all admin users
            $admins = DB::table('users')->where('role', 'admin')->get();

            foreach ($admins as $admin) {
                DB::table('notifications')->insert([
                    'user_id' => $admin->id,
                    'type' => 'event_updated',
                    'data' => json_encode([
                        'event_id' => $event->id,
                        'event_title' => $event->title,
                        'manager_id' => $managerId,
                        'message' => 'Sự kiện "' . $event->title . '" đã được cập nhật bởi manager. Vui lòng xem xét các thay đổi.'
                    ]),
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }
        } catch (Exception $e) {
            Log::error('Error notifying admins about event update: ' . $e->getMessage());
        }
    }

    /**
     * Mark volunteer completion
     */
    public function markVolunteerCompletion($eventId, $userId, $managerId, $status, $completionNote = null)
    {
        // Verify manager owns the event or is comanager
        $event = $this->eventRepo->getEventById($eventId);
        if (!$event) {
            throw new Exception('Event not found');
        }

        // Check authorization: author or comanager
        $isAuthor = $event->author_id === $managerId;
        $isComanager = $event->comanagers()->where('user_id', $managerId)->exists();
        
        if (!$isAuthor && !$isComanager) {
            throw new Exception('Unauthorized: You are not the manager or comanager of this event');
        }

        // Check event has ended
        if (now()->lt($event->end_time)) {
            throw new Exception('Cannot mark completion: Event has not ended yet');
        }

        return $this->joinEventRepo->markVolunteerCompletion($eventId, $userId, $managerId, $status, $completionNote);
    }

    /**
     * Get event report
     */
    public function getEventReport($eventId, $managerId)
    {
        // Verify manager owns the event or is comanager
        $event = $this->eventRepo->getEventById($eventId);
        if (!$event) {
            throw new Exception('Event not found');
        }

        $isAuthor = $event->author_id === $managerId;
        $isComanager = $event->comanagers()->where('user_id', $managerId)->exists();
        
        if (!$isAuthor && !$isComanager) {
            throw new Exception('Unauthorized: You are not the manager or comanager of this event');
        }

        return $this->joinEventRepo->getEventReport($eventId);
    }

    /**
     * Get manager's events overview report
     */
    public function getManagerEventsReport($managerId)
    {
        return $this->joinEventRepo->getManagerEventsReport($managerId);
    }
}