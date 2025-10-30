<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Noti extends Model {

    protected $table = 'notis';

    protected $fillable = [
        'title',
        'message',
        'sender_id',
        'is_read',
    ];
    
}