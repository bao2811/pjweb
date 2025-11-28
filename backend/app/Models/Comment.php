<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Comment extends Model
{
    /** @use HasFactory<\Database\Factories\CommentFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'content',
        'author_id',
        'post_id',
        'event_id',
        'created_at',
    ];

    /**
     * Indicates if the model should use timestamps.
     * Since our table only has created_at (not updated_at),
     * we need to customize timestamp behavior.
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * The name of the "updated at" column.
     * Set to null since our table doesn't have this column.
     *
     * @var string|null
     */
    const UPDATED_AT = null;
}