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
            $event = $this->managerService->getEventById($id);
            if (!$event) {
                return response()->json(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
            }
            return response()->json($event, Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error fetching Event: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    public function acceptUserJoinEvent(Request $request, $id): JsonResponse
    {
        try {
            $user = $request->user();
            $event = $this->managerService->acceptUserJoinEvent($user, $id);
            return response()->json($event, Response::HTTP_OK);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
        } catch (Exception $e) {
            Log::error('Error accepting user join event: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function rejectUserJoinEvent(Request $request, $id): JsonResponse
    {
        try {
            $event = $this->managerService->rejectUserJoinEvent($id);
            return response()->json($event, Response::HTTP_OK);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
        } catch (Exception $e) {
            Log::error('Error rejecting user join event: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function createEvent(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
            'max_participants' => 'required|integer|min:1',
            'points' => 'nullable|integer|min:0',
            'category' => 'required|string|max:100',
            'image' => 'nullable|string',
            'status' => 'nullable|string|in:pending,approved,rejected',
        ]);

        // Lấy user_id từ JWT token
        $userId = auth()->id();
        
        $eventData = $request->only([
            'title', 'description', 'location', 'start_time', 'end_time',
            'max_participants', 'points', 'category', 'image', 'status'
        ]);
        
        // Set default values
        $eventData['status'] = $eventData['status'] ?? 'pending';
        $eventData['points'] = $eventData['points'] ?? 100;
        $eventData['current_participants'] = 0;
        $eventData['creator_id'] = $userId;
        
        $event = $this->managerService->createEvent($eventData, []);

        return response()->json([
            'message' => 'Event created successfully',
            'event' => $event
        ], 201);
    }

}