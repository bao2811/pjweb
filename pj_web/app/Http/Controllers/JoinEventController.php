<?php

namespace App\Http\Controllers;

use App\Helpers\WebPushApi;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Http\Request;

class JoinEventController extends Controller
{
    protected $eventService;
    public function sendEventNotification(Request $request)
    {
        $subscriptions = $request->input('subscriptions');
        $title = $request->input('title');
        $body = $request->input('body');
        $url = $request->input('url');

        WebPushApi::sendNotification($subscriptions, $title, $body, $url);

        return response()->json(['success' => true]);
    }

    public function sendEventNotificationToAll(Request $request)
    {
        $title = $request->input('title');
        $body = $request->input('body');
        $url = $request->input('url');

        WebPushApi::sendNotificationToAll($title, $body, $url);

        return response()->json(['success' => true]);
    }

    public function joinEvent(Request $request, $eventId)
    {
        $user = $request->user();
        $data = $this->eventService->joinEvent($user->id, $eventId);
        if(!$data){
            return response()->json(['error' => 'Event not found'], 404);
        }
        return response()->json(['message' => 'Joined event successfully']);
    }

    public function leaveEvent(Request $request, $eventId)
    {
        $user = $request->user();
        $data = $this->eventService->leaveEvent($user->id, $eventId);
        if(!$data){
            return response()->json(['error' => 'Event not found'], 404);
        }
        return response()->json(['message' => 'Left event successfully']);
    }
}