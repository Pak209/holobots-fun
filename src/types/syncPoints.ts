export interface SyncPointsEntry {
  id: string;
  date: string;
  steps: number;
  syncPoints: number;
  syncTrainingMinutes?: number; // Minutes spent in Sync Training
  activityType: 'steps' | 'sync_training' | 'mission_bonus';
  timestamp: number;
}

export interface SyncPointsStats {
  totalSteps: number;
  totalSyncPoints: number;
  totalSpent: number; // Total SP spent on upgrades
  availableSyncPoints: number; // Current spendable SP
  weeklySteps: number;
  weeklySyncPoints: number;
  weeklySyncTrainingMinutes: number;
  dailyAverage: number;
  streak: number;
  xHolosWeight: number; // Hidden conversion for Stockpile rewards
}

export interface SyncBond {
  level: number;
  progress: number; // 0-100 progress to next level
  totalSyncPoints: number; // Total SP earned with this Holobot
  syncTrainingHours: number; // Total training time with this Holobot
  abilityBoost: number; // Percentage boost to abilities
  partCompatibility: number; // Percentage boost to part effectiveness
  specialUnlocks: string[]; // Unlocked special abilities/traits
}

export interface AttributeUpgrade {
  holobotId: string;
  attribute: 'hp' | 'attack' | 'speed' | 'defense' | 'special';
  level: number; // Current level of this attribute
  syncPointsInvested: number; // Total SP spent on this attribute
}

export interface SpecialAttackUnlock {
  id: string;
  name: string;
  description: string;
  requiredAttributes: Record<string, number>; // e.g., { attack: 5, special: 3 }
  syncPointCost: number;
  unlocked: boolean;
}

export interface AbilityChipUnlock {
  chipId: string;
  tierLevel: number;
  syncPointCost: number;
  unlocked: boolean;
}

export interface SyncPointsConfig {
  stepsPerSyncPoint: number;
  syncTrainingPointsPerMinute: number;
  bonusMultipliers: {
    streak: number[];
    weeklyGoal: number;
    monthlyGoal: number;
    syncTrainingBonus: number; // Extra multiplier for Sync Training
  };
  minimumStepsForReward: number;
  dailyStepGoal: number;
  weeklyStepGoal: number;
  attributeUpgradeCosts: number[]; // SP cost for each level [level1, level2, etc.]
  maxAttributeLevel: number;
  syncBondRequirements: number[]; // SP required for each Sync Bond level
  xHolosConversionRate: number; // Hidden: SP to xHolos weight ratio
}

export const DEFAULT_SYNC_CONFIG: SyncPointsConfig = {
  stepsPerSyncPoint: 1000, // 1000 steps = 1 sync point (updated from 100)
  syncTrainingPointsPerMinute: 2, // 2 SP per minute of Sync Training
  bonusMultipliers: {
    streak: [1, 1.1, 1.2, 1.3, 1.5, 2.0], // Day 1, 2, 3, 4, 5, 7+ consecutive days
    weeklyGoal: 1.5, // 50% bonus for hitting weekly goal
    monthlyGoal: 2.0, // 100% bonus for hitting monthly goal
    syncTrainingBonus: 1.5, // 50% bonus for Sync Training vs steps
  },
  minimumStepsForReward: 1000, // Must walk at least 1000 steps to get sync points
  dailyStepGoal: 10000,
  weeklyStepGoal: 70000,
  attributeUpgradeCosts: [
    4,    // Level 1
    10,   // Level 2
    25,   // Level 3
    50,   // Level 4
    100,  // Level 5
    200,  // Level 6
    350,  // Level 7
    500,  // Level 8
    750,  // Level 9
    1000, // Level 10 (max)
  ],
  maxAttributeLevel: 10,
  syncBondRequirements: [0, 50, 150, 300, 500, 750, 1000, 1500, 2000, 3000, 5000], // Level 0-10
  xHolosConversionRate: 0.1, // 1 SP = 0.1 xHolos weight (hidden)
};

// Utility functions
export const calculateAttributeUpgradeCost = (currentLevel: number): number => {
  if (currentLevel >= DEFAULT_SYNC_CONFIG.maxAttributeLevel) return 0;
  return DEFAULT_SYNC_CONFIG.attributeUpgradeCosts[currentLevel] || 0;
};

export const calculateTotalAttributeCost = (targetLevel: number): number => {
  return DEFAULT_SYNC_CONFIG.attributeUpgradeCosts
    .slice(0, targetLevel)
    .reduce((sum, cost) => sum + cost, 0);
};

export const calculateSyncBondLevel = (totalSyncPoints: number): { level: number; progress: number } => {
  const requirements = DEFAULT_SYNC_CONFIG.syncBondRequirements;
  
  let level = 0;
  for (let i = requirements.length - 1; i >= 0; i--) {
    if (totalSyncPoints >= requirements[i]) {
      level = i;
      break;
    }
  }
  
  const currentRequirement = requirements[level];
  const nextRequirement = requirements[level + 1] || requirements[requirements.length - 1];
  const progress = level === requirements.length - 1 ? 100 : 
    Math.floor(((totalSyncPoints - currentRequirement) / (nextRequirement - currentRequirement)) * 100);
  
  return { level, progress };
};

export const calculateXHolosWeight = (totalSyncPoints: number): number => {
  return totalSyncPoints * DEFAULT_SYNC_CONFIG.xHolosConversionRate;
}; 