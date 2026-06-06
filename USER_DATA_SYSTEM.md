# User Data System Documentation

## Overview
Complete user progress tracking system with JSON storage, utility functions, and React hooks for easy integration.

---

## 📂 File Structure

```
course-main/
├── data/
│   └── users/
│       ├── userdata.json           # Master user registry
│       ├── user_sambhog.json       # Example user data
│       └── user_{username}.json    # Individual user files
├── app/
│   ├── lib/
│   │   └── userDataUtils.ts        # Utility functions
│   └── hooks/
│       └── useUserProgress.ts      # React hook
```

---

## 📊 User Data Structure

### UserData Interface

```typescript
interface UserData {
  userId: string;
  
  profile: {
    displayName: string;
    email: string;
    createdAt: string;          // ISO date
    lastSeen: string;            // ISO date
    timezone: string;
  };
  
  progress: {
    overallProgress: number;      // 0-100
    totalResources: number;
    completedResources: number;
    totalTimeSpent: number;       // minutes
    lastActivityDate: string | null;
    startDate: string;
  };
  
  phases: {
    [phaseId: string]: {
      phaseId: string;
      name: string;
      status: 'not_started' | 'in_progress' | 'completed';
      progress: number;           // 0-100
      startDate: string | null;
      completionDate: string | null;
      totalResources: number;
      completedResources: number;
      timeSpent: number;          // minutes
    };
  };
  
  completedResources: string[];   // Array of resource IDs
  
  resourceDetails: {
    [resourceId: string]: {
      resourceId: string;
      completedAt: string;        // ISO date
      timeSpent?: number;         // minutes
      notes?: string;
      rating?: number;            // 1-5
    };
  };
  
  schedule: {
    selectedPhase: string;
    startDate: string | null;
    completedDays: Record<string, string>;
    skippedDays: Record<string, boolean>;
    currentWeek: number;
    totalWeeksActive: number;
  };
  
  statistics: {
    streak: {
      current: number;            // days
      longest: number;            // days
      lastActivityDate: string | null;
    };
    velocity: {
      itemsPerWeek: number;
      itemsPerDay: number;
      averageTimePerResource: number; // minutes
    };
    milestones: Array<{
      id: string;
      title: string;
      description: string;
      achievedAt: string;
      icon?: string;
    }>;
    achievements: string[];
  };
  
  preferences: {
    dailyGoal: number;
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
}
```

---

## 🛠️ Utility Functions

### Core Functions

#### `getUserData(userId: string)`
Fetches user data from API.

```typescript
const userData = await getUserData('sambhog');
```

#### `saveUserData(userId: string, data: Partial<UserData>)`
Saves user data to API.

```typescript
await saveUserData('sambhog', updatedData);
```

#### `markResourceCompleted(userId, resourceId, phaseId, timeSpent?)`
Marks a resource as completed and updates all related statistics.

```typescript
const updatedData = await markResourceCompleted(
  'sambhog',
  'linalg-mit-1806',
  'phase-1',
  120 // 2 hours in minutes
);
```

**Automatic Updates:**
- ✅ Adds to completed resources
- ✅ Updates phase progress
- ✅ Updates overall progress
- ✅ Updates streak
- ✅ Recalculates velocity
- ✅ Checks for milestones
- ✅ Updates timestamps

#### `markResourceIncomplete(userId, resourceId, phaseId)`
Marks a resource as incomplete and reverts statistics.

```typescript
const updatedData = await markResourceIncomplete(
  'sambhog',
  'linalg-mit-1806',
  'phase-1'
);
```

#### `initializeUserData(userId, totalResourcesByPhase)`
Creates initial user data structure.

```typescript
const newUser = await initializeUserData('newuser', {
  'phase-1': 35,
  'phase-2': 20,
  'phase-3': 30,
  'phase-4': 45,
  'phase-5': 60,
});
```

### Statistics Functions

#### `getPhaseStats(userData, phaseId)`
Get detailed phase statistics.

```typescript
const mathStats = getPhaseStats(userData, 'phase-1');
// Returns:
// {
//   phaseId: 'phase-1',
//   name: 'Mathematical Foundations',
//   progress: 65,
//   completedResources: 23,
//   totalResources: 35,
//   remainingResources: 12,
//   estimatedWeeksRemaining: 6,
//   ...
// }
```

#### `getOverallStats(userData)`
Get overall progress statistics.

```typescript
const stats = getOverallStats(userData);
// Returns:
// {
//   overallProgress: 45,
//   completedResources: 85,
//   totalResources: 190,
//   remainingResources: 105,
//   totalTimeSpent: 12600, // minutes
//   completedPhases: 2,
//   inProgressPhases: 2,
//   currentStreak: 7,
//   longestStreak: 14,
//   velocity: { ... },
//   estimatedCompletionDate: '2025-12-31T...',
// }
```

### Data Management

#### `exportUserData(userData)`
Export user data as JSON string for backup.

```typescript
const jsonBackup = exportUserData(userData);
// Save to file or download
```

#### `importUserData(userId, jsonData)`
Import user data from JSON backup.

```typescript
const success = await importUserData('sambhog', jsonBackup);
```

---

## ⚛️ React Hook Usage

### `useUserProgress(userId)`

#### Import

```typescript
import { useUserProgress } from '@/app/hooks/useUserProgress';
```

#### Basic Usage

```typescript
function MyComponent() {
  const {
    userData,
    loading,
    error,
    completeResource,
    uncompleteResource,
    isResourceCompleted,
    getPhaseProgress,
    getStats,
    refreshUserData,
  } = useUserProgress(userId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Progress: {userData?.progress.overallProgress}%</h1>
      {/* Your UI */}
    </div>
  );
}
```

#### Complete a Resource

```typescript
const handleComplete = async () => {
  await completeResource('linalg-mit-1806', 'phase-1', 120);
};
```

#### Check if Resource is Completed

```typescript
const isCompleted = isResourceCompleted('linalg-mit-1806');
```

#### Get Phase Stats

```typescript
const mathProgress = getPhaseProgress('phase-1');
console.log(`Math: ${mathProgress.progress}%`);
```

#### Get Overall Stats

```typescript
const stats = getStats();
console.log(`Streak: ${stats.currentStreak} days`);
```

---

## 🎯 Usage Examples

### Example 1: Resource Card with Completion

```typescript
import { useUserProgress } from '@/app/hooks/useUserProgress';

function ResourceCard({ resource, phaseId }) {
  const { isResourceCompleted, completeResource, uncompleteResource } = 
    useUserProgress(userId);

  const completed = isResourceCompleted(resource.id);

  const handleToggle = async () => {
    if (completed) {
      await uncompleteResource(resource.id, phaseId);
    } else {
      await completeResource(resource.id, phaseId, 60); // 1 hour
    }
  };

  return (
    <div>
      <h3>{resource.name}</h3>
      <button onClick={handleToggle}>
        {completed ? '✓ Completed' : 'Mark Complete'}
      </button>
    </div>
  );
}
```

### Example 2: Progress Dashboard

```typescript
function ProgressDashboard() {
  const { userData, getStats } = useUserProgress(userId);
  const stats = getStats();

  if (!stats) return null;

  return (
    <div>
      <h2>Your Progress</h2>
      <div>Overall: {stats.overallProgress}%</div>
      <div>Completed: {stats.completedResources}/{stats.totalResources}</div>
      <div>Current Streak: {stats.currentStreak} days 🔥</div>
      <div>Velocity: {stats.velocity.itemsPerWeek.toFixed(1)} items/week</div>
      <div>Completed Phases: {stats.completedPhases}/5</div>
      
      <h3>Milestones</h3>
      {userData?.statistics.milestones.map(m => (
        <div key={m.id}>
          {m.icon} {m.title} - {m.description}
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Phase Progress Display

```typescript
function PhaseProgress({ phaseId }) {
  const { getPhaseProgress } = useUserProgress(userId);
  const phase = getPhaseProgress(phaseId);

  if (!phase) return null;

  return (
    <div>
      <h3>{phase.name}</h3>
      <div>Status: {phase.status}</div>
      <div>Progress: {phase.progress}%</div>
      <div>
        {phase.completedResources} / {phase.totalResources} resources
      </div>
      <div>Remaining: {phase.remainingResources}</div>
      <div>
        Estimated: {phase.estimatedWeeksRemaining} weeks to complete
      </div>
      
      <ProgressBar value={phase.progress} />
    </div>
  );
}
```

### Example 4: Streak Tracker

```typescript
function StreakTracker() {
  const { userData } = useUserProgress(userId);

  if (!userData) return null;

  const { streak } = userData.statistics;

  return (
    <div>
      <div>🔥 Current Streak: {streak.current} days</div>
      <div>🏆 Longest Streak: {streak.longest} days</div>
      {streak.current > 0 && (
        <div>Keep it up! Complete another resource today!</div>
      )}
    </div>
  );
}
```

---

## 🎖️ Automatic Features

### Streak Tracking
- Automatically tracks consecutive days of activity
- Updates current and longest streak
- Resets if a day is missed

### Velocity Calculation
- Items per week
- Items per day
- Average time per resource

### Milestone Detection
Automatically awards milestones:
- 🎯 First Step (1 resource)
- 🎯 Getting Started (10 resources)
- 🎯 Quarter Century (25 resources)
- 🎯 Halfway Hero (50 resources)
- 🎯 Centurion (100 resources)
- 🎯 Dedication (150 resources)

### Phase Status Updates
- `not_started` → `in_progress` on first completion
- `in_progress` → `completed` at 100%
- Automatic start/completion dates

---

## 🔄 Integration with Existing Code

### Update AppShell.tsx

```typescript
import { useUserProgress } from './hooks/useUserProgress';

export function AppShell({ data }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const {
    userData,
    completeResource,
    uncompleteResource,
    isResourceCompleted,
  } = useUserProgress(userId);

  const toggleCompleted = useCallback(async (id: string, phaseId: string) => {
    if (isResourceCompleted(id)) {
      await uncompleteResource(id, phaseId);
    } else {
      await completeResource(id, phaseId);
    }
  }, [completeResource, uncompleteResource, isResourceCompleted]);

  // Rest of component...
}
```

---

## 📈 Data Storage

### Local Development
- Files stored in `/data/users/`
- One JSON file per user
- Automatically created on initialization

### Production (Vercel)
- Uses Vercel KV (Redis) if configured
- Falls back to filesystem if KV not available
- Automatic sync through API routes

---

## 🔧 Configuration

### Environment Variables

No additional environment variables needed. Uses existing:
- `KV_REST_API_URL` (optional)
- `KV_REST_API_TOKEN` (optional)

### Initialize New Users

```typescript
// Automatically called when user logs in for first time
const totalResourcesByPhase = {
  'phase-1': 35,  // Count from data.json
  'phase-2': 20,
  'phase-3': 30,
  'phase-4': 45,
  'phase-5': 60,
};

await initializeUserData(userId, totalResourcesByPhase);
```

---

## 🧪 Testing

### Manual Testing

```typescript
// Test marking resource complete
const result = await markResourceCompleted('testuser', 'resource-1', 'phase-1', 30);
console.log('Completed:', result);

// Test getting stats
const userData = await getUserData('testuser');
const stats = getOverallStats(userData);
console.log('Stats:', stats);

// Test streak
// Complete resources on consecutive days to test streak
```

---

## 📊 Analytics Available

From `getOverallStats()`:
- Overall progress percentage
- Completed/remaining resources
- Time spent learning
- Phases completed
- Current/longest streak
- Learning velocity
- Estimated completion date

From `getPhaseStats()`:
- Phase-specific progress
- Resources completed in phase
- Time spent on phase
- Estimated weeks to complete phase
- Phase status

---

## 🚀 Next Steps

1. **Integration**: Connect to existing components
2. **UI Enhancement**: Add progress visualizations
3. **Notifications**: Implement streak reminders
4. **Achievements**: Add more milestone types
5. **Export/Import**: Add UI for backup/restore
6. **Analytics Dashboard**: Create detailed stats page

---

## 📝 File Examples

### userdata.json (Master Registry)
```json
{
  "users": {},
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2025-01-01T00:00:00.000Z",
    "totalUsers": 0
  }
}
```

### user_sambhog.json (Individual User)
See `/data/users/user_sambhog.json` for complete example.

---

## 🎉 Summary

✅ Complete user progress tracking  
✅ Automatic statistics calculation  
✅ Streak tracking  
✅ Milestone system  
✅ Phase progress management  
✅ Easy React integration  
✅ Export/Import functionality  
✅ Production-ready  

**Start tracking progress today!** 📊
