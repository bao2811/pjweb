<?php

namespace App\Http\Controllers;

use App\Service\UserService;
use App\Service\EventService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Services\AdminService;
use Illuminate\Validation\ValidationException;


class AdminController {

    protected $adminService;

    public function __construct(AdminService $adminService){
        $this->adminService = $adminService;
    }

    public function getAllUsers() {
        try{
            $listUser = $this->adminService->getAllUsers();
            return response()->json($listUser, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error'=>'error server',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllEvents() {
        try{
            $listEvent = $this->adminService->getAllEvents();
            return response()->json($listEvent, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error'=>'error server',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllManagers() {
        try{
            $listManager = $this->adminService->getAllManagers();
            return response()->json($listManager, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error'=>'error server',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function banUser($id) {
        try {
        $res = $this->adminService->banUser($id);
            return response()->json([
                'message' => 'complete ban'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'something wrong',
                'message' => $e->getMessage()
        ], 500);
        } 
    }
    
    public function unbanUser($id) {
        try {
        $res = $this->adminService->unbanUser($id);
            return response()->json([
                'message' => 'complete unban'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'something wrong',
                'message' => $e->getMessage()
        ], 500);
        } 
    }

    public function deleteEvent($id) {
        try {
        $res = $this->adminService->deleteEvent($id);
            return response()->json([
                'message' => 'complete delete event'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'something wrong',
                'message' => $e->getMessage()
        ], 500);
        } 
    }

    public function acceptEvent($id) {
        try {
        $res = $this->adminService->acceptEvent($id);
            return response()->json([
                'message' => 'complete accept event'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'something wrong',
                'message' => $e->getMessage()
        ], 500);
        } 
    }

    public function rejectEvent($id) {
        try {
        $res = $this->adminService->rejectEvent($id);
            return response()->json([
                'message' => 'complete reject event'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'something wrong',
                'message' => $e->getMessage()
        ], 500);
        } 
    }

    public function createManagerEvent(Request $request) {
        try {
            $data = $request->validate([
                'username' => 'required|string|max:16|min:3|unique:users',
                'password' => 'required|string|min:8',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'image' => 'nullable|url|max:255',
                'address_card' => 'nullable|url|max:255',
            ]);
            $data['role'] = 'manager';
            $user = $this->adminService->createUser($data);
            return response()->json([
                'message' => 'complete create manager event',
                'user' => $user
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation error',
                'message' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => "lỗi tạo manager: " . $e->getMessage()
            ], 500);
        }
    }

    public function deleteUser($id) {
        try {
            $res = $this->adminService->deleteUser($id);
            return response()->json([
                'message' => 'complete delete user'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'something wrong',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkLockUsers(Request $request) {
        try {
            $data = $request->validate([
                'user_ids' => 'required|array',
                'user_ids.*' => 'required|integer|exists:users,id'
            ]);
            
            $result = $this->adminService->bulkLockUsers($data['user_ids']);
            return response()->json([
                'message' => 'complete bulk lock users',
                'affected' => $result
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation error',
                'message' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'something wrong',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkUnlockUsers(Request $request) {
        try {
            $data = $request->validate([
                'user_ids' => 'required|array',
                'user_ids.*' => 'required|integer|exists:users,id'
            ]);
            
            $result = $this->adminService->bulkUnlockUsers($data['user_ids']);
            return response()->json([
                'message' => 'complete bulk unlock users',
                'affected' => $result
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation error',
                'message' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'something wrong',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
