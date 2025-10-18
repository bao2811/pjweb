<?php

namespace App\Http\Controllers;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

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
