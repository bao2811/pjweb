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
            $userId = $request->get('userId');
            $event = $this->managerService->acceptUserJoinEvent($userId, $id, $request->managerId);
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
            $userId = $request->get('userId');
            $event = $this->managerService->rejectUserJoinEvent($id, $userId, $request->managerId);
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
            'description' => 'required|string',
            'date' => 'required|date',
            'user_id' => 'required|integer|exists:users,id',
            'image' => 'nullable|image|max:2048',
            'comanager' => 'nullable|array',
            'comanager.*' => 'integer|exists:users,id',
        ]);

        $eventData = $request->only(['title', 'description', 'date', 'user_id', 'image']);
        if ($request->hasFile('image')) {
            $eventData['image'] = $request->file('image')->store('events');
        }
        $event = $this->managerService->createEvent($eventData, $request->input('comanager', []));

        return response()->json(['event' => $event], 201);
    }

}