<?php

return [
    // Secret key used for signing HMAC (HS256) tokens
    // MUST be a sufficiently random string. Use `openssl rand -hex 32`.
    'secret' => env('JWT_SECRET'),

    // Standard expiries (in minutes / days) configurable via env
    'access_ttl' => (int) env('JWT_EXPIRY_MINUTES', 60),
    'refresh_ttl_days' => (int) env('JWT_REFRESH_EXPIRY_DAYS', 7),

    'issuer' => env('JWT_ISS', env('APP_URL', 'http://localhost')), // iss claim
    'audience' => env('JWT_AUD', env('APP_URL', 'http://localhost')), // aud claim
];
