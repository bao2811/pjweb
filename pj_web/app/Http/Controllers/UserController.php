<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{

   protected $userService;
   
   public function __construct(UserService $userService){
      $this->userService = $userService;
   }

   function getUser(Request $request)
   {

        $user = $request->user();
        
       return response()->json($request->user());
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
        $user = $request->user();
        $data = $this->userService->joinEvent($user->id, $eventId);
        if(!$data){
            return response()->json(['error' => 'Event not found'], 404);
        }
        return response()->json(['message' => 'Joined event successfully']);
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
   
}