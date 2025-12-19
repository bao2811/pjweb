<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{

   protected $userService;
   
   public function __construct(UserService $userService){
      $this->userService = $userService;
   }

   function getUser(Request $request)
   {
      $user = $request->user();
      if (!$user) {
         return response()->json(['error' => 'User not found'], 404);
      }
      
      $result = $this->userService->getUserWithStats($user->id);
      return response()->json($result['data']);
   }

   public function getUserDetails(Request $request, $id)
   {
      $result = $this->userService->getUserWithStats($id);
      return response()->json($result['data']);
   }

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

    public function leaveEvent(Request $request, $eventId)
    {
        $user = $request->user();
        $data = $this->userService->leaveEvent($user->id, $eventId);
        if(!$data){
            return response()->json(['error' => 'Event not found'], 404);
        }
        return response()->json(['message' => 'Left event successfully']);
    }
   
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