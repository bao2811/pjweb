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

    public static function getSecretKey(): string
    {
        if (!self::$secretKey) {
            self::$secretKey = (string) config('jwt.secret');
        }
        if (self::$secretKey === '' || self::$secretKey === null) {
            throw new \RuntimeException('JWT secret is missing. Set JWT_SECRET in .env');
        }
        return self::$secretKey;
    }

    public static function generateToken(int $userId, int $expiryMinutes = 60): string
    {
        $issuedAt = time();
        $expiry = $issuedAt + ($expiryMinutes * 60);

        $payload = [
            'iss' => config('jwt.issuer'),
            'aud' => config('jwt.audience'),
            'iat' => $issuedAt,
            'nbf' => $issuedAt,
            'exp' => $expiry,
            'sub' => $userId,
            'jti' => bin2hex(random_bytes(8)),
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
        }
         catch (SignatureInvalidException $e) {
            throw new \Exception('Invalid signature');
        } catch (\Exception $e) {
            throw new \Exception('Invalid token: ' . $e->getMessage());
        }
    }
}