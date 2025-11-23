-- ============================================
-- CLEANUP OLD DATA TO FREE UP RESOURCES
-- Run this AFTER applying the indexes migration
-- ============================================
-- 
-- WARNING: These queries will DELETE data permanently!
-- Review each section and adjust date ranges as needed.
-- Consider backing up your database first.
--
-- ============================================

-- 1. Delete old study sessions (older than 90 days)
-- Adjust the date as needed (e.g., 30 days, 60 days, etc.)
DELETE FROM public.study_sessions
WHERE completed_at < NOW() - INTERVAL '90 days';

-- 2. Delete old feed posts (older than 90 days)
-- This will also cascade delete related reactions and comments
DELETE FROM public.feed_posts
WHERE created_at < NOW() - INTERVAL '90 days';

-- 3. Delete old study blocks (completed blocks older than 90 days)
-- Only delete blocks that are in the past and not recurring
DELETE FROM public.study_blocks
WHERE block_date < CURRENT_DATE - INTERVAL '90 days'
  AND block_date < CURRENT_DATE; -- Only past dates

-- 4. Delete orphaned assignments (assignments without a class)
-- This shouldn't happen normally, but cleans up any orphaned data
DELETE FROM public.assignments
WHERE class_id NOT IN (SELECT id FROM public.classes);

-- 5. Delete old reactions (optional - usually handled by cascade)
-- Only needed if you want to clean up reactions separately
-- DELETE FROM public.reactions
-- WHERE created_at < NOW() - INTERVAL '90 days';

-- 6. Delete old comments (optional - usually handled by cascade)
-- DELETE FROM public.comments
-- WHERE created_at < NOW() - INTERVAL '90 days';

-- ============================================
-- ANALYZE TABLES AFTER CLEANUP
-- This updates statistics to help query planner
-- ============================================

ANALYZE public.study_sessions;
ANALYZE public.feed_posts;
ANALYZE public.study_blocks;
ANALYZE public.assignments;
ANALYZE public.reactions;
ANALYZE public.comments;

-- ============================================
-- CHECK TABLE SIZES (for monitoring)
-- ============================================
-- Run this query separately to see table sizes:
/*
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
*/

