<?php

namespace App\Http\Controllers;

use App\Helpers\WebPushApi;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Http\Request;
use App\Services\JoinEventService;

class JoinEventController extends Controller
{
    protected $joinEventService;
    public function __construct(JoinEventService $joinEventService)
    {
        $this->joinEventService = $joinEventService;
    }

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
        $data = $this->joinEventService->joinEvent($user->id, $eventId);
        if(!$data){
            return response()->json(['error' => 'Event not found'], 404);
        }
        return response()->json(['message' => 'Joined event successfully']);
    }

    public function leaveEvent(Request $request, $eventId)
    {
        $user = $request->user();
        $data = $this->joinEventService->leaveEvent($user->id, $eventId);
        if(!$data){
            return response()->json(['error' => 'Event not found'], 404);
        }
        return response()->json(['message' => 'Left event successfully']);
    }

    public function getMyRegistrations(Request $request)
    {
        $user = $request->user();
        $registrations = $this->joinEventService->getMyRegistrations($user->id);
        return response()->json($registrations);
    }
}