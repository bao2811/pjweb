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
use App\Models\Noti;
use App\Repositories\PushRepo;
use App\Repositories\ChannelRepo;
use App\Services\NotiService;

class EventService
{
    protected $eventRepo;
    protected $eventManagementRepo;
    protected $pushRepo;
    protected $notiService;

    protected $channelRepo;

    public function __construct(
        EventRepo $eventRepo, 
        EventManagementRepo $eventManagementRepo, 
        PushRepo $pushRepo,
        NotiService $notiService,
        ChannelRepo $channelRepo
    ) {
        $this->eventRepo = $eventRepo;
        $this->eventManagementRepo = $eventManagementRepo;
        $this->pushRepo = $pushRepo;
        $this->notiService = $notiService;
        $this->channelRepo = $channelRepo;
    }

    public function getAllEvents($userId = null)
    {
        return $this->eventRepo->getAllEvents($userId);
    }

    public function getEventById($id)
    {
        return $this->eventRepo->getEventById($id);
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
            $this->channelRepo->createChannel([
                'event_id' => $event->id,
                'name' => 'Kênh sự kiện: ' . $event->name,
                'created_at' => Carbon::now(),
            ]);
            DB::commit();

            $this->notifyAllUsersNewEvent($event, $authorId);
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
    public function notifyAllUsersNewEvent($event, $authorId)
    {
        $this->pushRepo->getAllSubscriptionsInChunk(100, function($subscriptions) use ($event, $authorId) {
            foreach ($subscriptions as $subscription) {
                // Dispatch notification job cho từng user
                Noti::dispatchCreateAndPush([
                    'title' => 'Sự kiện mới: ' . $event->name,
                    'message' => "Một sự kiện mới đã được tạo, hãy tham gia ngay!",
                    'sender_id' => $authorId,
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

    /**
     * Lấy các sự kiện "hot" trong 7 ngày gần đây, sắp xếp theo số lượt like giảm dần
     *
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    public function getTrendingEvents($limit = 5)
    {
        try {
            $sevenDaysAgo = Carbon::now()->subDays(7);

            $trendingEvents = Event::with('author:id,username,email,image')
                ->where('created_at', '>=', $sevenDaysAgo)
                ->where('status', '<>', 'rejected')
                ->orderBy('likes', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            return $trendingEvents;
        } catch (Exception $e) {
            Log::error('Error getting trending events: ' . $e->getMessage());
            return collect([]);
        }
    }

    public function acceptEvent($id, $senderId)
    {
        $result = $this->eventRepo->acceptEvent($id, $senderId);
        if (!$result) {
            throw new Exception('Failed to accept event');
        }
        return $result;
    }

    public function rejectEvent($id, $senderId)
    {
        $result = $this->eventRepo->rejectEvent($id, $senderId);
        if (!$result) {
            throw new Exception('Failed to reject event');
        }
        return $result;
    }

    public function searchEvents($keyword)
    {
        $result = $this->eventRepo->searchEventsByKeyword($keyword);
        return $result;
    }   
}