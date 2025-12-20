<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Event extends Model
{
    /** @use HasFactory<\Database\Factories\EventFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'content',
        'image',
        'address',
        'start_time',
        'end_time',
        'author_id',
        'status',
        'max_participants',
        'current_participants',
        'category',
        'likes',
    ];

    /**
     * Get the computed status based on current time and event times
     * 
     * @return string 'upcoming', 'ongoing', 'completed', 'pending', or 'rejected'
     */
    public function getComputedStatusAttribute()
    {
        // If admin has set status to pending or rejected, keep those
        if (in_array($this->status, ['pending', 'rejected'])) {
            return $this->status;
        }

        $now = now();
        $startTime = \Carbon\Carbon::parse($this->start_time);
        $endTime = \Carbon\Carbon::parse($this->end_time);

        // Event hasn't started yet
        if ($now->lt($startTime)) {
            return 'upcoming';
        }

        // Event has ended
        if ($now->gt($endTime)) {
            return 'completed';
        }

        // Event is currently happening
        return 'ongoing';
    }

    /**
     * Append computed_status to JSON output
     */
    protected $appends = ['computed_status'];

    public function joinEvents()
    {
        return $this->hasMany(JoinEvent::class);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'join_events', 'event_id', 'user_id');
    }

    /**
     * Get all likes for this event
     */
    public function likes()
    {
        return $this->hasMany(Like::class, 'event_id');
    }

    /**
     * Get users who liked this event
     */
    public function likedByUsers()
    {
        return $this->belongsToMany(User::class, 'likes', 'event_id', 'user_id')
                    ->withTimestamps();
    }

    /**
     * Get the author of the event
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Get co-managers of the event
     */
    public function comanagers()
    {
        return $this->belongsToMany(User::class, 'event_managements', 'event_id', 'user_id');
    }

    /**
     * Get the channel for this event (one-to-one)
     */
    public function channel()
    {
        return $this->hasOne(Channel::class, 'event_id');
    }
}