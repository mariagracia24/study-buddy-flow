# Testing RLS (Row Level Security) Policies

This guide will help you verify that users can only see their own data.

## Prerequisites

1. Make sure you've run the `COMPLETE_SETUP.sql` script in Supabase SQL Editor
2. Have at least 2 test user accounts ready

---

## Test 1: Create Test Data with Multiple Users

### Step 1: Create Two Test Users

1. Go to your app and sign up with:
   - **User 1**: `testuser1@example.com` (or any email)
   - **User 2**: `testuser2@example.com` (or any email)

2. Note down their user IDs from Supabase Dashboard → Authentication → Users

### Step 2: Create Test Data

**As User 1:**
1. Log in as User 1
2. Create a class: "Math 101"
3. Upload a syllabus (if you have one)
4. Create some study blocks in the calendar
5. Create an assignment

**As User 2:**
1. Log out and log in as User 2
2. Create a class: "History 201"
3. Create different study blocks
4. Create different assignments

---

## Test 2: Verify Data Isolation

### Test in Your App

**As User 1:**
1. Go to Dashboard → Should only see "Math 101"
2. Go to Calendar → Should only see User 1's study blocks
3. Go to Profile → Should only see User 1's classes

**As User 2:**
1. Go to Dashboard → Should only see "History 201" (NOT "Math 101")
2. Go to Calendar → Should only see User 2's study blocks (NOT User 1's)
3. Go to Profile → Should only see User 2's classes

### Test in Supabase SQL Editor

Run these queries in Supabase SQL Editor (they should return different results based on which user is authenticated):

```sql
-- This query should only return classes for the currently authenticated user
-- Run this while logged in as User 1 in your app, then check Supabase
SELECT id, name, user_id FROM public.classes;

-- This query should only return study blocks for the currently authenticated user
SELECT id, block_date, class_id, user_id FROM public.study_blocks;

-- This query should only return assignments for the currently authenticated user
SELECT id, title, class_id, user_id FROM public.assignments;
```

**Note:** In Supabase SQL Editor, you're running as the service role, so you'll see all data. This is expected - RLS only applies to client-side queries from your app.

---

## Test 3: Test Direct API Calls

### Using Browser Console

1. Open your app in the browser
2. Open Developer Tools (F12) → Console
3. Log in as User 1
4. Run this in the console:

```javascript
// Get the current user's Supabase client
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user?.id);

// Try to fetch classes - should only see User 1's classes
const { data: classes, error } = await supabase
  .from('classes')
  .select('*');
console.log('Classes for current user:', classes);
console.log('All user_ids in results:', classes?.map(c => c.user_id));

// Try to fetch study blocks - should only see User 1's blocks
const { data: blocks, error: blocksError } = await supabase
  .from('study_blocks')
  .select('*');
console.log('Study blocks for current user:', blocks);
console.log('All user_ids in results:', blocks?.map(b => b.user_id));
```

5. Log out and log in as User 2
6. Run the same code again
7. Verify that:
   - User IDs in the results match the logged-in user
   - No data from User 1 appears

---

## Test 4: Test Edge Cases

### Test 4a: Try to Access Another User's Data Directly

In browser console (while logged in as User 1):

```javascript
// Get User 2's class ID (you'll need to know this from your test data)
// Try to fetch it directly
const { data, error } = await supabase
  .from('classes')
  .select('*')
  .eq('id', 'USER_2_CLASS_ID_HERE'); // Replace with actual ID

// This should return empty array or null, NOT User 2's class
console.log('Should be empty:', data);
```

### Test 4b: Try to Update Another User's Data

```javascript
// Try to update User 2's class (should fail)
const { data, error } = await supabase
  .from('classes')
  .update({ name: 'Hacked!' })
  .eq('id', 'USER_2_CLASS_ID_HERE')
  .select();

// Should return error or empty
console.log('Update result:', data, error);
```

---

## Test 5: Verify Feed Still Works (Public Data)

The feed should still show posts from all users (this is intentional):

1. Log in as User 1
2. Create a study session and post to feed
3. Log out and log in as User 2
4. Go to Feed page
5. **Should see:** User 1's post (feed is public)
6. **Should NOT see:** User 1's classes, assignments, or calendar in other pages

---

## Test 6: Quick SQL Verification

Run this in Supabase SQL Editor to check policy status:

```sql
-- Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('classes', 'assignments', 'study_blocks', 'study_sessions')
ORDER BY tablename;

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('classes', 'assignments', 'study_blocks', 'study_sessions')
ORDER BY tablename, policyname;
```

All tables should show `rls_enabled = true` and have policies listed.

---

## Expected Results

✅ **PASS if:**
- Each user only sees their own classes, assignments, and study blocks
- Users cannot access other users' data through the app
- Feed still shows posts from all users (public)
- RLS is enabled on all tables
- Policies exist for all tables

❌ **FAIL if:**
- User 1 can see User 2's classes/calendar
- Users can update/delete other users' data
- RLS is disabled on any table
- Missing policies on tables

---

## Troubleshooting

### If users can see each other's data:

1. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename = 'classes';
   ```
   Should return `rowsecurity = true`

2. **Check policies exist:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'classes';
   ```
   Should show 4 policies (SELECT, INSERT, UPDATE, DELETE)

3. **Re-run the RLS fix migration:**
   - Copy `supabase/migrations/20251123000000_fix_rls_policies.sql`
   - Run it in SQL Editor

4. **Check your queries:**
   - Make sure frontend queries include `.eq('user_id', user.id)`
   - Check `src/pages/Dashboard.tsx`, `Calendar.tsx`, etc.

### If you get permission errors:

- Make sure users are authenticated
- Check that `auth.uid()` is not null
- Verify the user_id column matches the authenticated user's ID

---

## Quick Test Script

Save this as a test file and run it in browser console:

```javascript
async function testRLS() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Not logged in!');
    return;
  }
  
  console.log('Testing RLS for user:', user.id);
  
  // Test classes
  const { data: classes } = await supabase.from('classes').select('*');
  const allOwnClasses = classes?.every(c => c.user_id === user.id);
  console.log('✅ All classes belong to user:', allOwnClasses);
  
  // Test study blocks
  const { data: blocks } = await supabase.from('study_blocks').select('*');
  const allOwnBlocks = blocks?.every(b => b.user_id === user.id);
  console.log('✅ All blocks belong to user:', allOwnBlocks);
  
  // Test assignments
  const { data: assignments } = await supabase.from('assignments').select('*');
  const allOwnAssignments = assignments?.every(a => a.user_id === user.id);
  console.log('✅ All assignments belong to user:', allOwnAssignments);
  
  if (allOwnClasses && allOwnBlocks && allOwnAssignments) {
    console.log('🎉 RLS is working correctly!');
  } else {
    console.error('❌ RLS is NOT working - users can see other users\' data!');
  }
}

testRLS();
```

Run this while logged in as different users to verify isolation.

