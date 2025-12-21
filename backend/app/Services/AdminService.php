<?php

namespace App\Services;

use App\Repositories\UserRepo;;
use Exception;
use App\Services\EventService;
use Illuminate\Support\Facades\Log;

/**
 * Service AdminService - Xử lý logic nghiệp vụ quản trị hệ thống
 * 
 * Service này xử lý các thao tác nghiệp vụ cho quản trị viên,
 * bao gồm: quản lý users, managers, events, ban/unban, approve/reject.
 * 
 * @package App\Services
 */
class AdminService
{
    /** @var UserRepo Repository xử lý dữ liệu user */
    protected $userRepo;
    
    /** @var EventService Service xử lý sự kiện */
    protected $eventService;

    /**
     * Khởi tạo service với các repository và service cần thiết
     * 
     * @param UserRepo $userRepo Repository user
     * @param EventService $eventService Service sự kiện
     */
    public function __construct(UserRepo $userRepo, EventService $eventService)
    {
        $this->userRepo = $userRepo;
        $this->eventService = $eventService;
    }

    /**
     * Lấy tất cả users
     * 
     * @return \Illuminate\Support\Collection Danh sách users
     */
    public function getAllUsers()
    {
        return $this->userRepo->getAllUsers();
    }

    /**
     * Lấy tất cả sự kiện
     * 
     * @param int|null $userId ID user để kiểm tra isLiked
     * @return \Illuminate\Support\Collection Danh sách sự kiện
     */
    public function getAllEvents($userId = null)
    {
        return $this->eventService->getAllEvents($userId);
    }

    /**
     * Lấy tất cả managers
     * 
     * @return \Illuminate\Support\Collection Danh sách managers
     */
    public function getAllManagers()
    {
        return $this->userRepo->getUsersByRole('manager');
    }

    /**
     * Lấy sự kiện theo author
     * 
     * @param int $authorId ID của author
     * @return \Illuminate\Support\Collection Danh sách sự kiện
     */
    public function getEventsByAuthor($authorId)
    {
        return $this->eventService->getEventsByAuthor($authorId);
    }

    /**
     * Khóa tài khoản user (ban)
     * 
     * @param int $id ID của user
     * @return User User sau khi ban
     * @throws Exception Khi ban thất bại
     */
    public function banUser($id)
    {
        $result = $this->userRepo->banUser($id);
        if (!$result) {
            throw new Exception('Failed to ban user');
        }
        return $result;
    }

    /**
     * Mở khóa tài khoản user (unban)
     * 
     * @param int $id ID của user
     * @return User User sau khi unban
     * @throws Exception Khi unban thất bại
     */
    public function unbanUser($id)
    {
        $result = $this->userRepo->unbanUser($id);
        if (!$result) {
            throw new Exception('Failed to unban user');
        }
        return $result;
    }

    /**
     * Xóa sự kiện
     * 
     * @param int $id ID của sự kiện
     * @return bool Kết quả xóa
     */
    public function deleteEvent($id)
    {
        return $this->eventService->deleteEvent($id);
    }

    /**
     * Xóa user
     * 
     * @param int $id ID của user
     * @return bool Kết quả xóa
     * @throws Exception Khi xóa thất bại
     */
    public function deleteUser($id)
    {
        $result = $this->userRepo->deleteUserById($id);
        if (!$result) {
            throw new Exception('Failed to delete user');
        }
        return $result;
    }

    /**
     * Khóa nhiều users cùng lúc (bulk lock)
     * 
     * @param array $userIds Danh sách ID users cần khóa
     * @return int Số lượng users đã khóa thành công
     */
    public function bulkLockUsers(array $userIds)
    {
        $affected = 0;
        foreach ($userIds as $id) {
            try {
                $this->userRepo->banUser($id);
                $affected++;
            } catch (\Exception $e) {
                // Log error but continue with other users
                Log::error("Failed to lock user {$id}: " . $e->getMessage());
            }
        }
        return $affected;
    }

    /**
     * Mở khóa nhiều users cùng lúc (bulk unlock)
     * 
     * @param array $userIds Danh sách ID users cần mở khóa
     * @return int Số lượng users đã mở khóa thành công
     */
    public function bulkUnlockUsers(array $userIds)
    {
        $affected = 0;
        foreach ($userIds as $id) {
            try {
                $this->userRepo->unbanUser($id);
                $affected++;
            } catch (\Exception $e) {
                // Log error but continue with other users
                Log::error("Failed to unlock user {$id}: " . $e->getMessage());
            }
        }
        return $affected;
    }

    /**
     * Duyệt sự kiện (chấp nhận)
     * 
     * @param int $id ID của sự kiện
     * @param int $senderId ID của admin duyệt
     * @return Event Sự kiện sau khi duyệt
     */
    public function acceptEvent($id, $senderId)
    {
        $result = $this->eventService->acceptEvent($id, $senderId);
        return $result;
    }

    /**
     * Từ chối sự kiện
     * 
     * @param int $id ID của sự kiện
     * @param int $senderId ID của admin từ chối
     * @return Event Sự kiện sau khi từ chối
     */
    public function rejectEvent($id, $senderId)
    {
        $result = $this->eventService->rejectEvent($id, $senderId);
        return $result;
    }

    /**
     * Tạo user mới
     * 
     * @param array $data Dữ liệu user
     * @return User User vừa tạo
     */
    public function createUser($data)
    {
        $result = $this->userRepo->createUser($data);
        return $result;
    }

    /**
     * Cập nhật thông tin manager
     * 
     * @param int $id ID của manager
     * @param array $data Dữ liệu cần cập nhật
     * @return User|null Manager sau khi cập nhật
     */
    public function updateManager($id, $data) {
        $result = $this->userRepo->updateUserById($id, $data);
        if($result) {
            return $result;
        }
    }
}