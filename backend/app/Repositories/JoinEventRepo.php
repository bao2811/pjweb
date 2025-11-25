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
        $joinEvent = DB::insert(
                    "INSERT INTO joint_events (user_id, event_id, status, created_at, updated_at)
                    SELECT :user_id, :event_id, 'pending', NOW(), NOW()
                    FROM events e
                    WHERE e.id = :event_id_check
                    AND NOW() < e.start_time
                    AND NOT EXISTS (
                        SELECT 1 
                        FROM joint_events je 
                        WHERE je.user_id = :user_id_check
                            AND je.event_id = :event_id_check2
                    )
                    LIMIT 1",
                    [
                        'user_id'         => $data['user_id'],
                        'event_id'        => $data['event_id'],
                        'event_id_check'  => $data['event_id'],
                        'user_id_check'   => $data['user_id'],
                        'event_id_check2' => $data['event_id'],
                    ]
                );

        if (!$joinEvent) {
            throw new Exception('Cannot create JoinEvent. It may already exist or the event has started');
        }

        $event = Event::find($data['event_id']);
        Noti::createAndPush([
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

        return $joinEvent;
    }

    public function leaveEvent($userId, $eventId)
    {
        $joinEvent = DB::update(
            "UPDATE joint_events je
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

    public function acceptUserJoinEvent($userId, $eventId, $managerId) {
        $joinEvent = DB::update(
            "UPDATE joint_events je
             JOIN events e ON je.event_id = e.id
             SET je.status = 'approved', je.updated_at = NOW()
             WHERE je.user_id = :user_id
               AND je.event_id = :event_id
               AND je.status = 'pending'
               AND NOW() < e.start_time",
            ['user_id' => $userId, 'event_id' => $eventId]
        );

        if ($joinEvent) {
            // Lấy thông tin event
            $event = Event::find($eventId);
            
            // Gửi notification + push notification cho user
            if ($event) {
                Noti::createAndPush([
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
            
            return $joinEvent;
        }
        throw new Exception('JoinEvent not found');
    }

    public function rejectUserJoinEvent($eventId, $userId, $managerId) {
        $joinEvent = DB::update(
            "UPDATE joint_events je
             JOIN events e ON je.event_id = e.id
             SET je.status = 'rejected', je.updated_at = NOW()
             WHERE je.user_id = :user_id
               AND je.event_id = :event_id
               AND je.status = 'pending'
               AND NOW() < e.start_time",
            ['user_id' => $userId, 'event_id' => $eventId]
        );
        throw new Exception('JoinEvent not found');

        if ($joinEvent) {
            $event = Event::find($eventId);
            // Gửi notification + push notification cho user
            if ($event) {
                Noti::createAndPush([
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
            }
            
            return $joinEvent;
        }
    }


}
