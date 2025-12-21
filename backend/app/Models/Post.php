<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Post - Quản lý bài viết
 * 
 * Model này đại diện cho bảng posts trong database, chứa thông tin
 * bài viết của người dùng bao gồm bài đăng chung và bài trong channel sự kiện.
 * 
 * @package App\Models
 */
class Post extends Model
{
    /** @use HasFactory<\Database\Factories\PostFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'content',
        'author_id',
        'event_id',    // Thêm event_id vào fillable
        'channel_id',  // Post thuộc channel
        'image', 
        'published_at',
        'likes',      
        'comments',
        'status',
    ];

    /**
     * Lấy thông tin tác giả của bài viết
     * 
     * Quan hệ nhiều-một: Nhiều post thuộc về một user
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Lấy thông tin channel chứa bài viết
     * 
     * Bài viết có thể thuộc về một channel sự kiện
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function channel()
    {
        return $this->belongsTo(Channel::class, 'channel_id');
    }

    /**
     * Lấy danh sách bình luận của bài viết
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function comments()
    {
        return $this->hasMany(\App\Models\Comment::class, 'post_id');
    }

    /**
     * Lấy danh sách lượt thích của bài viết
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function likes()
    {
        return $this->hasMany(\App\Models\Like::class, 'post_id');
    }
}