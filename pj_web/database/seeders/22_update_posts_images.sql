-- ============================================
-- Update Posts with Sample Images
-- Add images to some posts (not all posts need images)
-- ============================================

-- Update posts with relevant images from Unsplash
UPDATE posts SET image = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800' WHERE title LIKE '%Mùa hè xanh%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800' WHERE title LIKE '%dọn dẹp công viên%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800' WHERE title LIKE '%dạy tiếng Anh%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800' WHERE title LIKE '%Workshop kỹ năng%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800' WHERE title LIKE '%quyên góp sách%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800' WHERE title LIKE '%sơ cấp cứu%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1543034892-c60d55a656e4?w=800' WHERE title LIKE '%Tết Nguyên Đán%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800' WHERE title LIKE '%môi trường%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800' WHERE title LIKE '%dọn bãi biển%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800' WHERE title LIKE '%Nâng bước đến trường%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800' WHERE title LIKE '%dạy lập trình%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=800' WHERE title LIKE '%quyên góp quần áo%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1530099486328-e021101a494a?w=800' WHERE title LIKE '%Tây Nguyên%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=800' WHERE title LIKE '%Trung thu%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800' WHERE title LIKE '%sinh nhật%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800' WHERE title LIKE '%người già%' OR title LIKE '%dưỡng lão%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800' WHERE title LIKE '%quyên góp cho bệnh nhân%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800' WHERE title LIKE '%Đà Lạt%' OR title LIKE '%học bổng%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800' WHERE title LIKE '%nấu ăn%' OR title LIKE '%bữa cơm%';
UPDATE posts SET image = 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800' WHERE title LIKE '%chụp ảnh%' OR title LIKE '%nhiếp ảnh%';

-- Total: About 20 posts updated with images
-- Other posts will remain without images (which is fine - not all posts need images)
