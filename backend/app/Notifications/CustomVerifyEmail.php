<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

/**
 * Notification CustomVerifyEmail - Email xác thực tài khoản
 * 
 * Notification này gửi email xác thực đến user sau khi đăng ký.
 * Hỗ trợ gửi qua mail, database và broadcast.
 * 
 * @package App\Notifications
 */
class CustomVerifyEmail extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Khởi tạo notification
     */
    public function __construct()
    {
        //
    }

    /**
     * Xác định các kênh gửi notification
     *
     * @param object $notifiable User nhận notification
     * @return array<int, string> Danh sách channels (mail, database, broadcast)
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    /**
     * Tạo nội dung email
     * 
     * @param object $notifiable User nhận email
     * @return MailMessage
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('Please click the button below to verify your email address.')
            ->action('Xác nhận ngay', $this->verificationUrl($notifiable))
            ->line('Thank you for using our application!');
    }

    /**
     * Tạo URL xác thực có chữ ký và thời hạn
     * 
     * @param object $notifiable User cần xác thực
     * @return string URL xác thực
     */
    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }

    /**
     * Chuyển notification thành array (cho database/broadcast)
     *
     * @param object $notifiable User nhận notification
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
