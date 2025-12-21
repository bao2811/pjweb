<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Like - Quản lý lượt thích
 * 
 * Model này đại diện cho bảng likes trong database, lưu trữ
 * lượt thích của người dùng trên bài viết hoặc sự kiện.
 * 
 * @package App\Models
 */
class Like extends Model
{
    /** @use HasFactory<\Database\Factories\LikeFactory> */
    use HasFactory;

    /**
     * Bảng có sử dụng timestamps
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * Tên cột "updated at" - set null vì không có cột này
     *
     * @var string|null
     */
    const UPDATED_AT = null;

    /**
     * Các trường được phép gán hàng loạt
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'post_id',
        'event_id', // thêm vào
        'status',
    ];

    /**
     * Lấy thông tin người dùng đã thích
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Lấy bài viết được thích (nullable - có thể null nếu like event)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Lấy sự kiện được thích (nullable - có thể null nếu like post)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
