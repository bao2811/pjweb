<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Utils\WebPushApi;
use Illuminate\Support\Facades\Log;
use App\Models\PushSubscription;
use Illuminate\Contracts\Queue\ShouldQueue;

class Noti extends Model implements ShouldQueue  {

    use Queueable;

    protected $table = 'notis';

    protected $fillable = [
        'title',
        'message',
        'sender_id',
        'receiver_id', // Thêm receiver_id để biết gửi cho ai
        'is_read',
        'type', // Loại thông báo: event_accepted, event_rejected, etc.
        'data', // JSON data thêm (event_id, url, etc.)
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
    ];

    /**
     * Người gửi thông báo
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Người nhận thông báo
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Tạo thông báo và tự động gửi push notification
     */
    public static function createAndPush(array $data): self
    {
        // Tạo notification record
        $notification = self::create($data);
        
        // Gửi push notification cho receiver
        if (isset($data['receiver_id'])) {
            $notification->sendPush();
        }
        
        return $notification;
    }

    public static function dispatchCreateAndPush(array $data)
    {
        dispatch(function() use ($data) {
            $notification = self::create($data);
            $notification->sendPush();
        });
    }


    /**
     * Gửi push notification cho user nhận
     */
    public function sendPush(): bool
    {
        try {
            // Lấy tất cả subscriptions của receiver
            $subscriptions = PushSubscription::where('user_id', $this->receiver_id)->get();
            
            if ($subscriptions->isEmpty()) {
                Log::info("No push subscriptions found for user {$this->receiver_id}");
                return false;
            }

            // Chuẩn bị URL dựa vào loại thông báo
            $url = $this->data['url'] ?? '/notifications';

            // Gửi push notification
            foreach ($subscriptions as $sub) {
                WebPushApi::sendNotification($sub, $this->title, $this->message, $url);
            }

            Log::info("Push notification sent to user {$this->receiver_id}");
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send push notification: " . $e->getMessage());
            return false;
        }
    }
    
}