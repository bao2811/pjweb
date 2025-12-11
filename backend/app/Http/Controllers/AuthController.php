<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Utils\JWTUtil;
use App\Services\UserService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cookie;

// use App\Jobs\SendWelcomeEmail;

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

        // $result = $this->userService->getUserByEmail($request->email);
        // $user = $result['data'];

        // if (!$user || !Hash::check($request->password, $user->password)) {
        //     throw ValidationException::withMessages([
        //         'email' => ['The provided credentials are incorrect.'],
        //     ]);
        // }
        
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
                try {
                    $token = JWTUtil::generateToken($user);
                    $refresh_token = JWTUtil::generateToken($user, 43200); // 30 days
                } catch (\Exception $e) {
                    // Log full exception for debugging and return a JSON error so the frontend can surface it
                    Log::error('JWT token generation failed: ' . $e->getMessage(), ['exception' => $e]);
                    return response()->json([
                        'error' => 'Server error while generating auth token',
                        'details' => $e->getMessage()
                    ], 500);
                }

                return response()->json([
                    'message' => 'Đăng nhập thành công!',
                    'user' => $user,
                    'access_token' => $token,
                    // 'refresh_token' => $refresh_token,
                ])->cookie('refresh_token', $refresh_token,  60 * 24 * 7, '/', null, true, true, false, 'strict');

        }

        return response()->json(['error' => 'Email hoặc mật khẩu không đúng'], 401);

    }

    // public function refreshToken(Request $request)
    // {
    //     $refresh_token = $request->refresh_token;

    //     if (!$refresh_token) {
    //         return response()->json(['error' => 'Refresh token is required'], 401);
    //     }

    //     try {
    //         // Kiểm tra refresh token hợp lệ
    //         $payload = JWTUtil::validateToken($refresh_token);
    //     } catch (\Exception $e) {
    //         // Nếu token hết hạn hoặc invalid → logout
    //         return response()->json(['error' => 'Invalid or expired refresh token'], 401);
    //     }

    //     // Lấy user từ payload hoặc request
    //     $user = $request->user();

    //     // Tạo access token mới
    //     $access_token = JWTUtil::generateToken($user->id, 60); // 60 phút

    //     return response()->json([
    //         'message' => 'Token refreshed successfully',
    //         'access_token' => $access_token,
    //         'token_type' => 'Bearer',
    //         'expires_in' => 3600,
    //     ]);
    // }


    public function refreshToken(Request $request)
    {
        $refresh_token = $request->cookie('refresh_token');
        Log::info('Refresh token request received', ['refresh_token' => $refresh_token]);
        if (!$refresh_token) {
            return response()->json(['error' => 'Invalid refresh token'], 401);
           
        }

        if (JWTUtil::validateToken($refresh_token) === false) {
            return response()->json(['error' => 'Invalid refresh token'], 401);
        }

        $user = JWTUtil::validateToken($refresh_token);
        $token = JWTUtil::generateToken($user, 60);
        // $refresh_token = JWTUtil::generateToken($user->id, 43200); // 30 days
        return response()->json([
            'message' => 'Token refreshed successfully',
            'access_token' => $token,
            // 'refresh_token' => $refresh_token,
        ]);

        
    }


    public function getCurrentUser(Request $request)
    {
        $userId = $request->attributes->get('userId');
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'image' => $user->image,
                'phone' => $user->phone,
                'address' => $user->address,
            ]
        ]);
    }

    public function register(Request $request)
    {
        // Delegate validation and creation to the service which expects a Request
        // Pass the whole Request object so ->validate() inside the service works

         $data = $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'image' => 'nullable|string|max:255',
            'address_card' => 'nullable|string|max:255',
        ]);
        $result = $this->userService->createUser($data);

        // createUser returns an array with 'success' and 'data' (the User model)
        $createdUser = $result['data'] ?? null;

        // SendWelcomeEmail::dispatch($createdUser->email, $createdUser->name);

        // $createdUser should be the User model; return minimal user info
        return response()->json([
            'user' => $createdUser ? [
                'id' => $createdUser->id,
                'username' => $createdUser->username,
                'email' => $createdUser->email,
            ] : null,
            'success' => $result['success'] ?? false,
            'message' => $result['message'] ?? ''
        ], $createdUser ? 201 : 400);
    }


    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        Auth::logout();
        session()->flush();
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
