<?php

use App\Helpers\WebPushApi;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

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


    public function getAllEvent(Request $request)
    {
        $events = $this->eventService->getAllEvent();
        return response()->json(['events' => $events]);
    }

    public function getDetailEvent(Request $request, $id)
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
        $event = $this->eventService->createEvent($eventData, $request->input('comanager', []));

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

    public function deleteEvent(Request $request, $id)
    {
        $event = $this->eventService->getEventById($id);
        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        $this->eventService->deleteEvent($event);

        return response()->json(['message' => 'Event deleted successfully']);
    }

}