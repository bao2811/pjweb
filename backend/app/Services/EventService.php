<?php

namespace App\Services;

use App\Repositories\UserRepo;
use App\Repositories\EventRepo;
use App\Repositories\EventManagementRepo;
use App\Models\Like;
use App\Models\Channel;
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

    public function getAllEvents($userId = null)
    {
        $events = $this->eventRepo->getAllEvents();
        
        \Log::info('🔍 EventService getAllEvents called', ['userId' => $userId]);
        
        // Thêm thông tin isLiked và likes cho mỗi event
        $events = $events->map(function ($event) use ($userId) {
            // Đếm tổng số likes
            $likesCount = Like::where('event_id', $event->id)->count();
            
            \Log::info("📊 Event {$event->id} likes count", [
                'event_id' => $event->id,
                'likesCount' => $likesCount,
                'userId' => $userId
            ]);
            
            // Kiểm tra user đã like event này chưa (nếu có userId)
            $isLiked = false;
            if ($userId) {
                $isLiked = Like::where('user_id', $userId)
                              ->where('event_id', $event->id)
                              ->exists();
                              
                \Log::info("👍 User like status", [
                    'user_id' => $userId,
                    'event_id' => $event->id,
                    'isLiked' => $isLiked
                ]);
            }
            
            $event->isLiked = $isLiked;
            $event->likes = $likesCount;
            
            return $event;
        });
        
        return $events;
    }

    public function getEventById($id)
    {
        return $this->eventRepo->getEventById($id);
    }

    public function searchEvents($query)
    {
        return $this->eventRepo->searchEvents($query);
    }

    public function createEvent($data, $userId)
    {
        // Thêm author_id và status mặc định
        $data['author_id'] = $userId;
        $data['status'] = 'upcoming'; // Sự kiện sắp diễn ra

        $event = $this->eventRepo->createEvent($data);
        
        // Tạo channel cho sự kiện
        if ($event) {
            Channel::create([
                'title' => 'Channel - ' . $event->title,
                'event_id' => $event->id,
            ]);
        }
        
        return $event;
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