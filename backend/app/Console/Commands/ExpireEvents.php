<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Event;
use Carbon\Carbon;

/**
 * Command ExpireEvents - Đánh dấu sự kiện hết hạn
 * 
 * Command này chạy định kỳ để tìm và đánh dấu các sự kiện
 * đang ở trạng thái 'pending' nhưng đã qua thời gian kết thúc
 * thành 'expired'.
 * 
 * Sử dụng: php artisan events:expire
 * 
 * @package App\Console\Commands
 */
class ExpireEvents extends Command
{
    /**
     * Tên và signature của lệnh artisan
     * 
     * @var string
     */
    protected $signature = 'events:expire';

    /**
     * Mô tả lệnh
     * 
     * @var string
     */
    protected $description = 'Mark events as expired if they have ended but are still pending approval';

    /**
     * Thực thi logic của command
     * 
     * Tìm các sự kiện có status='pending' và end_time < now,
     * sau đó cập nhật status thành 'expired'.
     * 
     * @return void
     */
    public function handle()
    {
        $now = Carbon::now();

        // Tìm sự kiện:
        // - status = pending (chưa duyệt)
        // - end_time < thời điểm hiện tại → đã quá hạn
        $updated = Event::where('status', 'pending')
            ->where('end_time', '<', $now)
            ->update([
                'status' => 'expired'
            ]);

        $this->info("Expired $updated events that were pending and already ended.");
    }
}
