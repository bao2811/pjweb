# Hướng Dẫn Triển Khai JWT Cho Volunteer Web

## 📋 Tổng Quan

Hiện tại hệ thống đang dùng **Laravel Sanctum** (token-based), cần chuyển sang **JWT** để quản lý phiên đăng nhập tốt hơn.

## 🔍 Phân Tích Hiện Trạng

### ✅ Đã Có:
1. **Backend:**
   - ✅ `JWTUtil.php` - Class generate/validate JWT
   - ✅ `JwtMiddleware.php` - Middleware xác thực
   - ✅ Firebase JWT package đã cài
   - ❌ Chưa config JWT_SECRET trong .env
   - ❌ AuthController vẫn dùng Sanctum
   - ❌ Middleware chưa được đăng ký

2. **Frontend:**
   - ✅ `api.ts` - Axios interceptor gửi token
   - ✅ Login page lưu token vào localStorage
   - ✅ Các component đọc token từ localStorage
   - ⚠️ Chưa có auto logout khi token hết hạn
   - ⚠️ Chưa có refresh token mechanism

---

## 🔧 BACKEND - Các Bước Cần Sửa

### 1️⃣ Thêm JWT_SECRET vào `.env`

```bash
# Thêm vào file backend/.env
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
JWT_EXPIRY_MINUTES=60
JWT_REFRESH_EXPIRY_DAYS=7
```

**Tạo secret key ngẫu nhiên:**
```bash
# Trong container Laravel
docker exec laravel_app php artisan key:generate
# Hoặc dùng openssl
openssl rand -base64 32
```

---

### 2️⃣ Sửa `AuthController.php` - Chuyển từ Sanctum sang JWT

**File:** `backend/app/Http/Controllers/AuthController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Utils\JWTUtil;
use App\Services\UserService;

class AuthController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * 🔐 Login với JWT
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'error' => 'Email hoặc mật khẩu không đúng'
            ], 401);
        }

        // 🔥 TẠO JWT TOKEN thay vì Sanctum
        $accessToken = JWTUtil::generateToken($user->id, 60); // 60 phút
        $refreshToken = JWTUtil::generateToken($user->id, 60 * 24 * 7); // 7 ngày

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'phone' => $user->phone,
            ],
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => 3600, // seconds
        ]);
    }

    /**
     * 📝 Register
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'addressCard' => 'nullable|string|max:12',
            'avatar' => 'nullable|string|max:500',
        ]);

        $userData = $request->only(['name', 'email', 'password', 'phone', 'address', 'addressCard', 'avatar']);
        $userData['role'] = 'user';

        $result = $this->userService->createUser($userData);

        if (!$result['success']) {
            return response()->json([
                'error' => $result['message']
            ], 400);
        }

        $user = $result['data'];

        // 🔥 Tự động tạo token sau khi đăng ký
        $accessToken = JWTUtil::generateToken($user->id, 60);
        $refreshToken = JWTUtil::generateToken($user->id, 60 * 24 * 7);

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * 🚪 Logout (Blacklist token nếu cần)
     */
    public function logout(Request $request)
    {
        // JWT là stateless, không cần xóa token trên server
        // Chỉ cần frontend xóa token
        // Nếu muốn blacklist token, cần implement Redis cache
        
        return response()->json([
            'message' => 'Đăng xuất thành công'
        ]);
    }

    /**
     * 🔄 Refresh Access Token
     */
    public function refresh(Request $request)
    {
        try {
            $refreshToken = JWTUtil::extractToken($request);
            $decoded = JWTUtil::validateToken($refreshToken);
            
            // Tạo access token mới
            $newAccessToken = JWTUtil::generateToken($decoded->sub, 60);
            
            return response()->json([
                'access_token' => $newAccessToken,
                'token_type' => 'Bearer',
                'expires_in' => 3600,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Invalid refresh token'
            ], 401);
        }
    }

    /**
     * 👤 Get Current User Info
     */
    public function me(Request $request)
    {
        $userId = $request->attributes->get('userId');
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'phone' => $user->phone,
                'address' => $user->address,
            ]
        ]);
    }
}
```

---

### 3️⃣ Cập Nhật `JwtMiddleware.php`

**File:** `backend/app/Http/Middleware/JwtMiddleware.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use App\Utils\JWTUtil;
use Illuminate\Http\Request;
use App\Models\User;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            // Extract và validate token
            $token = JWTUtil::extractToken($request);
            $decoded = JWTUtil::validateToken($token);
            
            // Lưu userId vào request để controller sử dụng
            $request->attributes->set('userId', $decoded->sub);
            
            // Optional: Load user vào request
            $user = User::find($decoded->sub);
            if (!$user) {
                return response()->json([
                    'error' => 'User not found'
                ], 404);
            }
            
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
            
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => $e->getMessage()
            ], 401);
        }

        return $next($request);
    }
}
```

---

### 4️⃣ Đăng Ký Middleware trong `bootstrap/app.php`

**File:** `backend/bootstrap/app.php`

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // 🔥 Đăng ký JWT middleware
        $middleware->alias([
            'jwt.auth' => \App\Http\Middleware\JwtMiddleware::class,
            'check.admin' => \App\Http\Middleware\CheckAdmin::class,
            'check.role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

---

### 5️⃣ Cập Nhật Routes với JWT Middleware

**File:** `backend/routes/api.php`

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\EventController;

// 🔓 Public routes (không cần token)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/refresh', [AuthController::class, 'refresh']);

// 🔐 Protected routes (cần JWT token)
Route::middleware(['jwt.auth'])->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Posts
    Route::prefix('posts')->group(function () {
        Route::get('/getAllPosts', [PostController::class, 'getAllPosts']);
        Route::get('/getPostDetails/{id}', [PostController::class, 'getPostDetails']);
        Route::post('/createPost', [PostController::class, 'createPost']);
        Route::put('/updatePostById/{id}', [PostController::class, 'updatePostById']);
        Route::delete('/deletePostById/{id}', [PostController::class, 'deletePostById']);
        Route::post('/searchPosts', [PostController::class, 'searchPosts']);
        Route::post('/addCommentOfPost', [PostController::class, 'addCommentOfPost']);
    });
    
    // Events
    Route::prefix('events')->group(function () {
        Route::get('/getAllEvents', [EventController::class, 'getAllEvents']);
        Route::post('/createEvent', [EventController::class, 'createEvent']);
        Route::post('/{id}/register', [EventController::class, 'registerEvent']);
    });
    
    // Likes
    Route::prefix('likes')->group(function () {
        Route::post('/like/{id}', [LikeController::class, 'likePost']);
        Route::post('/unlike/{id}', [LikeController::class, 'unlikePost']);
    });
});

// 🔐 Admin only routes
Route::middleware(['jwt.auth', 'check.admin'])->prefix('admin')->group(function () {
    Route::get('/users', [UserController::class, 'getAllUsers']);
    Route::delete('/users/{id}', [UserController::class, 'deleteUser']);
});
```

---

### 6️⃣ Cập Nhật Controllers để lấy userId từ JWT

**Ví dụ trong EventController:**

```php
public function createEvent(Request $request)
{
    // Lấy userId từ JWT (đã được JwtMiddleware set vào request)
    $userId = $request->attributes->get('userId');
    
    // Hoặc dùng auth helper (nếu đã set userResolver)
    $user = $request->user();
    
    $validated = $request->validate([
        'title' => 'required|string',
        'content' => 'required|string',
        // ...
    ]);
    
    $event = Event::create([
        'author_id' => $userId, // Hoặc $user->id
        ...$validated
    ]);
    
    return response()->json($event, 201);
}
```

---

## 🎨 FRONTEND - Các Bước Cần Sửa

### 1️⃣ Cập Nhật Login Page để lưu cả refresh_token

**File:** `frontend/src/app/home/login/page.tsx`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
    
    const response = await axios.post(
      `${API_URL}/login`,
      {
        email: formData.email,
        password: formData.password,
      }
    );

    const data = response.data;
    
    // ✅ Lưu cả access_token và refresh_token
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Optional: Lưu thời gian hết hạn
    const expiryTime = Date.now() + (data.expires_in * 1000);
    localStorage.setItem('token_expiry', expiryTime.toString());

    // Redirect theo role
    switch(data.user.role) {
      case 'admin':
        window.location.href = '/admin/dashboard';
        break;
      case 'manager':
        window.location.href = '/manager/dashboard';
        break;
      default:
        window.location.href = '/user/dashboard';
    }

  } catch (err: any) {
    const errorMessage = err.response?.data?.error || 'Đã xảy ra lỗi khi đăng nhập';
    setError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};
```

---

### 2️⃣ Cập Nhật `api.ts` với Auto Refresh Token

**File:** `frontend/src/utils/api.ts`

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
});

// Request interceptor - Gửi access_token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Auto refresh khi token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gọi API refresh token
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (!refreshToken) {
          // Không có refresh token -> logout
          handleLogout();
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "/api"}/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const { access_token } = response.data;

        // Lưu token mới
        localStorage.setItem("access_token", access_token);

        // Retry request với token mới
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh thất bại -> logout
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Hàm logout
function handleLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("token_expiry");
  window.location.href = "/home/login";
}

export default api;
```

---

### 3️⃣ Tạo Auth Context/Hook để quản lý user state

**File:** `frontend/src/contexts/AuthContext.tsx`

```typescript
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/utils/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user từ localStorage khi mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    const { user, access_token, refresh_token } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
  };

  const logout = () => {
    api.post('/logout').catch(() => {});
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    setUser(null);
    window.location.href = '/home/login';
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/me');
      const updatedUser = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

### 4️⃣ Wrap App với AuthProvider

**File:** `frontend/src/app/layout.tsx`

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### 5️⃣ Sử dụng useAuth trong Components

**Ví dụ:**

```typescript
"use client";
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Xin chào, {user.name}</h1>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}
```

---

## 🧪 TESTING

### Test Backend JWT:

```bash
# 1. Login
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dinh@example.com","password":"123456"}'

# 2. Sử dụng access_token
curl -X GET http://localhost/api/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 3. Refresh token
curl -X POST http://localhost/api/refresh \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN"
```

---

## 📝 CHECKLIST TRIỂN KHAI

### Backend:
- [ ] Thêm `JWT_SECRET` vào `.env`
- [ ] Sửa `AuthController::login()` trả về JWT
- [ ] Sửa `AuthController::register()` trả về JWT
- [ ] Thêm `AuthController::refresh()` method
- [ ] Thêm `AuthController::me()` method
- [ ] Cập nhật `JwtMiddleware`
- [ ] Đăng ký middleware trong `bootstrap/app.php`
- [ ] Cập nhật routes dùng `jwt.auth` middleware
- [ ] Sửa các controller lấy userId từ JWT
- [ ] Test API với Postman/curl

### Frontend:
- [ ] Cập nhật login page lưu `access_token` + `refresh_token`
- [ ] Sửa `api.ts` gửi `access_token` thay vì `token`
- [ ] Thêm auto refresh logic vào `api.ts`
- [ ] Tạo `AuthContext`
- [ ] Wrap app với `AuthProvider`
- [ ] Sửa các component dùng `useAuth` hook
- [ ] Test login/logout/refresh flow

---

## 🚀 DEPLOYMENT NOTES

1. **Production Environment:**
   - Dùng JWT_SECRET dài và random (min 32 ký tự)
   - Set `JWT_EXPIRY_MINUTES=15` (ngắn hơn)
   - Implement token blacklist với Redis
   - Enable HTTPS

2. **Security Best Practices:**
   - Refresh token nên lưu trong httpOnly cookie thay vì localStorage
   - Implement rate limiting cho login endpoint
   - Add CSRF protection
   - Log failed login attempts

---

## ❓ FAQ

**Q: Tại sao không dùng Sanctum?**
A: JWT phù hợp cho SPA/Mobile, Sanctum tốt cho server-rendered apps.

**Q: Refresh token có an toàn trong localStorage không?**
A: Không hoàn toàn. Nên dùng httpOnly cookie cho production.

**Q: Làm sao blacklist token khi logout?**
A: Cần implement Redis cache lưu token đã logout.

---

🎉 **Hoàn thành! Hệ thống JWT đã sẵn sàng!**
