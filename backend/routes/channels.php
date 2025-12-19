<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

// Đăng ký broadcasting authentication route với JWT middleware
// Laravel sẽ tự động tạo POST /broadcasting/auth
Broadcast::routes(['middleware' => ['jwt']]);

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

/**
 * Private notification channel cho từng user
 * Chỉ user được phép nghe notifications của chính họ
 */
Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    Log::info('🔐 [Channel Auth] notifications.{userId}', [
        'requested_userId' => $userId,
        'authenticated_user' => $user ? [
            'id' => $user->id,
            'email' => $user->email ?? 'N/A',
            'username' => $user->username ?? 'N/A',
        ] : 'NULL',
        'user_type' => get_class($user),
        'authorized' => (int) $user->id === (int) $userId,
    ]);
    
    return (int) $user->id === (int) $userId;
});