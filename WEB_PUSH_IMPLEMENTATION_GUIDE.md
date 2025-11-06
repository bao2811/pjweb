# Web Push Notifications Implementation Guide

## 🎯 Overview

This guide explains the complete Web Push Notification system integrated with your Laravel + Next.js application. When a manager accepts a user's event join request, the system automatically sends a push notification to the user's devices.

---

## 📋 Backend Setup (Laravel)

### 1. Database Tables

#### `notis` Table (Updated)

```
- id (bigint, PK)
- title (string) - Notification title
- message (text) - Notification content
- sender_id (bigint, FK to users) - Manager who sent
- receiver_id (bigint, FK to users) - User who receives
- type (string) - Notification type (e.g., 'event_accepted')
- data (json) - Additional data (event_id, url, etc.)
- is_read (boolean) - Read status
- timestamps
```

#### `push_subscriptions` Table (New)

```
- id (bigint, PK)
- user_id (bigint, FK to users)
- endpoint (text) - Push subscription endpoint
- p256dh (string) - Encryption public key
- auth (string) - Auth secret
- device_name (string) - Browser/device name
- timestamps
- UNIQUE(user_id, endpoint)
```

### 2. Models

#### `Noti` Model (`/backend/app/Models/Noti.php`)

```php
class Noti extends Model {
    protected $fillable = [
        'title', 'message', 'sender_id', 'receiver_id',
        'is_read', 'type', 'data'
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
    ];

    // Relations
    public function sender(): BelongsTo { ... }
    public function receiver(): BelongsTo { ... }

    // Methods
    public static function createAndPush(array $data): self { ... }
    public function sendPush(): bool { ... }
}
```

#### `PushSubscription` Model (`/backend/app/Models/PushSubscription.php`)

```php
class PushSubscription extends Model {
    protected $fillable = [
        'user_id', 'endpoint', 'p256dh', 'auth', 'device_name'
    ];

    public function user(): BelongsTo { ... }
}
```

### 3. WebPushApi Utility (`/backend/app/Utils/WebPushApi.php`)

Enhanced utility with error handling:

```php
WebPushApi::sendNotification(
    $subscriptions,  // Collection of PushSubscription models
    'Title',         // Notification title
    'Body message',  // Notification body
    '/url/to/open',  // URL to open on click
    '/icon.png'      // Optional icon
);
```

### 4. API Endpoints

Add to `/backend/routes/user.php`:

```php
Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::post('/push/subscribe', [PushSubscriptionController::class, 'subscribe']);
    Route::post('/push/unsubscribe', [PushSubscriptionController::class, 'unsubscribe']);
    Route::get('/push/subscriptions', [PushSubscriptionController::class, 'listSubscriptions']);
    Route::delete('/push/unsubscribe-all', [PushSubscriptionController::class, 'unsubscribeAll']);
});
```

### 5. Integration in JoinEventRepo

When manager accepts user:

```php
public function acceptUserJoinEvent($user, $eventId) {
    $joinEvent = JoinEvent::where('user_id', $user->id)
                          ->where('event_id', $eventId)
                          ->first();

    if ($joinEvent) {
        $joinEvent->status = 'accepted';
        $joinEvent->save();

        $event = Event::find($eventId);

        // 🔔 Send notification + push
        Noti::createAndPush([
            'title' => 'Tham gia sự kiện thành công! 🎉',
            'message' => "Yêu cầu tham gia '{$event->title}' đã được chấp nhận!",
            'sender_id' => Auth::id(),
            'receiver_id' => $user->id,
            'type' => 'event_accepted',
            'data' => [
                'event_id' => $eventId,
                'event_title' => $event->title,
                'url' => "/events/{$eventId}"
            ]
        ]);

        return $joinEvent;
    }
}
```

---

## 🎨 Frontend Setup (Next.js + React)

### 1. Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

### 2. Service Worker (`/frontend/public/sw.js`)

Already created! Handles:

- ✅ Receiving push notifications
- ✅ Displaying notifications
- ✅ Click handling (opens URL)
- ✅ Vibration pattern

### 3. React Hook (`/frontend/src/hooks/usePushNotifications.ts`)

Custom hook providing:

```typescript
const {
  isSupported, // Browser support check
  isSubscribed, // Current subscription status
  subscription, // PushSubscription object
  error, // Error messages
  loading, // Loading state
  subscribe, // Subscribe function
  unsubscribe, // Unsubscribe function
} = usePushNotifications({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL,
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
});
```

### 4. UI Component (`/frontend/src/components/PushNotificationSettings.tsx`)

Ready-to-use component with:

- ✅ Toggle button (Enable/Disable)
- ✅ Loading states
- ✅ Error handling
- ✅ Status indicators
- ✅ User-friendly messages

### 5. Usage Example

In any page/component:

```tsx
import PushNotificationSettings from "@/components/PushNotificationSettings";

export default function UserSettingsPage() {
  return (
    <div>
      <h1>Cài đặt</h1>
      <PushNotificationSettings />
    </div>
  );
}
```

---

## 🔐 Backend Configuration

### Generate VAPID Keys

Run this command once to generate keys:

```bash
cd /home/bao/Documents/pj_web/backend
php artisan tinker
```

Then in tinker:

```php
use Minishlink\WebPush\VAPID;
$keys = VAPID::createVapidKeys();
echo "Public Key: " . $keys['publicKey'] . "\n";
echo "Private Key: " . $keys['privateKey'] . "\n";
```

Add to `/backend/.env`:

```env
VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
```

---

## 🚀 Testing

### 1. Run Migrations

```bash
cd /home/bao/Documents/pj_web/backend
php artisan migrate
```

### 2. Test Push Subscription (Frontend)

1. Open browser (Chrome/Firefox)
2. Navigate to settings page with PushNotificationSettings component
3. Click "Bật thông báo"
4. Grant permission in browser prompt
5. Check console for success message

### 3. Test Notification Flow

1. User A joins an event (creates `join_events` record with status='pending')
2. Manager accepts User A's request
3. System automatically:
   - ✅ Creates Noti record in database
   - ✅ Sends push notification to User A's devices
   - ✅ Logs success/failure

### 4. Verify in Database

```sql
-- Check notifications
SELECT * FROM notis WHERE receiver_id = <user_id>;

-- Check push subscriptions
SELECT * FROM push_subscriptions WHERE user_id = <user_id>;
```

---

## 📱 Notification Flow Diagram

```
Manager accepts user
        ↓
JoinEventRepo::acceptUserJoinEvent()
        ↓
Noti::createAndPush([...])
        ↓
    Create Noti record
        ↓
    Noti->sendPush()
        ↓
    Query PushSubscription
        ↓
WebPushApi::sendNotification()
        ↓
    minishlink/web-push
        ↓
    Browser Push API
        ↓
Service Worker receives push
        ↓
Display notification
```

---

## 🐛 Troubleshooting

### Issue: "Push notifications not supported"

**Solution:** Use Chrome, Firefox, or Edge. Safari has limited support.

### Issue: No notifications received

**Checklist:**

1. ✅ VAPID keys configured in `.env`
2. ✅ Service worker registered (`/sw.js` accessible)
3. ✅ User granted notification permission
4. ✅ Push subscription saved in database
5. ✅ Check browser console for errors
6. ✅ Check Laravel logs: `/storage/logs/laravel.log`

### Issue: "Failed to save subscription on server"

**Solution:**

- Verify API endpoint is accessible
- Check authentication token in request
- Verify CORS settings allow push endpoint domains

### Issue: Notifications not clickable

**Solution:** Check service worker `notificationclick` event handler. Ensure URL is correct.

---

## 🔒 Security Notes

1. **VAPID Keys:** Keep private key secret! Never commit to git.
2. **Authentication:** All push APIs require `auth:sanctum` middleware.
3. **Endpoint Validation:** Backend validates subscription format.
4. **User Privacy:** Users can unsubscribe anytime.

---

## 📦 Required Dependencies

### Backend (Laravel)

```json
"minishlink/web-push": "^8.0"
```

Already installed via composer.

### Frontend (Next.js)

No additional dependencies needed! Uses native browser APIs.

---

## 🎯 Next Steps

1. **Run migrations:** `php artisan migrate`
2. **Generate VAPID keys** (see Backend Configuration)
3. **Add keys to `.env`** files (backend + frontend)
4. **Test subscription flow** in browser
5. **Test notification** by accepting a user join request

---

## 📚 API Reference

### POST `/api/user/push/subscribe`

**Request:**

```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "base64_encoded_key",
    "auth": "base64_encoded_secret"
  },
  "device_name": "Chrome"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Push subscription created successfully",
    "data": { ... }
}
```

### POST `/api/user/push/unsubscribe`

**Request:**

```json
{
  "endpoint": "https://fcm.googleapis.com/..."
}
```

### GET `/api/user/push/subscriptions`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "device_name": "Chrome",
      "created_at": "2025-01-15T10:30:00"
    }
  ],
  "count": 1
}
```

---

## ✅ Checklist

- [x] Database migrations created
- [x] Noti model updated with push support
- [x] PushSubscription model created
- [x] WebPushApi utility enhanced
- [x] API endpoints created
- [x] Integration in JoinEventRepo
- [x] Service worker created
- [x] React hook created
- [x] UI component created
- [ ] Run migrations
- [ ] Generate VAPID keys
- [ ] Test subscription flow
- [ ] Test notification delivery

---

**🎉 Your Web Push Notification system is ready!**

For questions or issues, check:

- Laravel logs: `/storage/logs/laravel.log`
- Browser console (F12)
- Service worker status: Chrome DevTools > Application > Service Workers
