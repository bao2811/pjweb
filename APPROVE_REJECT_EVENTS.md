# Hướng dẫn sử dụng chức năng Duyệt/Từ chối sự kiện

## 📋 Tổng quan

Tính năng này cho phép Admin duyệt hoặc từ chối các sự kiện đang chờ xét duyệt (status = 'pending').

## 🎯 Luồng hoạt động

### 1. Tạo sự kiện mới

- Khi user/manager tạo sự kiện mới, status mặc định là `pending`
- Sự kiện sẽ xuất hiện trong trang Admin Events với badge màu vàng "Chờ duyệt"

### 2. Admin xem và duyệt sự kiện

#### Trong danh sách sự kiện:

- Sự kiện có status `pending` sẽ hiển thị 2 nút:
  - **Nút Duyệt** (màu xanh lá): Chấp nhận sự kiện
  - **Nút Từ chối** (màu đỏ): Từ chối sự kiện
- Ngoài ra còn có nút "Chi tiết", "Xem thành viên", "Xóa sự kiện"

#### Trong modal chi tiết:

- Nếu sự kiện có status `pending`, footer sẽ hiển thị:
  - Nút **Đóng**
  - Nút **Từ chối** (màu đỏ)
  - Nút **Duyệt sự kiện** (màu xanh lá)

### 3. Kết quả sau khi duyệt/từ chối

**Khi DUYỆT sự kiện:**

- Status thay đổi từ `pending` → `upcoming`
- Sự kiện được hiển thị như sự kiện bình thường
- Thông báo: "Duyệt sự kiện thành công!"

**Khi TỪ CHỐI sự kiện:**

- Status thay đổi từ `pending` → `cancelled`
- Sự kiện bị xóa khỏi danh sách (tùy logic frontend)
- Thông báo: "Từ chối sự kiện thành công!"

## 🔧 Các trạng thái sự kiện

| Trạng thái  | Mô tả                       | Màu badge  |
| ----------- | --------------------------- | ---------- |
| `pending`   | Chờ duyệt                   | Vàng       |
| `upcoming`  | Sắp diễn ra (đã được duyệt) | Xanh lá    |
| `ongoing`   | Đang diễn ra                | Xanh dương |
| `ended`     | Đã kết thúc                 | Xám        |
| `cancelled` | Đã hủy/từ chối              | Đỏ         |

## 📡 API Backend

### Accept Event

```http
DELETE /api/admin/acceptEvent/{id}
```

**Response:**

```json
{
  "message": "complete accept event"
}
```

### Reject Event

```http
DELETE /api/admin/rejectEvent/{id}
```

**Response:**

```json
{
  "message": "complete reject event"
}
```

## 🎨 Giao diện

### Danh sách sự kiện (Event Card)

```tsx
// Sự kiện pending sẽ có 2 nút đặc biệt
{
  event.status === "pending" && (
    <>
      <button onClick={handleAcceptEvent}>
        <FaCheckCircle /> Duyệt
      </button>
      <button onClick={handleRejectEvent}>
        <FaTimes /> Từ chối
      </button>
    </>
  );
}
```

### Modal chi tiết

```tsx
// Footer thay đổi theo status
{selectedEvent.status === 'pending' ? (
  // Hiển thị nút Duyệt/Từ chối
) : (
  // Hiển thị nút Xem thành viên/Xóa sự kiện
)}
```

## 📝 Lưu ý quan trọng

1. **Migration Database**: Default status đã được đổi từ `upcoming` → `pending`

   ```php
   $table->string('status')->default('pending');
   ```

2. **EventRepo**: Status được cập nhật đúng theo tiêu chuẩn:

   - Accept: `pending` → `upcoming`
   - Reject: `pending` → `cancelled`

3. **Frontend**: Sử dụng optimistic UI:
   - Cập nhật state local ngay lập tức
   - Hiển thị alert cho user
   - Xử lý lỗi với try-catch

## 🧪 Test

### Test Case 1: Duyệt sự kiện

1. Tạo sự kiện mới với status = `pending`
2. Vào Admin Events → Click nút "Duyệt" trên card
3. Confirm dialog xuất hiện
4. Sau khi confirm, status → `upcoming`, badge chuyển màu xanh

### Test Case 2: Từ chối sự kiện

1. Tạo sự kiện mới với status = `pending`
2. Vào Admin Events → Click nút "Từ chối"
3. Confirm dialog xuất hiện
4. Sau khi confirm, sự kiện biến mất khỏi danh sách

### Test Case 3: Modal chi tiết

1. Click vào nút "Chi tiết" của sự kiện pending
2. Footer hiển thị nút "Duyệt" và "Từ chối"
3. Click "Duyệt" → Modal đóng, sự kiện được approve
4. Click "Từ chối" → Modal đóng, sự kiện bị reject

## 🔐 Bảo mật

- ✅ Chỉ Admin mới được phép duyệt/từ chối
- ✅ Route được protect bởi middleware auth + role check
- ✅ Confirm dialog trước khi thực hiện action
- ✅ Error handling đầy đủ

## 📦 Files đã thay đổi

### Frontend

- `/frontend/src/app/admin/events/page.tsx`
  - Thêm `handleAcceptEvent()`
  - Thêm `handleRejectEvent()`
  - Cập nhật UI trong event card
  - Cập nhật UI trong modal footer

### Backend

- `/backend/app/Repositories/EventRepo.php`
  - Sửa `acceptEvent()`: status = 'upcoming'
  - Sửa `rejectEvent()`: status = 'cancelled'
- `/backend/database/migrations/create_events_table.php`
  - Thay đổi default status: 'upcoming' → 'pending'
  - Cập nhật comment: thêm 'pending' vào danh sách status

## ✅ Hoàn thành

Tính năng duyệt/từ chối sự kiện đã được triển khai đầy đủ:

- ✅ Backend API
- ✅ Frontend UI
- ✅ Database migration
- ✅ Error handling
- ✅ Optimistic UI updates
- ✅ User feedback (alerts)

## 🚀 Cải tiến trong tương lai

- [ ] Thêm lý do khi từ chối sự kiện
- [ ] Gửi thông báo email cho người tạo sự kiện
- [ ] Lưu lịch sử duyệt/từ chối
- [ ] Thêm bulk approve/reject
- [ ] Dashboard thống kê sự kiện chờ duyệt
