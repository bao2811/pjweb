<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * Đây là nơi đăng ký các Command bạn tạo.
     */
    protected $commands = [
        // Đăng ký command của bạn ở đây
        \App\Console\Commands\ExpireJoinEvent::class,
        \App\Console\Commands\ExpireEvents::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * Đây là nơi bạn định nghĩa các task chạy theo lịch.
     */
    protected function schedule(Schedule $schedule)
    {
        // Task tự động expire pending registration mỗi phút
        $schedule->command('joins:expire')->everyMinute();

        // Bạn có thể thêm các task khác ở đây
        // ví dụ: gửi email, backup database...
    }

    /**
     * Register the commands for the application.
     *
     * Tự động load tất cả các command trong thư mục Commands.
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
