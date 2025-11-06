<?php
namespace App\Utils;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Support\Facades\Log;


class WebPushApi
{
    public static function sendNotification($subscriptions, string $title, string $body, string $url, ?string $icon = null){
        $auth = [
            'VAPID' => [
                'subject' => 'mailto:admin@domain.com',
                'publicKey' => env('VAPID_PUBLIC_KEY'),
                'privateKey' => env('VAPID_PRIVATE_KEY'),
            ],
        ];

        $webPush = new WebPush($auth);

        // Payload notification
        $payload = [
            'title' => $title,
            'body' => $body,
            'url' => $url,
            'icon' => $icon ?? '/icons/notification-icon.png', // Default icon
            'badge' => '/icons/badge-icon.png',
            'tag' => 'event-notification', // Tag để group notifications
        ];

        $successCount = 0;
        $failCount = 0;

        foreach ($subscriptions as $sub) {
            try {
                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->p256dh,
                    'authToken' => $sub->auth,
                ]);

                $webPush->queueNotification(
                    $subscription,
                    json_encode($payload)
                );
                
                $successCount++;
            } catch (\Exception $e) {
                Log::error("Failed to queue notification for subscription {$sub->id}: " . $e->getMessage());
                $failCount++;
            }
        }

        // Gửi tất cả notifications
        try {
            $results = $webPush->flush();
            
            // Log results
            foreach ($results as $result) {
                if (!$result->isSuccess()) {
                    Log::warning("Push notification failed: " . $result->getReason());
                }
            }
            
            Log::info("Push notifications sent: {$successCount} success, {$failCount} failed");
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to flush web push notifications: " . $e->getMessage());
            return false;
        }
    }
}
