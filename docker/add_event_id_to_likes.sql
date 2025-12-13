-- Migration: Add event_id to likes table
-- Date: 2024-12-13
-- Description: Thêm cột event_id vào bảng likes để hỗ trợ like cho events

-- Step 1: Thêm cột event_id (nếu chưa có)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'likes' 
        AND column_name = 'event_id'
    ) THEN
        ALTER TABLE likes ADD COLUMN event_id BIGINT;
        RAISE NOTICE 'Column event_id added to likes table';
    ELSE
        RAISE NOTICE 'Column event_id already exists';
    END IF;
END $$;

-- Step 2: Cập nhật kiểu dữ liệu event_id nếu cần (từ integer sang bigint)
DO $$
BEGIN
    ALTER TABLE likes ALTER COLUMN event_id TYPE BIGINT;
    RAISE NOTICE 'Column event_id type updated to BIGINT';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not alter event_id type: %', SQLERRM;
END $$;

-- Step 3: Cho phép post_id nullable (vì có thể like post HOẶC event)
ALTER TABLE likes ALTER COLUMN post_id DROP NOT NULL;

-- Step 4: Thêm foreign key constraint cho event_id (nếu chưa có)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'likes_event_id_fkey'
    ) THEN
        ALTER TABLE likes 
        ADD CONSTRAINT likes_event_id_fkey 
        FOREIGN KEY (event_id) 
        REFERENCES events(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key constraint likes_event_id_fkey added';
    ELSE
        RAISE NOTICE 'Foreign key constraint likes_event_id_fkey already exists';
    END IF;
END $$;

-- Step 5: Tạo partial unique index cho user-post (chỉ khi post_id NOT NULL)
DROP INDEX IF EXISTS likes_user_post_unique;
CREATE UNIQUE INDEX likes_user_post_unique 
ON likes(user_id, post_id) 
WHERE post_id IS NOT NULL;

-- Step 6: Tạo partial unique index cho user-event (chỉ khi event_id NOT NULL)
DROP INDEX IF EXISTS likes_user_event_unique;
CREATE UNIQUE INDEX likes_user_event_unique 
ON likes(user_id, event_id) 
WHERE event_id IS NOT NULL;

-- Step 7: Xác nhận cấu trúc bảng
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'likes'
ORDER BY ordinal_position;

-- Step 8: Hiển thị constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'likes'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Step 9: Hiển thị indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'likes'
ORDER BY indexname;

COMMIT;

-- Migration completed successfully!
