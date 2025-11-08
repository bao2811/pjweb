<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('event.{id}', function ($user, $id) {
    return true; // hoặc kiểm tra quyền: $user->canViewEvent($id);
});
Broadcast::channel('chat-room', function ($user) {
    return true; // Cho phép tất cả người dùng tham gia kênh chat-room
});

Broadcast::channel('chat.{groupId}', function ($user, $groupId) {
    return $user->isMemberOfGroup($groupId);
});