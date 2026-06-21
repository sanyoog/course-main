# User Data & Progress Tracking Fix

## Issues Fixed

### 1. Redis Connection Error
**Problem:** App was trying to connect to non-existent Redis instance at `your-kv-instance.upstash.io`

**Root Cause:** The `.env` file had placeholder KV credentials that were being loaded by Next.js

**Solution:** Commented out the KV variables in `.env` file:
```env
# KV_REST_API_URL="https://your-kv-instance.upstash.io"
# KV_REST_API_TOKEN="your_kv_token_here"
```

### 2. Missing Phase 0 and Phase 6 Support
**Problem:** User data structure and API didn't include the new phases (phase-0 and phase-6)

**Solution:** Updated the API route to include all 7 phases

## Changes Made

### 1. Environment Variables (`/.env`)
- Commented out placeholder KV credentials
- App now uses filesystem for local development

### 2. User API Route (`/app/api/user/route.ts`)

#### Added Phase 0 and Phase 6 to Default Profile:
```javascript
phases: {
  'phase-0': {
    phaseId: 'phase-0',
    name: 'Programming Fundamentals',
    ...
  },
  // ... phases 1-5 ...
  'phase-6': {
    phaseId: 'phase-6',
    name: 'Research Methodology & Publishing',
    ...
  }
}
```

#### Updated Resource-to-Phase Mapping:
```javascript
function getPhaseResourceMapping(completedResources: string[]): Record<string, number> {
  const phaseMap: Record<string, number> = {
    'phase-0': 0,  // NEW
    'phase-1': 0,
    'phase-2': 0,
    'phase-3': 0,
    'phase-4': 0,
    'phase-5': 0,
    'phase-6': 0,  // NEW
  };

  // Maps resource IDs to phases:
  // - 'prog-*' → phase-0 (Programming)
  // - 'math*', 'linalg*', 'calc*', etc. → phase-1 (Math)
  // - 'python*', 'numpy*', 'pandas*' → phase-2 (Python)
  // - 'ml-*' → phase-3 (ML)
  // - 'dl-*', 'neural*', 'deep*' → phase-4 (Deep Learning)
  // - 'arch-*', 'transformer*', 'diffusion*' → phase-5 (Architectures)
  // - 'rm-*', 'research*' → phase-6 (Research)
}
```

### 3. User Data File (`/data/users/user_sambhog.json`)
- Created user file with complete structure
- Includes all 7 phases (phase-0 through phase-6)
- Ready to track progress across all learning phases

## How Progress Tracking Works

### Resource ID Patterns:
- **Phase 0 (Programming):** `prog-*` (e.g., `prog-py-cs50p`, `prog-c-cs50x`)
- **Phase 1 (Math):** `math*`, `linalg*`, `calc*`, `prob*`, `opt*`, `info*`, `discrete*`
- **Phase 2 (Python):** `python*`, `numpy*`, `pandas*`
- **Phase 3 (ML):** `ml-*`, `sklearn*`, `regression*`
- **Phase 4 (Deep Learning):** `dl-*`, `neural*`, `deep*`
- **Phase 5 (Architectures):** `arch-*`, `transformer*`, `diffusion*`
- **Phase 6 (Research):** `rm-*`, `research*`

### Automatic Progress Updates:
When you mark a resource as completed:
1. Resource ID is added to `completedResources` array
2. Phase mapping function determines which phase it belongs to
3. Phase statistics are updated:
   - `completedResources` count
   - `progress` percentage
   - `status` changes from `not_started` → `in_progress` → `completed`
   - Timestamps for `startDate` and `completionDate`
4. Overall progress statistics are recalculated

## Testing

To verify everything works:
1. Restart your dev server if it's running
2. Log in as "sambhog"
3. Navigate to any phase (Programming, Math, Python, etc.)
4. Mark a resource as completed
5. Check that:
   - The checkmark appears on the resource
   - Progress bar updates
   - No Redis connection errors in console
   - Data persists in `data/users/user_sambhog.json`

## File Locations

- User data: `data/users/user_sambhog.json`
- API endpoint: `app/api/user/route.ts`
- Environment: `.env` and `.env.local`

## Notes

- For local development, the app uses the filesystem to store user data
- For production (Vercel), uncomment and set real KV credentials in Vercel dashboard
- User data is automatically created on first login if it doesn't exist
- All 7 phases are now fully supported for progress tracking
