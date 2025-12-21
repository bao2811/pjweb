<?php
namespace App\Utils;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Support\Facades\Log;
use App\Models\PushSubscription;

/**
 * Utility class WebPushApi - Gửi Web Push Notification
 * 
 * Class này xử lý việc gửi push notification đến browsers/clients
 * sử dụng thư viện Minishlink/WebPush và VAPID keys.
 * 
 * @package App\Utils
 */
class WebPushApi
{
    /**
     * Gửi web push notification đến danh sách subscriptions
     * 
     * Hàm này queue tất cả notifications và flush một lần để tối ưu performance.
     * Tự động xóa các subscription hết hạn (404/410) khỏi database.
     * 
     * @param \Illuminate\Support\Collection $subscriptions Collection of PushSubscription models
     * @param string $title Tiêu đề notification
     * @param string $body Nội dung notification  
     * @param string $url URL khi click vào notification
     * @param string|null $icon Icon của notification (mặc định: /icons/notification-icon.png)
     * @param string|null $badge Badge icon hiển thị trên app icon
     * @param string|null $timestamp Timestamp của notification
     * @return bool True nếu có ít nhất 1 notification gửi thành công
     */
    public static function sendNotification(
        $subscriptions, 
        string $title, 
        string $body, 
        string $url, 
        ?string $icon = null,
        ?string $badge = null,
        ?string $timestamp = null
    ) {
        // Validate VAPID keys
        $publicKey = env('VAPID_PUBLIC_KEY');
        $privateKey = env('VAPID_PRIVATE_KEY');
        
        if (!$publicKey || !$privateKey) {
            Log::error("[WebPush] VAPID keys not configured in .env");
            return false;
        }

        $auth = [
            'VAPID' => [
                'subject' => 'mailto:admin@domain.com',
                'publicKey' => $publicKey,
                'privateKey' => $privateKey,
            ],
        ];

        $webPush = new WebPush($auth);

        // Payload notification
        $payload = [
            'title' => $title,
            'body' => $body,
            'url' => $url,
            'icon' => $icon ?? '/icons/notification-icon.png',
            'badge' => $badge ?? '/icons/badge-icon.png',
            'tag' => 'event-notification',
            'timestamp' => $timestamp ?? now()->toIso8601String(),
            'requireInteraction' => false,
            'renotify' => true,
        ];

        $queuedCount = 0;
        $queueFailCount = 0;

        // Queue notifications
        foreach ($subscriptions as $sub) {
            try {
                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'keys' => [
                        'p256dh' => $sub->p256dh,
                        'auth' => $sub->auth,
                    ]
                ]);

                $webPush->queueNotification(
                    $subscription,
                    json_encode($payload)
                );
                
                $queuedCount++;
            } catch (\Exception $e) {
                $queueFailCount++;
                Log::error("[WebPush] Failed to queue notification for subscription {$sub->id}: " . $e->getMessage());
            }
        }

        Log::info("[WebPush] Queued {$queuedCount} notifications, {$queueFailCount} failed to queue");

        // Flush và gửi tất cả notifications
        try {
            $results = $webPush->flush();
            
            $sentCount = 0;
            $failedCount = 0;
            
            // Phân tích kết quả
            foreach ($results as $endpoint => $result) {

                if ($result->isSuccess()) {
                    $sentCount++;
                    continue;
                }

                $failedCount++;
                Log::warning("[WebPush] Push notification failed: " . $result->getReason());

                // Lấy mã lỗi HTTP
                $statusCode = $result->getResponse() ? $result->getResponse()->getStatusCode() : null;

                // Nếu subscription hết hạn hoặc không tồn tại
                if (in_array($statusCode, [404, 410])) {
                    Log::info("[WebPush] Subscription expired (status {$statusCode}), removing from database...");

                    // XÓA SUBSCRIPTION KHỎI DATABASE
                    PushSubscription::where('endpoint', $endpoint)->delete();
                }
            }

            
            Log::info("[WebPush] Push results: {$sentCount} sent successfully, {$failedCount} failed");
            
            // Return true nếu có ít nhất 1 notification gửi thành công
            return $sentCount > 0;
            
        } catch (\Exception $e) {
            Log::error("[WebPush] Failed to flush web push notifications: " . $e->getMessage());
            return false;
        }
    }

}
