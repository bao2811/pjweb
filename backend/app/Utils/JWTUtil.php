<?php

namespace App\Utils;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

/**
 * Utility class JWTUtil - Xử lý JSON Web Token
 * 
 * Class này cung cấp các phương thức tạo, giải mã và validate JWT token.
 * Sử dụng thư viện Firebase JWT.
 * 
 * @package App\Utils
 */
class JWTUtil
{
    /** @var string|null Secret key để ký và verify token */
    private static $secretKey = null;

    /**
     * Private constructor - Không cho phép khởi tạo instance
     */
    private function __construct() {}

    /**
     * Lấy secret key từ config
     * 
     * Sử dụng config() thay vì env() để support config caching.
     * 
     * @return string Secret key
     */
    public static function getSecretKey()
    {
        if (!self::$secretKey) {
            // Sử dụng config() thay vì env() để support config caching
            self::$secretKey = config('app.jwt_secret');
        }
        return self::$secretKey;
    }

    /**
     * Tạo JWT token cho user
     * 
     * Token chứa thông tin: user id, email, username, role.
     * Mặc định hết hạn sau 60 phút.
     * 
     * @param object $user User object (cần có id, email, username, role)
     * @param int $expiryMinutes Thời gian hết hạn (phút)
     * @return string JWT token
     */
    public static function generateToken($user, $expiryMinutes = 60)
    {
        $issuedAt = time();
        $expiry = $issuedAt + ($expiryMinutes * 60);

        $payload = [
            'iss' => 'your-issuer',
            'aud' => 'your-audience',
            'iat' => $issuedAt,
            'exp' => $expiry,
            'sub' => $user->id,
            'email' => $user->email,
            'username' => $user->username,
            'role' => $user->role,
        ];

        return JWT::encode($payload, self::getSecretKey(), 'HS256');
    }

    /**
     * Trích xuất token từ header Authorization
     * 
     * Expect format: "Bearer {token}"
     * 
     * @param \Illuminate\Http\Request $request Request object
     * @return string JWT token
     * @throws \Exception Nếu không có token
     */
    public static function extractToken($request)
    {
        $header = $request->header('Authorization');
        if (!$header || !preg_match('/Bearer\s(\S+)/', $header, $matches)) {
            throw new \Exception("Token not provided");
        }
        return $matches[1];
    }

    /**
     * Giải mã JWT token
     * 
     * @param string $token JWT token
     * @return object Decoded payload
     */
    public static function decodeToken($token)
    {
        return JWT::decode($token, new Key(self::getSecretKey(), 'HS256'));
    }

    /**
     * Validate JWT token
     * 
     * Kiểm tra token có hợp lệ và chưa hết hạn không.
     * 
     * @param string $token JWT token
     * @return object Decoded payload nếu hợp lệ
     * @throws \Exception Nếu token không hợp lệ hoặc đã hết hạn
     */
    public static function validateToken(string $token)
    {
        try {
            return self::decodeToken($token);
        } catch (ExpiredException $e) {
            throw new \Exception('Token has expired');
        } catch (SignatureInvalidException $e) {
            throw new \Exception('Invalid token');
        } catch (\Exception $e) {
            throw new \Exception('Invalid token');
        }
    }
}