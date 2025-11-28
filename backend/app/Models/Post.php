<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Post extends Model
{
    /** @use HasFactory<\Database\Factories\PostFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'content',
        'author_id',
        'image', 
        'published_at',
        'likes',
        'comments',
        'event_id',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'author_id'); // nếu cột khóa ngoại là author_id
    }

    // Backwards-compatible helper: some templates/services expect `author` relation
    public function author()
    {
        return $this->user();
    }
}