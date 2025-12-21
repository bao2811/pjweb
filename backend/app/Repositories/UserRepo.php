<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;


class UserRepo
{
    public function getUserByEmail($email)
    {
        return User::where('email', $email)->first();
    }

    /**
     * Lấy user theo email
     *
     * @param string $email Email của user cần tìm
     * @return User|null Trả về User hoặc null nếu không tìm thấy
     */
    

    /**
     * Lấy user theo ID
     *
     * @param int $id ID của user
     * @return User|null Trả về User hoặc null nếu không tồn tại
     */
    public function getUserById($id) : ?User
    {
        return User::find($id);
    }

    /**
     * Tạo user mới
     *
     * Nhận mảng dữ liệu và tạo bản ghi user trong database.
     *
     * @param array $data Dữ liệu user
     * @return User User vừa tạo
     */
    public function createUser($data) : User
    {
        return User::create($data);
    }

    /**
     * Lấy tất cả users có role = 'user'
     *
     * Kèm theo thông tin thống kê events đã tham gia và format dữ liệu
     * để trả về cho frontend.
     *
     * @return \Illuminate\Support\Collection Danh sách users đã format
     */
    public function getAllUsers()
    { 
        return User::where('role', 'user')
            ->withCount(['joinEvents as events_count']) // tính số lượng event tham gia
            ->with(['joinedEvents' => function($query) {
                $query->select(
                    'events.id',
                    'events.title',
                    'events.category',
                    'events.start_time as date',
                    'events.status'
                )
                ->withPivot('status', 'joined_at') // Lấy thêm status từ pivot table
                ->orderBy('events.start_time', 'desc')
                ->limit(10); // Giới hạn 10 events gần nhất
            }])
            ->get()
            ->map(function($user) {
                // Format events data theo UserEvent interface của frontend
                if ($user->joinedEvents && $user->joinedEvents->count() > 0) {
                    $user->events = $user->joinedEvents->map(function($event) {
                        return [
                            'id' => $event->id,
                            'title' => $event->title,
                            'category' => $event->category,
                            'date' => $event->date,
                            'status' => $event->status, // Status của event
                            'role' => 'participant', // User tham gia với role participant
                        ];
                    })->values()->toArray();
                } else {
                    $user->events = [];
                }
                
                // Đảm bảo events_count luôn tồn tại
                if (!isset($user->events_count)) {
                    $user->events_count = 0;
                }
                
                // Thêm isActive flag: user có >= 5 events được coi là active
                $user->isActive = $user->events_count >= 5;
                
                unset($user->joinedEvents); // Xóa joinedEvents, chỉ giữ events
                return $user;
            });
    }

    /**
     * Tìm user theo email (tương tự getUserByEmail)
     *
     * @param string $email Email cần tìm
     * @return User|null
     */
    public function findByEmail($email)
    {
        return User::where('email', $email)->first();
    }

    /**
     * Lấy users theo role (ví dụ: 'manager')
     *
     * Trả về users kèm thông tin events đã tham gia/được quản lý.
     *
     * @param string $role Role cần lọc
     * @return \Illuminate\Support\Collection Danh sách users
     */
    public function getUsersByRole($role)
    {
        return User::where('role', $role)
            ->withCount(['joinEvents as events_count']) // tính số lượng event tham gia
            ->with(['joinedEvents' => function($query) {
                $query->select(
                    'events.id',
                    'events.title',
                    'events.category',
                    'events.start_time as date',
                    'events.status'
                )
                ->withPivot('status', 'joined_at')
                ->orderBy('events.start_time', 'desc')
                ->limit(10); // Giới hạn 10 events gần nhất
            }])
            ->get()
            ->map(function($user) {
                // Format events data theo ManagerEvent interface
                if ($user->joinedEvents && $user->joinedEvents->count() > 0) {
                    $user->events = $user->joinedEvents->map(function($event) {
                        return [
                            'id' => $event->id,
                            'title' => $event->title,
                            'category' => $event->category,
                            'date' => $event->date,
                            'status' => $event->status,
                            'role' => 'manager', // Manager role
                        ];
                    })->values()->toArray();
                } else {
                    $user->events = [];
                }
                
                // Đảm bảo events_count luôn tồn tại
                if (!isset($user->events_count)) {
                    $user->events_count = 0;
                }
                
                // Thêm isActive flag: user có >= 5 events được coi là active
                $user->isActive = $user->events_count >= 5;
                
                unset($user->joinedEvents);
                return $user;
            });
    }

    /**
     * Cập nhật user theo ID
     *
     * @param int $id ID của user
     * @param array $data Dữ liệu cần cập nhật
     * @return User User đã được cập nhật
     * @throws Exception Nếu user không tồn tại
     */
    public function updateUserById($id, $data) : User
    {
        $user = $this->getUserById($id);
        if (!$user) {
            throw new Exception('User not found');
        }
        $user->update($data);
        return $user;
    }

    /**
     * Tìm user theo ID (wrapper cho getUserById)
     *
     * @param int $id ID của user
     * @return User|null
     */
    public function find($id) : ?User
    {
        $user = $this->getUserById($id);
        return $user;
    }

    /**
     * Khóa (ban) user theo ID
     *
     * @param int $id ID của user cần khóa
     * @return int Số record bị ảnh hưởng (1 nếu thành công)
     * @throws Exception Nếu user không tồn tại
     */
    public function banUser($id): int
    {
        $result = User::where('id', $id)->update(['status' => 'locked']);
        if (!$result) {
            throw new Exception('User not found');
        }
        return $result;
    }

    /**
     * Mở khóa (unban) user theo ID
     *
     * @param int $id ID của user cần mở khóa
     * @return int Số record bị ảnh hưởng
     * @throws Exception Nếu user không tồn tại
     */
    public function unbanUser($id) : int
    {
        $result = User::where('id', $id)->update(['status' => 'active']);
        if (!$result) {
            throw new Exception('User not found');
        }
        return $result;
    }

    /**
     * Xóa user theo ID
     *
     * @param int $id ID của user cần xóa
     * @return bool true nếu xóa thành công
     * @throws Exception Nếu user không tồn tại
     */
    public function deleteUserById($id) : bool
    {
        $user = $this->getUserById($id);
        if (!$user) {
            throw new Exception('User not found');
        }
        return $user->delete();
    }
}