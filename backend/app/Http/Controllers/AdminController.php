<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AdminService;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\LOG;

/**
 * Controller AdminController - Xử lý các thao tác quản trị hệ thống
 * 
 * Controller này xử lý các API endpoint cho quản trị viên,
 * bao gồm: quản lý users, events, managers, ban/unban, approve/reject events.
 * 
 * @package App\Http\Controllers
 */
class AdminController {

    /** @var AdminService Service xử lý logic quản trị */
    protected $adminService;

    /**
     * Khởi tạo controller với AdminService
     * 
     * @param AdminService $adminService Service xử lý logic quản trị
     */
    public function __construct(AdminService $adminService){
        $this->adminService = $adminService;
    }

    /**
     * Lấy danh sách tất cả người dùng
     * 
     * @return JsonResponse Danh sách users
     */
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

    /**
     * Lấy danh sách tất cả sự kiện
     * 
     * @param Request $request Request object
     * @return JsonResponse Danh sách events
     */
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

    /**
     * Lấy danh sách tất cả managers
     * 
     * @return JsonResponse Danh sách managers
     */
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

    /**
     * Lấy danh sách sự kiện theo author
     * 
     * @param int $authorId ID của author
     * @return JsonResponse Danh sách sự kiện của author
     */
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

    /**
     * Khóa tài khoản người dùng (ban)
     * 
     * @param int $id ID của user cần ban
     * @return JsonResponse Kết quả ban
     */
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
    
    /**
     * Mở khóa tài khoản người dùng (unban)
     * 
     * @param int $id ID của user cần unban
     * @return JsonResponse Kết quả unban
     */
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

    /**
     * Xóa sự kiện
     * 
     * @param int $id ID của sự kiện cần xóa
     * @return JsonResponse Kết quả xóa
     */
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

    /**
     * Duyệt sự kiện (chấp nhận)
     * 
     * Gửi thông báo cho author khi sự kiện được duyệt.
     * 
     * @param int $id ID của sự kiện cần duyệt
     * @return JsonResponse Kết quả duyệt
     */
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

    /**
     * Từ chối sự kiện
     * 
     * Gửi thông báo cho author khi sự kiện bị từ chối.
     * 
     * @param int $id ID của sự kiện cần từ chối
     * @return JsonResponse Kết quả từ chối
     */
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

    /**
     * Tạo tài khoản manager mới
     * 
     * Tạo user với role='manager' để quản lý sự kiện.
     * 
     * @param Request $request Request chứa username, password, email, phone, address, image, address_card
     * @return JsonResponse User manager vừa tạo
     */
    public function createManagerEvent(Request $request) {
        try {
            // NOTE: make validation tolerant for common client payloads
            // - image/address_card may be sent as filenames or base64 strings, allow string
            // - enforce unique email to surface a clear validation error instead of DB exception
            $data = $request->validate([
                'username' => 'required|string|min:3|max:16|unique:users,username',
                'password' => 'required|string|min:8',
                'email' => 'required|email|max:255|unique:users,email',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'image' => 'nullable|string|max:1000',
                'address_card' => 'nullable|max:1000',
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

    /**
     * Xóa người dùng
     * 
     * @param int $id ID của user cần xóa
     * @return JsonResponse Kết quả xóa
     */
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

    /**
     * Khóa nhiều người dùng cùng lúc (bulk lock)
     * 
     * @param Request $request Request chứa mảng user_ids
     * @return JsonResponse Số lượng users đã bị khóa
     */
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

    /**
     * Mở khóa nhiều người dùng cùng lúc (bulk unlock)
     * 
     * @param Request $request Request chứa mảng user_ids
     * @return JsonResponse Số lượng users đã được mở khóa
     */
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

/**
     * Cập nhật thông tin manager
     * 
     * Cho phép cập nhật username, email, phone, address, image, address_card.
     * 
     * @param Request $request Request chứa thông tin cần cập nhật
     * @param int $id ID của manager cần cập nhật
     * @return JsonResponse Manager sau khi cập nhật
     */
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