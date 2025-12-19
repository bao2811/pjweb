<?php

namespace App\Repositories;

use App\Repositories\UserRepo;

use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Event;
use App\Models\EventManagement;
use App\Models\Noti;
use App\Models\User;

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
            // Thêm trường is_liked: 1 nếu user đã like (với status=1), 0 nếu chưa
            $query->withExists([
                'likes as is_liked' => function ($q) use ($userId) {
                    $q->where('user_id', $userId)->where('status', 1);
                }
            ]);
        } else {
            // Nếu không có userId → mặc định false
            $query->selectRaw('events.*, false as is_liked');
        }

        $events = $query->get();

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
        if (!empty($comanager)) {
            $event->comanagers()->attach($comanager);
        }
        
        // Gửi notification cho tất cả admin yêu cầu duyệt sự kiện
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $notification = Noti::create([
                'title' => 'Yêu cầu duyệt sự kiện mới',
                'message' => 'Manager đã tạo sự kiện "' . $event->title . '" cần phê duyệt.',
                'sender_id' => $data['author_id'],
                'receiver_id' => $admin->id,
                'type' => 'event_approval',
                'data' => [
                    'event_id' => $event->id,
                    'url' => '/admin/events',
                    'icon' => '/icons/event-pending.png',
                ],
            ]);
            
            // Broadcast notification qua WebSocket
            broadcast(new \App\Events\NotificationSent($notification, $admin->id))->toOthers();
            
            // Gửi push notification
            $notification->sendPush();
        }
        
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

    /**
     * Lấy danh sách events của một manager cụ thể (author_id)
     * FIX #6: Thêm withCount để đếm số người tham gia (sử dụng status 'approved' thay vì 'participating')
     */
    public function getEventsByManagerId($managerId)
    {
        return Event::with('author:id,username,email,image')
            ->withCount([
                // FIX #6: Đếm số người đã được duyệt
                'joinEvents as approved_participants' => function ($query) {
                    $query->where('status', 'approved');
                },
                // Đếm tổng số người tham gia (bao gồm completed/failed)
                'joinEvents as participants_count' => function ($query) {
                    $query->whereIn('status', ['approved', 'completed', 'failed']);
                }
            ])
            ->where('author_id', $managerId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'content' => $event->content,
                    'address' => $event->address,
                    'category' => $event->category,
                    'start_time' => $event->start_time,
                    'end_time' => $event->end_time,
                    'max_participants' => $event->max_participants,
                    'status' => $event->status,
                    'image' => $event->image,
                    // FIX #6: Trả về số người tham gia đã đếm
                    'approved_participants' => $event->approved_participants ?? 0,
                    'participants_count' => $event->participants_count ?? 0,
                    'author' => $event->author ? [
                        'id' => $event->author->id,
                        'username' => $event->author->username,
                        'email' => $event->author->email,
                        'image' => $event->author->image,
                    ] : null,
                    'created_at' => $event->created_at,
                    'updated_at' => $event->updated_at,
                ];
            });
    }

    public function searchEventsByKeyword($keyword) {
        return Event::where(function($query) use ($keyword) {
            $query->where('title', 'like', '%' . $keyword . '%')
                  ->orWhere('content', 'like', '%' . $keyword . '%');
        })
            ->get();
    }
}