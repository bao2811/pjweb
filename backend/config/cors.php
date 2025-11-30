<?php

return [

    'paths' => [
        'api/*', 
        'admin/*', 
        'sanctum/csrf-cookie', 
        'user/*',
        'broadcasting/auth',  // Thêm endpoint cho WebSocket authentication
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000', 
        'http://localhost:3001',  // Frontend dev server alternative port
        'http://tinhnguyen.com'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // <- bật lên
];