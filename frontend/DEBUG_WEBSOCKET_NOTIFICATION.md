# 🔧 Debug WebSocket Notification System

## ✅ Các thay đổi đã sửa:

### 1. **NotificationIcon.tsx** - Sử dụng useCallback để tránh stale closure

```typescript
// ❌ TRƯỚC: Inline callback - bị stale closure
useReverbNotification({
  onNewNotification: (notification) => {
    setUnreadCount((prev) => prev + 1); // Closure cũ!
  },
});

// ✅ SAU: useCallback - callback ổn định
const handleNewNotification = useCallback((notification: any) => {
  setUnreadCount((prev) => prev + 1); // Luôn mới!
}, []);
```

### 2. **useReverbNotification.ts** - Sử dụng useRef cho callbacks

```typescript
// ❌ TRƯỚC: Dependencies bao gồm callbacks → reconnect liên tục
useEffect(() => {
  // ...
}, [userId, authToken, onNewNotification, onNotificationRead]);

// ✅ SAU: Dùng ref để lưu callbacks, chỉ phụ thuộc userId & authToken
const onNewNotificationRef = useRef(onNewNotification);

useEffect(() => {
  onNewNotificationRef.current = onNewNotification;
}, [onNewNotification]);

useEffect(() => {
  channel.listen(".notification.new", (data) => {
    onNewNotificationRef.current?.(data); // Luôn gọi version mới nhất!
  });
}, [userId, authToken]); // Không bị reconnect khi callback thay đổi
```

### 3. **Fetch notifications hợp nhất**

```typescript
// ✅ Một API call duy nhất
const fetchNotifications = useCallback(async () => {
  const response = await authFetch("/user/notifications");
  const notifications = data.notifications || [];

  // Tính unread count từ data
  const unread = notifications.filter((n: any) => !n.is_read).length;
  setUnreadCount(unread);

  // Lấy 5 recent
  setRecentNotifications(notifications.slice(0, 5));
}, [user]);
```

## 🧪 Cách test:

### 1. Mở Browser Console

```javascript
// Bạn sẽ thấy các log sau:
🚀 [Reverb] Initializing Echo for user: 123
📡 [Reverb] Subscribing to channel: notifications.123
🟢 [Reverb] Successfully subscribed to notifications.123
```

### 2. Gửi test notification từ backend

```php
use App\Models\Noti;

// Gửi thông báo đến user ID = 123
Noti::dispatchCreateAndPush([
    'title' => 'Test Notification',
    'message' => 'This is a test message',
    'sender_id' => 1,
    'receiver_id' => 123,
    'type' => 'system',
], [123]);
```

### 3. Kiểm tra Browser Console

```javascript
// Khi notification đến, bạn sẽ thấy:
🔔 [Reverb] New notification received: {
  id: 456,
  title: "Test Notification",
  message: "This is a test message",
  type: "system",
  is_read: false,
  created_at: "2025-11-30T10:30:00Z"
}

📬 New notification received via WebSocket: {...}
📈 Unread count updated: 2 → 3
🔄 Recent notifications updated: 5
```

### 4. Kiểm tra UI

- ✅ Badge số thông báo tăng lên ngay lập tức
- ✅ Dropdown hiển thị notification mới ở đầu danh sách
- ✅ Browser notification xuất hiện (nếu có permission)

## 🐛 Troubleshooting:

### Vấn đề 1: Badge không tăng khi có notification mới

**Nguyên nhân:** Stale closure - callback đang dùng state cũ

**Giải pháp:** ✅ Đã sửa bằng `useCallback` và `useRef`

### Vấn đề 2: WebSocket disconnect/reconnect liên tục

**Nguyên nhân:** Dependencies của useEffect bao gồm callbacks thay đổi mỗi render

**Giải pháp:** ✅ Đã sửa - chỉ phụ thuộc `userId` và `authToken`

### Vấn đề 3: Phải refresh trang mới thấy notification

**Nguyên nhân:** Không có real-time update hoặc WebSocket chưa kết nối

**Kiểm tra:**

```javascript
// Mở console, check:
console.log(window.Echo); // Phải có giá trị
```

### Vấn đề 4: Notification đến nhưng không hiển thị trong dropdown

**Nguyên nhân:** State không được update

**Kiểm tra:** Xem log console có `🔄 Recent notifications updated` không

## 📋 Checklist:

### Backend:

- [ ] Laravel Reverb đã chạy: `php artisan reverb:start`
- [ ] Queue worker đã chạy: `php artisan queue:work`
- [ ] Broadcasting driver = 'reverb' trong `.env`
- [ ] Channels.php có authorize cho `notifications.{userId}`

### Frontend:

- [ ] `.env.local` có config Reverb đầy đủ:
  ```
  NEXT_PUBLIC_REVERB_APP_KEY=your-app-key
  NEXT_PUBLIC_REVERB_HOST=localhost
  NEXT_PUBLIC_REVERB_PORT=8080
  NEXT_PUBLIC_REVERB_SCHEME=http
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```
- [ ] User đã đăng nhập (có `userId` và `token`)
- [ ] Console log hiển thị "🟢 Successfully subscribed"

## 🎯 Kết quả mong đợi:

1. **Khi gửi notification:**

   - Backend: Lưu vào DB → Broadcast qua Reverb
   - Frontend: WebSocket nhận event → Update state ngay lập tức
   - UI: Badge tăng, notification xuất hiện trong dropdown
   - Browser: Hiện native notification (nếu có permission)

2. **Không cần:**

   - ❌ Refresh trang
   - ❌ Polling API liên tục
   - ❌ Click vào route /notifications mới thấy

3. **Real-time:**
   - ✅ Badge cập nhật tức thì
   - ✅ Dropdown cập nhật tức thì
   - ✅ Browser notification hiển thị tức thì
