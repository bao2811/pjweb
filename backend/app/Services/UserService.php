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

class UserService
{

    protected UserRepo $userRepo;
    protected JoinEventRepo $joinEventRepo;

    public function __construct(UserRepo $userRepo, JoinEventRepo $joinEventRepo)
    {
        $this->userRepo = $userRepo;
        $this->joinEventRepo = $joinEventRepo;
    }

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
    public function createUser($data)
    {
            // Validate input and extract validated data (accepts a Request)
            // $validated = [];
            // if (is_object($data) && method_exists($data, 'validate')) {
            //     $validated = $data->validate([
            //         'username' => 'required|string|max:255',
            //         'email' => 'required|string|email|max:255|unique:users',
            //         'password' => 'required|string|min:8|confirmed',
            //         'phone' => 'required|string|max:20',
            //         'address' => 'required|string|max:255',
            //         'image' => 'nullable|string|max:255',
            //         'addressCard' => 'nullable|string|max:255',
            //     ]);
            // } elseif (is_array($data)) {
            //     // If an array was passed, validate using the Validator facade
            //     $validator = Validator::make($data, [
            //         'username' => 'required|string|max:255',
            //         'email' => 'required|string|email|max:255|unique:users',
            //         'password' => 'required|string|min:8|confirmed',
            //         'phone' => 'required|string|max:20',
            //         'address' => 'required|string|max:255',
            //         'image' => 'nullable|string',
            //         'addressCard' => 'nullable|string|max:255',
            //     ]);

            //     if ($validator->fails()) {
            //         throw new ValidationException($validator);
            //     }

            //     $validated = $validator->validated();
            // } else {
            //     throw new CustomException('Invalid data provided for user creation');
            // }

            // Hash password and create user
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

    public function getAllUsers()
    {
        $result = $this->userRepo->getAllUsers();
        return [
            'success' => true,
            'message' => 'Users retrieved successfully',
            'data' => $result
        ];
    }
    public function banUser($id)
    {
        $id->validate([
            'id' => 'required|integer|exists:users,id',
        ]);
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
     * Lấy thông tin user kèm theo stats
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

    public function unbanUser($id)
    {
        $id->validate([
            'id' => 'required|integer|exists:users,id',
        ]);
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
     * Get all user's event registrations (pending, accepted, rejected, etc.)
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
     * Get user's event history
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
                    $participants = DB::table('join_events')
                        ->where('event_id', $event->id)
                        ->where('status', 'approved')
                        ->count();

                    return [
                        'id' => $event->id,
                        'title' => $event->title,
                        'description' => $event->description,
                        'image' => $event->image,
                        'location' => $event->location,
                        'completedAt' => $event->completed_at ?? $event->end_time,
                        'hours' => round($hours, 1),
                        'participants' => $participants,
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