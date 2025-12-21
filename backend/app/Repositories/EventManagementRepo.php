<?php

namespace App\Repositories;

use App\Models\EventManagement;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EventManagementRepo
{
    public function getEventManagementById($id) : ?EventManagement
    {
        return EventManagement::find($id);
    }

    /**
     * Lấy EventManagement theo ID
     *
     * @param int $id ID của bản ghi
     * @return EventManagement|null
     */

    /**
     * Lấy tất cả EventManagement
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllEventManagements()
    {
        return EventManagement::all();
    }

    /**
     * Lấy danh sách comanager theo event ID
     *
     * @param int $eventId ID của event
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getComanagerByEventId($eventId)
    {
        return EventManagement::where('event_id', $eventId)->get();
    }

    /**
     * Lấy danh sách sự kiện mà một comanager quản lý
     *
     * @param int $comanagerId ID của comanager
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getEventsByComanagerId($comanagerId)
    {
        return EventManagement::where('comanager_id', $comanagerId)->get();
    }

    /**
     * Thêm nhiều comanager cho một event
     *
     * @param int $eventId ID của event
     * @param array $comanagerIds Mảng ID comanager
     * @return array Mảng các EventManagement vừa tạo
     */
    public function addComanagerByEventId($eventId, $comanagerIds) : array
    {
        $addedComanagers = [];
        foreach ($comanagerIds as $comanagerId) {
            $addedComanagers[] = $this->createEventManagement($eventId, $comanagerId);
        }
        return $addedComanagers;
    }

    /**
     * Tạo bản ghi EventManagement (gán comanager cho event)
     *
     * @param int $eventId ID của event
     * @param int $comanagerId ID của comanager
     * @return EventManagement Bản ghi vừa tạo
     */
    public function createEventManagement($eventId, $comanagerId) : EventManagement
    {
        return EventManagement::create([
            'event_id' => $eventId,
            'comanager_id' => $comanagerId,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
    }

}