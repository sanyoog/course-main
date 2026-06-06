# Quick User Data Integration Guide

## 🚀 Get Started in 5 Minutes

### Step 1: The Hook (Easiest Way)

In any component where you need user progress:

```typescript
import { useUserProgress } from '@/app/hooks/useUserProgress';

function MyComponent() {
  const userId = 'sambhog'; // Get from auth
  
  const {
    userData,           // Full user data object
    loading,           // Is data loading?
    error,             // Any errors?
    completeResource,  // Mark resource complete
    uncompleteResource, // Mark resource incomplete
    isResourceCompleted, // Check if completed
    getPhaseProgress,  // Get phase stats
    getStats,          // Get overall stats
  } = useUserProgress(userId);

  // That's it! Now use the functions
}
```

### Step 2: Mark Resource Complete

```typescript
// When user clicks "Mark as Complete"
const handleComplete = async () => {
  await completeResource(
    'linalg-mit-1806',  // Resource ID
    'phase-1',          // Phase ID
    120                 // Time spent (minutes) - optional
  );
};
```

**What happens automatically:**
- ✅ Resource marked complete
- ✅ Phase progress updated
- ✅ Overall progress updated
- ✅ Streak calculated
- ✅ Velocity updated
- ✅ Milestones checked
- ✅ Data saved to API

### Step 3: Display Progress

```typescript
function ProgressDisplay() {
  const { getStats } = useUserProgress(userId);
  const stats = getStats();

  return (
    <div>
      <h2>{stats.overallProgress}% Complete</h2>
      <p>{stats.completedResources} / {stats.totalResources}</p>
      <p>🔥 {stats.currentStreak} day streak</p>
      <p>📈 {stats.velocity.itemsPerWeek.toFixed(1)} items/week</p>
    </div>
  );
}
```

---

## 📊 Common Use Cases

### Check if Resource is Completed

```typescript
const isCompleted = isResourceCompleted('linalg-mit-1806');
```

### Toggle Completion

```typescript
const handleToggle = async () => {
  if (isResourceCompleted(resourceId)) {
    await uncompleteResource(resourceId, phaseId);
  } else {
    await completeResource(resourceId, phaseId);
  }
};
```

### Show Phase Progress

```typescript
const mathPhase = getPhaseProgress('phase-1');

<div>
  <h3>{mathPhase.name}</h3>
  <p>Progress: {mathPhase.progress}%</p>
  <p>{mathPhase.completedResources} / {mathPhase.totalResources}</p>
  <p>~{mathPhase.estimatedWeeksRemaining} weeks remaining</p>
</div>
```

### Display Milestones

```typescript
{userData?.statistics.milestones.map(milestone => (
  <div key={milestone.id}>
    {milestone.icon} {milestone.title}
    <p>{milestone.description}</p>
    <small>{new Date(milestone.achievedAt).toLocaleDateString()}</small>
  </div>
))}
```

---

## 📁 File Structure Created

```
✅ data/users/userdata.json              # Master registry
✅ data/users/user_sambhog.json          # Example user data
✅ app/lib/userDataUtils.ts              # Utility functions
✅ app/hooks/useUserProgress.ts          # React hook
✅ USER_DATA_SYSTEM.md                   # Full documentation
```

---

## 🎯 What You Get

### Automatic Tracking
- **Progress**: Overall and per-phase
- **Streaks**: Consecutive days of activity
- **Velocity**: Items per week/day
- **Milestones**: Automatic achievements
- **Time**: Total time spent learning

### Phase Management
- Status: not_started → in_progress → completed
- Progress percentage
- Resource counts
- Time spent per phase
- Estimated completion

### Statistics
- Current streak
- Longest streak
- Learning velocity
- Completion dates
- Time estimates

---

## 🔄 Integration with Existing AppShell

Replace your current `toggleCompleted` in AppShell.tsx:

```typescript
// OLD (localStorage only)
const toggleCompleted = useCallback((id: string) => {
  setCompleted(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    localStorage.setItem('ai-tracker-completed', JSON.stringify([...next]));
    return next;
  });
}, []);

// NEW (with full tracking)
const {
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
```

---

## 🎨 UI Components Ideas

### Progress Ring
```typescript
<CircularProgress value={stats.overallProgress} />
```

### Streak Display
```typescript
<div className="streak">
  🔥 {stats.currentStreak} day streak
  {stats.currentStreak > stats.longestStreak && (
    <span>🎉 New record!</span>
  )}
</div>
```

### Velocity Chart
```typescript
<LineChart data={weeklyProgress} />
<p>{stats.velocity.itemsPerWeek.toFixed(1)} items/week</p>
```

### Milestones List
```typescript
{milestones.map(m => (
  <div className="milestone">
    <span className="icon">{m.icon}</span>
    <div>
      <h4>{m.title}</h4>
      <p>{m.description}</p>
    </div>
  </div>
))}
```

---

## 🔧 Customization

### Add Custom Milestones

In `userDataUtils.ts`, edit the `checkMilestones()` function:

```typescript
const milestones = [
  { count: 1, title: 'First Step', description: 'Completed first resource' },
  { count: 10, title: 'Getting Started', description: '10 resources' },
  // Add your own:
  { count: 5, title: 'High Five', description: '5 resources in a week' },
];
```

### Adjust Daily Goal

```typescript
userData.preferences.dailyGoal = 3; // Change from 2 to 3
await saveUserData(userId, userData);
```

### Export User Data

```typescript
import { exportUserData } from '@/app/lib/userDataUtils';

const backup = exportUserData(userData);
// Download or save backup
```

---

## 🐛 Debugging

### Check if data is loading:
```typescript
console.log('Loading:', loading);
console.log('Error:', error);
console.log('User Data:', userData);
```

### Verify API is working:
```typescript
// Open browser console
await fetch('/api/user?userId=sambhog').then(r => r.json()).then(console.log);
```

### Reset user data:
Delete `/data/users/user_{username}.json` and restart server.

---

## ✅ Ready to Use!

Everything is set up and ready. Just:

1. Import the hook: `useUserProgress`
2. Use in components
3. Call functions
4. Display data

**No additional setup needed!**

See [USER_DATA_SYSTEM.md](./USER_DATA_SYSTEM.md) for complete documentation.
