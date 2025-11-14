# DANH SÁCH CÔNG VIỆC - APP TÌNH NGUYỆN VIÊN

> **Ngày tạo**: 04/11/2025  
> **Trạng thái project**: Backend foundation đã có, cần hoàn thiện chức năng theo yêu cầu

---

## 📊 TỔNG QUAN TIẾN ĐỘ

### ✅ ĐÃ CÓ (Hoàn thành ~20%)
- [x] Setup Docker (PostgreSQL, Nginx, Backend, Frontend)
- [x] Models cơ bản: User, Event, Post, JoinEvent, Like, Comment, Channel, Message
- [x] Controllers: Auth, User, Event, Post, JoinEvent, Like, Noti, Admin
- [x] Services: tương ứng với Controllers
- [x] Repositories: tương ứng với Services
- [x] Authentication cơ bản: register, login, logout
- [x] Database connection với PostgreSQL

### ⚠️ ĐANG LÀM
- [ ] Sửa lỗi middleware và routes
- [ ] Hoàn thiện API endpoints

### ❌ CHƯA CÓ (Còn ~80%)
- [ ] Migrations đầy đủ cho tất cả bảng
- [ ] API endpoints đầy đủ theo yêu cầu
- [ ] Authorization (phân quyền theo role)
- [ ] Web Push notifications
- [ ] Dashboard analytics
- [ ] Export data (CSV/JSON)
- [ ] Frontend integration

---

## 🗂️ PHẦN 1: DATABASE & MIGRATIONS (Ưu tiên: CAO)

### 1.1 Tạo/Sửa Migrations

#### ✅ Đã có
- [x] `users` table (đã thêm cột `role`)

#### ❌ Cần tạo mới
```bash
# Chạy các lệnh này trong container backend:
php artisan make:migration create_events_table
php artisan make:migration create_join_events_table
php artisan make:migration create_posts_table
php artisan make:migration create_comments_table
php artisan make:migration create_likes_table
php artisan make:migration create_channels_table
php artisan make:migration create_messages_table
php artisan make:migration create_notifications_table
```

#### 📋 Schema cần implement:

**events** (Sự kiện)
- id, title, description, location, date, time
- max_participants, current_participants
- category, status (pending/approved/rejected/completed/cancelled)
- is_hidden (boolean)
- organizer_id (foreign key -> users)
- created_at, updated_at

**join_events** (Đăng ký tham gia)
- id, user_id, event_id
- status (pending/approved/rejected/completed)
- registered_at, completed_at
- timestamps

**posts** (Bài viết trên kênh sự kiện)
- id, event_id, user_id
- content, images (json)
- likes_count, comments_count
- timestamps

**comments** (Bình luận)
- id, post_id, user_id
- content, parent_id (for replies)
- timestamps

**likes** (Lượt thích)
- id, user_id, likeable_id, likeable_type (polymorphic)
- timestamps

**channels** (Kênh trao đổi)
- id, event_id, name
- created_at, updated_at

**messages** (Tin nhắn trong kênh)
- id, channel_id, user_id
- content, type (text/image/file)
- timestamps

**notifications** (Thông báo)
- id, user_id, type, data (json)
- read_at, timestamps

---

## 🔐 PHẦN 2: AUTHENTICATION & AUTHORIZATION (Ưu tiên: CAO)

### 2.1 Hoàn thiện Authentication

#### ✅ Đã có
- [x] Register API
- [x] Login API  
- [x] Logout API

#### ❌ Cần làm thêm
- [ ] Forgot password
- [ ] Reset password
- [ ] Email verification
- [ ] Refresh token (nếu dùng JWT)
- [ ] Middleware xác thực token

**File cần sửa/tạo**:
- `app/Http/Controllers/AuthController.php` - thêm methods
- `routes/api.php` - thêm routes
- `app/Mail/` - tạo email templates

### 2.2 Authorization (Phân quyền theo Role)

#### ❌ Cần implement
- [ ] Middleware check role: `CheckRole` middleware
- [ ] Policy cho từng Model (UserPolicy, EventPolicy, PostPolicy)
- [ ] Gate definitions trong `AuthServiceProvider`

**Quy tắc phân quyền**:
- **User (Tình nguyện viên)**: Xem events, đăng ký, post/comment trên kênh đã tham gia
- **Manager (Quản lý sự kiện)**: Tạo/sửa/xóa events của mình, duyệt đăng ký, đánh dấu hoàn thành
- **Admin**: Duyệt/xóa tất cả events, quản lý users, export data

**File cần tạo**:
```bash
php artisan make:middleware CheckRole
php artisan make:policy UserPolicy --model=User
php artisan make:policy EventPolicy --model=Event
php artisan make:policy PostPolicy --model=Post
```

---

## 📡 PHẦN 3: API ENDPOINTS (Ưu tiên: CAO)

### 3.1 User/Volunteer APIs

#### ✅ Đã có
- [x] POST `/api/register`
- [x] POST `/api/login`
- [x] POST `/api/logout`

#### ❌ Cần implement
```php
// Auth
POST   /api/forgot-password
POST   /api/reset-password
POST   /api/verify-email

// Profile
GET    /api/profile              // Xem profile
PUT    /api/profile              // Cập nhật profile
POST   /api/profile/avatar       // Upload avatar

// Events (Volunteer view)
GET    /api/events               // Danh sách events (có filter, pagination)
GET    /api/events/{id}          // Chi tiết event
GET    /api/events/categories    // Danh sách categories

// Join Events
POST   /api/events/{id}/join     // Đăng ký tham gia
DELETE /api/events/{id}/leave    // Hủy đăng ký
GET    /api/my-events            // Lịch sử tham gia

// Channel & Posts (sau khi event approved)
GET    /api/events/{id}/posts    // Xem posts trong kênh event
POST   /api/events/{id}/posts    // Tạo post
PUT    /api/posts/{id}           // Sửa post
DELETE /api/posts/{id}           // Xóa post

// Comments
POST   /api/posts/{id}/comments  // Comment
PUT    /api/comments/{id}        // Sửa comment
DELETE /api/comments/{id}        // Xóa comment

// Likes
POST   /api/posts/{id}/like      // Like post
DELETE /api/posts/{id}/like      // Unlike post
POST   /api/comments/{id}/like   // Like comment

// Notifications
GET    /api/notifications        // Danh sách thông báo
PUT    /api/notifications/{id}/read  // Đánh dấu đã đọc
POST   /api/notifications/register-push  // Đăng ký Web Push

// Dashboard
GET    /api/dashboard            // Dashboard data (events mới, trending, etc)
```

### 3.2 Manager APIs

```php
// Event Management
POST   /api/manager/events       // Tạo event
PUT    /api/manager/events/{id}  // Sửa event
DELETE /api/manager/events/{id}  // Xóa event
GET    /api/manager/events       // Events của manager

// Participant Management
GET    /api/manager/events/{id}/participants  // Danh sách đăng ký
PUT    /api/manager/join-events/{id}/approve  // Duyệt đăng ký
PUT    /api/manager/join-events/{id}/reject   // Từ chối
PUT    /api/manager/join-events/{id}/complete // Đánh dấu hoàn thành

// Reports
GET    /api/manager/events/{id}/report        // Báo cáo event
```

### 3.3 Admin APIs

```php
// Event Approval
GET    /api/admin/events/pending     // Events chờ duyệt
PUT    /api/admin/events/{id}/approve // Duyệt event
PUT    /api/admin/events/{id}/reject  // Từ chối event
DELETE /api/admin/events/{id}         // Xóa event

// User Management
GET    /api/admin/users              // Danh sách users
GET    /api/admin/users/{id}         // Chi tiết user
PUT    /api/admin/users/{id}/ban     // Khóa tài khoản
PUT    /api/admin/users/{id}/unban   // Mở khóa
DELETE /api/admin/users/{id}         // Xóa user

// Export Data
GET    /api/admin/export/events      // Export events (CSV/JSON)
GET    /api/admin/export/users       // Export users
GET    /api/admin/export/participants // Export tham gia

// Dashboard
GET    /api/admin/dashboard          // Admin dashboard
GET    /api/admin/statistics         // Thống kê tổng quan
```

**File cần sửa**: `routes/api.php` - Thêm tất cả routes trên với middleware phù hợp

---

## 🎨 PHẦN 4: BUSINESS LOGIC (Ưu tiên: TRUNG BÌNH)

### 4.1 Event Service

**File**: `app/Services/EventService.php`

#### Cần implement:
- [ ] `createEvent()` - Tạo event (auto status = pending nếu user là manager)
- [ ] `updateEvent()` - Sửa event (chỉ organizer hoặc admin)
- [ ] `deleteEvent()` - Xóa event (soft delete)
- [ ] `approveEvent()` - Admin duyệt → tự động tạo Channel cho event
- [ ] `rejectEvent()` - Admin từ chối
- [ ] `filterEvents()` - Lọc theo category, date, status
- [ ] `searchEvents()` - Tìm kiếm theo keyword
- [ ] `getTrendingEvents()` - Events có nhiều đăng ký/tương tác

### 4.2 JoinEvent Service

**File**: `app/Services/JoinEventService.php`

#### Cần implement:
- [ ] `joinEvent()` - Đăng ký tham gia (check max_participants)
- [ ] `leaveEvent()` - Hủy đăng ký (trước khi event bắt đầu)
- [ ] `approveParticipant()` - Manager duyệt
- [ ] `rejectParticipant()` - Manager từ chối
- [ ] `markComplete()` - Đánh dấu hoàn thành (sau event)
- [ ] `getUserEvents()` - Lấy lịch sử của user
- [ ] `sendJoinNotification()` - Gửi thông báo khi đăng ký

### 4.3 Post & Channel Service

**File**: `app/Services/PostService.php`

#### Cần implement:
- [ ] `createPost()` - Tạo post trong kênh event (chỉ sau khi event approved và user đã join)
- [ ] `updatePost()` - Sửa post (chỉ author hoặc admin)
- [ ] `deletePost()` - Xóa post
- [ ] `getEventPosts()` - Lấy posts của event (phân trang)
- [ ] `uploadImages()` - Upload ảnh cho post

**File**: `app/Services/ChannelService.php` (cần tạo mới)
- [ ] `createChannel()` - Tự động tạo khi event được approve
- [ ] `getChannelPosts()` - Lấy posts trong channel
- [ ] `checkAccess()` - Kiểm tra user có quyền truy cập kênh không

### 4.4 Comment Service

**File**: Cần tạo `app/Services/CommentService.php`

#### Cần implement:
- [ ] `createComment()` - Tạo comment
- [ ] `replyComment()` - Trả lời comment (parent_id)
- [ ] `updateComment()` - Sửa comment
- [ ] `deleteComment()` - Xóa comment

### 4.5 Like Service

**File**: `app/Services/LikeService.php`

#### Cần implement:
- [ ] `likePost()` - Like post (polymorphic)
- [ ] `unlikePost()` - Unlike post
- [ ] `likeComment()` - Like comment
- [ ] `unlikeComment()` - Unlike comment
- [ ] `getLikesCount()` - Đếm likes

### 4.6 Notification Service

**File**: `app/Services/NotiService.php`

#### Cần implement:
- [ ] `sendNotification()` - Gửi thông báo chung
- [ ] `sendJoinApproved()` - Thông báo đăng ký được duyệt
- [ ] `sendJoinRejected()` - Thông báo bị từ chối
- [ ] `sendEventApproved()` - Event được duyệt
- [ ] `sendEventReminder()` - Nhắc nhở trước event
- [ ] `sendNewPost()` - Có post mới trong event
- [ ] `markAsRead()` - Đánh dấu đã đọc
- [ ] `getUnreadCount()` - Đếm chưa đọc

### 4.7 Admin Service

**File**: `app/Services/AdminService.php`

#### Cần implement:
- [ ] `approveEvent()` - Duyệt event
- [ ] `banUser()` - Khóa user
- [ ] `unbanUser()` - Mở khóa user
- [ ] `exportEvents()` - Export dữ liệu events (CSV/JSON)
- [ ] `exportUsers()` - Export dữ liệu users
- [ ] `getDashboardStats()` - Thống kê cho dashboard
- [ ] `getRecentActivities()` - Hoạt động gần đây

---

## 📱 PHẦN 5: WEB PUSH NOTIFICATIONS (Ưu tiên: THẤP)

### 5.1 Setup Web Push

#### ❌ Cần làm:
- [ ] Cài package `minishlink/web-push` (đã có trong composer.json)
- [ ] Tạo VAPID keys
- [ ] Lưu subscription vào DB (bảng `push_subscriptions`)
- [ ] API endpoint đăng ký/hủy đăng ký push

**File**: `app/Utils/WebPushApi.php` (đã tạo sẵn)

#### Cần implement:
- [ ] `generateVAPIDKeys()` - Tạo VAPID keys
- [ ] `subscribe()` - Lưu subscription
- [ ] `unsubscribe()` - Xóa subscription
- [ ] `sendPushNotification()` - Gửi push notification
- [ ] `sendToUser()` - Gửi cho 1 user
- [ ] `sendToMultiple()` - Gửi cho nhiều users

### 5.2 Integration với Notification Service

- [ ] Khi có event mới → push notification
- [ ] Khi đăng ký được duyệt → push
- [ ] Khi có post mới trong event đã join → push
- [ ] Nhắc nhở trước event 1 ngày → push

---

## 📊 PHẦN 6: DASHBOARD & ANALYTICS (Ưu tiên: THẤP)

### 6.1 Dashboard cho mọi role

#### User Dashboard
- [ ] Sự kiện mới công bố (trong 7 ngày)
- [ ] Sự kiện có tin bài mới (trong events đã join)
- [ ] Sự kiện trending (tăng thành viên nhanh)
- [ ] Lịch sử tham gia

#### Manager Dashboard
- [ ] Events của mình
- [ ] Số lượng đăng ký chờ duyệt
- [ ] Thống kê tham gia
- [ ] Events trending trong những event mình quản lý

#### Admin Dashboard
- [ ] Tổng số users (volunteer, manager, admin)
- [ ] Tổng số events (pending, approved, completed)
- [ ] Events chờ duyệt
- [ ] Hoạt động gần đây
- [ ] Biểu đồ thống kê theo thời gian

**File cần tạo**: `app/Services/DashboardService.php`

---

## 🧪 PHẦN 7: TESTING & VALIDATION (Ưu tiên: TRUNG BÌNH)

### 7.1 Validation

#### Cần tạo Form Requests:
```bash
php artisan make:request StoreEventRequest
php artisan make:request UpdateEventRequest
php artisan make:request StorePostRequest
php artisan make:request StoreCommentRequest
```

#### Validation rules cần implement:
- [ ] Event validation (title, date, location, max_participants)
- [ ] Post validation (content length, images format)
- [ ] Comment validation
- [ ] User profile validation

### 7.2 Testing

#### Unit Tests (optional):
- [ ] AuthService tests
- [ ] EventService tests
- [ ] JoinEventService tests

#### Feature Tests:
- [ ] Register/Login flow
- [ ] Create event flow
- [ ] Join event flow
- [ ] Post/Comment flow

---

## 🎨 PHẦN 8: FRONTEND INTEGRATION (Ưu tiên: THẤP)

### 8.1 API Documentation

- [ ] Tạo Postman Collection cho tất cả APIs
- [ ] Viết API documentation (Swagger/OpenAPI)
- [ ] Test tất cả endpoints

### 8.2 Frontend Tasks

**File location**: `frontend/src/`

#### Cần implement:
- [ ] Authentication pages (login, register, forgot password)
- [ ] Event listing page (với filter, search)
- [ ] Event detail page
- [ ] Event channel page (wall giống Facebook)
- [ ] Dashboard pages (theo role)
- [ ] Profile page
- [ ] Notification center
- [ ] Admin panel (user management, event approval)

---

## 🚀 THỨ TỰ ƯU TIÊN THỰC HIỆN

### GIAI ĐOẠN 1 (1-2 tuần): DATABASE & AUTH ✅
1. ✅ Tạo tất cả migrations
2. ✅ Chạy migrations
3. ✅ Hoàn thiện Authentication (register, login, logout)
4. ⚠️ Implement Authorization (middleware, policies)
5. ⚠️ Seed data mẫu để test

### GIAI ĐOẠN 2 (2-3 tuần): CORE FEATURES
1. ⏳ Event CRUD APIs (create, read, update, delete)
2. ⏳ Event approval flow (manager tạo → admin duyệt)
3. ⏳ Join/Leave event APIs
4. ⏳ Participant approval (manager duyệt đăng ký)
5. ⏳ Channel tự động tạo khi event approved

### GIAI ĐOẠN 3 (1-2 tuần): SOCIAL FEATURES
1. ⏳ Post/Comment/Like APIs
2. ⏳ Channel access control (chỉ members)
3. ⏳ Image upload cho posts
4. ⏳ Real-time updates (optional, dùng WebSocket)

### GIAI ĐOẠN 4 (1 tuần): NOTIFICATIONS
1. ⏳ Basic notification system
2. ⏳ Web Push setup
3. ⏳ Email notifications (optional)

### GIAI ĐOẠN 5 (1 tuần): ADMIN & REPORTS
1. ⏳ Admin APIs (user management, event approval)
2. ⏳ Export data (CSV/JSON)
3. ⏳ Dashboard statistics

### GIAI ĐOẠN 6 (2-3 tuần): FRONTEND
1. ⏳ Authentication UI
2. ⏳ Event listing & detail
3. ⏳ Event channel (wall)
4. ⏳ Dashboard pages
5. ⏳ Admin panel

### GIAI ĐOẠN 7 (1 tuần): TESTING & DEPLOYMENT
1. ⏳ API testing
2. ⏳ Bug fixes
3. ⏳ Deployment setup
4. ⏳ Documentation

---

## 📝 GHI CHÚ QUAN TRỌNG

### Các vấn đề cần lưu ý:

1. **Phân quyền**: 
   - Volunteer chỉ xem events approved
   - Manager chỉ sửa/xóa events của mình
   - Admin có quyền cao nhất

2. **Event Channel**:
   - Chỉ tạo khi event được approve
   - Chỉ members (đã join và approved) mới post/comment được
   - Organizer và Admin luôn có quyền

3. **Validation**:
   - Max participants không được vượt quá
   - Không được join event đã full
   - Không được hủy sau khi event bắt đầu

4. **Notification timing**:
   - Ngay khi đăng ký → thông báo pending
   - Khi được duyệt → thông báo approved
   - 1 ngày trước event → reminder
   - Khi có post mới trong event → real-time notification

5. **Performance**:
   - Sử dụng pagination cho danh sách
   - Cache dashboard data
   - Optimize queries (eager loading)
   - Index các cột thường search

---

## 🛠️ CÔNG CỤ & PACKAGES CẦN DÙNG

### Backend (Laravel)
- ✅ `laravel/framework` - Framework chính
- ✅ `minishlink/web-push` - Web Push notifications
- ⏳ `league/csv` - Export CSV
- ⏳ `barryvdh/laravel-debugbar` - Debug (dev only)
- ⏳ `spatie/laravel-permission` - Role & Permission (optional, có thể dùng cách thủ công)

### Frontend (Next.js)
- ✅ `react`, `next` - Framework
- ⏳ `axios` - HTTP client
- ⏳ `react-query` - Data fetching & caching
- ⏳ `tailwindcss` - Styling (đã có)
- ⏳ `react-icons` - Icons (đã có)
- ⏳ `date-fns` hoặc `dayjs` - Date formatting
- ⏳ `react-hook-form` - Form handling
- ⏳ `zod` - Validation

---

## 📞 HỖ TRỢ & TÀI LIỆU

### Tài liệu tham khảo:
- Laravel Documentation: https://laravel.com/docs
- Web Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- Next.js Documentation: https://nextjs.org/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/

### Contact:
- Developer: [Tên bạn]
- Project: Volunteer Management System
- Start Date: 31/10/2025
- Target Completion: [Ngày dự kiến]

---

**Cập nhật lần cuối**: 04/11/2025  
**Tổng số tasks**: ~150+  
**Hoàn thành**: ~20%  
**Thời gian dự kiến**: 8-12 tuần (full-time)


1️⃣ MANAGER tạo event
   ↓
   EVENTS (status = "pending")

2️⃣ ADMIN duyệt event
   ↓
   EVENTS (status = "approved")
   ↓
   TỰ ĐỘNG tạo CHANNELS
   ↓
   NOTIFICATIONS gửi cho manager

3️⃣ VOLUNTEER xem danh sách events approved
   ↓
   Chọn event và đăng ký
   ↓
   JOIN_EVENTS (status = "pending")
   ↓
   NOTIFICATIONS gửi cho manager

4️⃣ MANAGER duyệt đăng ký
   ↓
   JOIN_EVENTS (status = "approved")
   ↓
   NOTIFICATIONS gửi cho volunteer
   ↓
   Volunteer có quyền truy cập CHANNEL

5️⃣ MEMBERS tương tác trong CHANNEL
   ↓
   Tạo POSTS (chia sẻ thông tin)
   ↓
   COMMENTS (thảo luận)
   ↓
   LIKES (tương tác)
   ↓
   MESSAGES (chat nhanh)
   ↓
   NOTIFICATIONS gửi cho members khác

6️⃣ SAU EVENT
   ↓
   MANAGER đánh dấu hoàn thành
   ↓
   JOIN_EVENTS (status = "completed")
   ↓
   EVENTS (status = "completed")
   ↓
   NOTIFICATIONS cảm ơn volunteers



   - [ ] /home/forgot-password/page.tsx       - Form quên mật khẩu
- [ ] /home/reset-password/page.tsx        - Form reset mật khẩu
- [ ] /home/verify-email/page.tsx          - Trang xác nhận email
- [ ] /user/profile/page.tsx               - Trang profile user
- [ ] /manager/profile/page.tsx            - Trang profile manager  
- [ ] /admin/profile/page.tsx              - Trang profile admin
- [ ] /user/settings/page.tsx              - Cài đặt tài khoản


# 🎨 FRONTEND ARCHITECTURE - VOLUNTEER WEB

## 📋 MỤC LỤC
1. [Tổng quan Frontend](#1-tổng-quan-frontend)
2. [Cấu trúc thư mục chi tiết](#2-cấu-trúc-thư-mục-chi-tiết)
3. [User Flow - Tình nguyện viên](#3-user-flow---tình-nguyện-viên)
4. [Manager Flow - Quản lý sự kiện](#4-manager-flow---quản-lý-sự-kiện)
5. [Admin Flow - Quản trị viên](#5-admin-flow---quản-trị-viên)
6. [Component Architecture](#6-component-architecture)
7. [State Management](#7-state-management)
8. [API Integration](#8-api-integration)
9. [Routing Strategy](#9-routing-strategy)

---

## 1. TỔNG QUAN FRONTEND

### 1.1. Tech Stack
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.x
- **HTTP Client**: Axios
- **Icons**: React Icons (Font Awesome)
- **State**: React Hooks (useState, useEffect)
- **Storage**: localStorage (token, user data)

### 1.2. Key Features
- ✅ **Server-Side Rendering (SSR)**: Faster initial load
- ✅ **Client-Side Navigation**: Smooth page transitions
- ✅ **Role-based UI**: Different layouts for User/Manager/Admin
- ✅ **Real-time updates**: Auto-refresh after actions
- ✅ **Responsive Design**: Mobile-first approach

---

## 2. CẤU TRÚC THƯ MỤC CHI TIẾT
frontend/
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── layout.tsx # Root layout (global)
│ │ ├── page.tsx # Landing page
│ │ ├── globals.css # Global styles
│ │ │
│ │ ├── home/ # 🏠 PUBLIC PAGES
│ │ │ ├── login/
│ │ │ │ └── page.tsx # Đăng nhập (email/password)
│ │ │ └── register/
│ │ │ └── page.tsx # Đăng ký tài khoản
│ │ │
│ │ ├── user/ # 👤 USER ROLE (Tình nguyện viên)
│ │ │ ├── layout.tsx # User layout (NavbarUser)
│ │ │ │
│ │ │ ├── dashboard/
│ │ │ │ └── page.tsx # Dashboard - Tổng hợp hoạt động
│ │ │ │ # - Sự kiện đã tham gia
│ │ │ │ # - Điểm tích lũy
│ │ │ │ # - Thống kê cá nhân
│ │ │ │
│ │ │ ├── events/ # Quản lý sự kiện
│ │ │ │ ├── page.tsx # Danh sách sự kiện
│ │ │ │ │ # - Xem tất cả sự kiện
│ │ │ │ │ # - Lọc theo category
│ │ │ │ │ # - Tìm kiếm
│ │ │ │ └── [id]/
│ │ │ │ └── page.tsx # Chi tiết sự kiện
│ │ │ │ # - Xem thông tin chi tiết
│ │ │ │ # - Nút "Tham gia"
│ │ │ │ # - Danh sách thành viên
│ │ │ │
│ │ │ ├── my-events/
│ │ │ │ └── page.tsx # Sự kiện của tôi
│ │ │ │ # - Đang chờ duyệt
│ │ │ │ # - Đã được duyệt
│ │ │ │ # - Đã hoàn thành
│ │ │ │ # - Nút "Hủy đăng ký"
│ │ │ │
│ │ │ ├── posts/ # Bài viết/Hoạt động
│ │ │ │ ├── page.tsx # Feed bài viết
│ │ │ │ │ # - Xem tất cả posts
│ │ │ │ │ # - Like/Comment
│ │ │ │ └── [id]/
│ │ │ │ └── page.tsx # Chi tiết bài viết
│ │ │ │ # - Xem bài viết
│ │ │ │ # - Danh sách comments
│ │ │ │ # - Thêm comment
│ │ │ │
│ │ │ ├── profile/
│ │ │ │ └── page.tsx # Hồ sơ cá nhân
│ │ │ │ # - Xem thông tin
│ │ │ │ # - Cập nhật profile
│ │ │ │ # - Đổi avatar
│ │ │ │ # - Lịch sử hoạt động
│ │ │ │
│ │ │ ├── notifications/
│ │ │ │ └── page.tsx # Thông báo
│ │ │ │ # - Thông báo mới
│ │ │ │ # - Đánh dấu đã đọc
│ │ │ │
│ │ │ └── chat/
│ │ │ └── [channelId]/
│ │ │ └── page.tsx # Chat kênh sự kiện
│ │ │ # - Trò chuyện realtime
│ │ │ # - Gửi tin nhắn
│ │ │
│ │ ├── manager/ # 👔 MANAGER ROLE (Quản lý)
│ │ │ ├── layout.tsx # Manager layout (NavbarManager)
│ │ │ │
│ │ │ ├── dashboard/
│ │ │ │ └── page.tsx # Dashboard quản lý
│ │ │ │ # - Tổng số sự kiện
│ │ │ │ # - Tổng thành viên
│ │ │ │ # - Thống kê tham gia
│ │ │ │ # - Biểu đồ
│ │ │ │
│ │ │ ├── events/
│ │ │ │ ├── page.tsx # Quản lý sự kiện
│ │ │ │ │ # - Danh sách sự kiện của tôi
│ │ │ │ │ # - Trạng thái: pending/approved
│ │ │ │ │ # - Nút "Tạo sự kiện mới"
│ │ │ │ │
│ │ │ │ ├── create/
│ │ │ │ │ └── page.tsx # Tạo sự kiện mới
│ │ │ │ │ # - Form nhập thông tin:
│ │ │ │ │ # + title, description
│ │ │ │ │ # + location, dates
│ │ │ │ │ # + max_participants
│ │ │ │ │ # + points, category
│ │ │ │ │ # + image upload
│ │ │ │ │ # - Validate input
│ │ │ │ │ # - POST /api/manager/createEvent
│ │ │ │ │
│ │ │ │ └── [id]/
│ │ │ │ ├── page.tsx # Chi tiết/Chỉnh sửa
│ │ │ │ │ # - Xem thông tin
│ │ │ │ │ # - Sửa thông tin
│ │ │ │ │ # - Xóa sự kiện
│ │ │ │ │
│ │ │ │ └── participants/
│ │ │ │ └── page.tsx # Quản lý thành viên
│ │ │ │ # - Danh sách đăng ký
│ │ │ │ # - Nút "Duyệt"
│ │ │ │ # - Nút "Từ chối"
│ │ │ │
│ │ │ ├── members/
│ │ │ │ └── page.tsx # Thành viên toàn bộ
│ │ │ │ # - Xem báo cáo
│ │ │ │ # - Xuất dữ liệu
│ │ │ │
│ │ │ ├── posts/
│ │ │ │ ├── page.tsx # Quản lý bài viết
│ │ │ │ └── create/
│ │ │ │ └── page.tsx # Tạo bài viết
│ │ │ │
│ │ │ └── notifications/
│ │ │ └── page.tsx # Thông báo manager
│ │ │
│ │ └── admin/ # 👑 ADMIN ROLE (Quản trị)
│ │ ├── layout.tsx # Admin layout (NavbarAdmin)
│ │ │
│ │ ├── dashboard/
│ │ │ └── page.tsx # Dashboard admin
│ │ │ # - Tổng số users
│ │ │ # - Tổng số events
│ │ │ # - Tổng số managers
│ │ │ # - Biểu đồ thống kê
│ │ │ # - Hoạt động gần đây
│ │ │
│ │ ├── users/
│ │ │ ├── page.tsx # Quản lý users
│ │ │ │ # - Danh sách tất cả users
│ │ │ │ # - Tìm kiếm user
│ │ │ │ # - Nút "Ban/Unban"
│ │ │ │ # - Xem lịch sử
│ │ │ │
│ │ │ └── [id]/
│ │ │ └── page.tsx # Chi tiết user
│ │ │ # - Thông tin chi tiết
│ │ │ # - Lịch sử hoạt động
│ │ │ # - Ban/Unban
│ │ │
│ │ ├── events/
│ │ │ ├── page.tsx # Duyệt sự kiện
│ │ │ │ # - Danh sách pending events
│ │ │ │ # - Nút "Approve"
│ │ │ │ # - Nút "Reject"
│ │ │ │ # - Xóa event
│ │ │ │
│ │ │ └── [id]/
│ │ │ └── page.tsx # Chi tiết event
│ │ │ # - Xem đầy đủ thông tin
│ │ │ # - Approve/Reject
│ │ │ # - Delete
│ │ │
│ │ ├── managers/
│ │ │ ├── page.tsx # Quản lý managers
│ │ │ │ # - Danh sách managers
│ │ │ │ # - Nút "Tạo manager mới"
│ │ │ │
│ │ │ └── create/
│ │ │ └── page.tsx # Tạo tài khoản manager
│ │ │ # - Form tạo manager
│ │ │ # - POST /api/admin/createManager
│ │ │
│ │ ├── posts/
│ │ │ └── page.tsx # Quản lý posts
│ │ │ # - Xem tất cả posts
│ │ │ # - Xóa post vi phạm
│ │ │
│ │ └── reports/
│ │ └── page.tsx # Báo cáo/Thống kê
│ │ # - Xuất báo cáo CSV/JSON
│ │ # - Thống kê theo tháng
│ │
│ ├── components/ # 🧩 COMPONENTS
│ │ ├── layout/
│ │ │ ├── Navbar.tsx # Navbar chung (role router)
│ │ │ ├── NavbarUser.tsx # Navbar cho user
│ │ │ ├── NavbarManager.tsx # Navbar cho manager
│ │ │ ├── NavbarAdmin.tsx # Navbar cho admin
│ │ │ ├── Footer.tsx # Footer
│ │ │ └── Sidebar.tsx # Sidebar (optional)
│ │ │
│ │ ├── events/
│ │ │ ├── EventCard.tsx # Card hiển thị event
│ │ │ ├── EventList.tsx # Danh sách events
│ │ │ ├── EventForm.tsx # Form tạo/sửa event
│ │ │ ├── EventDetails.tsx # Chi tiết event
│ │ │ └── JoinEventButton.tsx # Nút tham gia
│ │ │
│ │ ├── posts/
│ │ │ ├── PostCard.tsx # Card bài viết
│ │ │ ├── PostList.tsx # Danh sách posts
│ │ │ ├── PostForm.tsx # Form tạo post
│ │ │ └── CommentSection.tsx # Comments
│ │ │
│ │ ├── users/
│ │ │ ├── UserCard.tsx # Card user
│ │ │ ├── UserTable.tsx # Bảng users
│ │ │ └── UserProfile.tsx # Profile card
│ │ │
│ │ ├── common/
│ │ │ ├── Button.tsx # Button component
│ │ │ ├── Input.tsx # Input field
│ │ │ ├── Modal.tsx # Modal dialog
│ │ │ ├── LoadingSpinner.tsx # Loading indicator
│ │ │ ├── Pagination.tsx # Pagination
│ │ │ └── SearchBar.tsx # Search input
│ │ │
│ │ └── dashboard/
│ │ ├── StatCard.tsx # Thẻ thống kê
│ │ ├── Chart.tsx # Biểu đồ
│ │ └── RecentActivity.tsx # Hoạt động gần đây
│ │
│ └── utils/ # 🛠️ UTILITIES
│ ├── api.ts # API client (axios)
│ ├── auth.ts # Auth helpers
│ ├── formatters.ts # Format date, number
│ ├── validators.ts # Form validation
│ └── constants.ts # Constants
│
├── public/ # Static files
│ ├── images/
│ ├── icons/
│ └── fonts/
│
├── next.config.ts # Next.js config
├── tailwind.config.ts # Tailwind config
├── tsconfig.json # TypeScript config
└── package.json # Dependencies

┌─────────┐ ┌──────────────┐ ┌─────────────┐ ┌──────────┐
│ Browser │ │ /home/ │ │ API │ │ Backend │
│ │ │ register │ │ Client │ │ Laravel │
└────┬────┘ └──────┬───────┘ └──────┬──────┘ └────┬─────┘
│ │ │ │
│ 1. Truy cập │ │ │
│ /home/register │ │ │
├────────────────────>│ │ │
│ │ │ │
│ 2. Render form │ │ │
│<────────────────────┤ │ │
│ │ │ │
│ 3. User điền form: │ │ │
│ - name │ │ │
│ - email │ │ │
│ - password │ │ │
│ - phone │ │ │
│ - address │ │ │
│ │ │ │
│ 4. Click "Đăng ký" │ │ │
├────────────────────>│ │ │
│ │ │ │
│ │ 5. Validate client │ │
│ │ - Email format │ │
│ │ - Password length │ │
│ │ │ │
│ │ 6. POST /api/register │ │
│ ├───────────────────────>│ │
│ │ │ │
│ │ │ 7. POST /register │
│ │ ├────────────────────>│
│ │ │ │
│ │ │ 8. Validate input │
│ │ │ Check email dup │
│ │ │ Hash password │
│ │ │ Create user │
│ │ │ role='user' │
│ │ │ │
│ │ │ 9. Return user data │
│ │ │<────────────────────┤
│ │ │ │
│ │ 10. {message, user} │ │
│ │<───────────────────────┤ │
│ │ │ │
│ 11. Show success │ │ │
│ Redirect login │ │ │
│<────────────────────┤ │ │
│ │ │ │
│ 12. Redirect to │ │ │
│ /home/login │ │ │
├────────────────────>│ │ │

┌─────────┐ ┌──────────────┐ ┌─────────────┐ ┌──────────┐
│ Browser │ │ /home/login │ │ API Client │ │ Backend │
└────┬────┘ └──────┬───────┘ └──────┬──────┘ └────┬─────┘
│ │ │ │
│ 1. Nhập email/pass │ │ │
│ Click "Đăng nhập" │ │ │
├────────────────────>│ │ │
│ │ │ │
│ │ 2. POST /api/login │ │
│ ├───────────────────────>│ │
│ │ │ │
│ │ │ 3. POST /login │
│ │ ├────────────────────>│
│ │ │ │
│ │ │ 4. Find user │
│ │ │ Check password │
│ │ │ Delete old token │
│ │ │ Create new token │
│ │ │ │
│ │ │ 5. {user, token} │
│ │ │<────────────────────┤
│ │ │ │
│ │ 6. Response data │ │
│ │<───────────────────────┤ │
│ │ │ │
│ │ 7. localStorage. │ │
│ │ setItem('token') │ │
│ │ setItem('user') │ │
│ │ │ │
│ │ 8. Check user.role │ │
│ │ if (role==='user') │ │
│ │ → /user/dashboard │ │
│ │ │ │
│ 9. Redirect │ │ │
│<────────────────────┤ │ │

3.3. Tham gia sự kiện
3.3.1. Sequence Diagram
3.3.2. Component: EventCard.tsx
3.4. Xem Dashboard
3.4.1. Page: page.tsx
4. MANAGER FLOW - QUẢN LÝ SỰ KIỆN
4.1. Tạo sự kiện
4.1.1. Page: page.tsx
4.2. Duyệt tình nguyện viên
4.2.1. Sequence Diagram - Duyệt thành viên
4.2.2. Page: page.tsx
Sorry, the response hit the length limit. Please rephrase your prompt.

Claude Sonnet 4.5 • 1x
