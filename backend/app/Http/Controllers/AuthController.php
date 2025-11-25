<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Utils\JWTUtil;
use App\Services\UserService;
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
            $token = JWTUtil::generateToken($user);
            $refresh_token = JWTUtil::generateToken($user, 43200); // 30 days
            return response()->json([
                'message' => 'Đăng nhập thành công!',
                'user' => $user,
                'access_token' => $token,
                'refresh_token' => $refresh_token,
            ])->cookie('user', json_encode($user), 120, '/', 'localhost', false, false, 'lax');

        }

        return response()->json(['error' => 'Email hoặc mật khẩu không đúng'], 401);

    }

    public function refreshToken(Request $request)
    {
        $refresh_token = $request->refresh_token;
        if (!$refresh_token || !JWTUtil::validateToken($refresh_token)) {
            return response()->json(['error' => 'Invalid refresh token'], 401);
        }
        $user = $request->user();
        $token = JWTUtil::generateToken($user->id);
        $refresh_token = JWTUtil::generateToken($user->id, 43200); // 30 days
        return response()->json([
            'message' => 'Token refreshed successfully',
            'access_token' => $token,
            'refresh_token' => $refresh_token,
        ]);
    }


    public function getCurrentUser(Request $request)
    {
        $payload = $request->attributes->get('jwtPayload');

        if (!$payload) {
            return response()->json(['error' => 'No user info'], 401);
        }

        // Nếu payload chỉ có userId, bạn có thể query DB nếu muốn thông tin chi tiết
        // Hoặc trả thẳng payload nếu đủ
        return response()->json([
            'id' => $payload->sub,
            'email' => $payload->email ?? null,
            'username' => $payload->username ?? null,
            'role' => $payload->role ?? 'user',
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