<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Like extends Model
{
    /** @use HasFactory<\Database\Factories\LikeFactory> */
    use HasFactory;

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * The name of the "updated at" column.
     *
     * @var string|null
     */
    const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'post_id',
        'event_id', // thêm vào
        'status',
    ];

    /**
     * Get the user that owns the like.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the post that is liked (nullable).
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the event that is liked (nullable).
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
