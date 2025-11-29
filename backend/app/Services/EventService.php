<?php

namespace App\Services;

use App\Repositories\UserRepo;
use App\Repositories\EventRepo;
use App\Repositories\EventManagementRepo;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\Event;
use App\Models\PushSubscription;
use App\Models\Noti;
use App\Models\User;
use App\Repositories\PushRepo;
use App\Services\NotiService;

class EventService
{
    protected $eventRepo;
    protected $eventManagementRepo;
    protected $pushRepo;
    protected $notiService;

    public function __construct(
        EventRepo $eventRepo, 
        EventManagementRepo $eventManagementRepo, 
        PushRepo $pushRepo,
        NotiService $notiService
    ) {
        $this->eventRepo = $eventRepo;
        $this->eventManagementRepo = $eventManagementRepo;
        $this->pushRepo = $pushRepo;
        $this->notiService = $notiService;
    }

    public function getAllEvents($userId = null)
    {
        return $this->eventRepo->getAllEvents($userId);
    }

    public function createEvent(array $data, array $comanager = [], $authorId = null)
    {
        try {
            $data['likes'] = 0;
            $data['status'] = 'pending';
            $data['created_at'] = Carbon::now();
            $data['current_participants'] = 0;
            $data['author_id'] = $authorId;
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

    /**
     * Gửi thông báo WebPush đến tất cả users khi có sự kiện mới
     */
    public function notifyAllUsersNewEvent($event)
    {
        $this->pushRepo->getAllSubscriptionsInChunk(100, function($subscriptions) use ($event) {
            foreach ($subscriptions as $subscription) {
                // Dispatch notification job cho từng user
                Noti::dispatchCreateAndPush([
                    'title' => 'Sự kiện mới: ' . $event->name,
                    'message' => "Một sự kiện mới đã được tạo, hãy tham gia ngay!",
                    'sender_id' => auth()->id() ?? null,
                    'receiver_id' => $subscription->user_id,
                    'type' => 'event_new',
                    'data' => [
                        'event_id' => $event->id,
                        'event_name' => $event->name,
                        'url' => "/events/{$event->id}"
                    ]
                ]);
            }
        });
        
        Log::info("Dispatched new event notifications for event: {$event->name} (ID: {$event->id})");
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