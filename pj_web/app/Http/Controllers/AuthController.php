<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Utils\JWTUtil;
use App\Services\UserService;

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
            // Đăng nhập thành công → Laravel tự tạo session
            $user = Auth::user();

            // Bạn có thể lưu thêm thông tin vào session
            session(['login_time' => now()]);

            return response()->json([
                'message' => 'Đăng nhập thành công!',
                'user' => $user,
            ]);
        }

        return response()->json(['error' => 'Email hoặc mật khẩu không đúng'], 401);

    }


    public function register(Request $request)
    {
        $user = $request->only(['name', 'email', 'password']);
        $user['role'] = 'user';

       $user['data'] = $this->userService->createUser($user);

        // $user->sendEmailVerificationNotification();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ], 201);
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