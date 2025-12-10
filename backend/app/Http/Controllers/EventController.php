<?php

namespace App\Http\Controllers;

use App\Utils\WebPushApi;
use App\Services\EventService;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Http\Request;


class EventController extends Controller
{

    protected $eventService;
    public function __construct(EventService $eventService){
        $this->eventService = $eventService;
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

    public function sendNotificationToAll(Request $request)
    {
        $title = $request->input('title');
        $body = $request->input('body');
        $url = $request->input('url');

        WebPushApi::sendNotificationToAll($title, $body, $url);

        return response()->json(['success' => true]);
    }


    public function getAllEvents(Request $request)
    {
        $userId = $request->user()->id ?? null;
        $events = $this->eventService->getAllEvents($userId);
        return response()->json(['events' => $events]);
    }

    public function getEventDetails(Request $request, $id)
    {
        $event = $this->eventService->getEventById($id);
        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }
        return response()->json(['event' => $event]);
    }

    public function createEvent(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'image' => 'nullable|string|max:255',
            'address' => 'required|string|max:255',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
        ]);

        // Lấy user_id từ JWT
        $userId = auth()->id();
        
        // Kiểm tra user có role manager không
        if (auth()->user()->role !== 'manager') {
            return response()->json(['error' => 'Only managers can create events'], 403);
        }

        $eventData = $request->only(['title', 'content', 'image', 'address', 'start_time', 'end_time']);
        $event = $this->eventService->createEvent($eventData, $userId);

        return response()->json([
            'message' => 'Event created successfully',
            'event' => $event
        ], 201);
    }

    public function updateEventById(Request $request, $id)
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

            $channel = $event->channel;
            if (!$channel) {
                // Create channel if it doesn't exist
                $channel = \App\Models\Channel::create([
                    'title' => 'Channel - ' . $event->title,
                    'event_id' => $event->id,
                ]);
            }

            return response()->json(['channel' => $channel]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

}