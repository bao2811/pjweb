<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\CustomVerifyEmail;

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
        'addressCard',  
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

    public function posts()
    {
        return $this->hasMany(Post::class, 'author_id'); // nếu cột khóa ngoại là author_id
    }

    /**
     * Notifications sent by this user
     */
    public function sentNotifications()
    {
        return $this->hasMany(Noti::class, 'sender_id');
    }

    /**
     * Notifications received by this user
     */
    public function receivedNotifications()
    {
        return $this->hasMany(Noti::class, 'receiver_id');
    }

    /**
     * Push subscriptions for this user
     */
    public function pushSubscriptions()
    {
        return $this->hasMany(PushSubscription::class);
    }


    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail);
    }

    public function resendEmailVerification()
    {
        $this->notify(new VerifyEmailNotification());
    }
}
