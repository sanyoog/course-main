# Quick Deploy to Vercel (5 Minutes)

## 🚀 Super Fast Setup

### Prerequisites
- [x] GitHub account
- [x] Vercel account (free at vercel.com)
- [x] This repository

---

## Step 1: Push to GitHub (1 min)

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/course-main.git
git branch -M main
git push -u origin main
```

---

## Step 2: Connect to Vercel (2 min)

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Select your **`course-main`** repository
5. Click **"Import"**

---

## Step 3: Set Environment Variables (2 min)

Vercel will show the configuration screen. Keep defaults, then click **"Environment Variables"**:

**Add these variables:**

```
Name: USER_ADMIN_PASSWORD
Value: YourStrongPassword123!
```

```
Name: USER_SAMBHOG_PASSWORD
Value: Gunu2007@
```

(Or use your own usernames/passwords)

Click **"Deploy"** - Done! ✨

---

## Step 4: Your App is Live!

After ~1-2 minutes:
- ✅ Build succeeds
- ✅ App deploys
- ✅ You get a URL: `https://course-main-xxxx.vercel.app`

**Login with:**
- Username: `admin` or `sambhog`
- Password: What you set above

---

## Optional: Add Custom Domain

After first deployment:
1. Settings → Domains
2. Enter your domain
3. Add DNS records from Vercel
4. Done! (takes ~10-20 min for DNS)

---

## Optional: Enable Redis Storage (KV)

For production data persistence:

1. Click **"Storage"** in Vercel dashboard
2. **"Create Database"** → **"KV"**
3. Copy the connection string
4. Add to Environment Variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

Your app automatically uses it!

---

## Troubleshooting

### "Build failed"
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `package.json` dependencies are correct

### "Cannot login"
- Verify username/password match environment variables
- Check environment variable names are exact: `USER_ADMIN_PASSWORD`
- Wait 1 minute after deployment for env vars to load

### "Data not persisting"
- By default uses filesystem (no persistence)
- Set up KV storage for production persistence
- Without KV, data resets on redeploy

---

## Next Steps

1. **Custom domain** → Settings → Domains
2. **Team members** → Settings → Members → Invite
3. **Auto-deployments** → Already enabled (git push = auto deploy)
4. **Monitoring** → Analytics tab

---

## That's It! 🎉

Your app is now on production Vercel!

- Push changes to `main` = auto-deploy
- Previous versions available for rollback
- Automatic HTTPS/SSL
- Free tier includes everything you need

Questions? Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed guide.
