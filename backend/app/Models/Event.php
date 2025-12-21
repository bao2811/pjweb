<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Event - Quản lý sự kiện tình nguyện
 * 
 * Model này đại diện cho bảng events trong database, chứa thông tin
 * các sự kiện tình nguyện do manager tạo ra.
 * 
 * @package App\Models
 */
class Event extends Model
{
    /** @use HasFactory<\Database\Factories\EventFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'content',
        'image',
        'address',
        'start_time',
        'end_time',
        'author_id',
        'status',
        'max_participants',
        'current_participants',
        'category',
        'likes',
    ];

    /**
     * Tính toán trạng thái sự kiện dựa trên thời gian hiện tại
     * 
     * Trả về trạng thái tự động dựa trên thời gian:
     * - 'upcoming': Sự kiện chưa bắt đầu
     * - 'ongoing': Sự kiện đang diễn ra
     * - 'completed': Sự kiện đã kết thúc
     * - 'pending'/'rejected': Giữ nguyên nếu admin đã set
     * 
     * @return string Trạng thái của sự kiện
     */
    public function getComputedStatusAttribute()
    {
        // If admin has set status to pending or rejected, keep those
        if (in_array($this->status, ['pending', 'rejected'])) {
            return $this->status;
        }

        $now = now();
        $startTime = \Carbon\Carbon::parse($this->start_time);
        $endTime = \Carbon\Carbon::parse($this->end_time);

        // Event hasn't started yet
        if ($now->lt($startTime)) {
            return 'upcoming';
        }

        // Event has ended
        if ($now->gt($endTime)) {
            return 'completed';
        }

        // Event is currently happening
        return 'ongoing';
    }

    /**
     * Tự động thêm computed_status vào JSON output
     */
    protected $appends = ['computed_status'];

    /**
     * Lấy danh sách đăng ký tham gia sự kiện
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function joinEvents()
    {
        return $this->hasMany(JoinEvent::class);
    }

    /**
     * Lấy danh sách thành viên đã tham gia sự kiện
     * 
     * Quan hệ nhiều-nhiều thông qua bảng join_events
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'join_events', 'event_id', 'user_id');
    }

    /**
     * Lấy tất cả lượt thích của sự kiện này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function likes()
    {
        return $this->hasMany(Like::class, 'event_id');
    }

    /**
     * Lấy danh sách người dùng đã thích sự kiện này
     * 
     * Quan hệ nhiều-nhiều thông qua bảng likes
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function likedByUsers()
    {
        return $this->belongsToMany(User::class, 'likes', 'event_id', 'user_id')
                    ->withTimestamps();
    }

    /**
     * Lấy thông tin người tạo sự kiện
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Lấy danh sách đồng quản lý của sự kiện
     * 
     * Quan hệ nhiều-nhiều thông qua bảng event_managements
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function comanagers()
    {
        return $this->belongsToMany(User::class, 'event_managements', 'event_id', 'user_id');
    }

    /**
     * Lấy kênh chat của sự kiện (quan hệ một-một)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function channel()
    {
        return $this->hasOne(Channel::class, 'event_id');
    }
}