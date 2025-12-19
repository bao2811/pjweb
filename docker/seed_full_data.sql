-- Seed full test data (keep users, regenerate all else)
-- Author: all events created by user_id=7
-- Priority user for testing: user_id=6
-- Run: Get-Content "seed_full_data.sql" -Raw | docker exec -i -e PGPASSWORD=bao12345 pj_postgres psql -h localhost -U bao -d web

BEGIN;

-- Step 0: ALTER TABLE to add completion columns if not exist
DO $$
BEGIN
  -- Add completion_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='join_events' AND column_name='completion_status'
  ) THEN
    ALTER TABLE public.join_events 
    ADD COLUMN completion_status VARCHAR(50) DEFAULT 'pending';
  END IF;

  -- Add completed_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='join_events' AND column_name='completed_at'
  ) THEN
    ALTER TABLE public.join_events 
    ADD COLUMN completed_at TIMESTAMP WITHOUT TIME ZONE;
  END IF;

  -- Add completed_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='join_events' AND column_name='completed_by'
  ) THEN
    ALTER TABLE public.join_events 
    ADD COLUMN completed_by BIGINT;
  END IF;

  -- Add completion_note column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='join_events' AND column_name='completion_note'
  ) THEN
    ALTER TABLE public.join_events 
    ADD COLUMN completion_note TEXT;
  END IF;

  -- Add foreign key if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'join_events_completed_by_fkey'
  ) THEN
    ALTER TABLE public.join_events 
    ADD CONSTRAINT join_events_completed_by_fkey 
    FOREIGN KEY (completed_by) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Step 1: Clean all data EXCEPT users
DELETE FROM public.comments;
DELETE FROM public.likes WHERE event_id IS NOT NULL;
DELETE FROM public.channels;
DELETE FROM public.event_managements;
DELETE FROM public.join_events;
DELETE FROM public.events;

-- Step 2: Insert 15 diverse events (author_id=7)
INSERT INTO public.events (
  id, title, content, image, address, start_time, end_time,
  author_id, status, created_at, updated_at,
  max_participants, current_participants, category, likes
) VALUES
-- Upcoming events (chua bat dau)
(1001, 'Don rac bai bien Da Nang', 'Hoat dong tinh nguyen don dep bai bien', 'https://picsum.photos/seed/e1/600/400',
 'Bai bien My Khe, Da Nang', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 3 hours',
 7, 'upcoming', NOW(), NOW(), 50, 8, 'Moi truong', 12),

(1002, 'Trong cay xanh cong vien', 'Trong 100 cay xanh tai cong vien', 'https://picsum.photos/seed/e2/600/400',
 'Cong vien Thong Nhat, Ha Noi', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours',
 7, 'upcoming', NOW(), NOW(), 40, 3, 'Moi truong', 8),

(1003, 'Day hoc mien phi cho tre em', 'Day tieng Anh va Toan cho tre em ngheo', 'https://picsum.photos/seed/e3/600/400',
 'Nha van hoa phuong 5, TP.HCM', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 4 hours',
 7, 'upcoming', NOW(), NOW(), 25, 0, 'Giao duc', 5),

-- Ongoing events (dang dien ra)
(1004, 'Hien mau nhan dao', 'Tiem chung va hien mau', 'https://picsum.photos/seed/e4/600/400',
 'Benh vien Trung uong, Ha Noi', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '3 hours',
 7, 'ongoing', NOW(), NOW(), 80, 65, 'Y te', 30),

(1005, 'Ho tro nguoi gia', 'Tham va tang qua nguoi gia', 'https://picsum.photos/seed/e5/600/400',
 'Vien duong lao, TP.HCM', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '2 hours',
 7, 'ongoing', NOW(), NOW(), 30, 28, 'Cong dong', 18),

-- Completed events (da ket thuc - DA DANH GIA)
(1006, 'Ve sinh song Huong', 'Don rac tren song Huong', 'https://picsum.photos/seed/e6/600/400',
 'Song Huong, Hue', NOW() - INTERVAL '10 days 4 hours', NOW() - INTERVAL '10 days',
 7, 'completed', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', 60, 55, 'Moi truong', 45),

(1007, 'Giao luu van hoa', 'Bieu dien van nghe truyen thong', 'https://picsum.photos/seed/e7/600/400',
 'Nha hat Thanh pho, Da Nang', NOW() - INTERVAL '5 days 3 hours', NOW() - INTERVAL '5 days',
 7, 'completed', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', 100, 88, 'Van hoa', 67),

-- Completed events (da ket thuc - CHUA DANH GIA)
(1008, 'Chay bo vi suc khoe', 'Chay bo 5km quanh ho Hoan Kiem', 'https://picsum.photos/seed/e8/600/400',
 'Ho Hoan Kiem, Ha Noi', NOW() - INTERVAL '2 days 2 hours', NOW() - INTERVAL '2 days',
 7, 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 120, 110, 'The thao', 88),

(1009, 'Phat com tu thien', 'Phat 200 suat com mien phi', 'https://picsum.photos/seed/e9/600/400',
 'Chua Phap Lam, TP.HCM', NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day',
 7, 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 50, 48, 'Tu thien', 55),

-- Cancelled events
(1010, 'Workshop lap trinh', 'Hoc lap trinh Python co ban', 'https://picsum.photos/seed/e10/600/400',
 'Truong DH Bach Khoa, Ha Noi', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours',
 7, 'cancelled', NOW(), NOW(), 40, 5, 'Giao duc', 3),

-- Pending events (cho admin duyet)
(1011, 'Don rac cong vien', 'Ve sinh cong vien Gia Dinh', 'https://picsum.photos/seed/e11/600/400',
 'Cong vien Gia Dinh, TP.HCM', NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days 2 hours',
 7, 'pending', NOW(), NOW(), 35, 0, 'Moi truong', 0),

-- Rejected events
(1012, 'Bieu dien street dance', 'Nhay hiphop tai quang truong', 'https://picsum.photos/seed/e12/600/400',
 'Quang truong Dong Khoi, TP.HCM', NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 2 hours',
 7, 'rejected', NOW(), NOW(), 60, 0, 'Van hoa', 0),

-- More completed for diversity
(1013, 'Quyen sach cho hoc sinh', 'Gom sach va tang cho tre em vung cao', 'https://picsum.photos/seed/e13/600/400',
 'Truong tieu hoc Dong Da, Ha Noi', NOW() - INTERVAL '15 days 2 hours', NOW() - INTERVAL '15 days',
 7, 'completed', NOW() - INTERVAL '16 days', NOW() - INTERVAL '15 days', 45, 40, 'Giao duc', 32),

(1014, 'Bao ve bien dao', 'Tuyen truyen bao ve chu quyen bien dao', 'https://picsum.photos/seed/e14/600/400',
 'Truong THPT Tran Phu, Hai Phong', NOW() - INTERVAL '8 days 3 hours', NOW() - INTERVAL '8 days',
 7, 'completed', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', 200, 180, 'Giao duc', 95),

(1015, 'Son lai truong hoc', 'Lam dep truong hoc cho tre em', 'https://picsum.photos/seed/e15/600/400',
 'Truong TH Nguyen Du, Quang Ngai', NOW() - INTERVAL '20 days 4 hours', NOW() - INTERVAL '20 days',
 7, 'completed', NOW() - INTERVAL '22 days', NOW() - INTERVAL '20 days', 70, 62, 'Cong dong', 48);


-- Step 3: Insert join_events with diverse scenarios
-- Priority: user_id=6
-- ONLY use existing columns: id, user_id, event_id, status, joined_at, created_at
INSERT INTO public.join_events (
  id, user_id, event_id, status, joined_at, created_at
) VALUES
-- Event 1001 (upcoming): user 6 approved, user 5 pending
(2001, 6, 1001, 'approved', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2002, 5, 1001, 'pending', NULL, NOW() - INTERVAL '1 day'),
(2003, 6, 1001, 'approved', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Event 1002 (upcoming): user 6 pending, user 3 approved
(2004, 6, 1002, 'pending', NULL, NOW() - INTERVAL '1 day'),
(2005, 3, 1002, 'approved', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Event 1004 (ongoing): user 6 approved, user 5 approved
(2006, 6, 1004, 'approved', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(2007, 5, 1004, 'approved', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

-- Event 1005 (ongoing): user 6 approved, user 3 approved
(2009, 6, 1005, 'approved', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(2010, 3, 1005, 'approved', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Event 1006 (completed): user 6 approved, user 5 approved
(2011, 6, 1006, 'approved', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days'),
(2012, 5, 1006, 'approved', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days'),

-- Event 1007 (completed): user 6 approved, user 3 approved
(2014, 6, 1007, 'approved', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
(2015, 3, 1007, 'approved', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),

-- Event 1008 (completed): user 6 approved, user 5 approved
(2016, 6, 1008, 'approved', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(2017, 5, 1008, 'approved', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Event 1009 (completed): user 6 approved, user 3 approved
(2019, 6, 1009, 'approved', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2020, 3, 1009, 'approved', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Event 1013 (completed): user 6 approved
(2021, 6, 1013, 'approved', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days'),

-- Event 1014 (completed): user 6 approved, user 5 approved
(2022, 6, 1014, 'approved', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
(2023, 5, 1014, 'approved', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),

-- Event 1015 (completed): user 6 approved, user 5 approved
(2024, 6, 1015, 'approved', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
(2025, 5, 1015, 'approved', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days');


-- Step 4: Skip likes (post_id is NOT NULL, cannot like events directly)


-- Step 5: Insert channels for events
INSERT INTO public.channels (event_id, title, created_at, updated_at) VALUES
(1001, 'Kenh su kien: Don rac bai bien Da Nang', NOW(), NOW()),
(1002, 'Kenh su kien: Trong cay xanh cong vien', NOW(), NOW()),
(1003, 'Kenh su kien: Day hoc mien phi cho tre em', NOW(), NOW()),
(1004, 'Kenh su kien: Hien mau nhan dao', NOW(), NOW()),
(1005, 'Kenh su kien: Ho tro nguoi gia', NOW(), NOW()),
(1006, 'Kenh su kien: Ve sinh song Huong', NOW(), NOW()),
(1007, 'Kenh su kien: Giao luu van hoa', NOW(), NOW()),
(1008, 'Kenh su kien: Chay bo vi suc khoe', NOW(), NOW()),
(1009, 'Kenh su kien: Phat com tu thien', NOW(), NOW()),
(1013, 'Kenh su kien: Quyen sach cho hoc sinh', NOW(), NOW()),
(1014, 'Kenh su kien: Bao ve bien dao', NOW(), NOW()),
(1015, 'Kenh su kien: Son lai truong hoc', NOW(), NOW());


-- Step 6: Insert some comments on events (user 6 active)
INSERT INTO public.comments (content, author_id, post_id, event_id, created_at, parent_id) VALUES
('Su kien rat y nghia!', 6, NULL, 1001, NOW() - INTERVAL '1 day', NULL),
('Minh se tham gia', 5, NULL, 1001, NOW() - INTERVAL '12 hours', NULL),
('Rat mong duoc tham gia', 6, NULL, 1004, NOW() - INTERVAL '4 days', NULL),
('Cam on BTC da to chuc', 6, NULL, 1006, NOW() - INTERVAL '10 days', NULL),
('Su kien rat thanh cong', 5, NULL, 1007, NOW() - INTERVAL '5 days', NULL),
('Hay qua!', 3, NULL, 1007, NOW() - INTERVAL '5 days', NULL);


-- Step 7: Update current_participants count based on approved joins
UPDATE public.events SET current_participants = (
  SELECT COUNT(*) FROM public.join_events 
  WHERE join_events.event_id = events.id AND join_events.status = 'approved'
);

-- Step 8: Update likes count based on actual likes
UPDATE public.events SET likes = (
  SELECT COUNT(*) FROM public.likes 
  WHERE likes.event_id = events.id
);

-- Step 9: Reset sequences
SELECT setval('events_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.events), 1), false);
SELECT setval('join_events_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.join_events), 1), false);
SELECT setval('likes_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.likes), 1), false);
SELECT setval('channels_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.channels), 1), false);
SELECT setval('comments_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.comments), 1), false);

COMMIT;

-- Summary of test scenarios (WITHOUT completion_status - need migration first):
-- 1. Event 1001 (upcoming): user 6 approved (x2), user 5 pending (test accept/reject)
-- 2. Event 1004 (ongoing): user 6 + user 5 approved (test ongoing participation)
-- 3. Event 1006-1015 (completed): Multiple approved registrations (test mark completion after event ends)
-- Note: Run completion migration first to enable completion_status tracking
