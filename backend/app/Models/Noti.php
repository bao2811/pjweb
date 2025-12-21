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

/**
 * Model Noti - Quản lý thông báo trong hệ thống
 * 
 * Model này đại diện cho bảng notis trong database, lưu trữ
 * tất cả các thông báo gửi đến người dùng. Hỗ trợ cả in-app
 * notification và Web Push Notification.
 * 
 * @package App\Models
 */
class Noti extends Model implements ShouldQueue  {

    use Notifiable; 

    /**
     * Tên bảng trong database
     */
    protected $table = 'notis';

    /**
     * Các trường được phép gán hàng loạt
     */
    protected $fillable = [
        'title',
        'message',
        'sender_id',
        'receiver_id', // ID người nhận thông báo
        'is_read',
        'type', // Loại thông báo: event_accepted, event_rejected, etc.
        'data', // JSON data thêm (event_id, url, etc.)
    ];

    /**
     * Định nghĩa kiểu dữ liệu cho các trường
     */
    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
    ];

    /**
     * Lấy thông tin người gửi thông báo
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Lấy thông tin người nhận thông báo
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function receiver(): BelongsTo                                                                                                   
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Tạo thông báo và tự động gửi push notification + broadcast
     * 
     * Phương thức này sẽ:
     * 1. Tạo record notification trong database
     * 2. Gửi push notification cho receiver
     * 3. Broadcast qua WebSocket
     * 
     * @param array $data Dữ liệu thông báo
     * @return self Instance của notification đã tạo
     */
    public static function createAndPush(array $data): self
    {
        
        // Tạo notification record
        $notification = self::create($data);
        
        // Gửi push notification cho receiver
        if (isset($data['receiver_id'])) {
            $notification->sendPush();
            
            // Broadcast notification qua WebSocket
            broadcast(new \App\Events\NotificationSent($notification, $data['receiver_id']))->toOthers();
        }
        
        return $notification;
    }                                                                                         

    /**
     * Tạo thông báo và gửi push notification qua queue cho nhiều users
     * 
     * Phương thức này dispatch job để gửi notification bất đồng bộ,
     * phù hợp với việc gửi thông báo cho nhiều người dùng.
     * 
     * @param array $data Dữ liệu notification
     * @param array|null $userIds Danh sách user IDs để gửi (null = gửi cho tất cả users đăng ký web push)
     * @return bool True nếu dispatch thành công
     */
    public static function dispatchCreateAndPush(array $data, ?array $userIds = null)
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

                // Gửi push notification cho từng subscription - wrap thành collection
                foreach ($subscriptions as $sub) {
                    try {
                        WebPushApi::sendNotification(collect([$sub]), $title, $message, $url);
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
     * 
     * Phương thức này gửi push notification đến tất cả các thiết bị
     * mà user đã đăng ký nhận thông báo.
     * 
     * @return bool True nếu gửi thành công ít nhất 1 notification
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

            // Gửi push notification - truyền collection thay vì từng subscription
            WebPushApi::sendNotification($subscriptions, $this->title, $this->message, $url);

            Log::info("Push notification sent to user {$this->receiver_id}");
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send push notification: " . $e->getMessage());
            return false;
        }
    }
    
}