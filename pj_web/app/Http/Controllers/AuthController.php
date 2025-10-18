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

        $result = $this->userService->getUserByEmail($request->email);
        $user = $result['data'];

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 401);
        }

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

    }


    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->only(['name', 'email', 'password']);

        $this->userService->createUser($user);

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

}