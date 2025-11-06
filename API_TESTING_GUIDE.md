# API Testing Examples for Web Push Notifications

## Prerequisites

- User must be authenticated (has valid Sanctum token)
- VAPID keys must be configured in backend `.env`
- Migrations must be run

---

## 1. Subscribe to Push Notifications

### Request

```http
POST http://localhost:8000/api/user/push/subscribe
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
    "endpoint": "https://fcm.googleapis.com/fcm/send/example-endpoint-id",
    "keys": {
        "p256dh": "BASE64_ENCODED_PUBLIC_KEY",
        "auth": "BASE64_ENCODED_AUTH_SECRET"
    },
    "device_name": "Chrome on Desktop"
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "Push subscription created successfully",
  "data": {
    "id": 1,
    "user_id": 5,
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "p256dh": "...",
    "auth": "...",
    "device_name": "Chrome on Desktop",
    "created_at": "2025-01-15T10:30:00.000000Z",
    "updated_at": "2025-01-15T10:30:00.000000Z"
  }
}
```

### Error Response (422)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "endpoint": ["The endpoint field is required."],
    "keys.p256dh": ["The keys.p256dh field is required."]
  }
}
```

---

## 2. Unsubscribe from Push Notifications

### Request

```http
POST http://localhost:8000/api/user/push/unsubscribe
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
    "endpoint": "https://fcm.googleapis.com/fcm/send/example-endpoint-id"
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Push subscription removed successfully"
}
```

### Not Found Response (404)

```json
{
  "success": false,
  "message": "Subscription not found"
}
```

---

## 3. List User's Subscriptions

### Request

```http
GET http://localhost:8000/api/user/push/subscriptions
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "device_name": "Chrome on Desktop",
      "created_at": "2025-01-15T10:30:00.000000Z"
    },
    {
      "id": 2,
      "device_name": "Firefox on Mobile",
      "created_at": "2025-01-15T11:00:00.000000Z"
    }
  ],
  "count": 2
}
```

---

## 4. Remove All Subscriptions

### Request

```http
DELETE http://localhost:8000/api/user/push/unsubscribe-all
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Success Response (200)

```json
{
  "success": true,
  "message": "All push subscriptions removed",
  "count": 2
}
```

---

## Testing Push Notification Flow

### Step 1: User Joins Event

```http
GET http://localhost:8000/api/user/joinEvent/123
Authorization: Bearer USER_ACCESS_TOKEN
```

This creates a `join_events` record with status='pending'.

### Step 2: Manager Accepts User

```http
POST http://localhost:8000/api/manager/acceptUserJoinEvent/123
Content-Type: application/json
Authorization: Bearer MANAGER_ACCESS_TOKEN

{
    "user_id": 5
}
```

**Expected Result:**

1. `join_events` status updated to 'accepted'
2. New `notis` record created
3. Push notification sent to user's devices
4. User receives browser notification

---

## Using cURL

### Subscribe

```bash
curl -X POST http://localhost:8000/api/user/push/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "BASE64_KEY",
      "auth": "BASE64_SECRET"
    },
    "device_name": "Chrome"
  }'
```

### List Subscriptions

```bash
curl -X GET http://localhost:8000/api/user/push/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Unsubscribe

```bash
curl -X POST http://localhost:8000/api/user/push/unsubscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/..."
  }'
```

---

## Testing with Postman

1. Create a new Collection "Web Push Notifications"
2. Add environment variables:
   - `base_url`: `http://localhost:8000/api`
   - `token`: Your access token
3. Import these requests
4. Test each endpoint

---

## Database Queries for Testing

### Check if user has subscriptions

```sql
SELECT * FROM push_subscriptions WHERE user_id = 5;
```

### Check notifications for user

```sql
SELECT * FROM notis WHERE receiver_id = 5 ORDER BY created_at DESC;
```

### Check join event status

```sql
SELECT * FROM join_events WHERE user_id = 5 AND event_id = 123;
```

### See all notifications with details

```sql
SELECT
    n.id,
    n.title,
    n.message,
    n.type,
    sender.name as sender_name,
    receiver.name as receiver_name,
    n.is_read,
    n.created_at
FROM notis n
LEFT JOIN users sender ON n.sender_id = sender.id
LEFT JOIN users receiver ON n.receiver_id = receiver.id
ORDER BY n.created_at DESC;
```

---

## Troubleshooting

### Issue: 401 Unauthorized

**Solution:** Check if token is valid and user is authenticated

### Issue: 500 Internal Server Error

**Solution:**

1. Check Laravel logs: `/storage/logs/laravel.log`
2. Verify VAPID keys are set in `.env`
3. Check database migrations are run

### Issue: Push not received

**Solution:**

1. Verify subscription exists in database
2. Check service worker is registered
3. Check browser console for errors
4. Verify VAPID public key matches in frontend and backend

---

## Browser Console Testing

### Check Service Worker Status

```javascript
navigator.serviceWorker.getRegistration().then((reg) => {
  console.log("Service Worker:", reg);
});
```

### Check Current Subscription

```javascript
navigator.serviceWorker.ready.then((reg) => {
  reg.pushManager.getSubscription().then((sub) => {
    console.log("Current Subscription:", sub);
  });
});
```

### Request Permission

```javascript
Notification.requestPermission().then((permission) => {
  console.log("Permission:", permission);
});
```

### Get Subscription Keys

```javascript
navigator.serviceWorker.ready.then((reg) => {
  reg.pushManager.getSubscription().then((sub) => {
    if (sub) {
      const key = sub.getKey("p256dh");
      const auth = sub.getKey("auth");
      console.log("p256dh:", btoa(String.fromCharCode(...new Uint8Array(key))));
      console.log("auth:", btoa(String.fromCharCode(...new Uint8Array(auth))));
    }
  });
});
```

---

## Expected Notification Payload

When manager accepts user, notification should contain:

```json
{
  "title": "Tham gia sự kiện thành công! 🎉",
  "body": "Yêu cầu tham gia sự kiện 'Event Title' của bạn đã được chấp nhận!",
  "icon": "/icons/notification-icon.png",
  "badge": "/icons/badge-icon.png",
  "url": "/events/123",
  "tag": "event-notification"
}
```

---

## Success Criteria

✅ User can subscribe to push notifications via API
✅ Subscription saved in `push_subscriptions` table
✅ Manager accepts user → Notification created in `notis` table
✅ Push notification delivered to user's browser
✅ User can click notification → Opens event page
✅ User can unsubscribe via API
✅ User can see all their devices/subscriptions

---

**Happy Testing! 🎉**
