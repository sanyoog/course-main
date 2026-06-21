# Supabase Setup Guide

This guide will help you set up Supabase for user data storage and progress tracking.

## Why Supabase?

- ✅ **Free tier** with generous limits
- ✅ **PostgreSQL database** - reliable and scalable
- ✅ **Works perfectly with Vercel** - no special configuration needed
- ✅ **Real-time updates** (can be added later)
- ✅ **No connection limits** unlike Redis free tier
- ✅ **SQL access** for data analysis and debugging

## Step 1: Create Supabase Project

1. Go to https://supabase.com/
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email
4. Click "New Project"
5. Fill in:
   - **Name:** `ai-course-tracker` (or whatever you prefer)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users (e.g., US East)
   - **Pricing Plan:** Free (plenty for this project)
6. Click "Create new project"
7. Wait 2-3 minutes for the project to provision

## Step 2: Create Database Table

1. In your Supabase project dashboard, click **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy and paste this SQL:

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on updated_at for faster queries
CREATE INDEX idx_user_profiles_updated_at ON user_profiles(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since we're using service role key)
CREATE POLICY "Allow all operations" ON user_profiles
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE user_profiles IS 'Stores user progress data and learning statistics';
```

4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

## Step 3: Get Your API Keys

1. In Supabase dashboard, click **Project Settings** (gear icon at bottom left)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL** - Copy this (looks like `https://xxxxx.supabase.co`)
   - **Project API keys:**
     - **anon/public** - Copy this key
     - **service_role** - Click "Reveal" and copy this key (⚠️ Keep this secret!)

## Step 4: Update Your Environment Variables

### For Local Development (`.env.local`):

Add these lines to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

Replace:
- `your-project-id.supabase.co` with your Project URL
- `your-anon-key-here` with your anon key
- `your-service-role-key-here` with your service_role key

### For Vercel (Production):

1. Go to your Vercel project dashboard
2. Click **Settings**
3. Click **Environment Variables**
4. Add these three variables one by one:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
     - **Value:** Your Supabase Project URL
     - **Environment:** Production, Preview, Development (check all)
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value:** Your anon key
     - **Environment:** Production, Preview, Development (check all)
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
     - **Value:** Your service_role key
     - **Environment:** Production, Preview, Development (check all)
5. Click **Save** for each variable

## Step 5: Test the Integration

### Local Testing:

1. Restart your development server:
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   npm run dev
   ```

2. Open http://localhost:3000
3. Log in as "sambhog"
4. Mark a course as completed
5. Check the browser console - you should NOT see any errors
6. Refresh the page - your progress should persist

### Verify in Supabase:

1. Go to Supabase dashboard
2. Click **Table Editor** in left sidebar
3. Click **user_profiles** table
4. You should see a row with your user_id and data
5. Click on the row to see the full JSON data

## Step 6: Deploy to Vercel

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add Supabase integration for user data storage"
   git push
   ```

2. Vercel will automatically deploy
3. Wait for deployment to complete
4. Test on your live site - mark some courses as completed
5. Verify data is saved in Supabase dashboard

## Troubleshooting

### "Missing Supabase environment variables" error

**Problem:** Environment variables not set correctly

**Solution:**
1. Check `.env.local` has all three variables
2. Restart your dev server
3. For Vercel: Check environment variables in dashboard
4. Redeploy after adding variables

### "Failed to save data to Supabase" error

**Problem:** Database permissions or table doesn't exist

**Solution:**
1. Verify table was created (Step 2)
2. Check RLS policies are set correctly
3. Try running the SQL script again

### Data not persisting

**Problem:** Using filesystem instead of Supabase

**Solution:**
1. Verify environment variables are set
2. Check browser console for errors
3. Look for "Supabase GET error" or "Supabase upsert error" in logs

### Can't see data in Supabase

**Problem:** Not authenticated or RLS blocking

**Solution:**
1. We use service_role key which bypasses RLS
2. Check you're looking at the right project/table
3. Try the SQL query: `SELECT * FROM user_profiles;`

## Database Schema Details

### Table: `user_profiles`

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | TEXT | Primary key, sanitized username |
| `data` | JSONB | Full user profile including progress, phases, stats |
| `created_at` | TIMESTAMPTZ | When the record was created |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### Data JSON Structure:

```json
{
  "userId": "sambhog",
  "profile": { ... },
  "progress": { ... },
  "phases": {
    "phase-0": { ... },
    "phase-1": { ... },
    ...
  },
  "completedResources": ["resource-id-1", "resource-id-2"],
  "schedule": { ... },
  "statistics": { ... },
  "preferences": { ... }
}
```

## Optional: View Your Data

You can query your data anytime in Supabase:

```sql
-- See all users
SELECT user_id, created_at, updated_at FROM user_profiles;

-- See specific user's full data
SELECT data FROM user_profiles WHERE user_id = 'sambhog';

-- See all users' progress
SELECT 
  user_id,
  data->'progress'->>'completedResources' as completed,
  data->'progress'->>'overallProgress' as progress
FROM user_profiles;
```

## Migration from Filesystem

If you have existing user data in `data/users/user_sambhog.json`:

1. Set up Supabase as described above
2. Log in to the app
3. The first time you mark something complete, your data will be created in Supabase
4. Old filesystem data won't be automatically migrated
5. You can manually copy data if needed (contact for help)

## Benefits of This Setup

✅ **Production-ready** - Works on Vercel without issues
✅ **Scalable** - Can handle many users
✅ **Reliable** - PostgreSQL is battle-tested
✅ **Free** - Up to 500MB database, 2GB bandwidth/month
✅ **Fast** - Direct database queries, no Redis latency
✅ **Debuggable** - SQL queries to inspect data
✅ **Backups** - Supabase handles backups automatically

## Next Steps

Once working, you can add:
- Real-time progress updates (see changes instantly)
- User analytics dashboard
- Export progress data
- Social features (compare progress with friends)
- Leaderboards

## Support

If you run into issues:
1. Check Supabase logs: Dashboard → Logs
2. Check Vercel logs: Vercel Dashboard → Deployments → [Your deployment] → Logs
3. Check browser console for errors
4. Verify all environment variables are set correctly

Your progress tracking is now production-ready! 🎉
