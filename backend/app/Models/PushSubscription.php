<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model PushSubscription - Quản lý đăng ký push notification
 * 
 * Model này đại diện cho bảng push_subscriptions trong database,
 * lưu trữ thông tin đăng ký nhận Web Push Notification của người dùng.
 * Một user có thể có nhiều subscription (nhiều thiết bị).
 * 
 * @package App\Models
 */
class PushSubscription extends Model
{
    /**
     * Tên bảng trong database
     */
    protected $table = 'push_subscriptions';

    /**
     * Các trường được phép gán hàng loạt
     */
    protected $fillable = [
        'user_id',
        'endpoint',
        'p256dh',
        'auth',
        'device_name',
    ];

    /**
     * Lấy thông tin user sở hữu subscription này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
