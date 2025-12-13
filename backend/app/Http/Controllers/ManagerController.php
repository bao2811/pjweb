<?php

namespace App\Http\Controllers;

use App\Services\ManagerService;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Validation\Validator;
use Illuminate\Support\Facades\Validator as FacadesValidator;

class ManagerController extends Controller
{
    protected  ManagerService $managerService;

    public function __construct(ManagerService $managerService)
    {
        $this->managerService = $managerService;
    }

    public function getListUserByEvent($id): JsonResponse
    {
        try {
            $users = $this->managerService->getListUserByEvent($id);
            return response()->json([
                'success' => true,
                'users' => $users
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error fetching users for event: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    public function acceptUserJoinEvent(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|integer',
                'event_id' => 'required|integer',
            ]);

            $userId = $request->input('user_id');
            $eventId = $request->input('event_id');
            $managerId = $request->user()->id; // Lấy manager ID từ user đang authenticated
            
            $result = $this->managerService->acceptUserJoinEvent($userId, $eventId, $managerId);
            
            return response()->json([
                'success' => true,
                'message' => 'User approved successfully',
                'data' => $result
            ], Response::HTTP_OK);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (Exception $e) {
            Log::error('Error accepting user join event: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function rejectUserJoinEvent(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|integer',
                'event_id' => 'required|integer',
            ]);

            $userId = $request->input('user_id');
            $eventId = $request->input('event_id');
            $managerId = $request->user()->id; // Lấy manager ID từ user đang authenticated
            
            $result = $this->managerService->rejectUserJoinEvent($eventId, $userId, $managerId);
            
            return response()->json([
                'success' => true,
                'message' => 'User rejected successfully',
                'data' => $result
            ], Response::HTTP_OK);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (Exception $e) {
            Log::error('Error rejecting user join event: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function createEvent(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'address' => 'required|string|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
            'image' => 'nullable|string|max:500', // Changed to accept URL string
            'comanager' => 'nullable|array',
            'comanager.*' => 'integer|exists:users,id',
            'max_participants' => 'required|integer|min:1',
            'category' => 'required|string|max:100',
        ]);

        $eventData = $request->only(['title', 'content', 'start_time', 'end_time', 'address', 'max_participants', 'category']);
        $eventData['author_id'] = $request->user()->id;
        $eventData['status'] = 'pending'; // Manager created events need admin approval
        
        // Handle image: use provided URL or default
        if (!empty($request->input('image'))) {
            $eventData['image'] = $request->input('image');
        } else {
            $eventData['image'] = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a';
        }
        
        $event = $this->managerService->createEvent($eventData, $request->input('comanager', []));

        return response()->json(['event' => $event], 201);
    }

    //  public function createEvent(Request $request)
    // {
    //     $request->validate([
    //         'title' => 'required|string|max:255',
    //         'description' => 'nullable|string',
    //         'location' => 'required|string|max:255',
    //         'start_time' => 'required|date',
    //         'end_time' => 'required|date|after_or_equal:start_time',
    //         'max_participants' => 'required|integer|min:1',
    //         'points' => 'nullable|integer|min:0',
    //         'category' => 'required|string|max:100',
    //         'image' => 'nullable|string',
    //         'status' => 'nullable|string|in:pending,approved,rejected',
    //     ]);

    //     // Lấy user_id từ JWT token
    //     $userId = auth()->id();
        
    //     $eventData = $request->only([
    //         'title', 'description', 'location', 'start_time', 'end_time',
    //         'max_participants', 'points', 'category', 'image', 'status'
    //     ]);
        
    //     // Set default values
    //     $eventData['status'] = $eventData['status'] ?? 'pending';
    //     $eventData['points'] = $eventData['points'] ?? 100;
    //     $eventData['current_participants'] = 0;
    //     $eventData['creator_id'] = $userId;
        
    //     $event = $this->managerService->createEvent($eventData, []);

    //     return response()->json([
    //         'message' => 'Event created successfully',
    //         'event' => $event
    //     ], 201);
    // }

    /**
     * Lấy danh sách events của manager hiện tại
     */
    public function getMyEvents(Request $request): JsonResponse
    {
        try {
            $managerId = $request->user()->id;
            $events = $this->managerService->getEventsByManagerId($managerId);
            
            return response()->json([
                'success' => true,
                'events' => $events
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error fetching manager events: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

}