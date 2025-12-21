<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Comment - Quản lý bình luận
 * 
 * Model này đại diện cho bảng comments trong database, chứa thông tin
 * bình luận của người dùng trên bài viết. Hỗ trợ bình luận lồng nhau (reply).
 * 
 * @package App\Models
 */
class Comment extends Model
{
    /** @use HasFactory<\Database\Factories\CommentFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'content',
        'author_id',
        'post_id',
        'event_id',
        'parent_id', // thêm vào
        'created_at',
    ];

    /**
     * Bảng có sử dụng timestamps
     * Lưu ý: Bảng chỉ có cột created_at, không có updated_at
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * Tên cột "updated at"
     * Set null vì bảng không có cột này
     *
     * @var string|null
     */
    const UPDATED_AT = null;

    /**
     * Lấy thông tin tác giả của bình luận
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Alias cho author (để tương thích)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Lấy bài viết mà bình luận thuộc về
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    /**
     * Lấy bình luận cha (nếu đây là reply)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /**
     * Lấy danh sách các reply của bình luận này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

}