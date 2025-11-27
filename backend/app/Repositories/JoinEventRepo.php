<?php

namespace App\Repositories;

use App\Models\JoinEvent;
use Illuminate\Support\Facades\DB;
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

    public function getMyRegistrations($userId)
    {
        return JoinEvent::where('user_id', $userId)
                        ->with(['event' => function($query) {
                            $query->with('author:id,name,avatar');
                        }])
                        ->whereHas('event') // Only get registrations where event still exists
                        ->orderBy('created_at', 'desc')
                        ->get();
    }
}
