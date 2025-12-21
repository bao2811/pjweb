<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\CustomVerifyEmail;

/**
 * Model User - Quản lý thông tin người dùng
 * 
 * Model này đại diện cho bảng users trong database, chứa thông tin
 * tài khoản người dùng bao gồm: admin, manager, và user thường.
 * 
 * @package App\Models
 */
class User extends Authenticatable
// implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'phone',
        'address',
        'role',
        'image',
        'status',
        'address_card',  
        'created_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Lấy danh sách bài viết của người dùng
     * 
     * Quan hệ một-nhiều: Một user có nhiều bài post
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function posts()
    {
        return $this->hasMany(Post::class, 'author_id'); // nếu cột khóa ngoại là author_id
    }

    /**
     * Lấy danh sách thông báo đã gửi bởi người dùng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function sentNotifications()
    {
        return $this->hasMany(Noti::class, 'sender_id');
    }

    /**
     * Lấy danh sách thông báo người dùng này nhận được
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function receivedNotifications()
    {
        return $this->hasMany(Noti::class, 'receiver_id');
    }

    /**
     * Lấy danh sách đăng ký push notification của người dùng
     * 
     * Một user có thể đăng ký nhận push trên nhiều thiết bị
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function pushSubscriptions()
    {
        return $this->hasMany(PushSubscription::class);
    }

    /**
     * Lấy danh sách kênh chat mà người dùng tham gia
     * 
     * Quan hệ nhiều-nhiều thông qua bảng trung gian channel_user
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function channels()
    {
        return $this->belongsToMany(Channel::class, 'channel_user', 'user_id', 'channel_id');
    }



    /**
     * Định nghĩa các kiểu dữ liệu cho các trường
     * 
     * @return array<string, string> Mảng mapping tên trường với kiểu dữ liệu
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Gửi email xác thực tài khoản
     * 
     * Sử dụng CustomVerifyEmail notification thay vì mặc định
     * 
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail);
    }

    // public function resendEmailVerification()
    // {
    //     $this->notify(new VerifyEmailNotification());
    // }

    /**
     * Lấy danh sách đăng ký tham gia sự kiện của user
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function joinEvents()
    {
        return $this->hasMany(JoinEvent::class);
    }

    /**
     * Lấy danh sách sự kiện mà user đã tham gia
     * 
     * Quan hệ nhiều-nhiều thông qua bảng join_events
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function joinedEvents()
    {
        return $this->belongsToMany(Event::class, 'join_events', 'user_id', 'event_id');
    }

    /**
     * Kiểm tra xem user đã tham gia sự kiện hay chưa
     * 
     * @param int $eventId ID của sự kiện cần kiểm tra
     * @return bool True nếu đã tham gia, False nếu chưa
     */
    public function isMemberOfEvent($eventId)
    {
        return $this->joinEvents()->where('event_id', $eventId)->exists();
    }
}
