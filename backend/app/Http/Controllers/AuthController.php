<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Services\UserService;
use App\Utils\JWTUtil;

class AuthController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        
        // Tìm user theo email
        $user = User::where('email', $request->email)->first();

        // Kiểm tra user tồn tại và password đúng
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Email hoặc mật khẩu không đúng'], 401);
        }

        $accessToken = JWTUtil::generateToken($user->id, 60); // 60 phút
        $refreshToken = JWTUtil::generateToken($user->id, 60 * 24 * 7); // 7 ngày

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => 3600,
        ]);
    }


    public function register(Request $request)
    {
        // Validate input
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'addressCard' => 'nullable|string|max:12',
            'avatar' => 'nullable|string|max:500', // URL hoặc base64
        ]);

        $userData = $request->only(['name', 'email', 'password', 'phone', 'address', 'addressCard', 'avatar']);
        $userData['role'] = 'user';

        // Gọi service và nhận kết quả
        $result = $this->userService->createUser($userData);

        if (!$result['success']) {
            return response()->json([
                'error' => $result['message']
            ], 400);
        }

        $user = $result['data'];

        $accessToken = JWTUtil::generateToken($user->id, 60);
        $refreshToken = JWTUtil::generateToken($user->id, 60 * 24 * 7);

        return response()->json([
            'message' => 'Registration successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => 3600,
        ], 201);
    }


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


    public function logout(Request $request)
    {
        // Xóa token hiện tại
        $request->user()->currentAccessToken()->delete();
        
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function resendVerificationEmail(Request $request)
    {
        $user = $request->user();
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 400);
        }
        $user->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification email resent.']);
    }

}