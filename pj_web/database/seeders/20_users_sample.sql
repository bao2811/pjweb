-- ============================================
-- Insert 20 Sample Users with Vietnamese Names
-- Password for all users: password123
-- Hashed with bcrypt: $2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu
-- ============================================

-- Manager users (8)
INSERT INTO users (username, email, password, phone, address, address_card, image, role, status, created_at, updated_at) VALUES
('manager_nguyen', 'nguyen.manager@tinhnguyen.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0901234567', '123 Lê Lợi, Quận 1, TP.HCM', '079123456789', 'https://i.pravatar.cc/150?img=11', 'manager', 'active', NOW(), NOW()),
('manager_tran', 'tran.manager@tinhnguyen.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0901234568', '456 Nguyễn Huệ, Quận 1, TP.HCM', '079123456790', 'https://i.pravatar.cc/150?img=12', 'manager', 'active', NOW(), NOW()),
('manager_le', 'le.manager@tinhnguyen.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0902345678', '789 Trần Hưng Đạo, Quận 5, TP.HCM', '079234567891', 'https://i.pravatar.cc/150?img=13', 'manager', 'active', NOW(), NOW()),
('manager_pham', 'pham.manager@tinhnguyen.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0902345679', '321 Võ Văn Tần, Quận 3, TP.HCM', '079234567892', 'https://i.pravatar.cc/150?img=14', 'manager', 'active', NOW(), NOW()),
('manager_hoang', 'hoang.manager@tinhnguyen.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0902345680', '654 Cách Mạng Tháng 8, Quận 10, TP.HCM', '079234567893', 'https://i.pravatar.cc/150?img=15', 'manager', 'active', NOW(), NOW()),
('manager_vu', 'vu.manager@tinhnguyen.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0902345681', '987 Lý Thường Kiệt, Quận 11, TP.HCM', '079234567894', 'https://i.pravatar.cc/150?img=16', 'manager', 'pending', NOW(), NOW()),
('manager_dang', 'dang.manager@tinhnguyen.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0902345682', '159 Hai Bà Trưng, Quận 1, TP.HCM', '079234567895', 'https://i.pravatar.cc/150?img=17', 'manager', 'active', NOW(), NOW()),
('manager_bui', 'bui.manager@tinhnguyen.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0902345683', '753 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', '079234567896', 'https://i.pravatar.cc/150?img=18', 'manager', 'locked', NOW(), NOW());

-- Regular users (12)
INSERT INTO users (username, email, password, phone, address, address_card, image, role, status, created_at, updated_at) VALUES
('user_minh', 'minh.user@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0903456789', '147 Pasteur, Quận 1, TP.HCM', '079345678901', 'https://i.pravatar.cc/150?img=21', 'user', 'active', NOW(), NOW()),
('user_anh', 'anh.user@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0903456790', '258 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM', '079345678902', 'https://i.pravatar.cc/150?img=22', 'user', 'active', NOW(), NOW()),
('user_linh', 'linh.user@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0903456791', '369 Lê Văn Sỹ, Quận Tân Bình, TP.HCM', '079345678903', 'https://i.pravatar.cc/150?img=23', 'user', 'active', NOW(), NOW()),
('user_hung', 'hung.user@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0903456792', '741 Hoàng Văn Thụ, Quận Phú Nhuận, TP.HCM', '079345678904', 'https://i.pravatar.cc/150?img=24', 'user', 'active', NOW(), NOW()),
('user_thao', 'thao.user@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0903456793', '852 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP.HCM', '079345678905', 'https://i.pravatar.cc/150?img=25', 'user', 'active', NOW(), NOW()),
('user_nam', 'nam.user@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0903456794', '963 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', '079345678906', 'https://i.pravatar.cc/150?img=26', 'user', 'pending', NOW(), NOW()),
('user_hoa', 'hoa.user@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0903456795', '159 Cộng Hòa, Quận Tân Bình, TP.HCM', '079345678907', 'https://i.pravatar.cc/150?img=27', 'user', 'active', NOW(), NOW()),
('user_khanh', 'khanh.user@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0903456796', '357 Phan Xích Long, Quận Phú Nhuận, TP.HCM', '079345678908', 'https://i.pravatar.cc/150?img=28', 'user', 'active', NOW(), NOW()),
('user_lan', 'lan.user@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0903456797', '456 Nguyễn Đình Chiểu, Quận 3, TP.HCM', '079345678909', 'https://i.pravatar.cc/150?img=29', 'user', 'locked', NOW(), NOW()),
('user_duc', 'duc.user@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0903456798', '789 Bà Huyện Thanh Quan, Quận 3, TP.HCM', '079345678910', 'https://i.pravatar.cc/150?img=30', 'user', 'active', NOW(), NOW()),
('user_mai', 'mai.user@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0903456799', '147 Trường Sơn, Quận Tân Bình, TP.HCM', '079345678911', 'https://i.pravatar.cc/150?img=31', 'user', 'active', NOW(), NOW()),
('user_tuan', 'tuan.user@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lE3NfwH5M3Zu', '0903456800', '258 Ung Văn Khiêm, Quận Bình Thạnh, TP.HCM', '079345678912', 'https://i.pravatar.cc/150?img=32', 'user', 'active', NOW(), NOW());

-- Total: 20 users
-- 8 managers, 12 regular users
-- Status distribution: 15 active, 3 pending, 2 locked
-- Password for all: password123
