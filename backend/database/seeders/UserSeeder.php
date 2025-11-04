<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Nguyen Ngoc Dinh',
            'email' => 'dinh@example.com',
            'password' => Hash::make('123456'),
        ]);

        User::create([
            'name' => 'Admin Test',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
        ]);
    }
}
