# Database Timeout Fix Guide

## Problem
Your Supabase database is experiencing connection timeouts when loading the dashboard. This is a **database performance issue**, not related to edge function environment variables.

## Solutions (Apply in Order)

### 1. **Immediate Fix: Add Database Indexes** ⚡

Run this SQL migration in your Supabase SQL Editor to add missing indexes:

```sql
-- Copy and paste the contents of:
-- supabase/migrations/20251124000000_optimize_queries_indexes.sql
```

**How to apply:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `supabase/migrations/20251124000000_optimize_queries_indexes.sql`
3. Paste and run it
4. This will add indexes to speed up queries

### 2. **Query Optimizations** ✅ (Already Applied)

The Dashboard queries have been optimized:
- ✅ Select only needed columns (not `SELECT *`)
- ✅ Run queries in parallel where possible
- ✅ Added limits to prevent large result sets
- ✅ Better error handling

### 3. **Upgrade Database Instance** 💰 (If Still Timing Out)

If timeouts persist after adding indexes:

1. Go to Supabase Dashboard → **Settings** → **Infrastructure**
2. Click **Upgrade** or **Change Plan**
3. Upgrade to a larger instance size:
   - **Free tier**: 500MB RAM, 2GB storage
   - **Pro tier**: 1GB+ RAM, 8GB+ storage (recommended for production)
4. Wait 5-10 minutes for upgrade to complete

**Cost**: Pro tier starts at ~$25/month

### 4. **Monitor Database Performance**

Check your database performance:
1. Go to Supabase Dashboard → **Database** → **Performance**
2. Look for slow queries
3. Check connection pool usage

## What Was Fixed

### Database Indexes Added:
- `friendships` table indexes (user_id, friend_id)
- `reactions` table indexes (post_id, user_id)
- `classes` table indexes (user_id)
- `feed_posts` table indexes (class_id, user_id + created_at)
- `profiles` table indexes (user_id)
- `assignments` table indexes (user_id, class_id)

### Query Optimizations:
- Dashboard `loadFeed()` now:
  - Selects only needed columns
  - Runs profile/class/reaction queries in parallel
  - Limits friendships query to 100 results
  - Handles errors gracefully

- Dashboard `loadTodayBlock()` now:
  - Selects only needed columns
  - Runs class/assignment queries in parallel

- Dashboard `loadClasses()` now:
  - Limits to 50 classes max

## Testing

After applying the indexes:
1. Refresh your dashboard
2. Check browser console for any errors
3. Monitor Supabase Dashboard → Database → Performance
4. If still timing out, proceed to database upgrade

## Expected Results

- ✅ Dashboard loads in < 2 seconds
- ✅ No timeout errors in console
- ✅ Smooth user experience

## If Issues Persist

1. **Check Supabase Status**: https://status.supabase.com
2. **Review Query Logs**: Supabase Dashboard → Logs → Database
3. **Contact Support**: If timeouts continue after all fixes

