<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Chạy tất cả seeders theo thứ tự
        $this->call([
            UserSeeder::class,
            EventSeeder::class,
            PostSeeder::class,
        ]);

        $this->command->info('✅ Đã seed tất cả dữ liệu test thành công!');
    }
}
