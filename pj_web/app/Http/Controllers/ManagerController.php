<?php

namespace App\Http\Controllers;

use App\Service\ManagerService;
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
            $event = $this->userService->acceptUserJoinEvent($id);
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
            $event = $this->userService->rejectUserJoinEvent($id);
            return response()->json($event, Response::HTTP_OK);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
        } catch (Exception $e) {
            Log::error('Error rejecting user join event: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

}