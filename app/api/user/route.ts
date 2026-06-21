/**
 * User data CRUD with enhanced progress tracking:
 * GET  /api/user?userId=xxx  → returns user profile with detailed progress
 * POST /api/user             → { userId, data: UserProfile } → saves and updates progress stats
 * 
 * Storage priority:
 * 1. Supabase (production & local if configured)
 * 2. Filesystem fallback (local development only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSupabaseClient } from '@/app/lib/supabase';

// Filesystem fallback for local development
const DATA_DIR = path.join(process.cwd(), 'data', 'users');

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Ignore error if running in an environment where fs is restricted
  }
}

function getUserFilePath(userId: string): string {
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(DATA_DIR, `user_${safe}.json`);
}

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
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
      'phase-0': {
        phaseId: 'phase-0',
        name: 'Programming Fundamentals',
        status: 'not_started',
        progress: 0,
        startDate: null,
        completionDate: null,
        totalResources: 0,
        completedResources: 0,
        timeSpent: 0,
      },
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
      'phase-6': {
        phaseId: 'phase-6',
        name: 'Research Methodology & Publishing',
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
    if (isSupabaseConfigured()) {
      // Use Supabase
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('data')
        .eq('user_id', safe)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Supabase GET error:', error);
      }
      
      if (data?.data) {
        profile = data.data;
      }
    } else {
      // Fallback to filesystem
      await ensureDir();
      const filePath = getUserFilePath(userId);
      const raw = await fs.readFile(filePath, 'utf8');
      profile = JSON.parse(raw);
    }
  } catch (err) {
    // Profile doesn't exist or error reading
    console.log('No existing profile found for:', userId);
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
    if (isSupabaseConfigured()) {
      // Use Supabase
      const supabase = getSupabaseClient();
      const { data: row, error } = await supabase
        .from('user_profiles')
        .select('data')
        .eq('user_id', safe)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase GET error:', error);
      }
      
      if (row?.data) {
        existingProfile = row.data;
      }
    } else {
      // Fallback to filesystem
      await ensureDir();
      const filePath = getUserFilePath(userId);
      const raw = await fs.readFile(filePath, 'utf8');
      existingProfile = JSON.parse(raw);
    }
  } catch (err) {
    // Profile doesn't exist, will create new
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
    if (isSupabaseConfigured()) {
      // Use Supabase (upsert)
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: safe,
          data: updatedProfile,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Supabase upsert error:', error);
        return NextResponse.json({ error: 'Failed to save data to Supabase' }, { status: 500 });
      }
    } else {
      // Fallback to filesystem
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
    'phase-0': 0,
    'phase-1': 0,
    'phase-2': 0,
    'phase-3': 0,
    'phase-4': 0,
    'phase-5': 0,
    'phase-6': 0,
  };

  completedResources.forEach((resourceId) => {
    // Simple heuristic: map based on resource ID prefixes
    if (resourceId.includes('prog-')) {
      // Programming fundamentals (phase-0)
      phaseMap['phase-0']++;
    } else if (resourceId.includes('math') || resourceId.includes('linalg') || resourceId.includes('calc') || 
        resourceId.includes('prob') || resourceId.includes('opt') || resourceId.includes('info') || 
        resourceId.includes('discrete')) {
      // Mathematics (phase-1)
      phaseMap['phase-1']++;
    } else if (resourceId.includes('python') || resourceId.includes('numpy') || resourceId.includes('pandas')) {
      // Python (phase-2)
      phaseMap['phase-2']++;
    } else if (resourceId.includes('ml-') || resourceId.includes('sklearn') || resourceId.includes('regression')) {
      // Machine Learning (phase-3)
      phaseMap['phase-3']++;
    } else if (resourceId.includes('dl-') || resourceId.includes('neural') || resourceId.includes('deep')) {
      // Deep Learning (phase-4)
      phaseMap['phase-4']++;
    } else if (resourceId.includes('arch-') || resourceId.includes('transformer') || resourceId.includes('diffusion')) {
      // Architectures (phase-5)
      phaseMap['phase-5']++;
    } else if (resourceId.includes('rm-') || resourceId.includes('research')) {
      // Research Methodology (phase-6)
      phaseMap['phase-6']++;
    }
  });

  return phaseMap;
}
