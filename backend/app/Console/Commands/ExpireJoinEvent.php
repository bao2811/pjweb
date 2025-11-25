<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\JoinEvent;
use Carbon\Carbon;

class ExpireJoinEvent extends Command
{
    /**
     * The name and signature of the console command.
     *
     * Đây là lệnh bạn sẽ gọi trong Scheduler.
     */
    protected $signature = 'joins:expire';

    /**
     * The console command description.
     */
    protected $description = 'Expire pending registrations in JoinEvent when event has started';

    /**
     * Execute the console command. 
     */
    public function handle()
    {
        $now = Carbon::now();

        $updated = JointEvent::where('status', 'pending')
            ->whereHas('event', function ($query) use ($now) {
                $query->where('start_time', '<=', $now);
            })
            ->update(['status' => 'expired']);

        $this->info("Expired $updated pending registrations in JointEvent.");
    }
}
