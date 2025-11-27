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

        // Lấy tất cả subscriptions từ database (cần implement lấy từ users table)
        // Tạm thời return empty vì chưa có table lưu subscriptions
        // TODO: Implement get all user subscriptions from database
        
        $webPush->flush();
        
        return true;
    }
}
