<?php

namespace App\Repositories;

use App\Models\Noti;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NotiRepo
{
    public function getEventManagementById($id) : ?EventManagement
    {
        return EventManagement::find($id);
    }

    public function getAllEventManagements()
    {
        return EventManagement::all();
    }

    public function deleteEventManagementById($id) : bool
    {
        $eventManagement = $this->getEventManagementById($id);
        if (!$eventManagement) {
            throw new Exception('EventManagement not found');
        }
        return $eventManagement->delete();
    }

    public function createEventManagement($data) : EventManagement
    {
        return EventManagement::create($data);
    }

    public function updateEventManagementById($id, $data) : EventManagement
    {
        $eventManagement = $this->getEventManagementById($id);
        if (!$eventManagement) {
            throw new Exception('EventManagement not found');
        }
        $eventManagement->update($data);
        return $eventManagement;
    }
}