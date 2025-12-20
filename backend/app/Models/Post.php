<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
        'like',        // Sửa từ 'likes' thành 'like' để khớp với database
        'comment',     // Sửa từ 'comments' thành 'comment' để khớp với database
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function channel()
    {
        return $this->belongsTo(Channel::class, 'channel_id');
    }

    public function comments()
    {
        return $this->hasMany(\App\Models\Comment::class, 'post_id');
    }

    public function likes()
    {
        return $this->hasMany(\App\Models\Like::class, 'post_id');
    }
}