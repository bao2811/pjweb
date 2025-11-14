<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $events = Event::all();

        if ($users->isEmpty() || $events->isEmpty()) {
            $this->command->warn('⚠️ Cần có users và events trước khi tạo posts!');
            return;
        }

        $posts = [
            [
                'title' => 'Buổi trồng cây hôm nay thật ý nghĩa! 🌱',
                'content' => 'Cảm ơn mọi người đã tham gia nhiệt tình. Chúng ta đã trồng được 50 cây xanh tại công viên. Hy vọng những cây xanh này sẽ lớn lên và đem lại bóng mát cho mọi người!',
                'author_id' => $users->random()->id,
                'event_id' => $events->random()->id,
                'image' => 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
                'like' => rand(10, 50),
                'comment' => rand(3, 15),
                'status' => true,
                'published_at' => Carbon::now()->subDays(rand(1, 10)),
            ],
            [
                'title' => 'Những khoảnh khắc đáng nhớ tại viện dưỡng lão ❤️',
                'content' => 'Hôm nay được gặp gỡ và trò chuyện với các cụ tại viện dưỡng lão. Những câu chuyện, nụ cười của các cụ đã cho tôi thêm động lực để tiếp tục công việc thiện nguyện này.',
                'author_id' => $users->random()->id,
                'event_id' => $events->random()->id,
                'image' => 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
                'like' => rand(20, 80),
                'comment' => rand(5, 20),
                'status' => true,
                'published_at' => Carbon::now()->subDays(rand(1, 7)),
            ],
            [
                'title' => 'Bãi biển sạch hơn sau ngày hôm nay! 🌊',
                'content' => 'Team chúng mình đã thu được gần 200kg rác thải nhựa tại bãi biển. Thật đáng buồn khi thấy biển bị ô nhiễm như vậy. Cùng nhau bảo vệ môi trường nào mọi người!',
                'author_id' => $users->random()->id,
                'event_id' => $events->random()->id,
                'image' => 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
                'like' => rand(30, 100),
                'comment' => rand(8, 25),
                'status' => true,
                'published_at' => Carbon::now()->subDays(rand(1, 5)),
            ],
            [
                'title' => 'Lớp học đầu tiên tại Sapa 📚',
                'content' => 'Các em nhỏ ở đây học hành rất chăm chỉ dù hoàn cảnh khó khăn. Hy vọng chương trình sẽ giúp các em có thêm kiến thức và cơ hội phát triển trong tương lai.',
                'author_id' => $users->random()->id,
                'event_id' => $events->random()->id,
                'image' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
                'like' => rand(15, 60),
                'comment' => rand(4, 18),
                'status' => true,
                'published_at' => Carbon::now()->subDays(rand(1, 3)),
            ],
            [
                'title' => 'Hiến máu là cứu người - Hành động ý nghĩa! 🩸',
                'content' => 'Lần đầu tiên đi hiến máu và cảm thấy rất tự hào. Chỉ cần 450ml máu có thể cứu sống 3 người. Mọi người hãy tham gia hiến máu thường xuyên nhé!',
                'author_id' => $users->random()->id,
                'event_id' => $events->random()->id,
                'image' => 'https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=800',
                'like' => rand(25, 90),
                'comment' => rand(6, 22),
                'status' => true,
                'published_at' => Carbon::now()->subDays(rand(1, 4)),
            ],
            [
                'title' => 'Ngôi nhà tình thương đã hoàn thành! 🏠',
                'content' => 'Sau 3 ngày làm việc không ngừng nghỉ, chúng tôi đã hoàn thành ngôi nhà cho gia đình chú Năm. Nhìn nụ cười hạnh phúc của các cháu nhỏ, mọi mệt mỏi đều tan biến.',
                'author_id' => $users->random()->id,
                'event_id' => $events->random()->id,
                'image' => 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800',
                'like' => rand(40, 120),
                'comment' => rand(10, 30),
                'status' => true,
                'published_at' => Carbon::now()->subDays(rand(1, 6)),
            ],
            [
                'title' => 'Món quà nhỏ - Yêu thương lớn 🎁',
                'content' => 'Trao quà cho các em nhỏ hôm nay, thấy các em vui mừng như vậy mà lòng mình ấm áp biết bao. Cảm ơn tất cả mọi người đã đóng góp quà và cùng tham gia chương trình!',
                'author_id' => $users->random()->id,
                'event_id' => $events->random()->id,
                'image' => 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800',
                'like' => rand(20, 70),
                'comment' => rand(5, 16),
                'status' => true,
                'published_at' => Carbon::now()->subDays(rand(1, 2)),
            ],
            [
                'title' => 'Thông báo: Sự kiện Marathon sắp diễn ra!',
                'content' => 'Còn 1 tuần nữa là sự kiện Marathon For Life sẽ diễn ra. Mọi người hãy đăng ký sớm để không bỏ lỡ cơ hội đóng góp cho các em nhỏ mắc bệnh hiểm nghèo nhé! 💪',
                'author_id' => $users->random()->id,
                'event_id' => $events->random()->id,
                'image' => 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
                'like' => rand(50, 150),
                'comment' => rand(15, 40),
                'status' => true,
                'published_at' => Carbon::now()->subHours(rand(1, 12)),
            ],
        ];

        foreach ($posts as $postData) {
            Post::create($postData);
        }

        $this->command->info('✅ Đã tạo ' . count($posts) . ' bài viết mẫu!');
    }
}
