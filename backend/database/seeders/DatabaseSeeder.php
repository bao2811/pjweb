<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use App\Models\User;
use App\Models\Post;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Tắt foreign key checks cho PostgreSQL
        DB::statement('SET CONSTRAINTS ALL DEFERRED;');

        // Xóa hết dữ liệu cũ (theo thứ tự ngược với foreign key)
        $this->command->info('Clearing old data...');
        DB::table('likes')->delete();
        DB::table('notis')->delete();
        DB::table('join_events')->delete();
        DB::table('event_managements')->delete();
        DB::table('messages')->delete();
        DB::table('channels')->delete();
        DB::table('comments')->delete();
        DB::table('posts')->delete();
        DB::table('events')->delete();
        DB::table('users')->delete();

        // Tạo users trước
        $this->command->info('Creating users...');
        $users = [];
        $users[] = User::create([
            'name' => 'Nguyễn Ngọc Dinh',
            'email' => 'dinh@example.com',
            'password' => '123456',
            'role' => 'admin'
        ]);

        $users[] = User::create([
            'name' => 'Nguyễn Dinh',
            'email' => 'dinh1@example.com',
            'password' => '1234567',
            'role' => 'manager'
        ]);

        $users[] = User::create([
            'name' => 'Nguyễn Ngọc Dinh',
            'email' => 'dinh2@example.com',
            'password' => '123456',
            'role' => 'user'
        ]);

        $users[] = User::create([
            'name' => 'Trần Thị B', 
            'email' => 'thib@example.com',
            'password' => '123456'
        ]);
        $users[] = User::create([
            'name' => 'Lê Văn C',
            'email' => 'vanc@example.com', 
            'password' => '123456'
        ]);

        // Tạo posts với ID users thực tế
        $this->command->info('Creating posts...');
        Post::create([
            'title' => 'Trồng cây xanh - Vì môi trường sạch',
            'content' => '🌱 Cùng nhau trồng cây xanh tại Công viên Tao Đàn!',
            'image' => 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
            'address' => 'Công viên Tao Đàn, Q.1',
            'start_time' => '2025-10-15 07:00:00',
            'end_time' => '2025-10-15 11:00:00',
            'author_id' => $users[0]->id,
            'status' => 'active'
        ]);
        
        Post::create([
            'title' => 'Dạy học cho trẻ em vùng cao',
            'content' => '📚 Chương trình dạy học miễn phí cho trẻ em vùng cao.',
            'image' => 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
            'address' => 'Sapa, Lào Cai',
            'start_time' => '2025-10-20 00:00:00',
            'end_time' => '2025-10-22 23:59:00',
            'author_id' => $users[1]->id,
            'status' => 'active'
        ]);

        Post::create([
            'title' => 'Nấu cơm từ thiện cuối tuần',
            'content' => '🍲 Nấu cơm từ thiện cho người vô gia cư!',
            'image' => 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
            'address' => 'Chùa Vĩnh Nghiêm, Q.3',
            'start_time' => '2025-10-14 16:00:00',
            'end_time' => '2025-10-14 20:00:00',
            'author_id' => $users[2]->id,
            'status' => 'active'
        ]);

        // Tạo events
        $this->command->info('Creating events...');
        DB::table('events')->insert([
            // Sự kiện sắp diễn ra
            [
                'title' => 'Dọn dẹp bãi biển Vũng Tàu',
                'content' => 'Thu gom rác thải nhựa và làm sạch bãi biển. Mang theo găng tay và chai nước.',
                'image' => 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&h=400&fit=crop',
                'address' => 'Bãi Trước, Vũng Tàu',
                'start_time' => '2025-12-15 08:00:00',
                'end_time' => '2025-12-15 17:00:00',
                'author_id' => $users[0]->id,
                'status' => 'upcoming',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Dạy học miễn phí cho trẻ em vùng cao',
                'content' => 'Dạy học các môn cơ bản và tặng sách vở cho trẻ em dân tộc.',
                'image' => 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
                'address' => 'Sapa, Lào Cai',
                'start_time' => '2025-12-20 08:00:00',
                'end_time' => '2025-12-22 17:00:00',
                'author_id' => $users[1]->id,
                'status' => 'upcoming',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Hiến máu nhân đạo tại BV Chợ Rẫy',
                'content' => 'Chiến dịch hiến máu cứu người, góp phần giúp đỡ những bệnh nhân cần máu.',
                'image' => 'https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=600&h=400&fit=crop',
                'address' => 'Bệnh viện Chợ Rẫy, Q.5, TP.HCM',
                'start_time' => '2025-11-25 07:00:00',
                'end_time' => '2025-11-25 16:00:00',
                'author_id' => $users[2]->id,
                'status' => 'upcoming',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Tặng áo ấm cho người vô gia cư',
                'content' => 'Phát áo ấm, chăn màn và suất cơm cho người vô gia cư mùa đông.',
                'image' => 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=400&fit=crop',
                'address' => 'Công viên 23/9, Q.1, TP.HCM',
                'start_time' => '2025-12-01 18:00:00',
                'end_time' => '2025-12-01 22:00:00',
                'author_id' => $users[3]->id,
                'status' => 'upcoming',
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Sự kiện đang diễn ra
            [
                'title' => 'Xây dựng nhà tình thương',
                'content' => 'Xây dựng nhà tình thương cho gia đình có hoàn cảnh khó khăn.',
                'image' => 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop',
                'address' => 'Huyện Củ Chi, TP.HCM',
                'start_time' => '2025-11-18 07:00:00',
                'end_time' => '2025-11-25 17:00:00',
                'author_id' => $users[0]->id,
                'status' => 'ongoing',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Chăm sóc người già neo đơn',
                'content' => 'Thăm nom, chăm sóc và trò chuyện với các cụ già neo đơn.',
                'image' => 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop',
                'address' => 'Viện dư양lão Thị Nghè, Q.Bình Thạnh',
                'start_time' => '2025-11-20 08:00:00',
                'end_time' => '2025-11-22 16:00:00',
                'author_id' => $users[1]->id,
                'status' => 'ongoing',
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Sự kiện đã hoàn thành
            [
                'title' => 'Trồng cây xanh Công viên Tao Đàn',
                'content' => 'Đã trồng thành công 200 cây xanh tại công viên, góp phần bảo vệ môi trường.',
                'image' => 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
                'address' => 'Công viên Tao Đàn, Q.1, TP.HCM',
                'start_time' => '2025-10-15 07:00:00',
                'end_time' => '2025-10-15 11:00:00',
                'author_id' => $users[2]->id,
                'status' => 'completed',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Nấu cơm từ thiện cuối tuần',
                'content' => 'Đã nấu và phát 500 suất cơm miễn phí cho người nghèo.',
                'image' => 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
                'address' => 'Chùa Vĩnh Nghiêm, Q.3, TP.HCM',
                'start_time' => '2025-10-14 16:00:00',
                'end_time' => '2025-10-14 20:00:00',
                'author_id' => $users[3]->id,
                'status' => 'completed',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Dọn dẹp rác thải kênh Nhiêu Lộc',
                'content' => 'Thu gom 2 tấn rác thải và làm sạch 3km kênh rạch.',
                'image' => 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop',
                'address' => 'Kênh Nhiêu Lộc, Q.3, TP.HCM',
                'start_time' => '2025-09-20 07:00:00',
                'end_time' => '2025-09-20 15:00:00',
                'author_id' => $users[4]->id,
                'status' => 'completed',
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Sự kiện bị hủy
            [
                'title' => 'Tặng quà Tết cho trẻ em mồ côi',
                'content' => 'Sự kiện bị hủy do thời tiết không thuận lợi, sẽ tổ chức lại vào tháng sau.',
                'image' => 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop',
                'address' => 'Trại trẻ mồ côi Gò Vấp, TP.HCM',
                'start_time' => '2025-11-10 08:00:00',
                'end_time' => '2025-11-10 17:00:00',
                'author_id' => $users[0]->id,
                'status' => 'cancelled',
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Sự kiện khẩn cấp
            [
                'title' => 'Cứu trợ lũ lụt miền Trung - KHẨN CẤP',
                'content' => 'Quyên góp và vận chuyển hàng cứu trợ cho đồng bào miền Trung bị lũ lụt.',
                'image' => 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop',
                'address' => 'Quảng Nam, Quảng Ngãi',
                'start_time' => '2025-11-22 00:00:00',
                'end_time' => '2025-11-30 23:59:00',
                'author_id' => $users[1]->id,
                'status' => 'urgent',
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Sự kiện nhiều ngày
            [
                'title' => 'Hỗ trợ mổ mắt miễn phí',
                'content' => 'Chương trình mổ mắt miễn phí cho người nghèo, thời gian 1 tuần.',
                'image' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
                'address' => 'Bệnh viện Mắt TP.HCM',
                'start_time' => '2025-12-10 07:00:00',
                'end_time' => '2025-12-17 17:00:00',
                'author_id' => $users[2]->id,
                'status' => 'upcoming',
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Sự kiện đặc biệt
            [
                'title' => 'Chạy bộ gây quỹ từ thiện Marathon',
                'content' => 'Giải chạy Marathon gây quỹ cho trẻ em khuyết tật. Phí đăng ký: 200k.',
                'image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
                'address' => 'Công viên Văn hóa Công viên Gia Định',
                'start_time' => '2025-12-05 05:00:00',
                'end_time' => '2025-12-05 10:00:00',
                'author_id' => $users[4]->id,
                'status' => 'upcoming',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // Tạo comments cho posts
        $this->command->info('Creating comments...');
        $posts = Post::all();
        DB::table('comments')->insert([
            [
                'content' => 'Sự kiện ý nghĩa quá!',
                'author_id' => $users[1]->id,
                'post_id' => $posts[0]->id,
                'event_id' => null,
                'created_at' => now()
            ],
            [
                'content' => 'Cho mình đăng ký tham gia.',
                'author_id' => $users[2]->id,
                'post_id' => $posts[0]->id,
                'event_id' => null,
                'created_at' => now()
            ],
            [
                'content' => 'Rất mong chờ chương trình này!',
                'author_id' => $users[0]->id,
                'post_id' => $posts[1]->id,
                'event_id' => null,
                'created_at' => now()
            ]
        ]);

        // Tạo likes cho posts
        $this->command->info('Creating likes...');
        DB::table('likes')->insert([
            [
                'user_id' => $users[1]->id,
                'post_id' => $posts[0]->id,
                'status' => true,
                'created_at' => now()
            ],
            [
                'user_id' => $users[2]->id,
                'post_id' => $posts[0]->id,
                'status' => true,
                'created_at' => now()
            ],
            [
                'user_id' => $users[0]->id,
                'post_id' => $posts[1]->id,
                'status' => true,
                'created_at' => now()
            ]
        ]);

        // Lấy IDs của events để tạo join_events và event_managements
        $events = DB::table('events')->get();
        
        // Tạo join_events (đăng ký tham gia sự kiện)
        $this->command->info('Creating event registrations...');
        DB::table('join_events')->insert([
            // User đăng ký sự kiện đang chờ duyệt
            [
                'user_id' => $users[1]->id,
                'event_id' => $events[0]->id, // Dọn dẹp bãi biển
                'status' => 'pending',
                'created_at' => now()
            ],
            [
                'user_id' => $users[2]->id,
                'event_id' => $events[0]->id,
                'status' => 'pending',
                'created_at' => now()
            ],
            
            // User đã được duyệt tham gia
            [
                'user_id' => $users[3]->id,
                'event_id' => $events[1]->id, // Dạy học vùng cao
                'status' => 'approved',
                'created_at' => now()
            ],
            [
                'user_id' => $users[4]->id,
                'event_id' => $events[1]->id,
                'status' => 'approved',
                'created_at' => now()
            ],
            
            // User đã hoàn thành sự kiện
            [
                'user_id' => $users[1]->id,
                'event_id' => $events[6]->id, // Trồng cây đã hoàn thành
                'status' => 'completed',
                'created_at' => now()
            ],
            [
                'user_id' => $users[3]->id,
                'event_id' => $events[7]->id, // Nấu cơm từ thiện
                'status' => 'completed',
                'created_at' => now()
            ],
            
            // User bị từ chối
            [
                'user_id' => $users[4]->id,
                'event_id' => $events[2]->id, // Hiến máu
                'status' => 'rejected',
                'created_at' => now()
            ],
            
            // User đang tham gia sự kiện ongoing
            [
                'user_id' => $users[2]->id,
                'event_id' => $events[4]->id, // Xây nhà tình thương
                'status' => 'participating',
                'created_at' => now()
            ],
            [
                'user_id' => $users[0]->id,
                'event_id' => $events[5]->id, // Chăm sóc người già
                'status' => 'participating',
                'created_at' => now()
            ]
        ]);

        // Tạo event_managements (quản lý sự kiện)
        $this->command->info('Creating event managements...');
        DB::table('event_managements')->insert([
            // Admin quản lý các sự kiện
            [
                'user_id' => $users[0]->id, // Admin
                'event_id' => $events[0]->id,
                'role' => 'organizer',
                'created_at' => now()
            ],
            [
                'user_id' => $users[1]->id, // Manager  
                'event_id' => $events[1]->id,
                'role' => 'organizer',
                'created_at' => now()
            ],
            
            // Co-organizers
            [
                'user_id' => $users[2]->id,
                'event_id' => $events[0]->id,
                'role' => 'co-organizer',
                'created_at' => now()
            ],
            [
                'user_id' => $users[3]->id,
                'event_id' => $events[2]->id,
                'role' => 'organizer',
                'created_at' => now()
            ],
            
            // Volunteers với quyền hỗ trợ
            [
                'user_id' => $users[4]->id,
                'event_id' => $events[1]->id,
                'role' => 'volunteer',
                'created_at' => now()
            ]
        ]);

        // Tạo channels cho các sự kiện
        $this->command->info('Creating event channels...');
        DB::table('channels')->insert([
            [
                'title' => 'Dọn dẹp bãi biển - Thảo luận',
                'event_id' => $events[0]->id,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Dạy học vùng cao - Chuẩn bị',
                'event_id' => $events[1]->id,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Hiến máu - Hướng dẫn',
                'event_id' => $events[2]->id,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // Tạo messages trong channels
        $channels = DB::table('channels')->get();
        $this->command->info('Creating channel messages...');
        DB::table('messages')->insert([
            [
                'content' => 'Chào mọi người! Hãy chuẩn bị găng tay và chai nước nhé.',
                'sender_id' => $users[0]->id,
                'channel_id' => $channels[0]->id,
                'sent_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'content' => 'Tôi có thể mang thêm túi đựng rác.',
                'sender_id' => $users[1]->id,
                'channel_id' => $channels[0]->id,
                'sent_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'content' => 'Cần chuẩn bị sách vở gì không ạ?',
                'sender_id' => $users[3]->id,
                'channel_id' => $channels[1]->id,
                'sent_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'content' => 'Nhớ ăn sáng đầy đủ trước khi đến hiến máu nhé!',
                'sender_id' => $users[2]->id,
                'channel_id' => $channels[2]->id,
                'sent_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // Tạo notifications
        $this->command->info('Creating notifications...');
        DB::table('notis')->insert([
            [
                'title' => 'Đăng ký sự kiện thành công',
                'message' => 'Bạn đã đăng ký tham gia sự kiện "Dọn dẹp bãi biển Vũng Tàu" thành công.',
                'sender_id' => $users[1]->id,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Sự kiện được duyệt',
                'message' => 'Đăng ký tham gia "Dạy học miễn phí cho trẻ em vùng cao" đã được chấp nhận.',
                'sender_id' => $users[3]->id,
                'is_read' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Sự kiện sắp diễn ra',
                'message' => 'Sự kiện "Hiến máu nhân đạo" sẽ diễn ra vào ngày mai.',
                'sender_id' => $users[2]->id,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Sự kiện bị hủy',
                'message' => 'Sự kiện "Tặng quà Tết cho trẻ em mồ côi" đã bị hủy do thời tiết.',
                'sender_id' => $users[0]->id,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        $this->command->info('✅ Full seeding completed! Created:');
        $this->command->info('   - ' . count($users) . ' users');
        $this->command->info('   - ' . count($posts) . ' posts'); 
        $this->command->info('   - ' . count($events) . ' events');
        $this->command->info('   - Event registrations, managements, channels, and notifications');
    }
}
