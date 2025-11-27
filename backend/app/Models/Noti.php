<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Noti extends Model {

    protected $table = 'notis';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'sender_id',
        'is_read',
        'link',
    ];
    
    protected $casts = [
        'is_read' => 'boolean',
    ];
}