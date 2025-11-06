# Web Push Notifications - Quick Start 🚀

## ✅ Completed

1. **Database Schema:**

   - ✅ Migration for `notis` table updates (receiver_id, type, data)
   - ✅ Migration for `push_subscriptions` table

2. **Backend Models:**

   - ✅ Enhanced `Noti` model with push support
   - ✅ Created `PushSubscription` model

3. **Backend Logic:**

   - ✅ Enhanced `WebPushApi` utility with error handling
   - ✅ Created `PushSubscriptionController` with 4 endpoints
   - ✅ Updated `JoinEventRepo` to send notifications when manager accepts user
   - ✅ Added routes in `/backend/routes/user.php`

4. **Frontend:**
   - ✅ Service Worker (`/frontend/public/sw.js`)
   - ✅ React Hook (`/frontend/src/hooks/usePushNotifications.ts`)
   - ✅ UI Component (`/frontend/src/components/PushNotificationSettings.tsx`)

---

## 🔧 Required Setup Steps

### 1. Run Migrations

```bash
cd /home/bao/Documents/pj_web/backend
php artisan migrate
```

### 2. Generate VAPID Keys

```bash
cd /home/bao/Documents/pj_web/backend
php artisan tinker
```

In tinker console:

```php
use Minishlink\WebPush\VAPID;
$keys = VAPID::createVapidKeys();
echo "Public Key: " . $keys['publicKey'] . "\n";
echo "Private Key: " . $keys['privateKey'] . "\n";
exit
```

### 3. Configure Environment

**Backend** (`/backend/.env`):

```env
VAPID_PUBLIC_KEY=<your_generated_public_key>
VAPID_PRIVATE_KEY=<your_generated_private_key>
```

**Frontend** (`/frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<same_public_key_from_backend>
```

---

## 🧪 Testing

### Test Subscription (Frontend)

1. Add `PushNotificationSettings` component to any page
2. Click "Bật thông báo"
3. Grant browser permission
4. Check database: `SELECT * FROM push_subscriptions;`

### Test Notification (Full Flow)

1. User A joins event (creates pending join_events record)
2. Manager accepts User A
3. User A receives push notification automatically
4. Click notification → Opens event page

### Debug Checklist

- ✅ Migrations run successfully
- ✅ VAPID keys in both .env files
- ✅ Service worker accessible at `/sw.js`
- ✅ User granted notification permission
- ✅ Check Laravel logs: `/storage/logs/laravel.log`
- ✅ Check browser console for errors

---

## 📡 API Endpoints

| Method | Endpoint                         | Description                     |
| ------ | -------------------------------- | ------------------------------- |
| POST   | `/api/user/push/subscribe`       | Subscribe to push notifications |
| POST   | `/api/user/push/unsubscribe`     | Unsubscribe from push           |
| GET    | `/api/user/push/subscriptions`   | List user's devices             |
| DELETE | `/api/user/push/unsubscribe-all` | Remove all subscriptions        |

All endpoints require `auth:sanctum` middleware.

---

## 📄 Files Created/Modified

### Backend

- ✅ `/backend/database/migrations/2025_11_05_141515_add_receiver_type_data_to_notis_table.php`
- ✅ `/backend/database/migrations/2025_11_05_141834_create_push_subscriptions_table.php`
- ✅ `/backend/app/Models/Noti.php` (updated)
- ✅ `/backend/app/Models/PushSubscription.php` (new)
- ✅ `/backend/app/Utils/WebPushApi.php` (enhanced)
- ✅ `/backend/app/Http/Controllers/PushSubscriptionController.php` (new)
- ✅ `/backend/app/Repositories/JoinEventRepo.php` (updated)
- ✅ `/backend/routes/user.php` (updated)

### Frontend

- ✅ `/frontend/public/sw.js` (new)
- ✅ `/frontend/src/hooks/usePushNotifications.ts` (new)
- ✅ `/frontend/src/components/PushNotificationSettings.tsx` (new)

### Documentation

- ✅ `/WEB_PUSH_IMPLEMENTATION_GUIDE.md` (comprehensive guide)
- ✅ `/QUICK_START.md` (this file)

---

## 🎯 How It Works

```
Manager accepts user join request
          ↓
  JoinEventRepo::acceptUserJoinEvent()
          ↓
      Noti::createAndPush([
          'title' => 'Event accepted!',
          'receiver_id' => $userId,
          'type' => 'event_accepted',
          'data' => ['event_id' => $eventId, 'url' => '/events/123']
      ])
          ↓
  1. Create Noti record in database
  2. Query user's PushSubscriptions
  3. Call WebPushApi::sendNotification()
          ↓
  Browser Service Worker receives push
          ↓
  Display notification to user
          ↓
  User clicks → Opens event page
```

---

## 🆘 Common Issues

**Issue:** "Rate limiter [api] is not defined"  
**Status:** ✅ Fixed (moved to AppServiceProvider::boot())

**Issue:** Migrations fail on channels table  
**Solution:** Table already exists, skip or mark as done

**Issue:** No push received  
**Checklist:**

1. VAPID keys configured?
2. Service worker registered?
3. Permission granted?
4. Subscription in database?
5. Check logs!

---

## 📚 Full Documentation

For complete documentation, see: `WEB_PUSH_IMPLEMENTATION_GUIDE.md`

---

**Ready to go! 🎉**

Run migrations → Generate VAPID keys → Test subscription → Test notifications!
