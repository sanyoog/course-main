/**
 * Custom React Hook for User Progress Management
 * Provides easy-to-use functions for tracking user progress
 */

import { useState, useEffect, useCallback } from 'react';
import {
  UserData,
  getUserData,
  markResourceCompleted,
  markResourceIncomplete,
  getPhaseStats,
  getOverallStats,
  initializeUserData,
} from '../lib/userDataUtils';

interface UseUserProgressReturn {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  completeResource: (resourceId: string, phaseId: string, timeSpent?: number) => Promise<void>;
  uncompleteResource: (resourceId: string, phaseId: string) => Promise<void>;
  isResourceCompleted: (resourceId: string) => boolean;
  getPhaseProgress: (phaseId: string) => any;
  getStats: () => any;
  refreshUserData: () => Promise<void>;
}

/**
 * Hook to manage user progress data
 */
export function useUserProgress(userId: string | null): UseUserProgressReturn {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserData(userId);
      
      if (data) {
        setUserData(data);
      } else {
        // Initialize if no data exists
        const newData = await initializeUserData(userId, {
          'phase-1': 0,
          'phase-2': 0,
          'phase-3': 0,
          'phase-4': 0,
          'phase-5': 0,
        });
        setUserData(newData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load on mount and userId change
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Complete a resource
  const completeResource = useCallback(
    async (resourceId: string, phaseId: string, timeSpent: number = 0) => {
      if (!userId) return;

      try {
        const updatedData = await markResourceCompleted(userId, resourceId, phaseId, timeSpent);
        if (updatedData) {
          setUserData(updatedData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete resource');
      }
    },
    [userId]
  );

  // Uncomplete a resource
  const uncompleteResource = useCallback(
    async (resourceId: string, phaseId: string) => {
      if (!userId) return;

      try {
        const updatedData = await markResourceIncomplete(userId, resourceId, phaseId);
        if (updatedData) {
          setUserData(updatedData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to uncomplete resource');
      }
    },
    [userId]
  );

  // Check if resource is completed
  const isResourceCompleted = useCallback(
    (resourceId: string): boolean => {
      return userData?.completedResources.includes(resourceId) ?? false;
    },
    [userData]
  );

  // Get phase progress
  const getPhaseProgress = useCallback(
    (phaseId: string) => {
      if (!userData) return null;
      return getPhaseStats(userData, phaseId);
    },
    [userData]
  );

  // Get overall stats
  const getStats = useCallback(() => {
    if (!userData) return null;
    return getOverallStats(userData);
  }, [userData]);

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  return {
    userData,
    loading,
    error,
    completeResource,
    uncompleteResource,
    isResourceCompleted,
    getPhaseProgress,
    getStats,
    refreshUserData,
  };
}
