<?php

namespace App\Repositories;

use App\Repositories\UserRepo;
use App\Repositories\EventRepo;
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

    public function createEvent($data, $comanager = []) : Event
    {
        
        $event = Event::create($data);
        // Attach comanagers to the event
        $event->comanagers()->attach($comanager);
        return $event;
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
        $event->status = 'upcoming';
        $event->save();
        return $event;
    }

    public function rejectEvent($id) : Event
    {
        $event = $this->getEventById($id);
        if (!$event) {
            throw new Exception('Event not found');
        }
        $event->status = 'cancelled';
        $event->save();
        return $event;
    }   
}