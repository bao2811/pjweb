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
    // public function getAllEvents($userId)
    // {
    //     $query = Event::query();

    //     if ($userId) {
    //         // Thêm trường is_liked: true/false nếu user đã like
    //         $events = $query->withExists([
    //             'likes as is_liked' => function ($q) use ($userId) {
    //                 $q->where('user_id', $userId);
    //             }
    //         ]);
    //     } else {
    //         // Nếu không có userId → mặc định false
    //         $events = $query->selectRaw('events.*, false as is_liked');
    //     }

    //     return $events;
    // }

    public function getAllEvents($userId = null)
    {
        $query = Event::with('author:id,username,email,image'); // Eager load author info

        if ($userId) {
            // Thêm trường is_liked: 1 nếu user đã like, 0 nếu chưa
            $query->withExists([
                'likes as is_liked' => function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                }
            ]);
        } else {
            // Nếu không có userId → mặc định false
            $query->selectRaw('events.*, false as is_liked');
        }

        $events = $query->get();

        // // Thêm computed_status dựa trên thời gian
        // $events = $query->get()->map(function ($event) {
        //     $now = Carbon::now();
        //     $startTime = Carbon::parse($event->start_time);
        //     $endTime = Carbon::parse($event->end_time);

        //     // Tính toán computed_status
        //     if ($event->status === 'pending' && $endTime->isPast()) {
        //         $event->computed_status = 'expired';
        //     } elseif ($event->status === 'accepted' || $event->status === 'completed') {
        //         if ($now->lt($startTime)) {
        //             $event->computed_status = 'upcoming';
        //         } elseif ($now->between($startTime, $endTime)) {
        //             $event->computed_status = 'ongoing';
        //         } elseif ($now->gt($endTime)) {
        //             $event->computed_status = 'completed';
        //         }
        //     } else {
        //         $event->computed_status = $event->status;
        //     }

        //     return $event;
        // });

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

    public function acceptEvent($id, $senderId) : Event
    {
        $event = $this->getEventById($id);
        if (!$event) {
            throw new Exception('Event not found');
        }
        $event->status = 'accepted';
        $event->save();
        $notification = Noti::create([
            'title' => 'Event Accepted',
            'message' => 'Your event has been accepted.',
            'sender_id' => $senderId,
            'receiver_id' => $event->author_id,
            'type' => 'webpush',
            'data' => [
                'url' => '/events/' . $event->id,
                'icon' => '/icons/event-accepted.png',
            ],
        ]);

        // Broadcast notification qua WebSocket
        broadcast(new \App\Events\NotificationSent($notification, $event->author_id))->toOthers();
        $notification->sendPush();

        return $event;
    }

    public function rejectEvent($id, $senderId) : Event
    {
        $event = $this->getEventById($id);
        if (!$event) {
            throw new Exception('Event not found');
        }
        $event->status = 'rejected';
        $event->save();

        $notification = Noti::create([
            'title' => 'Event Rejected',
            'message' => 'Your event has been rejected.',
            'sender_id' => $senderId,
            'receiver_id' => $event->author_id,
            'type' => 'webpush',
            'data' => [
                'url' => '/events/' . $event->id,
                'icon' => '/icons/event-rejected.png',
            ],
        ]);

        // Broadcast notification qua WebSocket
        broadcast(new \App\Events\NotificationSent($notification, $event->author_id))->toOthers();
        $notification->sendPush();
        return $event;
    }   
}