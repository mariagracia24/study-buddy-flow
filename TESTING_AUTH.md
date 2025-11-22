# Testing Authentication & Database

## Quick Ways to Test with Fresh Login

### Method 1: Use the Logout Button (Easiest)
1. Go to **Profile** page (bottom nav)
2. Scroll to the bottom
3. Click **"Sign Out"** button
4. You'll be redirected to the login page
5. Create a new account or sign in with a different email

### Method 2: Clear Browser Storage (Manual)
1. Open browser Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → your localhost URL
4. Delete all entries (especially `sb-<project-id>-auth-token`)
5. Refresh the page
6. You'll be logged out and see the login page

### Method 3: Use Browser Console (Quick)
Open browser console (F12) and run:
```javascript
// Clear Supabase session
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Method 4: Use Incognito/Private Window
- Open a new incognito/private window
- Navigate to localhost
- You'll start fresh with no saved session

## Testing Multiple Users

1. **Create User 1:**
   - Sign up with `test1@example.com`
   - Create classes and calendar events
   - Note what data you created

2. **Logout:**
   - Go to Profile → Sign Out
   - Or clear browser storage

3. **Create User 2:**
   - Sign up with `test2@example.com`
   - Create different classes and events

4. **Verify Isolation:**
   - User 2 should NOT see User 1's data
   - Each user should only see their own:
     - Classes
     - Calendar events
     - Assignments
     - Study blocks

## Quick Test Script

Run this in browser console while logged in to verify RLS:

```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user?.id, user?.email);

// Test classes - should only see current user's
const { data: classes } = await supabase.from('classes').select('*');
console.log('Classes:', classes);
console.log('All belong to user?', classes?.every(c => c.user_id === user.id));

// Test study blocks - should only see current user's
const { data: blocks } = await supabase.from('study_blocks').select('*');
console.log('Study blocks:', blocks);
console.log('All belong to user?', blocks?.every(b => b.user_id === user.id));
```

## Troubleshooting

**If you're still auto-logged in:**
- Check if there's a saved session in localStorage
- Make sure you clicked "Sign Out" button
- Try Method 2 or 3 above

**If logout doesn't work:**
- Check browser console for errors
- Make sure you're on the Profile page
- Try clearing browser storage manually

