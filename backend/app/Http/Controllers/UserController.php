<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Controller UserController - Xử lý các thao tác liên quan đến người dùng
 * 
 * Controller này xử lý các API endpoint cho người dùng thường (role: user),
 * bao gồm: xem/cập nhật thông tin cá nhân, tham gia/rời sự kiện, lịch sử hoạt động.
 * 
 * @package App\Http\Controllers
 */
class UserController extends Controller
{

   protected $userService;
   
   /**
    * Khởi tạo controller với UserService
    * 
    * @param UserService $userService Service xử lý logic nghiệp vụ user
    */
   public function __construct(UserService $userService){
      $this->userService = $userService;
   }

   /**
    * Lấy thông tin user hiện tại đang đăng nhập kèm thống kê
    * 
    * @param Request $request Request chứa thông tin user đã xác thực
    * @return JsonResponse Thông tin user với stats (events_joined, total_hours, etc.)
    */
   function getUser(Request $request)
   {
      $user = $request->user();
      if (!$user) {
         return response()->json(['error' => 'User not found'], 404);
      }
      
      $result = $this->userService->getUserWithStats($user->id);
      return response()->json($result['data']);
   }

   /**
    * Lấy thông tin chi tiết của một user theo ID
    * 
    * @param Request $request Request object
    * @param int $id ID của user cần xem
    * @return JsonResponse Thông tin chi tiết user kèm stats
    */
   public function getUserDetails(Request $request, $id)
   {
      $result = $this->userService->getUserWithStats($id);
      return response()->json($result['data']);
   }

   /**
    * Cập nhật thông tin profile của user
    * 
    * Chỉ cho phép user cập nhật profile của chính mình.
    * Validate các trường: username, email, phone, address, image, address_card.
    * 
    * @param Request $request Request chứa dữ liệu cập nhật
    * @param int $id ID của user cần cập nhật
    * @return JsonResponse Kết quả cập nhật hoặc thông báo lỗi
    */
   public function updateUserProfile(Request $request, $id)
   {
      try{
         // Verify user chỉ có thể update chính mình
         $currentUser = $request->user();
         if ($currentUser->id != $id) {
            return response()->json(['error' => 'Unauthorized'], 403);
         }

         // Validation với messages rõ ràng hơn
         $validated = $request->validate([
             'username' => 'required|string|max:255|min:3',
             'email' => 'required|email|max:255',
             'phone' => 'nullable|string|max:20',
             'address' => 'nullable|string|max:500',
             'image' => 'nullable|string',
             'address_card' => 'nullable|string|max:500',
         ], [
             'username.required' => 'Tên người dùng không được để trống',
             'username.min' => 'Tên người dùng phải có ít nhất 3 ký tự',
             'username.max' => 'Tên người dùng không được vượt quá 255 ký tự',
             'email.required' => 'Email không được để trống',
             'email.email' => 'Email không đúng định dạng',
             'email.max' => 'Email không được vượt quá 255 ký tự',
             'phone.max' => 'Số điện thoại không được vượt quá 20 ký tự',
             'address.max' => 'Địa chỉ không được vượt quá 500 ký tự',
             'address_card.max' => 'Địa chỉ thẻ không được vượt quá 500 ký tự',
         ]);
         
         $updatedUser = $this->userService->updateUser($id, $validated);
         return response()->json([
            'success' => true,
            'message' => 'Cập nhật thành công',
            'data' => $updatedUser
         ]);
      } catch (\Illuminate\Validation\ValidationException $e) {
         return response()->json([
             'error' => 'Validation error',
             'messages' => $e->errors()
         ], 422);
      } catch (\Exception $e) {
            Log::error('Update profile error: ' . $e->getMessage());
            return response()->json([
             'error' => 'Update failed',
             'message' => $e->getMessage()
         ], 500);
      }
   }

   /**
    * Tạo user mới
    * 
    * @param Request $request Request chứa thông tin user mới
    * @return JsonResponse User vừa tạo hoặc thông báo lỗi
    */
   public function createUser(Request $request)
   { 
      try{
         $data = $request->only(['name', 'email', 'password']);
         $newUser = $this->userService->createUser($data);
         return response()->json($newUser, 201);
      } catch (\Exception $e) {
         return response()->json([
             'error' => 'something wrong',
             'message' => $e->getMessage()
         ], 500);
      }
   }

   /**
    * User đăng ký tham gia sự kiện
    * 
    * Tạo một yêu cầu tham gia sự kiện với trạng thái 'pending'.
    * Manager sẽ duyệt yêu cầu này sau.
    * 
    * @param Request $request Request chứa thông tin user
    * @param int $eventId ID của sự kiện muốn tham gia
    * @return JsonResponse Kết quả đăng ký (registration object)
    */
   public function joinEvent(Request $request, $eventId)
    {
        try {
            $user = $request->user();
            $data = $this->userService->joinEvent($user->id, $eventId);
            
            if(!$data){
                return response()->json(['error' => 'Event not found'], 404);
            }
            
            // Trả về registration object cho frontend
            return response()->json([
                'success' => true,
                'message' => 'Joined event successfully',
                'registration' => [
                    'id' => $data['data']->id ?? null,
                    'event_id' => $eventId,
                    'status' => $data['data']->status ?? 'pending',
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * User rời khỏi sự kiện đã đăng ký
     * 
     * Hủy đăng ký tham gia sự kiện (nếu sự kiện chưa bắt đầu).
     * 
     * @param Request $request Request chứa thông tin user
     * @param int $eventId ID của sự kiện muốn rời
     * @return JsonResponse Kết quả hủy đăng ký
     */
    public function leaveEvent(Request $request, $eventId)
    {
        $user = $request->user();
        $data = $this->userService->leaveEvent($user->id, $eventId);
        if(!$data){
            return response()->json(['error' => 'Event not found'], 404);
        }
        return response()->json(['message' => 'Left event successfully']);
    }
   
    /**
     * Lấy lịch sử tham gia sự kiện của user
     * 
     * Trả về danh sách các sự kiện user đã hoàn thành,
     * bao gồm thông tin về số giờ tình nguyện.
     * 
     * @param Request $request Request chứa thông tin user
     * @return JsonResponse Danh sách lịch sử sự kiện
     */
    public function getEventHistory(Request $request)
   {
       try {
           $userId =$request->user()->id;
           
           if (!$userId) {
               return response()->json([
                   'success' => false,
                   'message' => 'User ID is required'
               ], 400);
           }

           $history = $this->userService->getEventHistory($userId);

           return response()->json([
               'success' => true,
               'history' => $history
           ]);

       } catch (\Exception $e) {
           Log::error('Error getting event history: ' . $e->getMessage());
           return response()->json([
               'success' => false,
               'message' => 'Failed to get event history',
               'error' => $e->getMessage()
           ], 500);
       }
   }

   /**
    * Lấy danh sách các đăng ký sự kiện của user
    * 
    * Trả về tất cả các đăng ký (pending, approved, rejected, etc.)
    * kèm thông tin chi tiết của từng sự kiện.
    * 
    * @param Request $request Request chứa thông tin user
    * @return JsonResponse Danh sách registrations
    */
   public function getMyRegistrations(Request $request)
   {
       try {
           $userId = $request->user()->id;
           
           if (!$userId) {
               return response()->json([
                   'success' => false,
                   'message' => 'User ID is required'
               ], 400);
           }

           $registrations = $this->userService->getMyRegistrations($userId);

           return response()->json([
               'success' => true,
               'registrations' => $registrations
           ]);

       } catch (\Exception $e) {
           Log::error('Error getting my registrations: ' . $e->getMessage());
           return response()->json([
               'success' => false,
               'message' => 'Failed to get registrations',
               'error' => $e->getMessage()
           ], 500);
       }
   }
}