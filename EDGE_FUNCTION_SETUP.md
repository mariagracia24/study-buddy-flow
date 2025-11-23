# Edge Function Setup Guide

## Fixing "Generate posts by AI" Backend Error

The `create-demo-posts` edge function requires three environment variables to be set in your Supabase project:

### Required Environment Variables

1. **SUPABASE_URL** - Your Supabase project URL
2. **SUPABASE_SERVICE_ROLE_KEY** - Your Supabase service role key (bypasses RLS)
3. **LOVABLE_API_KEY** - Your Lovable API key for image generation

### How to Set Environment Variables

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Edge Functions** in the left sidebar
4. Click on **Settings** or find the **Environment Variables** section
5. Add the following variables:

   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   LOVABLE_API_KEY=your-lovable-api-key-here
   ```

### Where to Find These Values

#### SUPABASE_URL
- Found in your Supabase project settings under **API** → **Project URL**
- Format: `https://xxxxxxxxxxxxx.supabase.co`

#### SUPABASE_SERVICE_ROLE_KEY
- Found in your Supabase project settings under **API** → **Service Role Key**
- ⚠️ **WARNING**: This key bypasses Row Level Security. Keep it secret!
- Never expose this key in client-side code

#### LOVABLE_API_KEY
- This should be provided by your Lovable project settings
- Used for AI image generation via the Lovable Gateway

### Verifying the Setup

After setting the environment variables:

1. The edge function will validate all required variables on startup
2. If any are missing, you'll see a clear error message like:
   - `SUPABASE_URL environment variable is not set`
   - `SUPABASE_SERVICE_ROLE_KEY environment variable is not set`
   - `LOVABLE_API_KEY environment variable is not set`

### Testing

1. Try the "Generate posts by AI" feature again
2. Check the browser console for detailed error messages
3. Check Supabase Edge Function logs:
   - Go to **Edge Functions** → **Logs** in your Supabase dashboard
   - Look for error messages with detailed stack traces

### Common Issues

**Issue**: "Failed to create study session" or "Failed to create feed post"
- **Solution**: Check that RLS policies are correctly set up (they should be, since we're using service role key)
- **Solution**: Verify the `study_sessions` and `feed_posts` tables exist and have the correct schema

**Issue**: "Image generation failed"
- **Solution**: Verify `LOVABLE_API_KEY` is correct and has proper permissions
- **Solution**: Check your Lovable API quota/limits

**Issue**: "Request timed out"
- **Solution**: Image generation can take time. The timeout is set to 2 minutes
- **Solution**: Check your network connection and Lovable API status

### Updated Error Handling

The edge function now provides detailed error messages:
- Environment variable validation
- Database operation errors with full details
- Image generation failures
- All errors are logged to Supabase Edge Function logs

Check the browser console and Supabase logs for specific error details.

