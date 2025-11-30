<?php

namespace App\Services;

use App\Repositories\UserRepo;;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Services\EventService;
use App\Models\User;

class AdminService
{
    protected $userRepo;
    protected $eventService;

    public function __construct(UserRepo $userRepo, EventService $eventService)
    {
        $this->userRepo = $userRepo;
        $this->eventService = $eventService;
    }

    public function getAllUsers()
    {
        return $this->userRepo->getAllUsers();
    }

    public function getAllEvents($userId = null)
    {
        return $this->eventService->getAllEvents($userId);
    }

    public function getAllManagers()
    {
        return $this->userRepo->getUsersByRole('manager');
    }

    public function banUser($id)
    {
        $result = $this->userRepo->banUser($id);
        if (!$result) {
            throw new Exception('Failed to ban user');
        }
        return $result;
    }

    public function unbanUser($id)
    {
        $result = $this->userRepo->unbanUser($id);
        if (!$result) {
            throw new Exception('Failed to unban user');
        }
        return $result;
    }

    public function deleteEvent($id)
    {
        return $this->eventService->deleteEvent($id);
    }

    public function deleteUser($id)
    {
        $result = $this->userRepo->deleteUserById($id);
        if (!$result) {
            throw new Exception('Failed to delete user');
        }
        return $result;
    }

    public function bulkLockUsers(array $userIds)
    {
        $affected = 0;
        foreach ($userIds as $id) {
            try {
                $this->userRepo->banUser($id);
                $affected++;
            } catch (\Exception $e) {
                // Log error but continue with other users
                \Log::error("Failed to lock user {$id}: " . $e->getMessage());
            }
        }
        return $affected;
    }

    public function bulkUnlockUsers(array $userIds)
    {
        $affected = 0;
        foreach ($userIds as $id) {
            try {
                $this->userRepo->unbanUser($id);
                $affected++;
            } catch (\Exception $e) {
                // Log error but continue with other users
                \Log::error("Failed to unlock user {$id}: " . $e->getMessage());
            }
        }
        return $affected;
    }

    public function acceptEvent($id)
    {
        $result = $this->eventService->acceptEvent($id);
        return $result;
    }

    public function rejectEvent($id)
    {
        $result = $this->eventService->rejectEvent($id);
        return $result;
    }

    public function createUser($data)
    {
        $result = $this->userRepo->createUser($data);
        return $result;
    }
}