# Supabase Quick Start - 5 Minutes

Follow these steps to get Supabase working with your app.

## 1. Create Supabase Project (2 min)

1. Go to **https://supabase.com/** → Sign in → "New Project"
2. Name: `ai-course-tracker`
3. Password: (create strong password, save it)
4. Region: US East (or closest to you)
5. Click "Create" → Wait 2 minutes

## 2. Create Database Table (1 min)

1. In Supabase dashboard → Click **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the contents of `supabase-schema.sql` from your project
4. Paste it in the SQL editor
5. Click **Run** → You should see "Success"

## 3. Get Your API Keys (1 min)

1. Click **Project Settings** (gear icon, bottom left)
2. Click **API** in left menu
3. Copy these three values:

   **Project URL:** `https://xxxxx.supabase.co`
   
   **anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
   
   **service_role key:** Click "Reveal" → Copy the key (⚠️ Keep secret!)

## 4. Add to Vercel (1 min)

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add these 3 variables (click "Add" after each):

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Project URL | ✅ All (Production, Preview, Development) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | ✅ All |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key | ✅ All |

3. Click "Save"

## 5. Deploy

```bash
git add .
git commit -m "Add Supabase integration"
git push
```

Vercel will auto-deploy. Wait 2 minutes, then test your app!

## ✅ Test It Works

1. Open your deployed app
2. Log in
3. Mark a course as completed
4. Refresh the page
5. Your progress should still be there! ✨

## Verify Data in Supabase

1. Supabase dashboard → **Table Editor** → `user_profiles`
2. You should see your user data
3. Click the row to see full JSON

---

## Local Development (Optional)

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

Restart dev server: `npm run dev`

---

**Need help?** See `SUPABASE_SETUP.md` for detailed guide and troubleshooting.
