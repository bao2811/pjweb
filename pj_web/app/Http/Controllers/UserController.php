<?php

class UserController extends Controller
{
    public function index()
    {
        return response()->json([
            'users' => [
                ['id' => 1, 'name' => 'Alice'],
                ['id' => 2, 'name' => 'Bob'],
            ],
        ]);
    }

    public function login(Request $request)
    {
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

        return response()->json(['message' => 'Sai tài khoản hoặc mật khẩu!'], 401);
    }
}