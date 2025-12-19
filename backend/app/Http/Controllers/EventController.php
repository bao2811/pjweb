<?php

namespace App\Http\Controllers;

use App\Utils\WebPushApi;
use Illuminate\Http\Request;
use App\Services\EventService;
use App\Services\ManagerService;
use Illuminate\Support\Facades\DB;


class EventController extends Controller
{

    protected $eventService;
    protected $managerService;
    
    public function __construct(EventService $eventService, ManagerService $managerService){
        $this->eventService = $eventService;
        $this->managerService = $managerService;
    }

    public function sendNotification(Request $request)
    {
        $subscriptions = $request->input('subscriptions');
        $title = $request->input('title');
        $body = $request->input('body');
        $url = $request->input('url');

        WebPushApi::sendNotification($subscriptions, $title, $body, $url);

        return response()->json(['success' => true]);   
    }

    public function getAllEvents(Request $request)
    {
        try{
            // Lấy userId từ authenticated user
            $userId = $request->user() ? $request->user()->id : null;
            $listEvent = $this->eventService->getAllEvents($userId);
            return response()->json(['events' => $listEvent], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error'=>'error server',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Trả về các sự kiện hot (nhiều lượt like nhất trong 7 ngày gần đây)
     */
    public function getTrendingEvents(Request $request)
    {
        try {
            $limit = (int) $request->query('limit', 5);
            $events = $this->eventService->getTrendingEvents($limit);
            return response()->json(['events' => $events], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'error server',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getEventDetails(Request $request, $id)
    {
        $event = $this->eventService->getEventById($id);
        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }
        
        // Check if current user has liked this event
        $isLiked = false;
        if ($request->user()) {
            $like = DB::table('likes')
                ->where('user_id', $request->user()->id)
                ->where('event_id', $id)
                ->where('status', 1)
                ->first();
            $isLiked = $like ? true : false;
        }
        
        $eventData = $event->toArray();
        $eventData['is_liked'] = $isLiked;
        
        return response()->json(['event' => $eventData]);
    }

    public function createEvent(Request $request)
    {
         $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'address' => 'required|string|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
            'image' => 'nullable|image|max:2048',
            'comanager' => 'nullable|array',
            'comanager.*' => 'integer|exists:users,id',
            'max_participants' => 'required|integer|min:1',
            'category' => 'required|string|max:100',
        ]);

        $eventData = $request->only(['title', 'content', 'start_time', 'end_time', 'address', 'image', 'max_participants', 'category']);
        $eventData['author_id'] = $request->user()->id;
        if ($request->hasFile('image')) {
            $eventData['image'] = $request->file('image')->store('events');
        
        }
        $event = $this->managerService->createEvent($eventData, $request->input('comanager', []));

        return response()->json(['event' => $event], 201);
        
    }

    public function updateEvent(Request $request, $id)
    {
        $event = $this->eventService->getEventById($id);
        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'date' => 'sometimes|required|date',
            'image' => 'nullable|image|max:2048',
        ]);

        $eventData = $request->only(['title', 'description', 'date', 'image']);
        if ($request->hasFile('image')) {
            $eventData['image'] = $request->file('image')->store('events');
        }
        $event = $this->eventService->updateEvent($event, $eventData);

        return response()->json(['event' => $event]);
    }

    public function deleteEventById(Request $request, $id)
    {
        $event = $this->eventService->getEventById($id);
        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        $this->eventService->deleteEvent($event);

        return response()->json(['message' => 'Event deleted successfully']);
    }

    public function searchEvents(Request $request)
    {
        $query = $request->input('query', '');
        $events = $this->eventService->searchEvents($query);
        return response()->json(['events' => $events]);
    }

    public function getEventChannel($id)
    {
        try {
            $event = $this->eventService->getEventById($id);
            if (!$event) {
                return response()->json(['error' => 'Event not found'], 404);
            }

            // Use firstOrCreate to avoid creating duplicate channels
            // This will find existing channel or create new one atomically
            $channel = \App\Models\Channel::firstOrCreate(
                ['event_id' => $event->id], // Search by event_id
                ['title' => 'Channel - ' . $event->title] // Create with this title if not found
            );

            return response()->json(['channel' => $channel]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

}