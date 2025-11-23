# Quick Fix: Apply Indexes Now

## Your Database Status ✅
- **Total size**: ~400 kB (very small!)
- **Largest table**: 40 kB (feed_posts)
- **Conclusion**: Database size is NOT the problem. You don't need to delete any data.

## The Real Problem
Missing database indexes are causing slow queries. Even with small tables, without indexes, queries can timeout.

## Solution: Apply Indexes (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

### Step 2: Copy This SQL

Copy the ENTIRE contents below and paste into SQL Editor:

```sql
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
CREATE INDEX IF NOT EXISTS idx_feed_posts_user_created_composite ON public.feed_posts(user_id, created_at DESC NULLS LAST);
```

### Step 3: Run It
1. Click **Run** button (or press Ctrl+Enter / Cmd+Enter)
2. Wait 2-5 seconds
3. You should see: "Success. No rows returned"

### Step 4: Test Your Dashboard
1. Refresh your browser
2. Go to your dashboard
3. It should load instantly now! ⚡

## Expected Results
- ✅ Dashboard loads in < 1 second
- ✅ No timeout errors
- ✅ Smooth scrolling and interactions

## If It Still Times Out
1. Check browser console (F12) for specific errors
2. Check Supabase Dashboard → Logs → Database for slow queries
3. Share the error message with me

## You DON'T Need To:
- ❌ Delete any data (your database is tiny!)
- ❌ Upgrade your plan (free tier is fine for this size)
- ❌ Run the cleanup script

The indexes are the solution! 🎯

