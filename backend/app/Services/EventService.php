<?php

namespace App\Services;

use App\Repositories\UserRepo;
use App\Repositories\EventRepo;
use App\Repositories\EventManagementRepo;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Event;
use App\Models\PushSubscription;
use App\Models\Noti;
use App\Repositories\PushRepo;

class EventService
{
    protected $eventRepo;
    protected $eventManagementRepo;
    protected $pushRepo;

    public function __construct(EventRepo $eventRepo, EventManagementRepo $eventManagementRepo, PushRepo $pushRepo)
    {
        $this->eventRepo = $eventRepo;
        $this->eventManagementRepo = $eventManagementRepo;
        $this->pushRepo = $pushRepo;
    }

    public function getAllEvents()
    {
        return $this->eventRepo->getAllEvents();
    }

    public function createEvent(array $data, array $comanager = [])
    {
        try {
            DB::beginTransaction();
            $event = $this->eventRepo->createEvent($data);
            $this->eventManagementRepo->addComanagerByEventId($event->id, $comanager);
            // tạo kênh sự kiện nữa
            DB::commit();

            $this->notifyAllUsersNewEvent($event);
    return $event;
        } catch (Exception $e) {
            // Handle exception
            DB::rollBack();
            return null;
        }
    }

    public function notifyAllUsersNewEvent($event)
    {
        $this->pushRepo->getAllUserIdsInChunk(100, function($subscriptions) use ($event) {
            foreach ($subscriptions as $sub) {
                // Queue gửi WebPush để không block request
                Noti::dispatchCreateAndPush([
                    'title' => 'Sự kiện mới: ' . $event->name,
                    'message' => "Một sự kiện mới đã được tạo, hãy tham gia ngay!",
                    'sender_id' => auth()->id() ?? null,
                    'receiver_id' => $sub->user_id,
                    'type' => 'event_new',
                    'data' => [
                        'event_id' => $event->id,
                        'url' => "/events/{$event->id}"
                    ]
                ]);
            }
        });
    }

    public function updateEvent($id, array $data)
    {
        $result = $this->eventRepo->updateEventById($id, $data);
        if (!$result) {
            throw new Exception('Failed to update event');
        }
        return $result;
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