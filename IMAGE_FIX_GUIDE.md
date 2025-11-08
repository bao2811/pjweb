# Hướng dẫn Fix lỗi Next.js Image

## ❌ Lỗi gốc

```
Invalid src prop (https://www.google.com/url?sa=t&source=web...) on `next/image`,
hostname "www.google.com" is not configured under images in your `next.config.js`
```

## ✅ Giải pháp đã áp dụng

### 1. Cập nhật `next.config.ts`

Đã thêm các hostname được phép:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "jbagy.me",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "images.unsplash.com",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "www.google.com",
      pathname: "/**",
    },
    {
      protocol: "http",
      hostname: "localhost",
      pathname: "/**",
    },
  ],
  dangerouslyAllowSVG: true,
  contentDispositionType: 'attachment',
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
},
```

### 2. Restart Dev Server

**QUAN TRỌNG**: Phải restart dev server để cấu hình có hiệu lực!

```bash
# Trong terminal frontend
Ctrl + C  # Dừng server hiện tại
npm run dev  # Khởi động lại
```

## ⚠️ Lưu ý quan trọng

### URL redirect của Google

URL bạn đang dùng:

```
https://www.google.com/url?sa=t&source=web&rct=j&url=https%3A%2F%2Fjbagy.me%2Fanh-avatar-zalo-dep%2F...
```

Đây là URL **redirect** của Google Search, **KHÔNG PHẢI** URL hình ảnh trực tiếp!

### ✅ Cách tốt hơn:

1. **Tìm URL hình ảnh gốc:**

   - Click chuột phải vào ảnh → Copy image address
   - Hoặc decode URL trên: `https://jbagy.me/anh-avatar-zalo-dep/`

2. **Dùng URL trực tiếp từ CDN/Storage:**

   ```
   https://images.unsplash.com/photo-xxx
   https://your-domain.com/images/avatar.jpg
   ```

3. **Upload lên project:**
   - Lưu ảnh trong `/public/images/`
   - Dùng: `src="/images/avatar.jpg"` (không cần hostname)

## 📝 Các domain đã được cấu hình

| Domain                | Mục đích                     |
| --------------------- | ---------------------------- |
| `jbagy.me`            | Avatar từ jbagy.me           |
| `images.unsplash.com` | Ảnh stock từ Unsplash        |
| `www.google.com`      | Google URLs (nên tránh dùng) |
| `localhost`           | Development images           |

## 🔧 Thêm domain mới

Nếu cần load ảnh từ domain khác, thêm vào `remotePatterns`:

```typescript
{
  protocol: "https",
  hostname: "your-domain.com",
  pathname: "/**",
}
```

## 🎯 Best Practices

### ✅ Nên làm:

- Dùng URL hình ảnh trực tiếp
- Upload ảnh vào `/public` cho static assets
- Dùng CDN chuyên dụng (Cloudinary, imgix, etc.)
- Optimize kích thước ảnh trước khi upload

### ❌ Không nên:

- Dùng URL redirect (Google, Facebook share links, etc.)
- Dùng ảnh quá lớn (> 1MB)
- Hardcode URL từ nhiều nguồn khác nhau
- Dùng `unoptimized={true}` không cần thiết

## 🖼️ Component Image đúng cách

### Với external URL:

```tsx
<Image
  src="https://images.unsplash.com/photo-xxx"
  alt="Description"
  width={100}
  height={100}
  className="rounded-full"
/>
```

### Với local image:

```tsx
<Image
  src="/images/avatar.jpg"
  alt="Description"
  width={100}
  height={100}
  className="rounded-full"
/>
```

### Với base64 (inline):

```tsx
<Image
  src="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  alt="Description"
  width={100}
  height={100}
  unoptimized // Bắt buộc với base64
/>
```

### Với fallback khi lỗi:

```tsx
<Image
  src={user?.avatar || "/images/default-avatar.png"}
  alt="User Avatar"
  width={40}
  height={40}
  onError={(e) => {
    e.currentTarget.src = "/images/default-avatar.png";
  }}
/>
```

## 🚨 Xử lý lỗi runtime

Nếu vẫn gặp lỗi sau khi restart:

1. **Clear Next.js cache:**

   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check terminal logs** để xem domain nào bị thiếu

3. **Kiểm tra URL** trong DevTools Network tab

4. **Thêm domain** vào next.config.ts nếu cần

## 📦 File đã thay đổi

- ✅ `/frontend/next.config.ts` - Thêm remotePatterns

## 🔄 Sau khi sửa

1. ✅ Restart dev server
2. ⏳ Đợi rebuild hoàn tất
3. 🔄 Refresh browser
4. ✅ Lỗi sẽ biến mất!

---

**Lưu ý cuối:** Nếu vẫn thấy lỗi, hãy check URL chính xác đang được dùng trong code và đảm bảo domain của URL đó đã có trong `remotePatterns`.
