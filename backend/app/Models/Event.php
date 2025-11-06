<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

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

    // Quan hệ: Event thuộc về 1 User (author)
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}