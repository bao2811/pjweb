<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{

   protected $userService;
   
   public function __construct(UserService $userService){
      $this->userService = $userService;
   }

   function getUser(Request $request)
   {
      $user = $request-user();
      return response()->json($user);
   }

   public function getUserDetails(Request $request, $id)
   {
      $userId = $request->session()->get('user_id');
      $user = $this->userService->getUserById($id);
      return response()->json($user);
   }

   public function updateUserProfile(Request $request, $id)
   {
      try{
         $request->validate([
             'name' => 'sometimes|string|max:255',
             'email' => 'sometimes|email|max:255',
             'password' => 'sometimes|string|min:6',
         ]);
         
         $userId = $request->session()->get('user_id');
         $data = $request->only(['name', 'email', 'password']);
         $updatedUser = $this->userService->updateUser($userId, $data);
         return response()->json($updatedUser);
      } catch (\Illuminate\Validation\ValidationException $e) {
         return response()->json([
             'error' => 'Validation error',
             'messages' => $e->errors()
         ], 422);
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
           \Log::error('Error getting event history: ' . $e->getMessage());
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
           \Log::error('Error getting my registrations: ' . $e->getMessage());
           return response()->json([
               'success' => false,
               'message' => 'Failed to get registrations',
               'error' => $e->getMessage()
           ], 500);
       }
   }
}