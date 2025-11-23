# How to Apply Database Indexes in Supabase

## Step 1: Apply the Indexes Migration

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy and Paste the Index Migration**
   - Open the file: `supabase/migrations/20251124000000_optimize_queries_indexes.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Query**
   - Click **Run** (or press Ctrl+Enter / Cmd+Enter)
   - Wait for it to complete (should take a few seconds)

5. **Verify Success**
   - You should see: "Success. No rows returned" or similar
   - If you see errors, they might be warnings about indexes already existing (that's okay)

## Step 2: Check Indexes Were Created

Run this query to verify indexes were created:

```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

You should see indexes for:
- `friendships`
- `reactions`
- `classes`
- `feed_posts`
- `profiles`
- `assignments`
- `study_blocks`

## Step 3: Test Your Dashboard

1. Refresh your dashboard in the browser
2. Check if it loads faster
3. Monitor the browser console for any errors

## If You Still Have Timeout Issues

### Option A: Clean Up Old Data

If your database has limited storage, you can delete old data:

1. **Review the cleanup script**: `supabase/migrations/20251124000001_cleanup_old_data.sql`
2. **Adjust the date ranges** (default is 90 days)
3. **Run it in SQL Editor** (be careful - this deletes data permanently!)

### Option B: Check Database Size

Run this query to see how much space your tables are using:

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Option C: Upgrade Database

If you're on the free tier and still having issues:
1. Go to **Settings** → **Infrastructure**
2. Click **Upgrade** or **Change Plan**
3. Upgrade to Pro tier ($25/month) for better performance

## Troubleshooting

**Error: "relation already exists"**
- This means the index already exists - that's fine! The migration uses `IF NOT EXISTS` so it's safe to run multiple times.

**Error: "permission denied"**
- Make sure you're running the query as the database owner (should be automatic in SQL Editor)

**Still timing out after indexes?**
- Check if you have a lot of data (run the size check query above)
- Consider cleaning up old data
- Consider upgrading your database instance

