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

    public function getUserById($id) : ?User
    {
        return User::find($id);
    }

    public function createUser($data) : User
    {
        return User::create($data);
    }

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

    public function findByEmail($email)
    {
        return User::where('email', $email)->first();
    }

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

    public function updateUserById($id, $data) : User
    {
        $user = $this->getUserById($id);
        if (!$user) {
            throw new Exception('User not found');
        }
        $user->update($data);
        return $user;
    }

    public function find($id) : ?User
    {
        $user = $this->getUserById($id);
        return $user;
    }

    public function banUser($id): int
    {
        $result = User::where('id', $id)->update(['status' => 'locked']);
        if (!$result) {
            throw new Exception('User not found');
        }
        return $result;
    }

    public function unbanUser($id) : int
    {
        $result = User::where('id', $id)->update(['status' => 'active']);
        if (!$result) {
            throw new Exception('User not found');
        }
        return $result;
    }

    public function deleteUserById($id) : bool
    {
        $user = $this->getUserById($id);
        if (!$user) {
            throw new Exception('User not found');
        }
        return $user->delete();
    }
}