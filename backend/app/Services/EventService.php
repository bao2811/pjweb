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

/**
 * Service EventService - Xử lý logic nghiệp vụ liên quan đến sự kiện
 * 
 * Service này xử lý các thao tác nghiệp vụ cho sự kiện tình nguyện,
 * bao gồm: CRUD event, approve/reject, trending, notify users.
 * 
 * @package App\Services
 */
class EventService
{
    /** @var EventRepo Repository xử lý dữ liệu sự kiện */
    protected $eventRepo;
    
    /** @var EventManagementRepo Repository xử lý quản lý sự kiện */
    protected $eventManagementRepo;
    
    /** @var PushRepo Repository xử lý push subscription */
    protected $pushRepo;
    
    /** @var NotiService Service xử lý notification */
    protected $notiService;
    
    /** @var ChannelRepo Repository xử lý channel */
    protected $channelRepo;

    /**
     * Khởi tạo service với các repository và service cần thiết
     * 
     * @param EventRepo $eventRepo Repository sự kiện
     * @param EventManagementRepo $eventManagementRepo Repository quản lý sự kiện
     * @param PushRepo $pushRepo Repository push subscription
     * @param NotiService $notiService Service notification
     * @param ChannelRepo $channelRepo Repository channel
     */
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

    /**
     * Lấy tất cả sự kiện
     * 
     * @param int|null $userId ID user để kiểm tra isLiked
     * @return \Illuminate\Support\Collection Danh sách sự kiện
     */
    public function getAllEvents($userId = null)
    {
        return $this->eventRepo->getAllEvents($userId);
    }

    /**
     * Lấy sự kiện theo author
     * 
     * @param int $authorId ID của author
     * @return \Illuminate\Support\Collection Danh sách sự kiện
     */
    public function getEventsByAuthor($authorId)
    {
        return $this->eventRepo->getEventsByAuthor($authorId);
    }

    /**
     * Lấy sự kiện theo ID
     * 
     * @param int $id ID của sự kiện
     * @return Event|null Sự kiện hoặc null
     */
    public function getEventById($id)
    {
        return $this->eventRepo->getEventById($id);
    }

    /**
     * Tạo sự kiện mới
     * 
     * Tự động tạo channel chat cho sự kiện.
     * Gửi thông báo đến tất cả users về sự kiện mới.
     * 
     * @param array $data Dữ liệu sự kiện
     * @param array $comanager Danh sách ID comanagers
     * @param int|null $authorId ID của author
     * @return Event|null Sự kiện vừa tạo
     */
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
     * 
     * Sử dụng chunking để xử lý số lượng lớn subscriptions.
     * 
     * @param Event $event Sự kiện mới
     * @param int $authorId ID của author
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

    /**
     * Cập nhật sự kiện
     * 
     * @param int $id ID của sự kiện
     * @param array $data Dữ liệu cần cập nhật
     * @return Event Sự kiện sau khi cập nhật
     * @throws Exception Khi cập nhật thất bại
     */
    public function updateEvent($id, array $data)
    {
        $result = $this->eventRepo->updateEventById($id, $data);
        if (!$result) {
            throw new Exception('Failed to update event');
        }
        return $result;
    }

    /**
     * Xóa sự kiện
     * 
     * @param int $id ID của sự kiện
     * @return bool Kết quả xóa
     * @throws Exception Khi xóa thất bại
     */
    public function deleteEvent($id)
    {
        $result = $this->eventRepo->deleteEventById($id);
        if (!$result) {
            throw new Exception('Failed to delete event');
        }
        return $result;
    }

    /**
     * Lấy sự kiện trending (nhiều like nhất trong 7 ngày)
     * 
     * Sắp xếp theo số lượt like giảm dần, sau đó theo thời gian tạo.
     * 
     * @param int $limit Số lượng sự kiện cần lấy
     * @return \Illuminate\Support\Collection Danh sách sự kiện trending
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

    /**
     * Duyệt sự kiện (chấp nhận)
     * 
     * Gửi thông báo cho author khi sự kiện được duyệt.
     * 
     * @param int $id ID của sự kiện
     * @param int $senderId ID của admin duyệt
     * @return Event Sự kiện sau khi duyệt
     * @throws Exception Khi duyệt thất bại
     */
    public function acceptEvent($id, $senderId)
    {
        $result = $this->eventRepo->acceptEvent($id, $senderId);
        if (!$result) {
            throw new Exception('Failed to accept event');
        }
        return $result;
    }

    /**
     * Từ chối sự kiện
     * 
     * Gửi thông báo cho author khi sự kiện bị từ chối.
     * 
     * @param int $id ID của sự kiện
     * @param int $senderId ID của admin từ chối
     * @return Event Sự kiện sau khi từ chối
     * @throws Exception Khi từ chối thất bại
     */
    public function rejectEvent($id, $senderId)
    {
        $result = $this->eventRepo->rejectEvent($id, $senderId);
        if (!$result) {
            throw new Exception('Failed to reject event');
        }
        return $result;
    }

    /**
     * Tìm kiếm sự kiện theo từ khóa
     * 
     * @param string $keyword Từ khóa tìm kiếm
     * @return \Illuminate\Support\Collection Danh sách sự kiện
     */
    public function searchEvents($keyword)
    {
        $result = $this->eventRepo->searchEventsByKeyword($keyword);
        return $result;
    }

    /**
     * Đếm số sự kiện đang diễn ra
     * 
     * @return int Số lượng sự kiện đang diễn ra
     */
    public function countOngoingEvents()
    {
        return $this->eventRepo->countOngoingEvents();
    }
}
