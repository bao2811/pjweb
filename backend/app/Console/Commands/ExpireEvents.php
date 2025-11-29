<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Event;
use Carbon\Carbon;

class ExpireEvents extends Command
{
    /**
     * Tên lệnh artisan.
     */
    protected $signature = 'events:expire';

    /**
     * Mô tả lệnh.
     */
    protected $description = 'Mark events as expired if they have ended but are still pending approval';

    /**
     * Logic xử lý.
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
