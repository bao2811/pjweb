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

/**
 * Controller AuthController - Xử lý xác thực người dùng
 * 
 * Controller này xử lý các API endpoint liên quan đến authentication,
 * bao gồm: đăng nhập, đăng ký, đăng xuất, refresh token, lấy thông tin user.
 * Sử dụng JWT để tạo và xác thực token.
 * 
 * @package App\Http\Controllers
 */
class AuthController extends Controller
{
    /** @var UserService Service xử lý logic user */
    protected $userService;

    /**
     * Khởi tạo controller với UserService
     * 
     * @param UserService $userService Service xử lý logic user
     */
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Đăng nhập người dùng
     * 
     * Xác thực thông tin đăng nhập và trả về JWT token.
     * - Access token có thời hạn 15 phút
     * - Refresh token có thời hạn 30 ngày, được lưu trong httpOnly cookie
     * 
     * @param Request $request Request chứa email và password
     * @return JsonResponse Token và thông tin user
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6',
        ], [
            'email.required' => 'Vui lòng nhập email',
            'email.email' => 'Email không hợp lệ',
            'email.max' => 'Email không được quá 255 ký tự',
            'password.required' => 'Vui lòng nhập mật khẩu',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự',
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
                    $token = JWTUtil::generateToken($user, 5);
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
                    'refresh_token' => $refresh_token,
                ])->withCookie(cookie(
                    'refresh_token',
                    $refresh_token,
                    60 * 24 * 7, // phút
                    '/',         // path
                    null,        // domain
                    false,       // 🔴 secure = false (localhost)
                    true,        // httpOnly
                    false,
                    'None'
                ));


        }

        return response()->json(['error' => 'Email hoặc mật khẩu không đúng'], 401);

    }

    /**
     * Làm mới access token bằng refresh token
     * 
     * Kiểm tra refresh token hợp lệ và tạo access token mới.
     * 
     * @param Request $request Request chứa refresh_token
     * @return JsonResponse Access token mới
     */
    public function refreshToken(Request $request)
    {
        $refresh_token = $request->input('refresh_token');

        if (!$refresh_token) {
            return response()->json(['error' => 'Refresh token is required'], 401);
        }

        try {
            // Kiểm tra refresh token hợp lệ
            $payload = JWTUtil::validateToken($refresh_token);
        } catch (\Exception $e) {
            // Nếu token hết hạn hoặc invalid → logout
            return response()->json(['error' => 'Invalid or expired refresh token'], 401);
        }

        $user = User::find($payload->sub);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $access_token = JWTUtil::generateToken($user, 15);

        return response()->json([
            'message' => 'Token refreshed successfully',
            'access_token' => $access_token,
            'token_type' => 'Bearer',
            'expires_in' => 900,
        ]);
    }

    /**
     * Lấy thông tin user hiện tại
     * 
     * Trả về thông tin của user đang đăng nhập dựa trên JWT token.
     * 
     * @param Request $request Request chứa userId từ JWT middleware
     * @return JsonResponse Thông tin user
     */
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

    /**
     * Đăng ký tài khoản mới
     * 
     * Tạo tài khoản user mới với các thông tin:
     * username, email, password, phone, address, image, address_card (CCCD).
     * 
     * @param Request $request Request chứa thông tin đăng ký
     * @return JsonResponse User vừa tạo
     */
    public function register(Request $request)
    {
        // Delegate validation and creation to the service which expects a Request
        // Pass the whole Request object so ->validate() inside the service works

         $data = $request->validate([
            'username' => 'required|string|min:3|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|max:255',
            'phone' => 'required|string|regex:/^(0[3|5|7|8|9])+([0-9]{8})$/|max:20',
            'address' => 'required|string|min:5|max:255',
            'image' => 'nullable|string|max:500|url',
            'address_card' => 'required|string|digits:12',
        ], [
            'username.required' => 'Vui lòng nhập tên người dùng',
            'username.min' => 'Tên người dùng phải có ít nhất 3 ký tự',
            'username.max' => 'Tên người dùng không được quá 255 ký tự',
            'email.required' => 'Vui lòng nhập email',
            'email.email' => 'Email không hợp lệ',
            'email.unique' => 'Email này đã được sử dụng',
            'password.required' => 'Vui lòng nhập mật khẩu',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự',
            'phone.required' => 'Vui lòng nhập số điện thoại',
            'phone.regex' => 'Số điện thoại không hợp lệ (VD: 0912345678)',
            'address.required' => 'Vui lòng nhập địa chỉ',
            'address.min' => 'Địa chỉ phải có ít nhất 5 ký tự',
            'image.url' => 'URL ảnh đại diện không hợp lệ',
            'address_card.required' => 'Vui lòng nhập số CCCD',
            'address_card.digits' => 'Số CCCD phải có đúng 12 chữ số',
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


    /**
     * Đăng xuất người dùng
     * 
     * Xóa refresh token khỏi cookie để đăng xuất.
     * 
     * @param Request $request Request object
     * @return JsonResponse Thông báo đăng xuất thành công
     */
    public function logout(Request $request)
    {
        return response()->json([
            'message' => 'Logged out successfully'
        ])->cookie(
            'refresh_token',
            '',
            -1,     // xoá cookie
            '/',
            null,
            false,  // secure (true nếu https)
            true,   // httpOnly
            false,
            'Lax'
        );
    }

    /**
     * Gửi lại email xác thực
     * 
     * Gửi lại email xác thực cho user chưa verify email.
     * 
     * @param Request $request Request object
     * @return JsonResponse Kết quả gửi email
     */
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
