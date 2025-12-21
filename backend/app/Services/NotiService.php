<?php

namespace App\Services;
use App\Repositories\NotiRepo;
use App\Utils\WebPushApi;
use App\Models\Noti;
use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

use Exception;

/**
 * Service NotiService - Xử lý logic nghiệp vụ thông báo
 * 
 * Service này xử lý các thao tác nghiệp vụ cho notification,
 * bao gồm: CRUD notification, WebPush, broadcast realtime.
 * 
 * @package App\Services
 */
class NotiService
{
    /** @var NotiRepo Repository xử lý dữ liệu notification */
    protected $notiRepo;

    /**
     * Khởi tạo service với repository cần thiết
     * 
     * @param NotiRepo $notiRepo Repository notification
     */
    public function __construct(NotiRepo $notiRepo)
    {
        $this->notiRepo = $notiRepo;
    }

    /**
     * Lấy danh sách notifications của user
     * 
     * @param int $userId ID của user
     * @return array|\Illuminate\Support\Collection Danh sách notifications
     */
    public function getNotificationsByUserId($userId)
    {
        try {
            return $this->notiRepo->findByUserId($userId);
        } catch (Exception $e) {
            // Handle exception
            return [];
        }
    }

    /**
     * Lấy notification theo ID
     * 
     * @param int $id ID của notification
     * @return Noti|null Notification hoặc null
     */
    public function getNotificationById($id)
    {
        try {
            return $this->notiRepo->findById($id);
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Tạo notification mới
     * 
     * @param array $data Dữ liệu notification
     * @return Noti|null Notification vừa tạo
     */
    public function createNotification($data)
    {
        try {
            return $this->notiRepo->create($data);
        } catch (Exception $e) {
            // Handle exception
            return null;
        }
    }

    /**
     * Đánh dấu notification đã đọc
     * 
     * @param int $id ID của notification
     * @return Noti|null Notification sau khi cập nhật
     */
    public function markAsRead($id)
    {
        try {
            $noti = $this->notiRepo->findById($id);
            if ($noti) {
                $noti->is_read = true;
                $noti->save();
                return $noti;
            }
            return null;
        } catch (Exception $e) {
            // Handle exception
            return null;
        }
    }

    /**
     * Đánh dấu tất cả notifications của user đã đọc
     * 
     * @param int $userId ID của user
     * @return bool Kết quả cập nhật
     */
    public function markAllAsRead($userId)
    {
        try {
            return $this->notiRepo->markAllAsReadByUserId($userId);
        } catch (Exception $e) {
            // Handle exception
            return false;
        }
    }

    /**
     * Xóa notification
     * 
     * @param int $id ID của notification
     * @return bool Kết quả xóa
     */
    public function deleteNotification($id)
    {
        try {
            return $this->notiRepo->deleteById($id);
        } catch (Exception $e) {
            // Handle exception
            return false;
        }
    }

    /**
     * Đếm số notifications chưa đọc của user
     * 
     * @param int $userId ID của user
     * @return int Số lượng chưa đọc
     */
    public function getUnreadCount($userId)
    {
        try {
            return $this->notiRepo->getUnreadCountByUserId($userId);
        } catch (Exception $e) {
            return 0;
        }
    }

    /**
     * Gửi WebPush notification đến danh sách subscriptions VÀ lưu vào database
     * 
     * Sử dụng WebPushApi để gửi push notification.
     * Broadcast qua WebSocket cho realtime update.
     * 
     * @param \Illuminate\Support\Collection $subscriptions Collection of PushSubscription models
     * @param array $payload Dữ liệu notification ['title', 'body', 'url', 'icon', 'badge', 'timestamp', 'type', 'sender_id']
     * @return bool Kết quả gửi
     */
    public function sendPushNotification($subscriptions, $payload)
    {
        $result = [
            'success' => false,
            'push_sent' => 0,
            'db_saved' => 0,
            'failed' => 0
        ];

        try {
            // Lấy danh sách unique user_ids từ subscriptions
            $userIds = $subscriptions->pluck('user_id')->unique()->toArray();
            
            Log::info("[NotiService] Sending push to " . count($userIds) . " users (" . $subscriptions->count() . " devices)");

            // 1. Gửi Web Push notification qua WebPushApi
            $pushResult = WebPushApi::sendNotification(
                $subscriptions,
                $payload['title'],
                $payload['body'],
                $payload['url'] ?? '/notifications',
                $payload['icon'] ?? '/icons/notification-icon.png',
                $payload['badge'] ?? '/icons/badge-icon.png',
                $payload['timestamp'] ?? now()->toIso8601String()
            );

            if ($pushResult) {
                $result['push_sent'] = count($userIds);
                Log::info("[NotiService] Web push sent successfully to {$result['push_sent']} users");
            } else {
                Log::warning("[NotiService] Web push sending failed");
            }

            // 2. Lưu notification vào database cho từng user VÀ broadcast
            foreach ($userIds as $userId) {
                try {
                    $notification = Noti::create([
                        'title' => $payload['title'],
                        'message' => $payload['body'],
                        'sender_id' => $payload['sender_id'] ?? null,
                        'receiver_id' => $userId,
                        'type' => $payload['type'] ?? 'webpush',
                        'data' => [
                            'url' => $payload['url'] ?? '/notifications',
                            'icon' => $payload['icon'] ?? '/icons/notification-icon.png',
                        ],
                    ]);
                    
                    // Broadcast notification qua WebSocket
                    broadcast(new \App\Events\NotificationSent($notification, $userId))->toOthers();
                    
                    $result['db_saved']++;
                    Log::info("[NotiService] Notification saved to DB and broadcasted for user {$userId}");
                } catch (Exception $e) {
                    $result['failed']++;
                    Log::error("[NotiService] Failed to save notification for user {$userId}: " . $e->getMessage());
                }
            }

            $result['success'] = $pushResult || $result['db_saved'] > 0;

            Log::info("[NotiService] Push notification complete: " . json_encode($result));

            return $result['success'];
        } catch (Exception $e) {
            Log::error("[NotiService] Failed to send push notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Gửi notification đến danh sách users (có hoặc không có WebPush)
     * 
     * Nếu user có WebPush subscription → Gửi push notification
     * Nếu user không có WebPush → Vẫn tạo in-app notification trong DB
     * 
     * @param array $userIds Danh sách user IDs cần gửi notification
     * @param array $notificationData Dữ liệu notification ['title', 'message', 'type', 'sender_id', 'data']
     * @return array Thống kê ['total' => int, 'with_push' => int, 'without_push' => int, 'failed' => int]
     */
    public function sendNotificationToUsers(array $userIds, array $notificationData): array
    {
        $stats = [
            'total' => count($userIds),
            'with_push' => 0,
            'without_push' => 0,
            'failed' => 0
        ];

        foreach ($userIds as $userId) {
            try {
                // Tạo notification record trong DB (in-app notification)
                $notification = Noti::create([
                    'title' => $notificationData['title'],
                    'message' => $notificationData['message'],
                    'sender_id' => $notificationData['sender_id'] ?? null,
                    'receiver_id' => $userId,
                    'type' => $notificationData['type'] ?? 'general',
                    'data' => $notificationData['data'] ?? [],
                ]);

                // Kiểm tra user có WebPush subscriptions không
                $subscriptions = PushSubscription::where('user_id', $userId)->get();

                if ($subscriptions->isNotEmpty()) {
                    // User có WebPush → Gửi push notification
                    $payload = [
                        'title' => $notificationData['title'],
                        'body' => $notificationData['message'],
                        'url' => $notificationData['data']['url'] ?? '/notifications',
                        'icon' => '/icons/notification-icon.png',
                        'badge' => '/icons/badge-icon.png',
                        'timestamp' => now()->toIso8601String(),
                    ];

                    $this->sendPushNotification($subscriptions, $payload);

                    $stats['with_push']++;
                    Log::info("Notification sent to user {$userId} with push");
                } else {
                    // User không có WebPush → Chỉ lưu in-app notification
                    $stats['without_push']++;
                    Log::info("Notification sent to user {$userId} without push");
                }
            } catch (Exception $e) {
                $stats['failed']++;
                Log::error("Failed to send notification to user {$userId}: " . $e->getMessage());
            }
        }

        return $stats;
    }

    /**
     * Gửi notification đến tất cả users tham gia sự kiện
     * 
     * Lấy danh sách users có status 'accepted' trong join_events.
     * 
     * @param int $eventId ID của sự kiện
     * @param array $notificationData Dữ liệu notification ['title', 'message', 'type', 'sender_id', 'data']
     * @return array Thống kê
     */
    public function sendNotificationToEventParticipants(int $eventId, array $notificationData): array
    {
        // Lấy tất cả users đã join event (status = 'accepted')
        $userIds = DB::table('join_events')
            ->where('event_id', $eventId)
            ->where('status', 'accepted')
            ->pluck('user_id')
            ->toArray();

        if (empty($userIds)) {
            Log::info("No participants found for event {$eventId}");
            return [
                'total' => 0,
                'with_push' => 0,
                'without_push' => 0,
                'failed' => 0
            ];
        }

        Log::info("Sending notification to " . count($userIds) . " participants of event {$eventId}");
        
        return $this->sendNotificationToUsers($userIds, $notificationData);
    }

    /**
     * Gửi notification đến TẤT CẢ users trong hệ thống
     * 
     * @param array $notificationData Dữ liệu notification ['title', 'message', 'type', 'sender_id', 'data']
     * @return array Thống kê
     */
    public function sendNotificationToAllUsers(array $notificationData): array
    {
        // Lấy tất cả user IDs
        $userIds = User::pluck('id')->toArray();

        if (empty($userIds)) {
            Log::warning("No users found in system");
            return [
                'total' => 0,
                'with_push' => 0,
                'without_push' => 0,
                'failed' => 0
            ];
        }

        Log::info("Sending notification to all " . count($userIds) . " users in system");
        
        return $this->sendNotificationToUsers($userIds, $notificationData);
    }
}