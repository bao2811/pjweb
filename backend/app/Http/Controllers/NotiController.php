<?php

namespace App\Http\Controllers;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Support\Facades\Redis;
use App\Models\PushSubscription;
use App\Models\Noti;
use Illuminate\Http\Request;
use App\Services\NotiService;

class NotiController extends Controller
{


    protected $notiService;
    public function __construct(NotiService $notiService)
    {
        $this->notiService = $notiService;
    }

    /**
     * Gửi web push notification đến những user đã đăng ký web push
     * Endpoint: POST /api/notifications/send-test
     * Body: { 
     *   "title": "...", 
     *   "message": "...", 
     *   "url": "...",
     *   "type": "announcement|event_update|...",
     *   "user_ids": [1, 2, 3] // Optional: nếu không có sẽ gửi đến tất cả users đã đăng ký
     * }
     */
    public function sendNotification(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'url' => 'nullable|string',
                'type' => 'nullable|string',
                'user_ids' => 'nullable|array',
                'user_ids.*' => 'integer|exists:users,id',
            ]);

            // Lấy subscriptions của users được chỉ định hoặc tất cả nếu không có user_ids
            $query = PushSubscription::query();
            
            if ($request->has('user_ids') && !empty($request->user_ids)) {
                $query->whereIn('user_id', $request->user_ids);
            }
            
            $subscriptions = $query->get();
            
            if ($subscriptions->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No push subscriptions found for the specified users'
                ], 404);
            }

            $payload = [
                'title' => $request->title,
                'body' => $request->message,
                'url' => $request->url ?? '/notifications',
                'icon' => '/icons/notification-icon.png',
                'badge' => '/icons/badge-icon.png',
                'timestamp' => now()->toIso8601String(),
                'type' => $request->type ?? 'webpush',
                'sender_id' => $request->user()->id,
            ];

            $result = $this->notiService->sendPushNotification($subscriptions, $payload);

            // Đếm số users unique nhận được notification
            $uniqueUsers = $subscriptions->unique('user_id')->count();

            return response()->json([
                'success' => $result,
                'message' => $result 
                    ? "✅ Push notification sent to {$uniqueUsers} users ({$subscriptions->count()} devices) and saved to database" 
                    : 'Failed to send push notification',
                'stats' => [
                    'total_users' => $uniqueUsers,
                    'total_devices' => $subscriptions->count(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserNotifications(Request $request)
    {
        try {
            $user = $request->user();
            $notifications = $this->notiService->getNotificationsByUserId($user->id);
            return response()->json([
                'success' => true,
                'notifications' => $notifications
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function markAsRead(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            // Check authorization - user can only mark their own notifications
            $noti = $this->notiService->getNotificationById($id);
            if (!$noti) {
                return response()->json(['error' => 'Notification not found'], 404);
            }
            if ($noti->receiver_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            
            $noti = $this->notiService->markAsRead($id);
            
            if ($noti) {
                // Broadcast notification read event
                broadcast(new \App\Events\NotificationRead($id, $user->id))->toOthers();
                
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
            $user = $request->user();
            
            // Check authorization - user can only delete their own notifications
            $noti = $this->notiService->getNotificationById($id);
            if (!$noti) {
                return response()->json(['error' => 'Notification not found'], 404);
            }
            if ($noti->receiver_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            
            $result = $this->notiService->deleteNotification($id);
            if ($result) {
                return response()->json(['success' => true]);
            }
            return response()->json(['error' => 'Failed to delete notification'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Lấy số lượng notifications chưa đọc
     * Endpoint: GET /api/notifications/unread-count
     */
    public function getUnreadCount(Request $request)
    {
        try {
            $user = $request->user();
            $count = $this->notiService->getUnreadCount($user->id);
            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Gửi thông báo với rate limiting (tránh spam)
     * Sử dụng Redis để track đã gửi hay chưa trong khoảng thời gian
     * 
     * @param int $userId User nhận notification
     * @param string $type Loại notification (event_new, event_accepted, etc.)
     * @param array $data Dữ liệu notification
     * @param int $seconds Thời gian chờ trước khi có thể gửi lại (default 60s)
     * @return bool True nếu gửi thành công, False nếu đã gửi trong thời gian chờ
     */
    public function sendNotificationWithRateLimit(int $userId, string $type, array $data, int $seconds = 60): bool
    {
        $key = "notify:user:{$userId}:{$type}";

        // Kiểm tra đã gửi trong thời gian này chưa
        if (Redis::exists($key)) {
            return false; // Đã gửi, bỏ qua
        }

        // Tạo và gửi notification
        $notification = Noti::createAndPush([
            'title' => $data['title'],
            'message' => $data['message'],
            'sender_id' => $data['sender_id'] ?? null,
            'receiver_id' => $userId,
            'type' => $type,
            'data' => $data['data'] ?? []
        ]);

        // Đánh dấu đã gửi, expire sau $seconds giây
        Redis::setex($key, $seconds, 1);

        return true;
    }

    /**
     * Gửi notification đến tất cả users tham gia event
     * Endpoint: POST /api/notifications/send-to-event-participants
     * Body: { "event_id": 123, "title": "...", "message": "...", "type": "...", "data": {...} }
     */
    public function sendToEventParticipants(Request $request)
    {
        try {
            $request->validate([
                'event_id' => 'required|integer|exists:events,id',
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'type' => 'nullable|string',
                'data' => 'nullable|array',
            ]);

            $stats = $this->notiService->sendNotificationToEventParticipants(
                $request->event_id,
                [
                    'title' => $request->title,
                    'message' => $request->message,
                    'type' => $request->type ?? 'event_update',
                    'sender_id' => auth()->id(),
                    'data' => $request->data ?? []
                ]
            );

            return response()->json([
                'success' => true,
                'message' => "Notification sent to {$stats['total']} event participants",
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gửi notification đến tất cả users trong hệ thống
     * Endpoint: POST /api/notifications/send-to-all
     * Body: { "title": "...", "message": "...", "type": "...", "data": {...} }
     */
    public function sendToAllUsers(Request $request)
    {
        try {
            $sender_id = $request->user()->id;
            $request->validate([
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'type' => 'nullable|string',
                'data' => 'nullable|array',
            ]);

            $stats = $this->notiService->sendNotificationToAllUsers([
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type ?? 'announcement',
                'sender_id' => $sender_id,
                'data' => $request->data ?? []
            ]);

            return response()->json([
                'success' => true,
                'message' => "Notification sent to all {$stats['total']} users",
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gửi notification đến danh sách users cụ thể
     * Endpoint: POST /api/notifications/send-to-users
     * Body: { "user_ids": [1, 2, 3], "title": "...", "message": "...", "type": "...", "data": {...} }
     */
    public function sendToSpecificUsers(Request $request)
    {
        try {
            $request->validate([
                'user_ids' => 'required|array',
                'user_ids.*' => 'integer|exists:users,id',
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'type' => 'nullable|string',
                'data' => 'nullable|array',
            ]);

            $stats = $this->notiService->sendNotificationToUsers(
                $request->user_ids,
                [
                    'title' => $request->title,
                    'message' => $request->message,
                    'type' => $request->type ?? 'custom',
                    'sender_id' => auth()->id(),
                    'data' => $request->data ?? []
                ]
            );

            return response()->json([
                'success' => true,
                'message' => "Notification sent to {$stats['total']} users",
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}


