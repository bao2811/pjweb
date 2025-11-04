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

   public function getUserDetails(Request $request)
   {
      $userId = $request->session()->get('user_id');
      $id = $request->param('id');
      $user = $this->userService->getUserById($id);
      return response()->json($user);
   }

   public function updateUserProfile(Request $request)
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
}