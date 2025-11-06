<?php

namespace App\Repositories;

use App\Models\Event;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EventRepo
{
    public function getEventById($id) : ?Event
    {
        return Event::find($id);
    }

    public function getAllEvents()
    {
        return Event::all();
    }

    public function deleteEventById($id) : bool
    {
        $event = $this->getEventById($id);
        if (!$event) {
            throw new Exception('Event not found');
        }
        return $event->delete();
    }

    public function createEvent($data) : Event
    {
        return Event::create($data);
    }

    public function updateEventById($id, $data) : Event
    {
        $event = $this->getEventById($id);
        if (!$event) {
            throw new Exception('Event not found');
        }
        $event->update($data);
        return $event;
    }

    public function acceptEvent($id) : Event
    {
        $event = $this->getEventById($id);
        if (!$event) {
            throw new Exception('Event not found');
        }
        $event->status = 'ACCEPTED';
        $event->save();
        return $event;
    }

    public function rejectEvent($id) : Event
    {
        $event = $this->getEventById($id);
        if (!$event) {
            throw new Exception('Event not found');
        }
        $event->status = 'REJECTED';
        $event->save();
        return $event;
    }   
}