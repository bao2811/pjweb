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
    ];

  public function joinEvents()
    {
        return $this->hasMany(JoinEvent::class);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'joinevent', 'event_id', 'user_id');
    }
}