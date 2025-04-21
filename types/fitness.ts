export interface FitnessData {
  steps: number;
  syncPointsEarned: number;
  dailyGoal: number;
  lastSynced: string;
  weeklySteps?: Array<{
    date: string;
    count: number;
  }>;
}

export interface HealthConnection {
  deviceName: string;
  deviceOS: string;
  connectedAt: string;
  lastSynced: string;
}