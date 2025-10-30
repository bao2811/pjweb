<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventManagement extends Model
{
    use HasFactory;

    protected $table = 'event_managements';

    protected $fillable = [
        'event_id',
        'user_id',
        'role', // e.g., 'captain', 'participant'
    ];
}