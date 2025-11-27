<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Noti;
use Carbon\Carbon;

class NotiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all user IDs
        $userIds = \DB::table('users')->pluck('id')->toArray();
        
        if (empty($userIds)) {
            $this->command->error('Không có user nào trong database!');
            return;
        }
        
        // Create notifications for each user
        foreach ($userIds as $userId) {
            $notifications = [
                [
                    'user_id' => $userId,
                    'type' => 'event_approved',
                'title' => 'Yêu cầu tham gia sự kiện được chấp nhận',
                'message' => 'Chúc mừng! Yêu cầu tham gia sự kiện "Trồng cây xanh - Vì môi trường sạch" của bạn đã được chấp nhận.',
                'sender_id' => null,
                'is_read' => false,
                'link' => '/events/1',
                'created_at' => Carbon::now()->subMinutes(5),
                'updated_at' => Carbon::now()->subMinutes(5),
            ],
            [
                'user_id' => $userId,
                'type' => 'event_reminder',
                'title' => 'Nhắc nhở sự kiện sắp diễn ra',
                'message' => 'Sự kiện "Hiến máu tình nguyện" sẽ bắt đầu trong 24 giờ nữa. Đừng quên tham gia nhé!',
                'sender_id' => null,
                'is_read' => false,
                'link' => '/events/2',
                'created_at' => Carbon::now()->subMinutes(30),
                'updated_at' => Carbon::now()->subMinutes(30),
            ],
            [
                'user_id' => $userId,
                'type' => 'event_rejected',
                'title' => 'Yêu cầu tham gia sự kiện bị từ chối',
                'message' => 'Rất tiếc, yêu cầu tham gia sự kiện "Dạy học cho trẻ em vùng cao" của bạn đã bị từ chối do đã hết chỗ.',
                'sender_id' => null,
                'is_read' => false,
                'link' => '/events/3',
                'created_at' => Carbon::now()->subHours(2),
                'updated_at' => Carbon::now()->subHours(2),
            ],
            [
                'user_id' => $userId,
                'type' => 'comment',
                'title' => 'Bình luận mới trên bài viết của bạn',
                'message' => 'Nguyễn Văn B đã bình luận: "Bài viết rất hay và bổ ích!"',
                'sender_id' => null,
                'is_read' => true,
                'link' => '/posts/10',
                'created_at' => Carbon::now()->subHours(5),
                'updated_at' => Carbon::now()->subHours(3),
            ],
            [
                'user_id' => $userId,
                'type' => 'like',
                'title' => 'Lượt thích mới',
                'message' => 'Trần Thị C và 15 người khác đã thích bài viết của bạn.',
                'sender_id' => null,
                'is_read' => true,
                'link' => '/posts/10',
                'created_at' => Carbon::now()->subHours(8),
                'updated_at' => Carbon::now()->subHours(6),
            ],
            [
                'user_id' => $userId,
                'type' => 'event_cancelled',
                'title' => 'Sự kiện đã bị hủy',
                'message' => 'Sự kiện "Dọn dẹp bãi biển" đã bị hủy do thời tiết xấu. Chúng tôi sẽ thông báo lại khi có lịch mới.',
                'sender_id' => null,
                'is_read' => true,
                'link' => '/events/5',
                'created_at' => Carbon::now()->subDay(1),
                'updated_at' => Carbon::now()->subDay(1),
            ],
            [
                'user_id' => $userId,
                'type' => 'achievement',
                'title' => 'Chúc mừng! Bạn đạt thành tích mới',
                'message' => 'Bạn đã hoàn thành 10 sự kiện tình nguyện và nhận được huy hiệu "Người hùng tình nguyện".',
                'sender_id' => null,
                'is_read' => false,
                'link' => '/user/achievements',
                'created_at' => Carbon::now()->subDay(2),
                'updated_at' => Carbon::now()->subDay(2),
            ],
            [
                'user_id' => $userId,
                'type' => 'new_event',
                'title' => 'Sự kiện mới phù hợp với bạn',
                'message' => 'Có sự kiện mới "Chăm sóc người già" trong khu vực của bạn. Đăng ký ngay!',
                'sender_id' => null,
                'is_read' => false,
                'link' => '/events/12',
                'created_at' => Carbon::now()->subDay(3),
                'updated_at' => Carbon::now()->subDay(3),
            ],
            [
                'user_id' => $userId,
                'type' => 'system',
                'title' => 'Cập nhật hệ thống',
                'message' => 'Hệ thống sẽ bảo trì vào lúc 2:00 AM ngày mai. Thời gian dự kiến: 1 giờ.',
                'sender_id' => null,
                'is_read' => true,
                'link' => null,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(4),
            ],
            [
                'user_id' => $userId,
                'type' => 'message',
                'title' => 'Tin nhắn mới từ người quản lý',
                'message' => 'Lê Văn D đã gửi tin nhắn: "Cảm ơn bạn đã tham gia sự kiện. Hẹn gặp lại!"',
                'sender_id' => null,
                'is_read' => false,
                'link' => '/messages/6',
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(7),
            ],
        ];

            foreach ($notifications as $notification) {
                Noti::create($notification);
            }
        }

        $totalNotifications = count($userIds) * 10;
        $this->command->info("Đã tạo {$totalNotifications} thông báo mẫu cho " . count($userIds) . " users!");
    }
}
