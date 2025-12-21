<?php

namespace App\Services;

use App\Repositories\JoinEventRepo;
use App\Repositories\ChannelRepo;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Repositories\EventRepo;

/**
 * Service ManagerService - Xử lý logic nghiệp vụ cho Manager
 * 
 * Service này xử lý các thao tác nghiệp vụ cho manager (quản lý sự kiện),
 * bao gồm: quản lý event, approve/reject volunteers, reports.
 * 
 * @package App\Services
 */
class ManagerService {
    /** @var JoinEventRepo Repository xử lý tham gia sự kiện */
    protected $joinEventRepo;
    
    /** @var EventRepo Repository xử lý sự kiện */
    protected $eventRepo;
    
    /** @var ChannelRepo Repository xử lý channel */
    protected $channelRepo;

    /**
     * Khởi tạo service với các repository cần thiết
     * 
     * @param JoinEventRepo $joinEventRepo Repository tham gia sự kiện
     * @param EventRepo $eventRepo Repository sự kiện
     * @param ChannelRepo $channelRepo Repository channel
     */
    public function __construct(JoinEventRepo $joinEventRepo, EventRepo $eventRepo, ChannelRepo $channelRepo) {
        $this->joinEventRepo = $joinEventRepo;
        $this->eventRepo = $eventRepo;
        $this->channelRepo = $channelRepo;
    }

    /**
     * Lấy danh sách users đã đăng ký sự kiện (có kiểm tra quyền)
     * 
     * Chỉ author hoặc comanager mới được xem danh sách.
     * 
     * @param int $eventId ID của sự kiện
     * @param int $managerId ID của manager đang xem
     * @return \Illuminate\Support\Collection Danh sách users
     * @throws Exception Khi không có quyền xem
     */
    public function getListUserByEvent($eventId, $managerId) {
        // Kiểm tra Manager có quyền xem event này không
        $event = $this->eventRepo->getEventById($eventId);
        
        if (!$event) {
            throw new Exception('Event not found');
        }

        // Check ownership
        $isAuthor = $event->author_id === $managerId;
        $isComanager = $event->comanagers()->where('user_id', $managerId)->exists();
        
        if (!$isAuthor && !$isComanager) {
            throw new Exception('You do not have permission to view this event');
        }

        return $this->joinEventRepo->getListUserByEvent($eventId);
    }

    /**
     * Xóa sự kiện (có kiểm tra quyền sở hữu)
     * 
     * Chỉ author mới được xóa, không cho xóa event đã bắt đầu.
     * 
     * @param int $eventId ID của sự kiện
     * @param int $managerId ID của manager
     * @return bool Kết quả xóa
     * @throws Exception Khi không có quyền hoặc event đã bắt đầu
     */
    public function deleteEvent($eventId, $managerId) {
        $event = $this->eventRepo->getEventById($eventId);
        
        if (!$event) {
            return false;
        }

        // Check ownership - chỉ author mới được xóa (không phải comanager)
        if ($event->author_id !== $managerId) {
            throw new Exception('Only the event creator can delete this event');
        }

        // Không cho xóa event đã kết thúc hoặc đang diễn ra
        if (now()->gte($event->start_time)) {
            throw new Exception('Cannot delete event that has started or completed');
        }

        return $this->eventRepo->deleteEventById($eventId);
    }

    /**
     * Chấp nhận user tham gia sự kiện
     * 
     * @param int $userId ID của user
     * @param int $eventId ID của sự kiện
     * @param int $managerId ID của manager duyệt
     * @return mixed Kết quả cập nhật
     */
    public function acceptUserJoinEvent($userId, $eventId, $managerId) {
        return $this->joinEventRepo->acceptUserJoinEvent($userId, $eventId, $managerId);
    }

    /**
     * Từ chối user tham gia sự kiện
     * 
     * @param int $eventId ID của sự kiện
     * @param int $userId ID của user
     * @param int $managerId ID của manager từ chối
     * @return mixed Kết quả cập nhật
     */
    public function rejectUserJoinEvent($eventId, $userId, $managerId) {
        return $this->joinEventRepo->rejectUserJoinEvent($eventId, $userId, $managerId);
    }

    /**
     * Tạo sự kiện mới (dành cho manager)
     * 
     * Tự động tạo channel chat cho sự kiện.
     * 
     * @param array $data Dữ liệu sự kiện
     * @param array $comanager Danh sách ID comanagers
     * @return Event Sự kiện vừa tạo
     * @throws Exception Khi tạo thất bại
     */
    public function createEvent(array $data, array $comanager = [])
    {
        try {
            DB::beginTransaction();
            $event = $this->eventRepo->createEvent($data, $comanager);
            
            // Tạo kênh sự kiện
            $this->channelRepo->createChannel([
                'event_id' => $event->id,
                'title' => 'Kênh sự kiện: ' . $event->title,
                'created_at' => Carbon::now(),
            ]);
            
            DB::commit();
            return $event;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('ManagerService createEvent error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Lấy danh sách sự kiện của một manager
     * 
     * @param int $managerId ID của manager
     * @return \Illuminate\Support\Collection Danh sách sự kiện
     */
    public function getEventsByManagerId($managerId)
    {
        return $this->eventRepo->getEventsByManagerId($managerId);
    }

    /**
     * Lấy sự kiện theo ID (có kiểm tra quyền manager)
     * 
     * Chỉ author hoặc comanager mới xem được.
     * 
     * @param int $eventId ID của sự kiện
     * @param int $managerId ID của manager
     * @return Event|null Sự kiện hoặc null nếu không có quyền
     */
    public function getEventById($eventId, $managerId)
    {
        $event = $this->eventRepo->getEventById($eventId);
        
        if (!$event) {
            return null;
        }

        // Check if manager owns this event
        if ($event->author_id !== $managerId) {
            $isComanager = $event->comanagers()->where('user_id', $managerId)->exists();
            if (!$isComanager) {
                return null;
            }
        }

        return $event;
    }

    /**
     * Cập nhật sự kiện và thông báo admin
     * 
     * Không cho sửa event đã bắt đầu hoặc kết thúc.
     * Kiểm tra quyền author hoặc comanager.
     * 
     * @param int $eventId ID của sự kiện
     * @param int $managerId ID của manager
     * @param array $eventData Dữ liệu cần cập nhật
     * @return Event|null Sự kiện sau khi cập nhật
     * @throws Exception Khi không có quyền hoặc event đã bắt đầu
     */
    public function updateEvent($eventId, $managerId, array $eventData)
    {
        try {
            DB::beginTransaction();

            $event = $this->eventRepo->getEventById($eventId);
            
            if (!$event) {
                return null;
            }

            // FIX #8: Không cho sửa event đã bắt đầu hoặc kết thúc
            if (now()->gte($event->start_time)) {
                throw new Exception('Cannot edit event that has already started or completed');
            }

            // Check authorization
            $isAuthor = $event->author_id === $managerId;
            $isComanager = $event->comanagers()->where('user_id', $managerId)->exists();
            
            if (!$isAuthor && !$isComanager) {
                return null;
            }

            // Update event - sử dụng đúng tên method updateEventById
            $updated = $this->eventRepo->updateEventById($eventId, $eventData);

            // Notify all admins about the update
            // $this->notifyAdminsAboutEventUpdate($event, $managerId);

            DB::commit();
            return $updated;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('ManagerService updateEvent error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Gửi thông báo đến tất cả admin khi sự kiện được cập nhật
     * 
     * @param Event $event Sự kiện được cập nhật
     * @param int $managerId ID của manager cập nhật
     */
    private function notifyAdminsAboutEventUpdate($event, $managerId)
    {
        try {
            // Get all admin users
            $admins = DB::table('users')->where('role', 'admin')->get();

            foreach ($admins as $admin) {
                DB::table('notifications')->insert([
                    'user_id' => $admin->id,
                    'sender_id' => $managerId,
                    'type' => 'event_updated',
                    'data' => json_encode([
                        'event_id' => $event->id,
                        'event_title' => $event->title,
                        'manager_id' => $managerId,
                        'message' => 'Sự kiện "' . $event->title . '" đã được cập nhật bởi manager. Vui lòng xem xét các thay đổi.',
                    ]),
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }
        } catch (Exception $e) {
            Log::error('Error notifying admins about event update: ' . $e->getMessage());
        }
    }

    /**
     * Đánh dấu tình nguyện viên đã hoàn thành sự kiện
     * 
     * Chỉ author hoặc comanager mới được đánh dấu.
     * Chỉ được đánh dấu sau khi event kết thúc.
     * 
     * @param int $eventId ID của sự kiện
     * @param int $userId ID của tình nguyện viên
     * @param int $managerId ID của manager
     * @param string $status Trạng thái hoàn thành
     * @param string|null $completionNote Ghi chú
     * @return mixed Kết quả cập nhật
     * @throws Exception Khi không có quyền hoặc event chưa kết thúc
     */
    public function markVolunteerCompletion($eventId, $userId, $managerId, $status, $completionNote = null)
    {
        // Verify manager owns the event or is comanager
        $event = $this->eventRepo->getEventById($eventId);
        if (!$event) {
            throw new Exception('Event not found');
        }

        // Check authorization: author or comanager
        $isAuthor = $event->author_id === $managerId;
        $isComanager = $event->comanagers()->where('user_id', $managerId)->exists();
        
        if (!$isAuthor && !$isComanager) {
            throw new Exception('Unauthorized: You are not the manager or comanager of this event');
        }

        // Check event has ended
        if (now()->lt($event->end_time)) {
            throw new Exception('Cannot mark completion: Event has not ended yet');
        }

        return $this->joinEventRepo->markVolunteerCompletion($eventId, $userId, $managerId, $status, $completionNote);
    }

    /**
     * Lấy báo cáo sự kiện
     * 
     * Chỉ author hoặc comanager mới được xem báo cáo.
     * 
     * @param int $eventId ID của sự kiện
     * @param int $managerId ID của manager
     * @return array Báo cáo sự kiện
     * @throws Exception Khi không có quyền xem
     */
    public function getEventReport($eventId, $managerId)
    {
        // Verify manager owns the event or is comanager
        $event = $this->eventRepo->getEventById($eventId);
        if (!$event) {
            throw new Exception('Event not found');
        }

        $isAuthor = $event->author_id === $managerId;
        $isComanager = $event->comanagers()->where('user_id', $managerId)->exists();
        
        if (!$isAuthor && !$isComanager) {
            throw new Exception('Unauthorized: You are not the manager or comanager of this event');
        }

        return $this->joinEventRepo->getEventReport($eventId);
    }

    /**
     * Lấy báo cáo tổng quan các sự kiện của manager
     * 
     * @param int $managerId ID của manager
     * @return array Báo cáo tổng quan
     */
    public function getManagerEventsReport($managerId)
    {
        return $this->joinEventRepo->getManagerEventsReport($managerId);
    }
}