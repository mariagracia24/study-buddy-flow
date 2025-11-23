# Setup Guide for New Developers

## Quick Start

When you clone this repository, you need to set up your own `.env` file to connect to Supabase.

## Option 1: Use the Shared Supabase Project (Recommended for Team)

If you're working with a team and want to share the same database:

1. **Get the credentials from your team lead** or check your team's shared password manager
2. **Create a `.env` file** in the project root:
   ```env
   VITE_SUPABASE_URL=https://yqwvwzpwwtpkolwnjkom.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_HP6McMu5kRH9RQFv4mCu8w_l4u7uHRH
   ```
3. **Restart your dev server**

## Option 2: Create Your Own Supabase Project (For Testing)

If you want your own separate database for testing:

1. **Create a Supabase account** at https://app.supabase.com
2. **Create a new project** (takes 2-3 minutes)
3. **Get your API keys:**
   - Go to Settings → API
   - Copy your Project URL
   - Copy your anon/public key
4. **Create a `.env` file** in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key-here
   ```
5. **Set up your database:**
   - Go to Supabase SQL Editor
   - Run the `COMPLETE_SETUP.sql` file from `supabase/migrations/`
   - Run the indexes migration: `20251124000000_optimize_queries_indexes.sql`
6. **Restart your dev server**

## Why .env is Not Committed

The `.env` file contains sensitive credentials and is **never committed to git** for security reasons:

- ✅ **Safe**: Each developer has their own `.env` file locally
- ✅ **Secure**: Credentials never end up in version control
- ✅ **Flexible**: Developers can use shared or separate databases

## What IS Committed

- ✅ `.env.example` - Template showing what variables are needed
- ✅ All documentation files explaining how to set up
- ✅ All code and configuration files

## For Production/Deployment

When deploying to production (Vercel, Netlify, etc.):

1. **Set environment variables in your hosting platform:**
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Other platforms: Check their documentation

2. **Use the same Supabase project** (or create a production project)

3. **Never commit production credentials** to git

## Troubleshooting

**"Missing Supabase environment variables" error:**
- ✅ Make sure `.env` file exists in project root
- ✅ Check variable names start with `VITE_`
- ✅ Restart dev server after creating `.env`

**Can't sign in:**
- ✅ Check your Supabase project is active
- ✅ Verify credentials are correct
- ✅ Make sure database schema is set up (run migrations)

## Need Help?

- See `CONNECT_SUPABASE_STEP_BY_STEP.md` for detailed instructions
- See `FIND_API_KEYS_GUIDE.md` for visual guide to finding keys
- Ask your team lead for shared credentials

