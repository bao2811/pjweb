<?php

namespace App\Repositories;

use App\Models\JoinEvent;
use App\Models\Noti;
use App\Models\Event;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Exception;

class JoinEventRepo
{
    public function getJoinEventById($id)
    {
        return JoinEvent::find($id);
    }

    public function joinEvent($data) : JoinEvent
    {
        // Kiểm tra điều kiện trước khi insert
        $event = Event::find($data['event_id']);
        if (!$event) {
            throw new Exception('Event not found');
        }

        // Kiểm tra event chưa bắt đầu
        if (now()->gte($event->start_time)) {
            throw new Exception('Event has already started');
        }

        // Kiểm tra user đã đăng ký chưa (chỉ kiểm tra status pending hoặc approved)
        $existing = JoinEvent::where('user_id', $data['user_id'])
            ->where('event_id', $data['event_id'])
            ->whereIn('status', ['pending', 'approved'])
            ->first();
        
        if ($existing) {
            throw new Exception('You have already registered for this event');
        }

        // Tạo JoinEvent mới bằng Eloquent (trả về JoinEvent model)
        $joinEvent = JoinEvent::create([
            'user_id' => $data['user_id'],
            'event_id' => $data['event_id'],
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Gửi notification cho manager
        $notification = Noti::createAndPush([
            'title' => 'Yêu cầu tham gia sự kiện đã được gửi 📩',
            'message' => "Yêu cầu tham gia sự kiện của bạn đang chờ được phê duyệt.",
            'sender_id' => $data['user_id'],
            'receiver_id' => $event->author_id,
            'type' => 'event_join_request',
            'data' => [
                'event_id' => $data['event_id'],
                'url' => "/notification/{$event->author_id}"
            ]
        ]);

        broadcast(new \App\Events\NotificationSent($notification, $event->author_id))->toOthers();

        return $joinEvent;
    }

    public function leaveEvent($userId, $eventId)
    {
        $joinEvent = DB::update(
            "UPDATE join_events je
             JOIN events e ON je.event_id = e.id
             SET je.status = 'cancelled', je.updated_at = NOW()
             WHERE je.user_id = :user_id
               AND je.event_id = :event_id
               AND je.status = 'pending'
               AND NOW() < e.start_time",
            [
                'user_id'  => $userId,
                'event_id' => $eventId,
            ]
        );
        if ($joinEvent) {
            return $joinEvent->delete();
        }
        return false;
    }

    public function all()
    {
        return JoinEvent::all();
    }

    /**
     * Lấy danh sách users đã đăng ký tham gia event
     * @param int $eventId
     * @return array
     */
    public function getListUserByEvent($eventId)
    {
        return DB::select(
            "SELECT 
                je.id,
                je.user_id,
                je.event_id,
                je.status,
                je.created_at,
                je.joined_at,
                u.id as user_id,
                u.username,
                u.email,
                u.image
            FROM join_events je
            JOIN users u ON je.user_id = u.id
            WHERE je.event_id = ?
            ORDER BY 
                CASE je.status
                    WHEN 'pending' THEN 1
                    WHEN 'approved' THEN 2
                    WHEN 'rejected' THEN 3
                    ELSE 4
                END,
                je.created_at DESC",
            [$eventId]
        );
    }

    public function acceptUserJoinEvent($userId, $eventId, $managerId) {
        $joinEvent = DB::update(
            "UPDATE join_events
             SET status = 'approved', joined_at = NOW()
             WHERE user_id = :user_id
               AND event_id = :event_id
               AND status = 'pending'",
            ['user_id' => $userId, 'event_id' => $eventId]
        );

        if ($joinEvent > 0) {
            // Lấy thông tin event
            $event = Event::find($eventId);
            
            // Gửi notification + push notification cho user
            if ($event) {
                $notification = Noti::createAndPush([
                    'title' => 'Tham gia sự kiện thành công! 🎉',
                    'message' => "Yêu cầu tham gia sự kiện '{$event->title}' của bạn đã được chấp nhận!",
                    'sender_id' => $managerId, // Manager đang accept
                    'receiver_id' => $userId, // User được accept
                    'type' => 'event_accepted',
                    'data' => [
                        'event_id' => $eventId,
                        'event_title' => $event->title,
                        'url' => "/notification/{$userId}"
                    ]
                ]);
            }

            broadcast(new \App\Events\NotificationSent($notification, $userId))->toOthers();
            
            return $joinEvent;
        }
        throw new Exception('JoinEvent not found');
    }

    public function rejectUserJoinEvent($eventId, $userId, $managerId) {
        // Tìm bản ghi cần xóa
        $joinEvent = JoinEvent::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->where('status', 'pending')
            ->first();

        if ($joinEvent) {
            $event = Event::find($eventId);
            
            // Gửi notification + push notification cho user trước khi xóa
            if ($event) {
                $notification = Noti::createAndPush([
                    'title' => 'Yêu cầu tham gia sự kiện bị từ chối ❌',
                    'message' => "Yêu cầu tham gia sự kiện '{$event->title}' của bạn đã bị từ chối.",
                    'sender_id' => $managerId, // Manager đang reject
                    'receiver_id' => $userId, // User bị reject
                    'type' => 'event_rejected',
                    'data' => [
                        'event_id' => $eventId,
                        'event_title' => $event->title,
                        'url' => "/notification/{$userId}"
                    ]
                ]);
                
                broadcast(new \App\Events\NotificationSent($notification, $userId))->toOthers();
            }
            
            // Xóa bản ghi thay vì update status
            $joinEvent->delete();
            
            return true;
        }
        
        return false;
    }


}