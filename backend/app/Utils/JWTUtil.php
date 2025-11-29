<?php

namespace App\Utils;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

class JWTUtil
{
    private static $secretKey = null;

    private function __construct() {}

    public static function getSecretKey()
    {
        if (!self::$secretKey) {
            self::$secretKey = env('JWT_SECRET');
        }
        return self::$secretKey;
    }

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


    public static function extractToken($request)
    {
        $header = $request->header('Authorization');
        if (!$header || !preg_match('/Bearer\s(\S+)/', $header, $matches)) {
            throw new \Exception("Token not provided");
        }
        return $matches[1];
    }


    public static function decodeToken($token)
    {
        return JWT::decode($token, new Key(self::getSecretKey(), 'HS256'));
    }


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