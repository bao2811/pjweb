<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AdminService;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\LOG;


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

    public function getAllEvents(Request $request) {
        try{
            // Lấy userId từ authenticated user
            $userId = $request->user() ? $request->user()->id : null;
            $listEvent = $this->adminService->getAllEvents($userId);
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

    public function getEventsByAuthor($authorId) {
        try {
            $events = $this->adminService->getEventsByAuthor($authorId);
            return response()->json([
                'events' => $events
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'error server',
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
            $senderId = request()->user()->id;
            $res = $this->adminService->acceptEvent($id, $senderId);
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
            $senderId = request()->user()->id;
            $res = $this->adminService->rejectEvent($id, $senderId);
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

public function updateManager(Request $request, $id) {
        try {
            $data = $request->validate([
                'username' => 'sometimes|string|max:255',
                'email' => [
                    'sometimes',
                    'string',
                    'email',
                    'max:255',
                ],
                'phone' => 'sometimes|nullable|string|max:20',
                'address' => 'sometimes|nullable|string|max:255',
                'image' => 'sometimes|nullable|string|max:255',
                'address_card' => 'sometimes|nullable|string|max:255',
            ]);

            $result = $this->adminService->updateManager($id, $data);

            if (!$result) {
                return response()->json([
                    'error' => 'not_found',
                    'message' => 'Manager not found'
                ], 404);
            }

            return response()->json([
                'message' => 'update thành công',
                'user' => $result
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'validation',
                'message' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('updateManager failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'error' => 'server_error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}