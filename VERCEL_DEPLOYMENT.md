# Vercel Deployment Guide

## Overview
This Next.js application is fully configured for deployment on Vercel. It includes both frontend and backend (API routes) with optional Redis KV storage for production data persistence.

---

## Pre-Deployment Checklist

### ✅ Environment Setup
- [x] `.env.local` created with passwords
- [x] `.env.example` created for reference
- [x] `vercel.json` configured
- [x] `.vercelignore` configured
- [x] `next.config.ts` optimized for Vercel

### ✅ Code Quality
- [x] No TypeScript errors
- [x] ESLint configuration present
- [x] No console.log statements in production code
- [x] API routes properly configured

### ✅ Dependencies
- [x] All dependencies pinned to specific versions
- [x] No dev dependencies in production
- [x] Tree-shakeable libraries used (recharts, framer-motion)

### ✅ Performance
- [x] Images optimized
- [x] Code compression enabled
- [x] Source maps disabled in production
- [x] Security headers configured

---

## Step 1: Prepare for Deployment

### 1.1 Ensure Git Repository
```bash
git init
git add .
git commit -m "Initial commit: AI learning tracker with mobile responsive design"
```

### 1.2 Create `.env.production` (Vercel Dashboard Only)
Do NOT commit to git. Set these in Vercel dashboard:
- `USER_ADMIN_PASSWORD` - Admin user password
- `USER_SAMBHOG_PASSWORD` - Your user password (or new username)
- Optional: `KV_REST_API_URL` and `KV_REST_API_TOKEN` for Redis storage

### 1.3 Update User Credentials
Before deploying, decide on your usernames and passwords:

Option A: Keep existing users (admin, sambhog)
- Set passwords in Vercel environment variables

Option B: Add new users
- Update `USER_*_PASSWORD` in environment variables
- Remember: Format is `USER_{USERNAME}_PASSWORD`

---

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

4. **Follow prompts:**
   - Link to existing project or create new
   - Confirm project name: `course-main` (or your choice)
   - Select root directory: `./`
   - Accept build settings
   - Environment variables will be asked for

5. **Set Environment Variables**
During deployment, enter:
- `USER_ADMIN_PASSWORD`: Your admin password
- `USER_SAMBHOG_PASSWORD`: Your password
- (Optional) KV credentials if using Redis

### Option B: GitHub/GitLab Integration (Recommended for CI/CD)

1. **Push to GitHub**
```bash
git remote add origin https://github.com/yourusername/course-main.git
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - In Vercel dashboard: Settings → Environment Variables
   - Add all USER_* passwords and optional KV credentials
   - Select which environments: Development / Preview / Production

4. **Deploy**
   - Every push to main automatically deploys

### Option C: Direct Git Connection (Recommended for Teams)

1. **Connect Git Repository**
   - Vercel dashboard → New Project
   - Select "Import Git Repository"
   - Connect your GitHub/GitLab/Bitbucket account
   - Select the repository

2. **Configure**
   - Root directory: `./`
   - Framework: Next.js (auto-detected)
   - Build command: `npm run build` (auto-detected)
   - Install command: `npm install` (auto-detected)

3. **Environment Variables**
   - Add in dashboard before first deployment
   - Will apply to all deployments from this project

---

## Step 3: Configure Environment Variables

### In Vercel Dashboard

1. Go to Project Settings → Environment Variables
2. Add the following:

```
Key: USER_ADMIN_PASSWORD
Value: your_secure_admin_password
Environments: Production, Preview, Development
```

```
Key: USER_SAMBHOG_PASSWORD
Value: your_secure_password
Environments: Production, Preview, Development
```

### Optional: Enable Vercel KV (Redis)

For production data persistence beyond what the filesystem supports:

1. **Create KV Instance**
   - Vercel Dashboard → Storage → Create Database → KV
   - Select region (closest to your users)
   - Copy the connection string

2. **Add to Environment Variables**
```
Key: KV_REST_API_URL
Value: https://your-kv-instance.upstash.io
Environments: Production

Key: KV_REST_API_TOKEN
Value: your_kv_token
Environments: Production
```

---

## Step 4: Post-Deployment

### Verify Deployment

1. **Check Build Logs**
   - Vercel Dashboard → Deployments
   - Click latest deployment
   - Review build logs for any errors

2. **Test Application**
   - Visit your Vercel URL: `https://your-project.vercel.app`
   - Login with your credentials
   - Test features:
     - Overview page with charts
     - Mobile navigation (resize browser)
     - Resource completion tracking
     - Schedule page

3. **Test API Routes**
```bash
# Test auth
curl -X POST https://your-project.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin","password":"your_password"}'

# Test user endpoint
curl "https://your-project.vercel.app/api/user?userId=admin"
```

### Monitor Performance

1. **Vercel Analytics**
   - Dashboard → Analytics
   - View Web Vitals (LCP, FID, CLS)
   - Monitor API usage and response times

2. **Error Tracking**
   - Dashboard → Monitoring
   - Set up error alerts
   - Review performance issues

---

## Configuration Files Overview

### `vercel.json`
- Build and dev commands
- Node.js version (20.x)
- Environment variables metadata
- API function configuration
- Deployment regions

### `next.config.ts`
- Image optimization
- Security headers
- Cache-control policies
- Performance optimizations
- Disables source maps in production

### `.env.example`
- Template for environment variables
- Documents required and optional vars
- Share with team members

### `.vercelignore`
- Excludes unnecessary files from deployment
- Reduces deployment time
- Keeps build lightweight

---

## Troubleshooting

### Build Failures

**Error: "Cannot find module 'recharts'"**
- Run: `npm install`
- Check: `package-lock.json` is committed
- Solution: Vercel will reinstall dependencies

**Error: "Environment variable not found"**
- Check: Variable name in code matches Vercel dashboard
- Ensure: Variable is set for correct environment
- Verify: No typos in variable names

### Runtime Errors

**Error: "Cookie error"**
- Issue: HTTPS required for secure cookies
- Vercel: Always uses HTTPS ✓

**Error: "Cannot write to filesystem"**
- Issue: Vercel Functions are read-only FS
- Solution: Use Vercel KV for persistent storage
- Enable: KV_REST_API_URL and KV_REST_API_TOKEN

### Performance Issues

**Slow page load**
- Check: Image optimization enabled
- Verify: No large bundle issues
- Solution: Use Vercel Analytics to identify bottlenecks

**API timeouts**
- Issue: Default timeout is 30 seconds
- Solution: Already configured in `vercel.json`

---

## Data Storage Strategy

### Development (Local)
- Filesystem-based storage in `/data/users/`
- Set in local `.env.local` only
- Good for development and testing

### Production (Vercel)

**Option 1: Filesystem (Limited)**
- Works on Vercel (read-only for most functions)
- User data stored in filesystem
- Not recommended for persistent data

**Option 2: Vercel KV (Recommended)**
- Redis-based persistent storage
- Serverless, scalable, reliable
- Pay-as-you-go pricing
- 1GB free tier available

**Implementation:**
- API routes automatically use KV if configured
- Fallback to filesystem if KV not available
- No code changes needed!

---

## Security Best Practices

### Passwords

✅ Use strong passwords for production
✅ Different password for each user
✅ Store in Vercel Environment Variables (encrypted)
✅ Never commit `.env.local` to git
✅ Rotate passwords periodically

### HTTPS
✅ All Vercel deployments use HTTPS by default
✅ Custom domain support available
✅ Automatic SSL certificates

### Headers
✅ X-Content-Type-Options
✅ X-Frame-Options
✅ X-XSS-Protection
✅ Referrer-Policy
✅ Permissions-Policy

All configured in `next.config.ts`

### API Security
✅ Cookies set as httpOnly (not accessible via JS)
✅ sameSite: 'lax' prevents CSRF
✅ Password validation server-side
✅ No secrets in client-side code

---

## Custom Domain Setup

1. **Add Domain to Vercel**
   - Project Settings → Domains
   - Enter your domain (e.g., `learning.yourdomain.com`)

2. **Update DNS Records**
   - Vercel will provide nameservers or CNAME
   - Update your domain registrar
   - Wait for DNS propagation (can take 24 hours)

3. **SSL Certificate**
   - Automatic with Let's Encrypt
   - No action needed

---

## CI/CD Pipeline

### Automatic Deployments

**Preview Deployments** (on every push to non-main branches)
- Automatic environment variables from main
- Shareable preview URLs
- Great for PRs and testing

**Production Deployments** (on push to main)
- Same environment variables as production
- Full monitoring and error tracking
- Automatic rollback available

### Manual Redeployment

```bash
vercel --prod
```

Or through dashboard: Deployments → Click deployment → "Redeploy"

---

## Monitoring & Maintenance

### Weekly
- Check Vercel Dashboard for errors
- Review analytics metrics
- Monitor user feedback

### Monthly
- Review API usage
- Check for dependency updates
- Verify data integrity (if using KV)

### Quarterly
- Security audit
- Performance optimization
- Backup verification

---

## Rollback Strategy

If deployment goes wrong:

1. **Vercel Dashboard**
   - Deployments section
   - Previous deployment (auto-kept)
   - Click "Rollback" button
   - Instant rollback (no rebuild)

2. **Git Rollback**
```bash
git revert HEAD
git push
# Vercel auto-deploys the reverted commit
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel KV Docs**: https://vercel.com/docs/storage/vercel-kv
- **Status Page**: https://www.vercelstatus.com/

---

## Deployment Checklist Summary

- [ ] Git repository created and committed
- [ ] `.env.local` NOT in git (in `.gitignore`)
- [ ] Vercel CLI installed
- [ ] GitHub/GitLab account connected
- [ ] User credentials decided
- [ ] Vercel account created
- [ ] Project created in Vercel
- [ ] Environment variables set
- [ ] Build succeeds
- [ ] Application loads
- [ ] Features tested
- [ ] Analytics visible
- [ ] Custom domain configured (optional)

---

## Success! 🎉

Your application is now live on Vercel!

- **Production URL**: `https://your-project.vercel.app`
- **Custom Domain**: `https://your-domain.com` (if configured)
- **Auto-deployments**: Push to main branch
- **Monitoring**: Vercel Dashboard
- **Data**: Persistent with KV storage
- **Performance**: Optimized with Vercel Edge Network

Happy learning! 🚀
