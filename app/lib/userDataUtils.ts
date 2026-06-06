/**
 * User Data Utility Functions
 * Handles reading, updating, and managing user progress data
 */

import { UserProfile } from '../types';

// Type definitions for user data structure
export interface ResourceDetail {
  resourceId: string;
  completedAt: string;
  timeSpent?: number;
  notes?: string;
  rating?: number;
}

export interface PhaseProgress {
  phaseId: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  startDate: string | null;
  completionDate: string | null;
  totalResources: number;
  completedResources: number;
  timeSpent: number;
}

export interface Streak {
  current: number;
  longest: number;
  lastActivityDate: string | null;
}

export interface Velocity {
  itemsPerWeek: number;
  itemsPerDay: number;
  averageTimePerResource: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedAt: string;
  icon?: string;
}

export interface UserData {
  userId: string;
  profile: {
    displayName: string;
    email: string;
    createdAt: string;
    lastSeen: string;
    timezone: string;
  };
  progress: {
    overallProgress: number;
    totalResources: number;
    completedResources: number;
    totalTimeSpent: number;
    lastActivityDate: string | null;
    startDate: string;
  };
  phases: Record<string, PhaseProgress>;
  completedResources: string[];
  resourceDetails: Record<string, ResourceDetail>;
  schedule: {
    selectedPhase: string;
    startDate: string | null;
    completedDays: Record<string, string>;
    skippedDays: Record<string, boolean>;
    currentWeek: number;
    totalWeeksActive: number;
  };
  statistics: {
    streak: Streak;
    velocity: Velocity;
    milestones: Milestone[];
    achievements: string[];
  };
  preferences: {
    dailyGoal: number;
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
}

/**
 * Fetch user data from API
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const response = await fetch(`/api/user?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) throw new Error('Failed to fetch user data');
    const data = await response.json();
    return data as UserData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Save user data to API
 */
export async function saveUserData(userId: string, data: Partial<UserData>): Promise<boolean> {
  try {
    const response = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, data }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
}

/**
 * Mark a resource as completed
 */
export async function markResourceCompleted(
  userId: string,
  resourceId: string,
  phaseId: string,
  timeSpent: number = 0
): Promise<UserData | null> {
  const userData = await getUserData(userId);
  if (!userData) return null;

  // Update completed resources
  if (!userData.completedResources.includes(resourceId)) {
    userData.completedResources.push(resourceId);
  }

  // Add resource details
  userData.resourceDetails[resourceId] = {
    resourceId,
    completedAt: new Date().toISOString(),
    timeSpent,
  };

  // Update phase progress
  if (userData.phases[phaseId]) {
    userData.phases[phaseId].completedResources += 1;
    userData.phases[phaseId].timeSpent += timeSpent;
    userData.phases[phaseId].progress = calculatePhaseProgress(
      userData.phases[phaseId].completedResources,
      userData.phases[phaseId].totalResources
    );

    // Update phase status
    if (userData.phases[phaseId].status === 'not_started') {
      userData.phases[phaseId].status = 'in_progress';
      userData.phases[phaseId].startDate = new Date().toISOString();
    }
    if (userData.phases[phaseId].progress === 100) {
      userData.phases[phaseId].status = 'completed';
      userData.phases[phaseId].completionDate = new Date().toISOString();
    }
  }

  // Update overall progress
  userData.progress.completedResources = userData.completedResources.length;
  userData.progress.totalTimeSpent += timeSpent;
  userData.progress.overallProgress = calculatePhaseProgress(
    userData.progress.completedResources,
    userData.progress.totalResources
  );
  userData.progress.lastActivityDate = new Date().toISOString();

  // Update streak
  updateStreak(userData);

  // Calculate velocity
  updateVelocity(userData);

  // Check for milestones
  checkMilestones(userData);

  // Update last seen
  userData.profile.lastSeen = new Date().toISOString();

  // Save to API
  await saveUserData(userId, userData);

  return userData;
}

/**
 * Mark a resource as incomplete
 */
export async function markResourceIncomplete(
  userId: string,
  resourceId: string,
  phaseId: string
): Promise<UserData | null> {
  const userData = await getUserData(userId);
  if (!userData) return null;

  // Remove from completed resources
  userData.completedResources = userData.completedResources.filter(id => id !== resourceId);

  // Remove resource details
  const timeSpent = userData.resourceDetails[resourceId]?.timeSpent || 0;
  delete userData.resourceDetails[resourceId];

  // Update phase progress
  if (userData.phases[phaseId]) {
    userData.phases[phaseId].completedResources = Math.max(0, userData.phases[phaseId].completedResources - 1);
    userData.phases[phaseId].timeSpent = Math.max(0, userData.phases[phaseId].timeSpent - timeSpent);
    userData.phases[phaseId].progress = calculatePhaseProgress(
      userData.phases[phaseId].completedResources,
      userData.phases[phaseId].totalResources
    );

    // Update phase status
    if (userData.phases[phaseId].completedResources === 0) {
      userData.phases[phaseId].status = 'not_started';
      userData.phases[phaseId].startDate = null;
    } else {
      userData.phases[phaseId].status = 'in_progress';
    }
    userData.phases[phaseId].completionDate = null;
  }

  // Update overall progress
  userData.progress.completedResources = userData.completedResources.length;
  userData.progress.totalTimeSpent = Math.max(0, userData.progress.totalTimeSpent - timeSpent);
  userData.progress.overallProgress = calculatePhaseProgress(
    userData.progress.completedResources,
    userData.progress.totalResources
  );

  // Update last seen
  userData.profile.lastSeen = new Date().toISOString();

  // Save to API
  await saveUserData(userId, userData);

  return userData;
}

/**
 * Initialize user data with resource counts from data.json
 */
export async function initializeUserData(userId: string, totalResourcesByPhase: Record<string, number>): Promise<UserData> {
  const now = new Date().toISOString();
  
  const userData: UserData = {
    userId,
    profile: {
      displayName: userId,
      email: '',
      createdAt: now,
      lastSeen: now,
      timezone: 'UTC',
    },
    progress: {
      overallProgress: 0,
      totalResources: Object.values(totalResourcesByPhase).reduce((sum, count) => sum + count, 0),
      completedResources: 0,
      totalTimeSpent: 0,
      lastActivityDate: null,
      startDate: now,
    },
    phases: {
      'phase-1': createPhaseProgress('phase-1', 'Mathematical Foundations', totalResourcesByPhase['phase-1'] || 0),
      'phase-2': createPhaseProgress('phase-2', 'Python for ML/AI', totalResourcesByPhase['phase-2'] || 0),
      'phase-3': createPhaseProgress('phase-3', 'Classical Machine Learning', totalResourcesByPhase['phase-3'] || 0),
      'phase-4': createPhaseProgress('phase-4', 'Deep Learning Fundamentals', totalResourcesByPhase['phase-4'] || 0),
      'phase-5': createPhaseProgress('phase-5', 'Advanced Architectures', totalResourcesByPhase['phase-5'] || 0),
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

  await saveUserData(userId, userData);
  return userData;
}

/**
 * Get phase statistics
 */
export function getPhaseStats(userData: UserData, phaseId: string) {
  const phase = userData.phases[phaseId];
  if (!phase) return null;

  return {
    ...phase,
    percentage: phase.progress,
    remainingResources: phase.totalResources - phase.completedResources,
    estimatedWeeksRemaining: calculateEstimatedWeeks(
      phase.totalResources - phase.completedResources,
      userData.statistics.velocity.itemsPerWeek
    ),
  };
}

/**
 * Get overall statistics
 */
export function getOverallStats(userData: UserData) {
  const completedPhases = Object.values(userData.phases).filter(p => p.status === 'completed').length;
  const inProgressPhases = Object.values(userData.phases).filter(p => p.status === 'in_progress').length;
  
  return {
    overallProgress: userData.progress.overallProgress,
    completedResources: userData.progress.completedResources,
    totalResources: userData.progress.totalResources,
    remainingResources: userData.progress.totalResources - userData.progress.completedResources,
    totalTimeSpent: userData.progress.totalTimeSpent,
    completedPhases,
    inProgressPhases,
    currentStreak: userData.statistics.streak.current,
    longestStreak: userData.statistics.streak.longest,
    velocity: userData.statistics.velocity,
    estimatedCompletionDate: calculateEstimatedCompletion(userData),
  };
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function calculatePhaseProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function createPhaseProgress(phaseId: string, name: string, totalResources: number): PhaseProgress {
  return {
    phaseId,
    name,
    status: 'not_started',
    progress: 0,
    startDate: null,
    completionDate: null,
    totalResources,
    completedResources: 0,
    timeSpent: 0,
  };
}

function updateStreak(userData: UserData) {
  const now = new Date();
  const lastActivity = userData.statistics.streak.lastActivityDate
    ? new Date(userData.statistics.streak.lastActivityDate)
    : null;

  if (!lastActivity) {
    userData.statistics.streak.current = 1;
    userData.statistics.streak.lastActivityDate = now.toISOString();
    return;
  }

  const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // Same day, don't change streak
    return;
  } else if (daysDiff === 1) {
    // Consecutive day
    userData.statistics.streak.current += 1;
    userData.statistics.streak.longest = Math.max(
      userData.statistics.streak.longest,
      userData.statistics.streak.current
    );
  } else {
    // Streak broken
    userData.statistics.streak.current = 1;
  }

  userData.statistics.streak.lastActivityDate = now.toISOString();
}

function updateVelocity(userData: UserData) {
  const startDate = new Date(userData.progress.startDate);
  const now = new Date();
  const daysSinceStart = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const weeksSinceStart = Math.max(0.1, daysSinceStart / 7);

  userData.statistics.velocity.itemsPerDay = userData.progress.completedResources / daysSinceStart;
  userData.statistics.velocity.itemsPerWeek = userData.progress.completedResources / weeksSinceStart;
  userData.statistics.velocity.averageTimePerResource =
    userData.progress.completedResources > 0
      ? userData.progress.totalTimeSpent / userData.progress.completedResources
      : 0;
}

function checkMilestones(userData: UserData) {
  const milestones = [
    { count: 1, title: 'First Step', description: 'Completed your first resource' },
    { count: 10, title: 'Getting Started', description: 'Completed 10 resources' },
    { count: 25, title: 'Quarter Century', description: 'Completed 25 resources' },
    { count: 50, title: 'Halfway Hero', description: 'Completed 50 resources' },
    { count: 100, title: 'Centurion', description: 'Completed 100 resources' },
    { count: 150, title: 'Dedication', description: 'Completed 150 resources' },
  ];

  milestones.forEach(milestone => {
    const milestoneId = `resources-${milestone.count}`;
    const alreadyAchieved = userData.statistics.milestones.some(m => m.id === milestoneId);

    if (!alreadyAchieved && userData.progress.completedResources >= milestone.count) {
      userData.statistics.milestones.push({
        id: milestoneId,
        title: milestone.title,
        description: milestone.description,
        achievedAt: new Date().toISOString(),
        icon: '🎯',
      });
    }
  });
}

function calculateEstimatedWeeks(remainingResources: number, itemsPerWeek: number): number {
  if (itemsPerWeek === 0) return 0;
  return Math.ceil(remainingResources / itemsPerWeek);
}

function calculateEstimatedCompletion(userData: UserData): string | null {
  const { velocity } = userData.statistics;
  if (velocity.itemsPerWeek === 0) return null;

  const remainingResources = userData.progress.totalResources - userData.progress.completedResources;
  const weeksRemaining = remainingResources / velocity.itemsPerWeek;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + weeksRemaining * 7);

  return estimatedDate.toISOString();
}

/**
 * Export user data as JSON for backup
 */
export function exportUserData(userData: UserData): string {
  return JSON.stringify(userData, null, 2);
}

/**
 * Import user data from JSON backup
 */
export async function importUserData(userId: string, jsonData: string): Promise<boolean> {
  try {
    const userData = JSON.parse(jsonData) as UserData;
    userData.userId = userId; // Ensure userId matches
    userData.profile.lastSeen = new Date().toISOString();
    return await saveUserData(userId, userData);
  } catch (error) {
    console.error('Error importing user data:', error);
    return false;
  }
}
