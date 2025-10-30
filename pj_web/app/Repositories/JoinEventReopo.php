<?php

namespace App\Repositories;

use App\Models\JoinEvent;
use Illuminate\Support\Facades\DB;
use Exception;

class JoinEventRepo
{
    public function getJoinEventById($id)
    {
        return JoinEvent::find($id);
    }

    public function createJoinEvent($data) : JoinEvent
    {
        return JoinEvent::create($data);
    }

    public function updateJoinEventById($id, $data) : JoinEvent
    {
        $joinEvent = $this->getJoinEventById($id);
        if (!$joinEvent) {
            throw new Exception('JoinEvent not found');
        }
        $joinEvent->update($data);
        return $joinEvent;
    }

    public function all()
    {
        return JoinEvent::all();
    }

    public function deleteJoinEventById($id) : bool
    {
        $joinEvent = $this->getJoinEventById($id);
        if (!$joinEvent) {
            throw new Exception('JoinEvent not found');
        }
        return $joinEvent->delete();
    }
}