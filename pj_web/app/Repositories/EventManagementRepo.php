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

    public function getAllEventManagements()
    {
        return EventManagement::all();
    }

    public function getComanagerByEventId($eventId)
    {
        return EventManagement::where('event_id', $eventId)->get();
    }

    public function getEventsByComanagerId($comanagerId)
    {
        return EventManagement::where('comanager_id', $comanagerId)->get();
    }

    public function addComanagerByEventId($eventId, $comanagerIds) : array
    {
        $addedComanagers = [];
        foreach ($comanagerIds as $comanagerId) {
            $addedComanagers[] = $this->createEventManagement($eventId, $comanagerId);
        }
        return $addedComanagers;
    }
}