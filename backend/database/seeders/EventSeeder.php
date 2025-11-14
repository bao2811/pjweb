<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        // Lấy manager và admin để làm creator
        $manager = User::where('role', 'manager')->first();
        $admin = User::where('role', 'admin')->first();

        $events = [
            [
                'title' => 'Trồng cây xanh tại công viên Gia Định',
                'description' => 'Cùng nhau trồng 100 cây xanh để góp phần làm sạch môi trường và tạo không gian xanh cho thành phố.',
                'location' => 'Công viên Gia Định, Quận Gò Vấp, TP.HCM',
                'start_date' => Carbon::now()->addDays(7),
                'end_date' => Carbon::now()->addDays(7)->addHours(4),
                'max_participants' => 50,
                'current_participants' => 12,
                'points' => 100,
                'status' => 'approved',
                'category' => 'Môi trường',
                'image' => 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800',
                'creator_id' => $manager->id ?? 1,
            ],
            [
                'title' => 'Dọn rác bãi biển Vũng Tàu',
                'description' => 'Hoạt động dọn dẹp rác thải trên bãi biển, bảo vệ môi trường biển và nâng cao ý thức cộng đồng.',
                'location' => 'Bãi biển Thùy Vân, Vũng Tàu',
                'start_date' => Carbon::now()->addDays(14),
                'end_date' => Carbon::now()->addDays(14)->addHours(5),
                'max_participants' => 100,
                'current_participants' => 35,
                'points' => 150,
                'status' => 'approved',
                'category' => 'Môi trường',
                'image' => 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800',
                'creator_id' => $manager->id ?? 1,
            ],
            [
                'title' => 'Hỗ trợ người cao tuổi tại viện dưỡng lão',
                'description' => 'Thăm hỏi, trò chuyện và tổ chức các hoạt động vui chơi cho người cao tuổi tại viện dưỡng lão.',
                'location' => 'Viện Dưỡng lão Thị Nghè, Quận 1, TP.HCM',
                'start_date' => Carbon::now()->addDays(5),
                'end_date' => Carbon::now()->addDays(5)->addHours(3),
                'max_participants' => 30,
                'current_participants' => 18,
                'points' => 80,
                'status' => 'approved',
                'category' => 'Xã hội',
                'image' => 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
                'creator_id' => $admin->id ?? 2,
            ],
            [
                'title' => 'Dạy học miễn phí cho trẻ em vùng cao',
                'description' => 'Chương trình giảng dạy tiếng Anh và tin học cơ bản cho trẻ em tại các vùng cao khó khăn.',
                'location' => 'Sapa, Lào Cai',
                'start_date' => Carbon::now()->addDays(21),
                'end_date' => Carbon::now()->addDays(23),
                'max_participants' => 20,
                'current_participants' => 8,
                'points' => 200,
                'status' => 'approved',
                'category' => 'Giáo dục',
                'image' => 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
                'creator_id' => $manager->id ?? 1,
            ],
            [
                'title' => 'Hiến máu nhân đạo Chữ thập đỏ',
                'description' => 'Tham gia hiến máu tình nguyện để cứu sống nhiều người bệnh cần được truyền máu khẩn cấp.',
                'location' => 'Trung tâm Huyết học - Truyền máu TP.HCM',
                'start_date' => Carbon::now()->addDays(3),
                'end_date' => Carbon::now()->addDays(3)->addHours(6),
                'max_participants' => 80,
                'current_participants' => 45,
                'points' => 120,
                'status' => 'approved',
                'category' => 'Y tế',
                'image' => 'https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=800',
                'creator_id' => $admin->id ?? 2,
            ],
            [
                'title' => 'Xây nhà tình thương cho hộ nghèo',
                'description' => 'Cùng nhau xây dựng và sửa chữa nhà cửa cho các hộ gia đình có hoàn cảnh khó khăn.',
                'location' => 'Huyện Củ Chi, TP.HCM',
                'start_date' => Carbon::now()->addDays(10),
                'end_date' => Carbon::now()->addDays(12),
                'max_participants' => 40,
                'current_participants' => 22,
                'points' => 250,
                'status' => 'approved',
                'category' => 'Xã hội',
                'image' => 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800',
                'creator_id' => $manager->id ?? 1,
            ],
            [
                'title' => 'Chương trình "Mùa đông ấm" - Tặng quà cho trẻ em nghèo',
                'description' => 'Thu thập và trao tặng quần áo ấm, sách vở, đồ chơi cho trẻ em có hoàn cảnh khó khăn.',
                'location' => 'Quận 4, TP.HCM',
                'start_date' => Carbon::now()->addDays(2),
                'end_date' => Carbon::now()->addDays(2)->addHours(4),
                'max_participants' => 60,
                'current_participants' => 28,
                'points' => 90,
                'status' => 'pending',
                'category' => 'Xã hội',
                'image' => 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800',
                'creator_id' => $manager->id ?? 1,
            ],
            [
                'title' => 'Chạy bộ từ thiện Marathon For Life',
                'description' => 'Sự kiện chạy bộ gây quỹ hỗ trợ điều trị cho trẻ em mắc bệnh hiểm nghèo.',
                'location' => 'Phú Mỹ Hưng, Quận 7, TP.HCM',
                'start_date' => Carbon::now()->addDays(30),
                'end_date' => Carbon::now()->addDays(30)->addHours(3),
                'max_participants' => 200,
                'current_participants' => 85,
                'points' => 100,
                'status' => 'pending',
                'category' => 'Cộng đồng',
                'image' => 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800',
                'creator_id' => $admin->id ?? 2,
            ],
        ];

        foreach ($events as $eventData) {
            Event::create($eventData);
        }

        $this->command->info('✅ Đã tạo ' . count($events) . ' sự kiện mẫu!');
    }
}
