<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Utils\WebPushApi;
use Illuminate\Support\Facades\Log;
use App\Models\PushSubscription;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notifiable;
use Illuminate\Bus\Queueable;

class Noti extends Model implements ShouldQueue  {

    use Notifiable; 

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

    /**
     * Tạo thông báo và gửi push notification qua queue cho nhiều users
     * 
     * @param array $data Dữ liệu notification
     * @param array|null $userIds Danh sách user IDs để gửi (null = gửi cho tất cả users đăng ký web push)
     */
    public static function dispatchCreateAndPush(array $data, array $userIds = null)
    {
        try {
            dispatch(function() use ($data, $userIds) {
                // Lấy danh sách user IDs đã đăng ký web push
                $query = PushSubscription::query();
                
                if ($userIds !== null && !empty($userIds)) {
                    // Gửi cho các user cụ thể
                    $query->whereIn('user_id', $userIds);
                }
                
                $subscriptions = $query->get();
                
                if ($subscriptions->isEmpty()) {
                    Log::info("No push subscriptions found for sending notification");
                    return;
                }

                // Lấy danh sách unique user IDs
                $receiverIds = $subscriptions->pluck('user_id')->unique();
                
                Log::info("Dispatching notification to " . $receiverIds->count() . " users with " . $subscriptions->count() . " devices");

                // Chuẩn bị URL dựa vào loại thông báo
                $url = $data['data']['url'] ?? '/notifications';
                $title = $data['title'];
                $message = $data['message'];

                // Gửi push notification cho từng subscription
                foreach ($subscriptions as $sub) {
                    try {
                        WebPushApi::sendNotification($sub, $title, $message, $url);
                    } catch (\Exception $e) {
                        Log::error("Failed to send push to subscription {$sub->id}: " . $e->getMessage());
                    }
                }

                // Lưu notification vào database cho từng receiver
                foreach ($receiverIds as $receiverId) {
                    try {
                        self::create([
                            'title' => $title,
                            'message' => $message,
                            'sender_id' => $data['sender_id'] ?? null,
                            'receiver_id' => $receiverId,
                            'type' => $data['type'] ?? 'system',
                            'data' => $data['data'] ?? [],
                            'is_read' => false,
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Failed to save notification for user {$receiverId}: " . $e->getMessage());
                    }
                }

                Log::info("Notification dispatched successfully to {$receiverIds->count()} users");
            })->onQueue('notifications');
            
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to dispatch notification: " . $e->getMessage());
            return false;
        }
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