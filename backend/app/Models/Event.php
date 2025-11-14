<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',      // Đổi từ 'content'
        'location',         // Đổi từ 'address'
        'start_date',       // Đổi từ 'start_time'
        'end_date',         // Đổi từ 'end_date'
        'max_participants', // Thêm mới
        'points',           // Thêm mới
        'category',         // Thêm mới
        'image',
        'status',
        'creator_id',       // Đổi từ 'author_id'
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
}