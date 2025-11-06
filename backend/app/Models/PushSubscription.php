<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PushSubscription extends Model
{
    protected $table = 'push_subscriptions';

    protected $fillable = [
        'user_id',
        'endpoint',
        'p256dh',
        'auth',
        'device_name',
    ];

    /**
     * User sở hữu subscription này
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
