<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class JoinEvent extends Model
{
    /** @use HasFactory<\Database\Factories\JoinEventFactory> */
    use HasFactory;

    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'event_id',
        'status',
        'joined_at',
        'created_at',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

}