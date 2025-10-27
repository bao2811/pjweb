<?php

namespace App\Http\Controllers;

use App\Service\UserService;
use App\Service\EventService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController {

    protected $userService;
    protected $eventService;

    public function __construct(UserService $userService, EventService $eventService){
        $this->userService = $userService;
        $this->eventService = $eventService;
    }

    public function getAllUsers() {
        try{
            $listUser = $this->userService->getAllUsers();
            return response()->json($listUser, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error'=>'error server',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllEvent() {
        try{
            $listEvent = $this->eventService->getAllEvent();
            return response()->json($listEvent, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error'=>'error server',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function banUser($id) {
        try {
        $res = $this->userService->banUser($id);
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
        $res = $this->userService->unbanUser($id);
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
        $res = $this->eventService->deleteEvent($id);
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
        $res = $this->eventService->acceptEvent($id);
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
        $res = $this->eventService->rejectEvent($id);
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

    public function createMangerEvent(Request $request) {
        try {
            $data = validate($request->all(), [
                'username' => 'required|string|max:16|min:3|unique:users',
                'password' => 'required|string|min:8',
                'email' => 'required|email|max:255',
            ]);
            $data['role'] = 'manager';
            $user = $this->userService->createUser($data);
            return response()->json([
                'message' => 'complete create manager event',
                'user' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
