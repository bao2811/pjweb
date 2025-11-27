<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'location',
        'start_time',
        'end_time',
        'max_participants',
        'points',
        'category',
        'image',
        'status',
        'creator_id',
    ];

    // Quan hệ: Event thuộc về 1 User (creator)
    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
    
    // Alias cho backward compatibility
    public function author()
    {
        return $this->creator();
    }
    
    // Quan hệ: Event có 1 Channel
    public function channel()
    {
        return $this->hasOne(Channel::class, 'event_id');
    }
}