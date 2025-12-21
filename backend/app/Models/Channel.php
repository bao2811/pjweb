<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Channel - Quản lý kênh chat của sự kiện
 * 
 * Model này đại diện cho bảng channels trong database, chứa thông tin
 * kênh chat riêng cho mỗi sự kiện. Mỗi sự kiện có một channel để
 * các thành viên trao đổi thông tin.
 * 
 * @package App\Models
 */
class Channel extends Model
{
    /** @use HasFactory<\Database\Factories\ChannelFactory> */
    use HasFactory;

    /**
     * Các trường được phép gán hàng loạt
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'event_id',
    ];

    /**
     * Lấy sự kiện mà channel này thuộc về
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    /**
     * Lấy danh sách bài viết trong channel
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function posts()
    {
        return $this->hasMany(Post::class, 'channel_id');
    }

    /**
     * Lấy danh sách tin nhắn trong channel
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'channel_id');
    }
}