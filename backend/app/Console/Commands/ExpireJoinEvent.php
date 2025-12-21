<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\JoinEvent;
use Carbon\Carbon;

/**
 * Command ExpireJoinEvent - Hết hạn đăng ký tham gia sự kiện
 * 
 * Command này chạy định kỳ để tìm và đánh dấu các đăng ký
 * tham gia sự kiện đang ở trạng thái 'pending' nhưng sự kiện
 * đã bắt đầu thành 'expired'.
 * 
 * Sử dụng: php artisan joins:expire
 * 
 * @package App\Console\Commands
 */
class ExpireJoinEvent extends Command
{
    /**
     * Tên và signature của lệnh artisan
     *
     * @var string
     */
    protected $signature = 'joins:expire';

    /**
     * Mô tả lệnh
     * 
     * @var string
     */
    protected $description = 'Expire pending registrations in JoinEvent when event has started';

    /**
     * Thực thi logic của command
     * 
     * Tìm các JoinEvent có status='pending' mà event đã bắt đầu (start_time < now),
     * sau đó cập nhật status thành 'expired'.
     * 
     * @return void
     */
    public function handle()
    {
        $now = Carbon::now();

        $updated = JoinEvent::where('status', 'pending')
            ->whereHas('event', function ($query) use ($now) {
                $query->where('start_time', '<', $now);
            })
            ->update(['status' => 'expired']);

        $this->info("Expired $updated pending registrations in JoinEvent.");
    }
}
