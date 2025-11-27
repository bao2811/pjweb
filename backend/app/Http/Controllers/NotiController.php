<?php

namespace App\Http\Controllers;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Support\Facades\Redis;
use App\Models\PushSubscription;
use Illuminate\Http\Request;
use App\Services\NotiService;

class NotiController extends Controller
{
    protected $notiService;

    public function __construct(NotiService $notiService)
    {
        $this->notiService = $notiService;
    }

    public function getUserNotifications(Request $request)
    {
        try {
            $user = $request->user();
            $notifications = $this->notiService->getNotificationsByUserId($user->id);
            return response()->json($notifications);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function markAsRead(Request $request, $id)
    {
        try {
            $noti = $this->notiService->markAsRead($id);
            if ($noti) {
                return response()->json(['success' => true, 'notification' => $noti]);
            }
            return response()->json(['error' => 'Notification not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function markAllAsRead(Request $request)
    {
        try {
            $user = $request->user();
            $this->notiService->markAllAsRead($user->id);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteNotification(Request $request, $id)
    {
        try {
            $result = $this->notiService->deleteNotification($id);
            if ($result) {
                return response()->json(['success' => true]);
            }
            return response()->json(['error' => 'Notification not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function sendNotification(Request $request)
    {
        $subscriptions = PushSubscription::all();
        $this->sendPushNotification($subscriptions);
        return response()->json(['success' => true]);
    }


    function sendNotificationOnce($userId, $type, $message, $seconds = 60) {
        $key = "notify:user:$userId:$type";

        // Kiểm tra key
        if (Redis::exists($key)) {
            return false; // đã gửi thông báo trong thời gian này
        }

        // Gửi thông báo
        sendNotification($userId, $message);

        // Đánh dấu đã gửi, expire sau $seconds giây
        Redis::setex($key, $seconds, 1);
        
        $auth = [
            'VAPID' => [
                'subject' => 'mailto:admin@domain.com',
                'publicKey' => env('VAPID_PUBLIC_KEY'),
                'privateKey' => env('VAPID_PRIVATE_KEY'),
            ],
        ];

        $webPush = new WebPush($auth);

        foreach ($subscriptions as $sub) {
            $subscription = Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->p256dh,
                'authToken' => $sub->auth,
            ]);

            $webPush->queueNotification(
                $subscription,
                json_encode([
                    'title' => 'Thông báo sự kiện 🎉',
                    'body' => 'Manager vừa gửi thông báo cho bạn!',
                    'url' => '/events/123'
                ])
            );
        }

        $webPush->flush();

        return true;
    }
}


