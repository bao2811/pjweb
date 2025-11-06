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

    public function createJoinEvent($data) : JoinEvent
    {
        return JoinEvent::create($data);
    }

    public function updateJoinEventById($id, $data) : JoinEvent
    {
        $joinEvent = $this->getJoinEventById($id);
        if (!$joinEvent) {
            throw new Exception('JoinEvent not found');
        }
        $joinEvent->update($data);
        return $joinEvent;
    }

    public function all()
    {
        return JoinEvent::all();
    }

    public function deleteJoinEventById($id) : bool
    {
        $joinEvent = $this->getJoinEventById($id);
        if (!$joinEvent) {
            throw new Exception('JoinEvent not found');
        }
        return $joinEvent->delete();
    }

    public function acceptUserJoinEvent($user, $eventId) {
        $joinEvent = JoinEvent::where('user_id', $user->id)
                              ->where('event_id', $eventId)
                              ->first();
        if ($joinEvent) {
            $joinEvent->status = 'accepted';
            $joinEvent->save();
            
            // Lấy thông tin event
            $event = Event::find($eventId);
            
            // Gửi notification + push notification cho user
            if ($event) {
                Noti::createAndPush([
                    'title' => 'Tham gia sự kiện thành công! 🎉',
                    'message' => "Yêu cầu tham gia sự kiện '{$event->title}' của bạn đã được chấp nhận!",
                    'sender_id' => Auth::id(), // Manager đang accept
                    'receiver_id' => $user->id, // User được accept
                    'type' => 'event_accepted',
                    'data' => [
                        'event_id' => $eventId,
                        'event_title' => $event->title,
                        'url' => "/events/{$eventId}"
                    ]
                ]);
            }
            
            return $joinEvent;
        }
        throw new Exception('JoinEvent not found');
    }

    public function rejectUserJoinEvent($eventId) {
        $joinEvent = JoinEvent::where('event_id', $eventId)
                              ->first();
        if ($joinEvent) {
            $joinEvent->status = 'rejected';
            $joinEvent->save();
            return $joinEvent;
        }
        throw new Exception('JoinEvent not found');
    }

    public function joinEvent($userId, $eventId)
    {
        $existingJoin = JoinEvent::where('user_id', $userId)
                                 ->where('event_id', $eventId)
                                 ->first();
        if ($existingJoin) {
            return $existingJoin;
        }

        $joinEvent = new JoinEvent();
        $joinEvent->user_id = $userId;
        $joinEvent->event_id = $eventId;
        $joinEvent->status = 'pending';
        $joinEvent->save();

        return $joinEvent;
    }

    public function leaveEvent($userId, $eventId)
    {
        $joinEvent = JoinEvent::where('user_id', $userId)
                              ->where('event_id', $eventId)
                              ->first();
        if ($joinEvent) {
            return $joinEvent->delete();
        }
        return false;
    }
}
