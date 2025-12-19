<?php

namespace App\Http\Controllers;

use App\Services\ManagerService;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ManagerController extends Controller
{
    protected  ManagerService $managerService;

    public function __construct(ManagerService $managerService)
    {
        $this->managerService = $managerService;
    }

    /**
     * Kiểm tra Manager ownership trước khi lấy danh sách users
     */
    public function getListUserByEvent(Request $request, $id): JsonResponse
    {
        try {
            $managerId = $request->user()->id;
            $users = $this->managerService->getListUserByEvent($id, $managerId);
            return response()->json([
                'success' => true,
                'users' => $users
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error fetching users for event: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * FIX #3: Delete event với kiểm tra quyền sở hữu
     */
    public function deleteEvent(Request $request, $id): JsonResponse
    {
        try {
            $managerId = $request->user()->id;
            $result = $this->managerService->deleteEvent($id, $managerId);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event not found or you do not have permission'
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully'
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error deleting event: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
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
            $managerId = $request->user()->id;
            
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
            $managerId = $request->user()->id;
            
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

    /**
     * FIX #7: Thêm validation 'start_time' => 'after:now'
     */
    public function createEvent(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:5000', // FIX #10 (optional): Giới hạn độ dài content
            'address' => 'required|string|max:255',
            'start_time' => 'required|date|after:now', // FIX #7: start_time phải sau thời điểm hiện tại
            'end_time' => 'required|date|after_or_equal:start_time',
            'image' => 'nullable|string|max:500',
            'comanager' => 'nullable|array',
            'comanager.*' => 'integer|exists:users,id',
            'max_participants' => 'required|integer|min:1',
            'category' => 'required|string|max:100',
        ]);

        $eventData = $request->only(['title', 'content', 'start_time', 'end_time', 'address', 'max_participants', 'category']);
        $eventData['author_id'] = $request->user()->id;
        $eventData['status'] = 'pending';
        
        if (!empty($request->input('image'))) {
            $eventData['image'] = $request->input('image');
        } else {
            $eventData['image'] = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a';
        }
        
        $event = $this->managerService->createEvent($eventData, $request->input('comanager', []));

        return response()->json(['event' => $event], 201);
    }

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

    /**
     * Get event details for editing
     */
    public function getEventDetails(Request $request, $id): JsonResponse
    {
        try {
            $managerId = $request->user()->id;
            $event = $this->managerService->getEventById($id, $managerId);
            
            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event not found or you do not have permission'
                ], Response::HTTP_NOT_FOUND);
            }
            
            return response()->json([
                'success' => true,
                'event' => $event
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error fetching event details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update event and notify admin
     * FIX #7, #8: Thêm validation start_time > now và kiểm tra lifecycle
     */
    public function updateEvent(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string|max:5000', // FIX optional: Giới hạn content
                'address' => 'required|string|max:255',
                'start_time' => 'required|date|after:now', // FIX #7: start_time phải sau thời điểm hiện tại
                'end_time' => 'required|date|after_or_equal:start_time',
                'image' => 'nullable|string|max:500',
                'max_participants' => 'required|integer|min:1',
                'category' => 'required|string|max:100',
            ]);

            $managerId = $request->user()->id;
            $eventData = $request->only([
                'title', 
                'content', 
                'start_time', 
                'end_time', 
                'address', 
                'max_participants', 
                'category',
                'image'
            ]);

            $event = $this->managerService->updateEvent($id, $managerId, $eventData);

            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event not found or you do not have permission'
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'message' => 'Event updated successfully. Admin has been notified.',
                'event' => $event
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error updating event: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Mark volunteer completion
     */
    public function markVolunteerCompletion(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'event_id' => 'required|integer',
                'user_id' => 'required|integer',
                // unified participant status: completed or failed
                'status' => 'required|string|in:completed,failed',
                'completion_note' => 'nullable|string|max:1000',
            ]);

            $managerId = $request->user()->id;
            $eventId = $request->input('event_id');
            $userId = $request->input('user_id');
            $status = $request->input('status');
            $completionNote = $request->input('completion_note');

            $result = $this->managerService->markVolunteerCompletion(
                $eventId,
                $userId,
                $managerId,
                $status,
                $completionNote
            );

            return response()->json([
                'success' => true,
                'message' => 'Volunteer completion marked successfully',
                'data' => $result
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error marking volunteer completion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Get event report
     */
    public function getEventReport(Request $request, $eventId): JsonResponse
    {
        try {
            $managerId = $request->user()->id;
            $report = $this->managerService->getEventReport($eventId, $managerId);

            return response()->json([
                'success' => true,
                'report' => $report
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error fetching event report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Get manager's events overview report
     */
    public function getManagerEventsReport(Request $request): JsonResponse
    {
        try {
            $managerId = $request->user()->id;
            $report = $this->managerService->getManagerEventsReport($managerId);

            return response()->json([
                'success' => true,
                'report' => $report
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            Log::error('Error fetching manager events report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}