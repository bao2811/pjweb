<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use App\Repositories\UserRepo;
use Exception;
use Illuminate\Support\Facades\Validator;
use App\Exceptions\CustomException;
use App\Repositories\JoinEventRepo;
use Illuminate\Support\Facades\Log;

/**
 * Service UserService - Xử lý logic nghiệp vụ liên quan đến User
 * 
 * Service này xử lý các thao tác nghiệp vụ cho người dùng,
 * bao gồm: CRUD user, ban/unban, join/leave event, lấy lịch sử sự kiện.
 * 
 * @package App\Services
 */
class UserService
{
    /** @var UserRepo Repository xử lý dữ liệu user */
    protected UserRepo $userRepo;
    
    /** @var JoinEventRepo Repository xử lý dữ liệu tham gia sự kiện */
    protected JoinEventRepo $joinEventRepo;

    /**
     * Khởi tạo service với các repository cần thiết
     * 
     * @param UserRepo $userRepo Repository user
     * @param JoinEventRepo $joinEventRepo Repository join event
     */
    public function __construct(UserRepo $userRepo, JoinEventRepo $joinEventRepo)
    {
        $this->userRepo = $userRepo;
        $this->joinEventRepo = $joinEventRepo;
    }

    /**
     * Tìm user theo email
     * 
     * @param string $email Email của user
     * @return array Kết quả tìm kiếm
     */
    public function getUserByEmail($email)
    {
        $user = $this->userRepo->findByEmail($email);
        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'data' => null
            ];
        }
        return [
            'success' => true,
            'message' => 'User retrieved successfully',
            'data' => $user
        ];
    }
    
    /**
     * Tạo user mới
     * 
     * Hash password trước khi lưu vào database.
     * 
     * @param array $data Dữ liệu user
     * @return array Kết quả tạo user
     */
    public function createUser($data)
    {
         try {
            // Hash password
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            // Tạo user qua repository
            $user = $this->userRepo->createUser($data);
            
            return [
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create user: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Lấy tất cả users
     * 
     * @return array Danh sách users
     */
    public function getAllUsers()
    {
        $result = $this->userRepo->getAllUsers();
        return [
            'success' => true,
            'message' => 'Users retrieved successfully',
            'data' => $result
        ];
    }
    
    /**
     * Khóa tài khoản user (ban)
     * 
     * @param int $id ID của user cần ban
     * @return array Kết quả ban
     * @throws Exception Khi ban thất bại
     */
    public function banUser($id)
    {
        $result = $this->userRepo->banUser($id);
        if ($result) {
            return [
                'success' => true,
                'message' => 'User banned successfully',
                'data' => $result
            ];
        } else {
            throw new Exception('Failed to ban user');
        }
    }

    /**
     * Lấy thông tin user theo ID
     * 
     * @param int $id ID của user
     * @return array Thông tin user
     * @throws Exception Khi không tìm thấy user
     */
    public function getUserById($id)
    {
        $result = $this->userRepo->getUserById($id);
        if ($result) {
            return [
                'success' => true,
                'message' => 'User retrieved successfully',
                'data' => $result
            ];
        } else {
            throw new Exception('Failed to retrieve user');
        }
    }

    /**
     * Lấy thông tin user kèm theo thống kê
     * 
     * Bao gồm: số sự kiện đã tham gia, hoàn thành, tổng giờ tình nguyện.
     * 
     * @param int $userId ID của user
     * @return array Thông tin user với stats
     * @throws Exception Khi không tìm thấy user
     */
    public function getUserWithStats($userId)
    {
        $user = $this->userRepo->getUserById($userId);
        
        if (!$user) {
            throw new Exception('User not found');
        }

        // Tính toán stats từ join_events
        $eventsJoined = DB::table('join_events')->where('user_id', $userId)->count();
        
        $eventsCompleted = DB::table('join_events')
            ->where('user_id', $userId)
            ->where('completion_status', 'completed')
            ->count();
        
        // Tính tổng giờ từ các sự kiện đã hoàn thành (chỉ tính khi completion_status='completed')
        $totalHours = DB::table('join_events')
            ->join('events', 'join_events.event_id', '=', 'events.id')
            ->where('join_events.user_id', $userId)
            ->where('join_events.completion_status', 'completed')
            ->whereNotNull('events.start_time')
            ->whereNotNull('events.end_time')
            ->selectRaw('SUM(EXTRACT(EPOCH FROM (events.end_time - events.start_time)) / 3600) as total')
            ->value('total');

        return [
            'success' => true,
            'message' => 'User retrieved successfully',
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'image' => $user->image,
                'phone' => $user->phone,
                'address' => $user->address,
                'address_card' => $user->address_card,
                'status' => $user->status,
                'created_at' => $user->created_at,
                'events_joined' => $eventsJoined,
                'events_completed' => $eventsCompleted,
                'total_hours' => round($totalHours ?? 0, 1),
            ]
        ];
    }

    /**
     * Mở khóa tài khoản user (unban)
     * 
     * @param int $id ID của user cần unban
     * @return array Kết quả unban
     * @throws Exception Khi unban thất bại
     */
    public function unbanUser($id)
    {
        $result = $this->userRepo->unbanUser($id);
        if ($result) {
            return [
                'success' => true,
                'message' => 'User unbanned successfully',
                'data' => $result
            ];
        } else {
            throw new Exception('Failed to unban user');
        }
    }

    /**
     * Cập nhật thông tin user
     * 
     * Hash password mới nếu có thay đổi password.
     * 
     * @param int $id ID của user
     * @param array $data Dữ liệu cần cập nhật
     * @return array Kết quả cập nhật
     * @throws Exception Khi cập nhật thất bại
     */
    public function updateUser($id, $data)
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        
        $result = $this->userRepo->updateUserById($id, $data);
        if ($result) {
            return [
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $result
            ];
        } else {
            throw new Exception('Failed to update user');
        }
    } 

    /**
     * Đăng ký tham gia sự kiện
     * 
     * @param int $userId ID của user
     * @param int $eventId ID của sự kiện
     * @return array|bool Kết quả đăng ký
     */
    public function joinEvent($userId, $eventId)
    {
        $result =  $this->joinEventRepo->joinEvent([
            'user_id' => $userId,
            'event_id' => $eventId
        ]);

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
     * Hủy đăng ký tham gia sự kiện
     * 
     * @param int $userId ID của user
     * @param int $eventId ID của sự kiện
     * @return array|bool Kết quả hủy đăng ký
     */
    public function leaveEvent($userId, $eventId)
    {
        $result = $this->joinEventRepo->leaveEvent($userId, $eventId);

        // kiểm tra check điều kiện để  rời và đăng ký sự kiện

        if ($result) {
            return [
                'success' => true,
                'message' => 'Left event successfully',
                'data' => $result
            ];
        } else {
            return false;
        }
    }

    /**
     * Hủy yêu cầu tham gia sự kiện (khi status=pending)
     * 
     * @param int $userId ID của user
     * @param int $eventId ID của sự kiện
     * @return array|bool Kết quả hủy
     */
    public function cancelJoinEvent($userId, $eventId)
    {
        $result = $this->joinEventRepo->leaveEvent($userId, $eventId);

        if ($result) {
            return [
                'success' => true,
                'message' => 'JoinEvent destroyed successfully',
                'data' => $result
            ];
        } else {
            return false;
        }
    }

    /**
     * Lấy tất cả đăng ký sự kiện của user
     * 
     * Bao gồm các trạng thái: pending, approved, rejected...
     * Kèm thông tin chi tiết sự kiện và author.
     * 
     * @param int $userId ID của user
     * @return \Illuminate\Support\Collection Danh sách đăng ký
     */
    public function getMyRegistrations($userId)
    {
        try {
            $registrations = DB::table('join_events')
                ->join('events', 'join_events.event_id', '=', 'events.id')
                ->join('users as author', 'events.author_id', '=', 'author.id')
                ->where('join_events.user_id', $userId)
                ->select(
                    'join_events.id as registration_id',
                    'join_events.status as registration_status',
                    'join_events.completion_status',
                    'join_events.completed_at',
                    'join_events.completion_note',
                    'join_events.created_at',
                    'join_events.joined_at',
                    'events.id as event_id',
                    'events.title',
                    'events.content',
                    'events.image',
                    'events.address',
                    'events.start_time',
                    'events.end_time',
                    'events.max_participants',
                    'events.current_participants',
                    'events.category',
                    'events.status as event_status',
                    'events.likes',
                    'events.author_id',
                    'events.created_at as event_created_at',
                    'author.username as author_username',
                    'author.email as author_email',
                    'author.image as author_image'
                )
                ->orderBy('join_events.created_at', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->registration_id,
                        'status' => $item->registration_status,
                        'completion_status' => $item->completion_status,
                        'completed_at' => $item->completed_at,
                        'completion_note' => $item->completion_note,
                        'created_at' => $item->created_at,
                        'joined_at' => $item->joined_at,
                        'event_id' => $item->event_id,
                        'event' => [
                            'id' => $item->event_id,
                            'title' => $item->title,
                            'content' => $item->content,
                            'image' => $item->image,
                            'address' => $item->address,
                            'start_time' => $item->start_time,
                            'end_time' => $item->end_time,
                            'max_participants' => $item->max_participants,
                            'current_participants' => $item->current_participants,
                            'category' => $item->category,
                            'status' => $item->event_status,
                            'likes' => $item->likes,
                            'author_id' => $item->author_id,
                            'created_at' => $item->event_created_at,
                            'author' => [
                                'id' => $item->author_id,
                                'username' => $item->author_username,
                                'email' => $item->author_email,
                                'image' => $item->author_image,
                            ]
                        ]
                    ];
                });

            return $registrations;
        } catch (\Exception $e) {
            Log::error('Error in UserService::getMyRegistrations: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Lấy lịch sử tham gia sự kiện của user
     * 
     * Chỉ lấy các sự kiện đã hoàn thành (completion_status='completed')
     * và đã kết thúc (end_time < now).
     * 
     * @param int $userId ID của user
     * @return \Illuminate\Support\Collection Lịch sử sự kiện
     */
    public function getEventHistory($userId)
    {
        try {
            $history = DB::table('join_events')
                ->join('events', 'join_events.event_id', '=', 'events.id')
                ->join('users as author', 'events.author_id', '=', 'author.id')
                ->where('join_events.user_id', $userId)
                ->where('join_events.status', 'approved')
                ->where('join_events.completion_status', 'completed')
                ->where('events.end_time', '<', now()) // Only past events
                ->select(
                    'events.id',
                    'events.title',
                    'events.content as description',
                    'events.image',
                    'events.address as location',
                    'events.max_participants',
                    'events.current_participants',
                    'events.start_time',
                    'events.end_time',
                    'join_events.created_at as joined_at',
                    'join_events.completed_at',
                    'join_events.completion_note',
                    'author.username as organizer_name',
                    'author.image as organizer_avatar'
                )
                ->orderBy('events.end_time', 'desc')
                ->get()
                ->map(function ($event) {
                    // Calculate hours
                    $startTime = new \DateTime($event->start_time);
                    $endTime = new \DateTime($event->end_time);
                    $interval = $startTime->diff($endTime);
                    $hours = ($interval->days * 24) + $interval->h + ($interval->i / 60);

                    // Get participant count (chỉ tính approved)
                    // $participants = DB::table('join_events')
                    //     ->where('event_id', $event->id)
                    //     ->where('status', 'approved')
                    //     ->count();

                    return [
                        'id' => $event->id,
                        'title' => $event->title,
                        'description' => $event->description,
                        'image' => $event->image,
                        'location' => $event->location,
                        'completedAt' => $event->completed_at ?? $event->end_time,
                        'hours' => round($hours, 1),
                        'max_participants' => $event->max_participants,
                        'participants' => $event->current_participants,
                        'completion_note' => $event->completion_note,
                        'organizer' => [
                            'name' => $event->organizer_name,
                            'avatar' => $event->organizer_avatar
                        ]
                    ];
                });

            return $history;
        } catch (\Exception $e) {
            Log::error('Error in UserService::getEventHistory: ' . $e->getMessage());
            throw $e;
        }
    } 

}