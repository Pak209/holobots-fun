export interface SyncPointsEntry {
  id: string;
  date: string;
  steps: number;
  syncPoints: number;
  timestamp: number;
}

export interface SyncPointsStats {
  totalSteps: number;
  totalSyncPoints: number;
  weeklySteps: number;
  weeklySyncPoints: number;
  dailyAverage: number;
  streak: number;
}

export interface SyncPointsConfig {
  stepsPerSyncPoint: number;
  bonusMultipliers: {
    streak: number[];
    weeklyGoal: number;
    monthlyGoal: number;
  };
  minimumStepsForReward: number;
  dailyStepGoal: number;
  weeklyStepGoal: number;
}

export const DEFAULT_SYNC_CONFIG: SyncPointsConfig = {
  stepsPerSyncPoint: 100, // 100 steps = 1 sync point
  bonusMultipliers: {
    streak: [1, 1.1, 1.2, 1.3, 1.5, 2.0], // Day 1, 2, 3, 4, 5, 7+ consecutive days
    weeklyGoal: 1.5, // 50% bonus for hitting weekly goal
    monthlyGoal: 2.0, // 100% bonus for hitting monthly goal
  },
  minimumStepsForReward: 1000, // Must walk at least 1000 steps to get sync points
  dailyStepGoal: 10000,
  weeklyStepGoal: 70000,
}; 