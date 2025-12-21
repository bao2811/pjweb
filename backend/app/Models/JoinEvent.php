<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model JoinEvent - Quản lý đăng ký tham gia sự kiện
 * 
 * Model này đại diện cho bảng join_events trong database, lưu trữ
 * thông tin đăng ký tham gia sự kiện của người dùng, bao gồm
 * trạng thái duyệt và đánh giá hoàn thành.
 * 
 * @package App\Models
 */
class JoinEvent extends Model
{
    /** @use HasFactory<\Database\Factories\JoinEventFactory> */
    use HasFactory;

    /**
     * Không sử dụng timestamps tự động
     */
    public $timestamps = false;

    /**
     * Các trường được phép gán hàng loạt
     * Lưu ý: Database không có cột updated_at
     * 
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'event_id',
        'status',
        'joined_at',
        'created_at',
        'completion_status',
        'completed_at',
        'completed_by',
        'completion_note',
    ];

    /**
     * Lấy sự kiện mà người dùng đăng ký
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    /**
     * Lấy thông tin người dùng đăng ký
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

}