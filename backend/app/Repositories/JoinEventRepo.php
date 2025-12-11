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

    public function joinEvent($userId, $eventId) 
    {
        // Kiểm tra event có tồn tại không
        $event = Event::find($eventId);
        if (!$event) {
            throw new Exception('Event not found');
        }
        
        // Kiểm tra đã join chưa
        $existing = JoinEvent::where('user_id', $userId)
                             ->where('event_id', $eventId)
                             ->first();
        if ($existing) {
            throw new Exception('Already joined this event');
        }
        
        // Tạo join event mới - không dùng updated_at
        $joinEvent = new JoinEvent();
        $joinEvent->user_id = $userId;
        $joinEvent->event_id = $eventId;
        $joinEvent->status = 'pending';
        $joinEvent->created_at = now();
        $joinEvent->save();

        // Gửi notification
        $notification = Noti::createAndPush([
            'title' => 'Yêu cầu tham gia sự kiện đã được gửi 📩',
            'message' => "Yêu cầu tham gia sự kiện của bạn đang chờ được phê duyệt.",
            'sender_id' => $userId,
            'receiver_id' => $event->author_id,
            'type' => 'event_join_request',
            'data' => [
                'event_id' => $eventId,
                'url' => "/notification/{$event->author_id}"
            ]
        ]);

        broadcast(new \App\Events\NotificationSent($notification, $event->author_id))->toOthers();

        return $joinEvent;
    }

    public function leaveEvent($userId, $eventId)
    {
        // PostgreSQL syntax - không dùng updated_at
        $affectedRows = DB::update(
            "UPDATE join_events je
             SET status = 'cancelled'
             FROM events e 
             WHERE je.event_id = e.id
               AND je.user_id = :user_id
               AND je.event_id = :event_id
               AND je.status = 'pending'
               AND NOW() < e.start_time",
            [
                'user_id'  => $userId,
                'event_id' => $eventId,
            ]
        );
        
        return $affectedRows > 0;
    }

    public function all()
    {
        return JoinEvent::all();
    }

    public function acceptUserJoinEvent($userId, $eventId, $managerId) {
        // PostgreSQL syntax - không dùng updated_at
        $affectedRows = DB::update(
            "UPDATE join_events je
             SET status = 'approved'
             FROM events e
             WHERE je.event_id = e.id
               AND je.user_id = :user_id
               AND je.event_id = :event_id
               AND je.status = 'pending'
               AND NOW() < e.start_time",
            ['user_id' => $userId, 'event_id' => $eventId]
        );

        if ($affectedRows > 0) {
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
            
            return true;
        }
        throw new Exception('JoinEvent not found');
    }

    public function rejectUserJoinEvent($eventId, $userId, $managerId) {
        // PostgreSQL syntax - không dùng updated_at
        $affectedRows = DB::update(
            "UPDATE join_events je
             SET status = 'rejected'
             FROM events e
             WHERE je.event_id = e.id
               AND je.user_id = :user_id
               AND je.event_id = :event_id
               AND je.status = 'pending'
               AND NOW() < e.start_time",
            ['user_id' => $userId, 'event_id' => $eventId]
        );

        if ($affectedRows > 0) {
            $event = Event::find($eventId);
            // Gửi notification + push notification cho user
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
            
            return true;
        }
        
        throw new Exception('JoinEvent not found');
    }


}
