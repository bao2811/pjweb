-- Migration: Add completion tracking columns to join_events table
-- Date: 2025-12-17
-- Description: Add completion_status, completed_at, completed_by, completion_note columns

-- Add new columns
ALTER TABLE join_events
ADD COLUMN completion_status VARCHAR(20) DEFAULT 'pending' CHECK (completion_status IN ('pending', 'completed', 'failed')),
ADD COLUMN completed_at TIMESTAMP NULL,
ADD COLUMN completed_by INTEGER NULL,
ADD COLUMN completion_note TEXT NULL;

-- Add foreign key for completed_by (references users table)
ALTER TABLE join_events
ADD CONSTRAINT fk_completed_by_user
FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_join_events_completion_status ON join_events(completion_status);
CREATE INDEX idx_join_events_completed_by ON join_events(completed_by);

-- Add comment to columns
COMMENT ON COLUMN join_events.completion_status IS 'Status of volunteer completion: pending, completed, failed';
COMMENT ON COLUMN join_events.completed_at IS 'Timestamp when volunteer was marked as completed';
COMMENT ON COLUMN join_events.completed_by IS 'Manager ID who marked the completion';
COMMENT ON COLUMN join_events.completion_note IS 'Note from manager about volunteer performance';
