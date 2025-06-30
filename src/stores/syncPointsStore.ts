import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SyncPointsEntry, SyncPointsStats, DEFAULT_SYNC_CONFIG } from '@/types/syncPoints';

interface SyncPointsStore {
  entries: SyncPointsEntry[];
  stats: SyncPointsStats;
  isLoading: boolean;
  
  // Actions
  addStepsEntry: (steps: number) => void;
  calculateStats: () => void;
  resetDailyEntries: () => void;
  getEntriesForDateRange: (startDate: Date, endDate: Date) => SyncPointsEntry[];
  getTotalSyncPoints: () => number;
}

const calculateSyncPoints = (steps: number, streak: number = 0): number => {
  if (steps < DEFAULT_SYNC_CONFIG.minimumStepsForReward) {
    return 0;
  }

  // Base sync points
  const baseSyncPoints = Math.floor(steps / DEFAULT_SYNC_CONFIG.stepsPerSyncPoint);
  
  // Streak multiplier
  const streakIndex = Math.min(streak - 1, DEFAULT_SYNC_CONFIG.bonusMultipliers.streak.length - 1);
  const streakMultiplier = streak > 0 ? DEFAULT_SYNC_CONFIG.bonusMultipliers.streak[streakIndex] : 1;
  
  return Math.floor(baseSyncPoints * streakMultiplier);
};

const getStreakCount = (entries: SyncPointsEntry[]): number => {
  if (entries.length === 0) return 0;
  
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    if (entryDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

export const useSyncPointsStore = create<SyncPointsStore>()(
  persist(
    (set, get) => ({
      entries: [],
      stats: {
        totalSteps: 0,
        totalSyncPoints: 0,
        weeklySteps: 0,
        weeklySyncPoints: 0,
        dailyAverage: 0,
        streak: 0,
      },
      isLoading: false,

      addStepsEntry: (steps: number) => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        // Check if entry already exists for today
        const existingEntryIndex = state.entries.findIndex(entry => entry.date === today);
        
        // Calculate streak for sync points calculation
        const currentStreak = getStreakCount(state.entries);
        const newStreak = existingEntryIndex >= 0 ? currentStreak : currentStreak + 1;
        
        const syncPoints = calculateSyncPoints(steps, newStreak);
        
        const newEntry: SyncPointsEntry = {
          id: `${today}-${Date.now()}`,
          date: today,
          steps,
          syncPoints,
          timestamp: Date.now(),
        };

        let updatedEntries;
        if (existingEntryIndex >= 0) {
          // Update existing entry
          updatedEntries = [...state.entries];
          updatedEntries[existingEntryIndex] = newEntry;
        } else {
          // Add new entry
          updatedEntries = [...state.entries, newEntry];
        }

        set({ entries: updatedEntries });
        get().calculateStats();
      },

      calculateStats: () => {
        const state = get();
        const { entries } = state;
        
        if (entries.length === 0) {
          set({
            stats: {
              totalSteps: 0,
              totalSyncPoints: 0,
              weeklySteps: 0,
              weeklySyncPoints: 0,
              dailyAverage: 0,
              streak: 0,
            }
          });
          return;
        }

        const totalSteps = entries.reduce((sum, entry) => sum + entry.steps, 0);
        const totalSyncPoints = entries.reduce((sum, entry) => sum + entry.syncPoints, 0);
        
        // Calculate weekly stats (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyEntries = entries.filter(entry => new Date(entry.date) >= weekAgo);
        const weeklySteps = weeklyEntries.reduce((sum, entry) => sum + entry.steps, 0);
        const weeklySyncPoints = weeklyEntries.reduce((sum, entry) => sum + entry.syncPoints, 0);
        
        const dailyAverage = entries.length > 0 ? Math.floor(totalSteps / entries.length) : 0;
        const streak = getStreakCount(entries);

        set({
          stats: {
            totalSteps,
            totalSyncPoints,
            weeklySteps,
            weeklySyncPoints,
            dailyAverage,
            streak,
          }
        });
      },

      resetDailyEntries: () => {
        set({ entries: [] });
        get().calculateStats();
      },

      getEntriesForDateRange: (startDate: Date, endDate: Date) => {
        const { entries } = get();
        return entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        });
      },

      getTotalSyncPoints: () => {
        return get().stats.totalSyncPoints;
      },
    }),
    {
      name: 'sync-points-storage',
    }
  )
); 