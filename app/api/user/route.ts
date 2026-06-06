/**
 * User data CRUD with enhanced progress tracking:
 * GET  /api/user?userId=xxx  → returns user_{userId}.json with detailed progress
 * POST /api/user             → { userId, data: UserProfile } → saves and updates progress stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Store user files in /data/users/ directory at project root
const DATA_DIR = path.join(process.cwd(), 'data', 'users');

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Ignore error if running in an environment where fs is restricted
  }
}

function getUserFilePath(userId: string): string {
  // Sanitize userId to prevent path traversal
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(DATA_DIR, `user_${safe}.json`);
}

// Default user profile structure
function createDefaultProfile(userId: string) {
  return {
    userId,
    profile: {
      displayName: userId.charAt(0).toUpperCase() + userId.slice(1),
      email: '',
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      timezone: 'UTC',
    },
    progress: {
      overallProgress: 0,
      totalResources: 0,
      completedResources: 0,
      totalTimeSpent: 0,
      lastActivityDate: null,
      startDate: new Date().toISOString(),
    },
    phases: {
      'phase-1': {
        phaseId: 'phase-1',
        name: 'Mathematical Foundations',
        status: 'not_started',
        progress: 0,
        startDate: null,
        completionDate: null,
        totalResources: 0,
        completedResources: 0,
        timeSpent: 0,
      },
      'phase-2': {
        phaseId: 'phase-2',
        name: 'Python for ML/AI',
        status: 'not_started',
        progress: 0,
        startDate: null,
        completionDate: null,
        totalResources: 0,
        completedResources: 0,
        timeSpent: 0,
      },
      'phase-3': {
        phaseId: 'phase-3',
        name: 'Classical Machine Learning',
        status: 'not_started',
        progress: 0,
        startDate: null,
        completionDate: null,
        totalResources: 0,
        completedResources: 0,
        timeSpent: 0,
      },
      'phase-4': {
        phaseId: 'phase-4',
        name: 'Deep Learning Fundamentals',
        status: 'not_started',
        progress: 0,
        startDate: null,
        completionDate: null,
        totalResources: 0,
        completedResources: 0,
        timeSpent: 0,
      },
      'phase-5': {
        phaseId: 'phase-5',
        name: 'Advanced Architectures',
        status: 'not_started',
        progress: 0,
        startDate: null,
        completionDate: null,
        totalResources: 0,
        completedResources: 0,
        timeSpent: 0,
      },
    },
    completedResources: [],
    resourceDetails: {},
    schedule: {
      selectedPhase: 'phase-1',
      startDate: null,
      completedDays: {},
      skippedDays: {},
      currentWeek: 1,
      totalWeeksActive: 0,
    },
    statistics: {
      streak: {
        current: 0,
        longest: 0,
        lastActivityDate: null,
      },
      velocity: {
        itemsPerWeek: 0,
        itemsPerDay: 0,
        averageTimePerResource: 0,
      },
      milestones: [],
      achievements: [],
    },
    preferences: {
      dailyGoal: 2,
      notifications: true,
      theme: 'dark',
      language: 'en',
    },
  };
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, '');
  let profile = null;

  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      // Use Vercel KV (Redis)
      const res = await fetch(`${process.env.KV_REST_API_URL}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        body: JSON.stringify(['GET', `user_${safe}`]),
        cache: 'no-store',
      });
      const json = await res.json();
      if (json.result) {
        profile = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
      }
    } else {
      // Use local filesystem
      await ensureDir();
      const filePath = getUserFilePath(userId);
      const raw = await fs.readFile(filePath, 'utf8');
      profile = JSON.parse(raw);
    }
  } catch (err) {
    // File doesn't exist or error reading
  }

  // If profile exists, merge with defaults to ensure all fields are present
  if (profile) {
    const defaultProfile = createDefaultProfile(userId);
    profile = deepMerge(defaultProfile, profile);
    profile.profile = profile.profile || {};
    profile.profile.lastSeen = new Date().toISOString();
    return NextResponse.json(profile);
  }

  // Return default profile if not found
  return NextResponse.json(createDefaultProfile(userId));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, data } = body as { userId: string; data: any };

  if (!userId || !data) {
    return NextResponse.json({ error: 'Missing userId or data' }, { status: 400 });
  }

  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, '');
  
  // Load existing profile or create default
  let existingProfile = null;
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const res = await fetch(`${process.env.KV_REST_API_URL}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        body: JSON.stringify(['GET', `user_${safe}`]),
        cache: 'no-store',
      });
      const json = await res.json();
      if (json.result) {
        existingProfile = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
      }
    } else {
      await ensureDir();
      const filePath = getUserFilePath(userId);
      const raw = await fs.readFile(filePath, 'utf8');
      existingProfile = JSON.parse(raw);
    }
  } catch (err) {
    // File doesn't exist, will create new
  }

  const defaultProfile = createDefaultProfile(userId);
  const baseProfile = existingProfile ? deepMerge(defaultProfile, existingProfile) : defaultProfile;
  
  // Merge incoming data with existing profile
  const updatedProfile = deepMerge(baseProfile, data);
  
  // Update timestamps
  updatedProfile.profile = updatedProfile.profile || {};
  updatedProfile.profile.lastSeen = new Date().toISOString();
  
  // Calculate progress statistics
  if (updatedProfile.completedResources) {
    updatedProfile.progress = updatedProfile.progress || {};
    updatedProfile.progress.completedResources = updatedProfile.completedResources.length;
    updatedProfile.progress.lastActivityDate = new Date().toISOString();
    
    // Calculate phase progress
    const phaseResourceMap = getPhaseResourceMapping(updatedProfile.completedResources);
    Object.keys(updatedProfile.phases || {}).forEach((phaseId) => {
      const phase = updatedProfile.phases[phaseId];
      const completedInPhase = phaseResourceMap[phaseId] || 0;
      
      if (completedInPhase > 0 && phase.status === 'not_started') {
        phase.status = 'in_progress';
        phase.startDate = new Date().toISOString();
      }
      
      phase.completedResources = completedInPhase;
      phase.progress = phase.totalResources > 0 
        ? Math.round((completedInPhase / phase.totalResources) * 100) 
        : 0;
      
      if (phase.progress === 100 && phase.status !== 'completed') {
        phase.status = 'completed';
        phase.completionDate = new Date().toISOString();
      }
    });
  }

  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      // Use Vercel KV (Redis)
      await fetch(`${process.env.KV_REST_API_URL}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        body: JSON.stringify(['SET', `user_${safe}`, JSON.stringify(updatedProfile)]),
      });
    } else {
      // Use local filesystem
      await ensureDir();
      const filePath = getUserFilePath(userId);
      await fs.writeFile(filePath, JSON.stringify(updatedProfile, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error saving user data:', err);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile: updatedProfile });
}

// Deep merge utility function
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Map completed resources to phases (simplified version)
function getPhaseResourceMapping(completedResources: string[]): Record<string, number> {
  const phaseMap: Record<string, number> = {
    'phase-1': 0,
    'phase-2': 0,
    'phase-3': 0,
    'phase-4': 0,
    'phase-5': 0,
  };

  completedResources.forEach((resourceId) => {
    // Simple heuristic: map based on resource ID prefixes
    if (resourceId.includes('math') || resourceId.includes('linalg') || resourceId.includes('calc') || 
        resourceId.includes('prob') || resourceId.includes('opt') || resourceId.includes('info') || 
        resourceId.includes('discrete')) {
      phaseMap['phase-1']++;
    } else if (resourceId.includes('python') || resourceId.includes('numpy') || resourceId.includes('pandas')) {
      phaseMap['phase-2']++;
    } else if (resourceId.includes('ml-') || resourceId.includes('sklearn') || resourceId.includes('regression')) {
      phaseMap['phase-3']++;
    } else if (resourceId.includes('dl-') || resourceId.includes('neural') || resourceId.includes('deep')) {
      phaseMap['phase-4']++;
    } else if (resourceId.includes('arch-') || resourceId.includes('transformer') || resourceId.includes('diffusion')) {
      phaseMap['phase-5']++;
    }
  });

  return phaseMap;
}
