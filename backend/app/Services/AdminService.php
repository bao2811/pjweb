<?php

namespace App\Services;

use App\Repositories\UserRepo;;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Services\EventService;

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
        return $this->userRepo->all();
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

    public function getAllEvents()
    {
        $result = $this->eventService->getAllEvents();
        return $result;
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