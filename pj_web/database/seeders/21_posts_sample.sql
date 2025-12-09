-- ============================================
-- Insert Sample Posts for Users
-- Posts are general posts (not in any event/channel)
-- channel_id = NULL for general posts
-- ============================================

-- Posts from managers (16 posts)
INSERT INTO posts (title, content, author_id, channel_id, created_at, updated_at) VALUES
-- Manager Nguyen
('Khởi động chiến dịch "Mùa hè xanh 2025"', 'Chúng tôi rất vui mừng thông báo chiến dịch tình nguyện mùa hè năm nay! Cùng nhau chúng ta sẽ mang đến những hoạt động ý nghĩa cho cộng đồng. Đăng ký ngay hôm nay!', (SELECT id FROM users WHERE username = 'manager_nguyen'), NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('Cảm ơn các tình nguyện viên tuần qua', 'Xin gửi lời cảm ơn chân thành đến tất cả các bạn tình nguyện viên đã tham gia dọn dẹp công viên. 50+ bạn đã góp sức làm cho không gian xanh-sạch-đẹp hơn!', (SELECT id FROM users WHERE username = 'manager_nguyen'), NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Manager Tran
('Tuyển tình nguyện viên dạy tiếng Anh miễn phí', 'Chương trình "English for Everyone" đang tìm kiếm 20 tình nguyện viên có khả năng tiếng Anh tốt để dạy cho trẻ em vùng sâu. Thời gian: Thứ 7-CN hàng tuần.', (SELECT id FROM users WHERE username = 'manager_tran'), NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('Chia sẻ kinh nghiệm tổ chức sự kiện', 'Sau 5 năm làm việc với các hoạt động tình nguyện, tôi muốn chia sẻ một số tips quan trọng: 1) Lập kế hoạch chi tiết, 2) Giao tiếp rõ ràng, 3) Luôn có plan B!', (SELECT id FROM users WHERE username = 'manager_tran'), NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Manager Le
('Workshop kỹ năng mềm cho tình nguyện viên', 'Ngày 15/12, chúng tôi sẽ tổ chức workshop về kỹ năng giao tiếp và làm việc nhóm. Miễn phí cho tất cả tình nguyện viên. Đăng ký qua link bên dưới!', (SELECT id FROM users WHERE username = 'manager_le'), NULL, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('Thành quả quý 4/2024', 'Cảm ơn sự đóng góp của mọi người! Quý 4 vừa qua: 15 sự kiện, 500+ tình nguyện viên, 2000+ người được hỗ trợ. Cùng nhau tiếp tục những điều tốt đẹp nhé!', (SELECT id FROM users WHERE username = 'manager_le'), NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Manager Pham
('Quyên góp sách cũ cho thư viện nông thôn', 'Các bạn có sách cũ không dùng nữa? Hãy quyên góp cho dự án xây dựng thư viện tại các trường học vùng sâu. Điểm thu gom: Văn phòng tại 321 Võ Văn Tần.', (SELECT id FROM users WHERE username = 'manager_pham'), NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('Đào tạo kỹ năng sơ cấp cứu', 'Chương trình đào tạo sơ cấp cứu cơ bản sẽ được tổ chức ngày 20/12. Kiến thức cần thiết cho mọi tình nguyện viên khi tham gia các hoạt động ngoài trời.', (SELECT id FROM users WHERE username = 'manager_pham'), NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Manager Hoang
('Kế hoạch Tết Nguyên Đán 2025', 'Chuẩn bị cho mùa Tết, chúng ta sẽ có các hoạt động: tặng quà cho người nghèo, tổ chức bữa cơm sum họp, và múa lân cho trẻ em. Cùng tham gia nhé!', (SELECT id FROM users WHERE username = 'manager_hoang'), NULL, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('Tips bảo vệ môi trường mỗi ngày', 'Những hành động nhỏ tạo nên thay đổi lớn: 1) Mang túi vải khi đi chợ, 2) Tắt điện khi không dùng, 3) Phân loại rác tại nguồn, 4) Sử dụng bình nước cá nhân.', (SELECT id FROM users WHERE username = 'manager_hoang'), NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Manager Vu
('Câu chuyện tình nguyện của tôi', 'Năm năm trước, tôi tham gia hoạt động tình nguyện đầu tiên với tâm thế e dè. Hôm nay, tôi không thể tưởng tượng cuộc sống mà không có cộng đồng này. Cảm ơn mọi người!', (SELECT id FROM users WHERE username = 'manager_vu'), NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('Tìm kiếm sponsor cho dự án năm 2025', 'Chúng tôi đang tìm kiếm các nhà tài trợ cho dự án "Ánh sáng tri thức" - xây dựng 10 thư viện cho trường học vùng cao. Liên hệ qua email nếu quan tâm.', (SELECT id FROM users WHERE username = 'manager_vu'), NULL, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

-- Manager Dang
('Kỷ niệm 3 năm cùng cộng đồng', 'Hôm nay đánh dấu 3 năm tôi được làm việc với các bạn tình nguyện viên tuyệt vời. Cảm ơn vì tất cả những kỷ niệm đẹp và bài học quý giá!', (SELECT id FROM users WHERE username = 'manager_dang'), NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('Hướng dẫn viết báo cáo hoạt động', 'Để báo cáo hiệu quả, hãy ghi rõ: mục tiêu, số người tham gia, kết quả đạt được, khó khăn, và bài học rút ra. Mẫu báo cáo đính kèm trong comment!', (SELECT id FROM users WHERE username = 'manager_dang'), NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Manager Bui
('Góc thư giãn cho tình nguyện viên', 'Làm việc quá nhiều cũng cần nghỉ ngơi! Ngày 25/12, chúng ta sẽ có buổi picnic, chơi game, và giao lưu. Không bàn công việc, chỉ vui vẻ thôi 😊', (SELECT id FROM users WHERE username = 'manager_bui'), NULL, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
('An toàn khi tham gia hoạt động', 'Nhắc nhở quan trọng: Luôn đi theo nhóm, mang theo nước uống, điện thoại đầy pin, và thông báo cho gia đình. An toàn là ưu tiên số 1!', (SELECT id FROM users WHERE username = 'manager_bui'), NULL, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours');

-- Posts from regular users (24 posts)
INSERT INTO posts (title, content, author_id, channel_id, created_at, updated_at) VALUES
-- User Minh
('Lần đầu đi tình nguyện!', 'Hôm qua là lần đầu tiên tôi tham gia hoạt động tình nguyện. Cảm giác thật tuyệt khi được giúp đỡ người khác. Tôi sẽ tham gia thường xuyên hơn!', (SELECT id FROM users WHERE username = 'user_minh'), NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('Cần người cùng đi dọn bãi biển', 'Ai ở quanh khu vực Vũng Tàu muốn cùng nhau đi dọn rác bãi biển không? Thứ 7 tuần sau nhé! Comment nếu bạn quan tâm.', (SELECT id FROM users WHERE username = 'user_minh'), NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- User Anh
('Chia sẻ ảnh hoạt động tuần trước', 'Album ảnh từ sự kiện "Nâng bước đến trường" đây! Cảm ơn mọi người đã tạo nên một ngày đáng nhớ cho các em nhỏ 📸❤️', (SELECT id FROM users WHERE username = 'user_anh'), NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('Tìm kiếm đồng đội cho dự án mới', 'Tôi có ý tưởng về một dự án dạy lập trình cho trẻ em nghèo. Cần tìm 5-6 người có kinh nghiệm IT để cùng thực hiện. DM nếu bạn quan tâm!', (SELECT id FROM users WHERE username = 'user_anh'), NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- User Linh
('Cảm ơn manager_le về workshop!', 'Workshop hôm qua thật bổ ích! Tôi học được nhiều kỹ năng giao tiếp mới. Hy vọng có thêm những buổi như vậy trong tương lai.', (SELECT id FROM users WHERE username = 'user_linh'), NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('Gợi ý điểm quyên góp quần áo cũ', 'Mình có rất nhiều quần áo cũ còn đẹp muốn quyên góp. Các bạn biết điểm tiếp nhận nào uy tín không? Comment giúp mình nhé!', (SELECT id FROM users WHERE username = 'user_linh'), NULL, NOW() - INTERVAL '18 hours', NOW() - INTERVAL '18 hours'),

-- User Hung
('Review chuyến đi từ thiện Tây Nguyên', 'Tuần vừa rồi đi Tây Nguyên trao quà cho bà con vùng cao. Hành trình dài nhưng rất ý nghĩa. Các em nhỏ thật hồn nhiên và đáng yêu!', (SELECT id FROM users WHERE username = 'user_hung'), NULL, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('Tặng quà Trung thu cho trẻ em mồ côi', 'Tháng 9 sắp đến rồi! Ai muốn cùng tôi chuẩn bị quà Trung thu cho các em ở trại mồ côi? Góp tiền hoặc góp công đều được!', (SELECT id FROM users WHERE username = 'user_hung'), NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- User Thao
('Những bài học từ công việc tình nguyện', 'Sau 2 năm làm tình nguyện, tôi học được: kiên nhẫn, lắng nghe, và trân trọng những điều nhỏ bé. Cuộc sống có ý nghĩa hơn nhiều!', (SELECT id FROM users WHERE username = 'user_thao'), NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('Tổ chức sinh nhật cho các bé mồ côi', 'Tháng này có 3 em ở trại mồ côi sinh nhật. Cùng tổ chức bữa tiệc nhỏ cho các em nhé! Đóng góp bánh, quà, hoặc thời gian đều được.', (SELECT id FROM users WHERE username = 'user_thao'), NULL, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),

-- User Nam
('Hỏi về quy trình đăng ký tình nguyện viên', 'Mình mới tham gia group, muốn hỏi quy trình đăng ký chính thức để trở thành tình nguyện viên lâu dài như thế nào? Cảm ơn!', (SELECT id FROM users WHERE username = 'user_nam'), NULL, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('Chia sẻ kinh nghiệm làm việc với người già', 'Khi tham gia viếng thăm viện dưỡng lão, tôi học được cách lắng nghe và kiên nhẫn. Người già cần sự quan tâm và thời gian hơn bất cứ thứ gì.', (SELECT id FROM users WHERE username = 'user_nam'), NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- User Hoa
('Kêu gọi quyên góp cho bệnh nhân nghèo', 'Bạn tôi đang điều trị ung thư nhưng hoàn cảnh khó khăn. Nếu ai có thể hỗ trợ, xin vui lòng liên hệ. Mỗi đồng góp đều quý giá!', (SELECT id FROM users WHERE username = 'user_hoa'), NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('Cảm nhận sau chuyến đi Đà Lạt', 'Chuyến đi trao học bổng tại Đà Lạt tuần trước thật tuyệt! Thấy các em học sinh nghèo vùng cao vẫn cố gắng học tập, tôi cảm thấy mình cần cố gắng hơn nữa.', (SELECT id FROM users WHERE username = 'user_hoa'), NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- User Khanh
('Tips tiết kiệm chi phí khi đi tình nguyện', 'Chia sẻ nhỏ: đi nhóm để chia tiền xăng, mang đồ ăn từ nhà, đặt phòng nghỉ chung. Vừa tiết kiệm vừa vui!', (SELECT id FROM users WHERE username = 'user_khanh'), NULL, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('Tìm người cùng học tiếng Anh', 'Mình muốn cải thiện tiếng Anh để có thể dạy cho trẻ em sau này. Ai muốn cùng học và luyện tập không? Học nhóm sẽ vui hơn!', (SELECT id FROM users WHERE username = 'user_khanh'), NULL, NOW() - INTERVAL '20 hours', NOW() - INTERVAL '20 hours'),

-- User Lan
('Câu chuyện cảm động từ viện dưỡng lão', 'Hôm qua gặp cụ bà 85 tuổi không có con cháu. Cụ nói: "Các cháu đến đây, cụ vui lắm". Tôi khóc mất. Chúng ta thật may mắn!', (SELECT id FROM users WHERE username = 'user_lan'), NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('Mọi người đã đọc sách gì hay chưa?', 'Đang tìm sách hay về phát triển bản thân và kỹ năng xã hội. Các bạn có gợi ý không? Comment tựa sách nhé!', (SELECT id FROM users WHERE username = 'user_lan'), NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- User Duc
('Hướng dẫn cách đóng góp hiệu quả', 'Muốn giúp đỡ nhưng không biết bắt đầu? Hãy: 1) Tìm hiểu nhu cầu thực tế, 2) Đóng góp theo khả năng, 3) Kiên trì dài hạn. Đừng nản khi gặp khó khăn!', (SELECT id FROM users WHERE username = 'user_duc'), NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('Kỷ niệm 1 năm làm tình nguyện', 'Đúng 1 năm trước, tôi tham gia hoạt động đầu tiên. Giờ tôi đã có 500+ giờ đóng góp và vô số kỷ niệm đẹp. Cảm ơn cộng đồng tuyệt vời này!', (SELECT id FROM users WHERE username = 'user_duc'), NULL, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),

-- User Mai
('Lịch hoạt động tháng 12', 'Ai có lịch chi tiết các hoạt động tháng 12 không? Tôi muốn sắp xếp để tham gia nhiều nhất có thể. Cảm ơn trước!', (SELECT id FROM users WHERE username = 'user_mai'), NULL, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('Chia sẻ công thức nấu ăn cho 100 người', 'Vừa tổ chức bữa cơm từ thiện cho 100 người! Nếu ai cần công thức và tips, inbox tôi nhé. Hy vọng giúp ích được!', (SELECT id FROM users WHERE username = 'user_mai'), NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- User Tuan
('Review ứng dụng quản lý tình nguyện', 'Ứng dụng này của chúng ta thiết kế rất đẹp và dễ dùng! Mong team phát triển thêm tính năng chat nhóm để mọi người dễ kết nối hơn.', (SELECT id FROM users WHERE username = 'user_tuan'), NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('Cần người chụp ảnh cho sự kiện', 'Sự kiện tuần sau cần 2-3 bạn biết chụp ảnh để ghi lại khoảnh khắc đẹp. Bạn nào có máy ảnh và kỹ năng nhiếp ảnh hãy đăng ký nhé!', (SELECT id FROM users WHERE username = 'user_tuan'), NULL, NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours');

-- Total: 40 posts
-- 16 posts from managers
-- 24 posts from regular users
-- All posts have channel_id = NULL (general posts, not in any event)
