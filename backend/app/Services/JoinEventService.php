<?php

namespace App\Services;

use App\Repositories\JoinEventRepo;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;


class JoinEventService {
    protected $joinEventRepo;

    public function __construct(JoinEventRepo $joinEventRepo)
    {
        $this->joinEventRepo = $joinEventRepo;
    }

    public function joinEvent($userId, $eventId)
    {
        $result =  $this->joinEventRepo->joinEvent($userId, $eventId);

        if ($result) {
            return [
                'success' => true,
                'message' => 'Joined event successfully',
                'data' => $result
            ];
        } else {
            return false;
        }
    }

    public function leaveEvent($userId, $eventId)
    {
        $result = $this->joinEventRepo->leaveEvent($userId, $eventId);

        // kiểm tra check điều kiện để  rời và đăng ký sự kiện

        if ($result) {
            return [
                'success' => true,
                'message' => 'Left event successfully',
                'data' => $result
            ];
        } else {
            return false;
        }
    }

}