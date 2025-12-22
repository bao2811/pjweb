<?php

namespace App\Services;

use App\Repositories\JoinEventRepo;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Repositories\EventRepo;

/**
 * Service JoinEventService - Xử lý logic nghiệp vụ tham gia sự kiện
 * 
 * Service này xử lý các thao tác nghiệp vụ cho việc đăng ký và rời sự kiện,
 * bao gồm: kiểm tra điều kiện, join/leave event.
 * 
 * @package App\Services
 */
class JoinEventService {
    /** @var JoinEventRepo Repository xử lý tham gia sự kiện */
    protected $joinEventRepo;
    
    /** @var EventRepo Repository xử lý sự kiện */
    protected $eventRepo;

    /**
     * Khởi tạo service với các repository cần thiết
     * 
     * @param JoinEventRepo $joinEventRepo Repository tham gia sự kiện
     * @param EventRepo $eventRepo Repository sự kiện
     */
    public function __construct(JoinEventRepo $joinEventRepo, EventRepo $eventRepo)
    {
        $this->joinEventRepo = $joinEventRepo;
        $this->eventRepo = $eventRepo;
    }

    /**
     * Đăng ký tham gia sự kiện
     * 
     * Kiểm tra các điều kiện:
     * - Sự kiện phải tồn tại
     * - Sự kiện chưa đầy
     * - Sự kiện chưa bắt đầu
     * 
     * @param int $userId ID của user
     * @param int $eventId ID của sự kiện
     * @return array Kết quả đăng ký ['success' => bool, 'message' => string, 'data' => mixed]
     */
    public function joinEvent($userId, $eventId)
    {
        $event =  $this->eventRepo->getEventById($eventId);
            if (!$event) {
                return [
                    'success' => false,
                    'message' => 'Event not found',
                    'data' => null
                ];
            }
            if ($event->current_participants >= $event->max_participants) {
                return [
                    'success' => false,
                    'message' => 'Event is full',
                    'data' => null
                ];
            }
            if ($event->start_time <= Carbon::now()) {
                return [
                    'success' => false,
                    'message' => 'Cannot join event that has already started',
                    'data' => null
                ];
            }
        $result =  $this->joinEventRepo->joinEvent($userId, $eventId);

        if ($result) {
            return [
                'success' => true,
                'message' => 'Joined event successfully',
                'data' => $result
            ];
        } else {
            return false;
        }
    }

    /**
     * Rời khỏi sự kiện đã đăng ký
     * 
     * Kiểm tra các điều kiện:
     * - Sự kiện phải tồn tại
     * - Sự kiện chưa bắt đầu
     * 
     * @param int $userId ID của user
     * @param int $eventId ID của sự kiện
     * @return array Kết quả rời sự kiện ['success' => bool, 'message' => string, 'data' => mixed]
     */
    public function leaveEvent($userId, $eventId)
    {
        // Delegate the leave operation to the repository which handles
        // defensive checks (event existence, start_time, participant decrement, etc.)
        $result = $this->joinEventRepo->leaveEvent($userId, $eventId);

        if ($result) {
            return [
                'success' => true,
                'message' => 'Left event successfully',
                'data' => $result
            ];
        }

        // If repository returned false, provide a clearer message.
        // Fallback message
        return [
            'success' => false,
            'message' => 'Failed to leave event. It may have started or the registration was not found.',
            'data' => null
        ];
    }

    /**
     * Lấy danh sách sự kiện mà user đã đăng ký
     * 
     * @param int $userId ID của user
     * @return \Illuminate\Support\Collection Danh sách đăng ký
     */
    public function getMyRegistrations($userId)
    {
        return $this->joinEventRepo->getMyRegistrations($userId);
    }

}