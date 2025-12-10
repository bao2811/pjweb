<?php
namespace App\Utils;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;


class WebPushApi
{
    public static function sendNotification($subscriptions, $title, $body, $url){
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
                    'title' => $title,
                    'body' => $body,
                    'url' => $url
                ])
            );
        }

        $webPush->flush();
    }

    public static function sendNotificationToAll($title, $body, $url)
    {
        $auth = [
            'VAPID' => [
                'subject' => 'mailto:admin@domain.com',
                'publicKey' => env('VAPID_PUBLIC_KEY'),
                'privateKey' => env('VAPID_PRIVATE_KEY'),
            ],
        ];

        $webPush = new WebPush($auth);

        // Lấy tất cả subscriptions từ database
        $subscriptions = \App\Models\PushSubscription::all();

        foreach ($subscriptions as $sub) {
            try {
                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->p256dh,
                    'authToken' => $sub->auth,
                ]);

                $webPush->queueNotification(
                    $subscription,
                    json_encode([
                        'title' => $title,
                        'body' => $body,
                        'url' => $url
                    ])
                );
            } catch (\Exception $e) {
                // Log error but continue
                \Log::error('WebPush subscription error: ' . $e->getMessage());
            }
        }

        // Send and handle responses
        foreach ($webPush->flush() as $report) {
            if (!$report->isSuccess()) {
                // Remove invalid subscriptions
                $endpoint = $report->getRequest()->getUri()->__toString();
                \App\Models\PushSubscription::where('endpoint', $endpoint)->delete();
            }
        }
        
        return true;
    }

    public static function sendNotificationToUser($userId, $title, $body, $url)
    {
        \Log::info("🔔 WebPushApi: sendNotificationToUser called", [
            'user_id' => $userId,
            'title' => $title,
        ]);

        $auth = [
            'VAPID' => [
                'subject' => 'mailto:admin@domain.com',
                'publicKey' => env('VAPID_PUBLIC_KEY'),
                'privateKey' => env('VAPID_PRIVATE_KEY'),
            ],
        ];

        $webPush = new WebPush($auth);

        // Lấy subscriptions của user cụ thể
        $subscriptions = \App\Models\PushSubscription::where('user_id', $userId)->get();
        
        \Log::info("📊 Found subscriptions", ['count' => $subscriptions->count()]);

        foreach ($subscriptions as $sub) {
            try {
                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->p256dh,
                    'authToken' => $sub->auth,
                ]);

                $webPush->queueNotification(
                    $subscription,
                    json_encode([
                        'title' => $title,
                        'body' => $body,
                        'url' => $url
                    ])
                );
            } catch (\Exception $e) {
                \Log::error('WebPush subscription error: ' . $e->getMessage());
            }
        }

        foreach ($webPush->flush() as $report) {
            if (!$report->isSuccess()) {
                $endpoint = $report->getRequest()->getUri()->__toString();
                \Log::error("❌ WebPush failed for endpoint", ['endpoint' => $endpoint, 'reason' => $report->getReason()]);
                \App\Models\PushSubscription::where('endpoint', $endpoint)->delete();
            } else {
                \Log::info("✅ WebPush sent successfully");
            }
        }
        
        return true;
    }
}
