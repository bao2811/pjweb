<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Message - Quản lý tin nhắn trong channel
 * 
 * Model này đại diện cho bảng messages trong database, lưu trữ
 * các tin nhắn chat trong kênh sự kiện.
 * 
 * @package App\Models
 */
class Message extends Model
{
    /** @use HasFactory<\Database\Factories\MessageFactory> */
    use HasFactory; 

    /**
     * Không sử dụng timestamps tự động của Laravel
     */
    public $timestamps = false;
    
    /**
     * Các trường được phép gán hàng loạt
     *
     * @var list<string>
     */
    protected $fillable = [
        'sender_id',
        'channel_id',
        'content',
        'sent_at',
    ];

    /**
     * Lấy thông tin người gửi tin nhắn
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Lấy kênh chat mà tin nhắn thuộc về
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function channel()
    {
        return $this->belongsTo(Channel::class, 'channel_id');
    }
}