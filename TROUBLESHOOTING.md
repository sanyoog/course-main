# Troubleshooting Guide

## Common Issues and Solutions

---

## Issue: Error saving user data - "getaddrinfo ENOTFOUND example.upstash.io"

### Problem
```
Error saving user data: [TypeError: fetch failed]
{[cause]: Error: getaddrinfo ENOTFOUND example.upstash.io
```

### Cause
The API is trying to use Vercel KV (Redis) because `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set in `.env.local`, but they have placeholder/example values that don't point to a real Redis instance.

### Solution

**Option 1: Use Filesystem (Local Development)**

Comment out or remove the KV variables in `.env.local`:

```bash
# .env.local

# Authentication
USER_ADMIN_PASSWORD="password123"
USER_sambhog_PASSWORD="Gunu2007@"

# KV - Leave commented for local development
# KV_REST_API_URL="https://example.upstash.io"
# KV_REST_API_TOKEN="example_token"
```

**Option 2: Set Up Real Vercel KV (Production)**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Create a KV database
3. Copy the real connection string
4. Update `.env.local` with real values:

```bash
KV_REST_API_URL="https://your-real-kv-instance.upstash.io"
KV_REST_API_TOKEN="your_real_token_here"
```

### After Fix

1. Stop the dev server (Ctrl+C)
2. Restart: `npm run dev`
3. Try marking a resource as complete
4. Check `data/users/user_sambhog.json` - it should update!

---

## Issue: Data Not Saving

### Symptoms
- Mark resources as complete
- Page refreshes, but progress is lost
- `data/users/user_sambhog.json` doesn't update

### Diagnosis Steps

1. **Check the API is being called:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Mark a resource complete
   - Look for POST request to `/api/user`
   - Check the response status (should be 200, not 500)

2. **Check environment variables:**
   - Verify `.env.local` has no KV variables (or they're commented out)
   - Restart dev server after changes

3. **Check file permissions:**
   - Ensure `data/users/` folder exists
   - Windows: Right-click folder → Properties → Security → make sure you have Write permissions

4. **Check browser console:**
   - F12 → Console tab
   - Look for red error messages
   - Common errors:
     - "Failed to fetch" - Network issue
     - "500 Internal Server Error" - API error (check terminal)

### Solutions

**If API returns 500:**
- Check terminal/console for detailed error
- Usually KV configuration issue (see Issue #1 above)

**If API not called at all:**
- Check browser console for JavaScript errors
- Verify you're logged in
- Clear browser cache and reload

**If folder doesn't exist:**
```bash
mkdir -p data/users
```

**If permissions issue (Windows):**
1. Right-click `data/users/` folder
2. Properties → Security
3. Edit → Add your user
4. Check "Full Control"
5. Apply → OK

---

## Issue: Login Not Working

### Symptoms
- Enter username/password
- "Invalid password" or "User not found" error
- Can't access the app

### Solution

1. **Check environment variables:**

Open `.env.local` and verify:
```bash
USER_ADMIN_PASSWORD="password123"
USER_sambhog_PASSWORD="Gunu2007@"
```

2. **Verify username format:**
- Environment variable: `USER_SAMBHOG_PASSWORD` (UPPERCASE)
- Login username: `sambhog` (lowercase)
- The system converts username to uppercase for lookup

3. **Restart dev server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

4. **Clear cookies:**
- F12 → Application → Cookies
- Delete all cookies for localhost:3000
- Try logging in again

### Add New User

To add a new user named "john":

1. Edit `.env.local`:
```bash
USER_JOHN_PASSWORD="john_password_here"
```

2. Restart server: `npm run dev`
3. Login with:
   - Username: `john`
   - Password: `john_password_here`

---

## Issue: Charts Not Showing

### Symptoms
- Overview page loads but charts are blank
- Console shows errors about recharts

### Solution

1. **Reinstall dependencies:**
```bash
npm install
```

2. **Check recharts is installed:**
```bash
npm list recharts
```

Should show: `recharts@3.8.1`

3. **Clear Next.js cache:**
```bash
rm -rf .next
npm run dev
```

4. **Check browser console:**
- F12 → Console
- Look for errors about missing modules
- If you see "Cannot find module", run `npm install`

---

## Issue: Mobile Navigation Not Working

### Symptoms
- Bottom nav doesn't appear on mobile
- Drawers don't slide up
- Desktop sidebar shows on mobile

### Solution

1. **Check screen width:**
   - Open DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Select a mobile device or resize to < 768px

2. **Clear cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Check CSS:**
   - Verify `@media (max-width: 768px)` styles are loading
   - Inspect element and check computed styles

---

## Issue: Progress Not Calculating Correctly

### Symptoms
- Mark resources complete but percentage stays at 0%
- Phase progress doesn't update
- Overall progress wrong

### Diagnosis

Check the user data file:
```bash
type data\users\user_sambhog.json
```

Look for:
- `completedResources`: Should have resource IDs
- `progress.completedResources`: Should match array length
- `phases[X].completedResources`: Should be > 0 for completed items

### Solution

**If counts are wrong:**
The API auto-calculates based on resource ID patterns. Check resource IDs match these patterns:

- Phase 1 (Math): `math`, `linalg`, `calc`, `prob`, `opt`, `info`, `discrete`
- Phase 2 (Python): `python`, `numpy`, `pandas`
- Phase 3 (ML): `ml-`, `sklearn`, `regression`
- Phase 4 (DL): `dl-`, `neural`, `deep`
- Phase 5 (Arch): `arch-`, `transformer`, `diffusion`

**If resource IDs don't match patterns:**
Update the `getPhaseResourceMapping()` function in:
`app/api/user/route.ts`

---

## Issue: TypeScript Errors

### During Build

```bash
npm run build
```

If errors appear:

1. **Check for syntax errors:**
   - Missing semicolons
   - Unclosed brackets
   - Typos in variable names

2. **Check type definitions:**
   - Ensure types match between components
   - Check `app/types/index.ts` for correct types

3. **Clear TypeScript cache:**
```bash
rm -rf .next
npm run build
```

---

## Issue: Vercel Deployment Fails

### Problem
Build succeeds locally but fails on Vercel

### Solutions

1. **Check environment variables:**
   - Vercel Dashboard → Settings → Environment Variables
   - Ensure all `USER_*_PASSWORD` variables are set
   - Don't set KV variables unless you have real KV instance

2. **Check build logs:**
   - Vercel Dashboard → Deployments → Click deployment
   - Look for error message
   - Common: Missing environment variable

3. **Verify Node version:**
   - Ensure `vercel.json` specifies Node 20.x
   - Check `package.json` engines field

4. **Test build locally:**
```bash
npm run build
```
Should succeed with no errors

---

## Issue: Data Lost After Deployment

### Problem
Data exists locally but not in production

### Cause
Production uses Vercel KV, not filesystem

### Solution

**Option 1: Set up Vercel KV (Recommended)**
1. Vercel Dashboard → Storage → Create KV
2. Add env variables to production
3. Data persists across deployments

**Option 2: Export/Import Data**
1. Export from local:
```javascript
// In browser console
fetch('/api/user?userId=sambhog')
  .then(r => r.json())
  .then(data => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-data-backup.json';
    a.click();
  });
```

2. Import to production:
```javascript
// Read the JSON file
const data = { /* paste JSON here */ };

fetch('/api/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'sambhog',
    data: data
  })
});
```

---

## Debug Commands

### Check User Data
```bash
# Windows
type data\users\user_sambhog.json

# Mac/Linux
cat data/users/user_sambhog.json
```

### Check Environment Variables
```bash
# Windows
echo %USER_SAMBHOG_PASSWORD%

# Mac/Linux
echo $USER_SAMBHOG_PASSWORD
```

### Check API Response
```javascript
// Browser console
fetch('/api/user?userId=sambhog')
  .then(r => r.json())
  .then(console.log)
```

### Clear All Data
```javascript
// Browser console
localStorage.clear();
fetch('/api/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'sambhog',
    data: { completedResources: [] }
  })
}).then(() => location.reload());
```

---

## Getting Help

If none of these solutions work:

1. **Check the terminal output** - error messages are detailed
2. **Check browser console** - F12 → Console tab
3. **Check Network tab** - F12 → Network, filter by "user"
4. **Look at the actual error message** - screenshot and analyze
5. **Verify Node.js version** - should be 20.x or higher

### Useful Debug Info to Collect

When asking for help, provide:
- Error message from terminal
- Error message from browser console
- Network tab screenshot (POST /api/user request)
- Content of `.env.local` (redact passwords)
- Output of `npm list` (shows installed packages)
- Node.js version: `node --version`

---

## Quick Fixes Reference

| Problem | Quick Fix |
|---------|----------|
| API 500 error | Comment out KV vars in `.env.local`, restart server |
| Login fails | Check `USER_{USERNAME}_PASSWORD` in `.env.local` |
| Data not saving | Check `data/users/` folder exists |
| Charts missing | Run `npm install` |
| Mobile nav hidden | Resize browser to < 768px width |
| Progress at 0% | Check resource IDs match phase patterns |
| TypeScript errors | Run `npm run build` to see details |
| Vercel build fails | Check environment variables in dashboard |

---

## Prevention Tips

✅ Always comment out KV variables for local development  
✅ Restart dev server after `.env.local` changes  
✅ Use browser DevTools to debug (F12)  
✅ Check terminal for error messages  
✅ Test locally before deploying to Vercel  
✅ Back up user data before major changes  
✅ Use TypeScript strict mode for better error catching  

---

Need more help? Check:
- [DATA_PERSISTENCE.md](./DATA_PERSISTENCE.md) - How data saving works
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Deployment guide
- [README.md](./README.md) - General project info
