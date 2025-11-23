-- Add missing indexes to improve query performance and prevent timeouts

-- Indexes for friendships queries (used in Dashboard loadFeed)
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_friend ON public.friendships(user_id, friend_id);

-- Indexes for reactions queries
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);

-- Indexes for classes queries
CREATE INDEX IF NOT EXISTS idx_classes_user_id ON public.classes(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_user_id_name ON public.classes(user_id, name);

-- Indexes for feed_posts queries
CREATE INDEX IF NOT EXISTS idx_feed_posts_class_id ON public.feed_posts(class_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_user_created_desc ON public.feed_posts(user_id, created_at DESC);

-- Indexes for profiles queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Indexes for study_blocks queries (for today's block lookup)
CREATE INDEX IF NOT EXISTS idx_study_blocks_user_date_time ON public.study_blocks(user_id, block_date, start_time);

-- Indexes for assignments queries
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON public.assignments(class_id);

-- Composite index for feed_posts with user_id and created_at (most common query pattern)
-- This should already exist but ensuring it's there
CREATE INDEX IF NOT EXISTS idx_feed_posts_user_created_composite ON public.feed_posts(user_id, created_at DESC NULLS LAST);

