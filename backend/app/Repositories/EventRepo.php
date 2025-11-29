<?php

namespace App\Repositories;

use App\Repositories\UserRepo;
use App\Repositories\EventRepo;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Event;
use App\Models\EventManagement;
use App\Models\Noti;

class EventRepo
{
    public function getEventById($id) : ?Event
    {
        return Event::find($id);
    }

    /**
     * Lấy tất cả events và kiểm tra user đã like hay chưa
     * 
     * @param int|null $userId ID của user để filter và check like status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllEvents($userId = null)
    {
        $query = Event::query();

        if ($userId) {
            // Thêm trường is_liked: true/false nếu user đã like
            $events = $query->withExists([
                'likes as is_liked' => function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                }
            ]);
        } else {
            // Nếu không có userId → mặc định false
            $events = $query->selectRaw('events.*, false as is_liked');
        }

        return $events;
    }

    public function deleteEventById($id) : bool
    {
        $event = $this->getEventById($id);
        if (!$event) {
            throw new Exception('Event not found');
        }
        return $event->delete();
    }

    public function createEvent($data, $comanager = []) : Event
    {
        
        $event = Event::create($data);
        // Attach comanagers to the event
        $event->comanagers()->attach($comanager);
        Noti::sendpush();
        return $event;
    }

    public function updateEventById($id, $data) : Event
    {
        $event = $this->getEventById($id);
        if (!$event) {
            throw new Exception('Event not found');
        }
        $event->update($data);
        return $event;
    }

    public function acceptEvent($id) : Event
    {
        $event = $this->getEventById($id);
        if (!$event) {
            throw new Exception('Event not found');
        }
        $event->status = 'accepted';
        $event->save();
        return $event;
    }

    public function rejectEvent($id) : Event
    {
        $event = $this->getEventById($id);
        if (!$event) {
            throw new Exception('Event not found');
        }
        $event->status = 'rejected';
        $event->save();
        return $event;
    }   
}