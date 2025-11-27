<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use App\Repositories\UserRepo;
use Exception;

class UserService
{

    protected UserRepo $userRepo;

    public function __construct(UserRepo $userRepo)
    {
        $this->userRepo = $userRepo;
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
    public function createUser(array $data)
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

    public function getAllUsers()
    {
        $result = $this->userRepo->all();
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
        $result = $this->userRepo->ban($id);
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
        $id->validate([
            'id' => 'required|integer|exists:users,id',
        ]);
        $result = $this->userRepo->find($id);
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

    public function unbanUser($id)
    {
        $id->validate([
            'id' => 'required|integer|exists:users,id',
        ]);
        $result = $this->userRepo->unban($id);
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
        $id->validate([
            'id' => 'required|integer|exists:users,id',
        ]);

        $data->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|required|string|min:8|confirmed',
        ]);

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
     * Get user's event history
     */
    public function getEventHistory($userId)
    {
        try {
            $history = DB::table('join_events')
                ->join('events', 'join_events.event_id', '=', 'events.id')
                ->join('users as author', 'events.author_id', '=', 'author.id')
                ->where('join_events.user_id', $userId)
                ->where('join_events.status', 'accepted')
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
                    'author.name as organizer_name',
                    'author.avatar as organizer_avatar'
                )
                ->orderBy('events.end_time', 'desc')
                ->get()
                ->map(function ($event) {
                    // Calculate hours
                    $startTime = new \DateTime($event->start_time);
                    $endTime = new \DateTime($event->end_time);
                    $interval = $startTime->diff($endTime);
                    $hours = ($interval->days * 24) + $interval->h + ($interval->i / 60);

                    // Get participant count
                    $participants = DB::table('join_events')
                        ->where('event_id', $event->id)
                        ->where('status', 'accepted')
                        ->count();

                    return [
                        'id' => $event->id,
                        'title' => $event->title,
                        'description' => $event->description,
                        'image' => $event->image,
                        'location' => $event->location,
                        'completedAt' => $event->end_time,
                        'hours' => round($hours, 1),
                        'participants' => $participants,
                        'organizer' => [
                            'name' => $event->organizer_name,
                            'avatar' => $event->organizer_avatar
                        ]
                    ];
                });

            return $history;
        } catch (\Exception $e) {
            \Log::error('Error in UserService::getEventHistory: ' . $e->getMessage());
            throw $e;
        }
    } 
}