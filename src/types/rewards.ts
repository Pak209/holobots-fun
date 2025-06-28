export type DailyMissionType = 
  | 'daily_login'
  | 'complete_quest'
  | 'train_holobot'
  | 'arena_battle'
  | 'open_booster_pack'
  | 'sync_fitness'
  | 'level_up_holobot';

export interface DailyMission {
  id: string;
  type: DailyMissionType;
  name: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: {
    gachaTickets: number;
    holosTokens?: number;
    exp?: number;
  };
  resetDaily: boolean;
}

export interface TrainingStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date string
  weeklyTicketsEarned: number;
  lastWeeklyReward: string; // ISO date string for week tracking
}

export interface ArenaStreak {
  currentWinStreak: number;
  longestWinStreak: number;
  lastBattleDate: string;
  streakRewardsEarned: number;
  lastStreakReward: number; // Last streak milestone that gave rewards
}

export interface LeagueProgression {
  currentTier: 'junkyard' | 'city_scraps' | 'neon_core' | 'overlord';
  tiersCompleted: string[];
  lastTierCompletedDate: string;
  tierRewardsEarned: number;
}

export interface RewardSystem {
  dailyMissions: DailyMission[];
  trainingStreak: TrainingStreak;
  arenaStreak: ArenaStreak;
  leagueProgression: LeagueProgression;
  lastDailyMissionReset: string;
}

// Daily mission configurations
export const DAILY_MISSION_CONFIGS: Record<DailyMissionType, {
  name: string;
  description: string;
  baseTarget: number;
  baseReward: { gachaTickets: number; holosTokens?: number; exp?: number };
}> = {
  daily_login: {
    name: 'Daily Check-in',
    description: 'Log in to the game',
    baseTarget: 1,
    baseReward: { gachaTickets: 1 }
  },
  complete_quest: {
    name: 'Quest Explorer',
    description: 'Complete any quest',
    baseTarget: 2,
    baseReward: { gachaTickets: 1, holosTokens: 50 }
  },
  train_holobot: {
    name: 'Training Session',
    description: 'Complete a fitness training session',
    baseTarget: 1,
    baseReward: { gachaTickets: 2, exp: 100 }
  },
  arena_battle: {
    name: 'Arena Fighter',
    description: 'Participate in arena battles',
    baseTarget: 3,
    baseReward: { gachaTickets: 2, holosTokens: 100 }
  },
  open_booster_pack: {
    name: 'Pack Collector',
    description: 'Open booster packs',
    baseTarget: 1,
    baseReward: { gachaTickets: 1 }
  },
  sync_fitness: {
    name: 'Fitness Sync',
    description: 'Reach your daily step goal',
    baseTarget: 10000,
    baseReward: { gachaTickets: 3, holosTokens: 200 }
  },
  level_up_holobot: {
    name: 'Level Master',
    description: 'Level up any Holobot',
    baseTarget: 1,
    baseReward: { gachaTickets: 2, holosTokens: 150 }
  }
};

// Streak reward configurations
export const TRAINING_STREAK_REWARDS = {
  WEEKLY_THRESHOLD: 7,
  WEEKLY_TICKETS: 5,
  BONUS_THRESHOLDS: [7, 14, 30], // Bonus rewards at these streak milestones
  BONUS_TICKETS: [2, 5, 10]
};

export const ARENA_STREAK_REWARDS = {
  STREAK_THRESHOLDS: [3, 5, 10, 15, 20],
  TICKETS_PER_THRESHOLD: [5, 10, 15, 20, 25]
};

export const LEAGUE_TIER_REWARDS = {
  junkyard: { gachaTickets: 10, holosTokens: 500 },
  city_scraps: { gachaTickets: 15, holosTokens: 1000 },
  neon_core: { gachaTickets: 20, holosTokens: 2000 },
  overlord: { gachaTickets: 25, holosTokens: 5000 }
}; 