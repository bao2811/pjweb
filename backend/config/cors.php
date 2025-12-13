<?php

return [

    'paths' => [
        'api/*', 
        'admin/*', 
        'manager/*',
        'user/*',
        'events/*',
        'sanctum/csrf-cookie', 
        'broadcasting/auth',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000', 
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://tinhnguyen.com',
        'https://tinhnguyen.com',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // <- bật lên
];