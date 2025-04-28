import { Holobot } from './holobots';

export interface UserStats {
  // Battle stats
  wins: number;
  losses: number;
  winStreak: number;
  bestWinStreak: number;
  totalBattles: number;
  
  // Sync Training stats
  totalSyncTime: number;
  totalSteps: number;
  avgSpeed: number;
  bestSpeed: number;
  syncPoints: number;
  
  // Quest stats
  totalQuests: number;
  completedQuests: number;
  failedQuests: number;
  energySpent: number;
  blueprintsCollected: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  sound: boolean;
  vibration: boolean;
  notifications: boolean;
  language: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  completedAt?: string;
  progress?: number;
  maxProgress?: number;
  category: 'battle' | 'training' | 'collection' | 'quest';
  reward?: {
    type: 'holosTokens' | 'gachaTickets' | 'blueprint';
    amount: number;
    blueprintType?: string;
  };
}

export type PlayerRank = 'Rookie' | 'Scout' | 'Champion' | 'Elite' | 'Legend' | 'Mythic';

export interface User {
  id: string;
  name: string;
  email: string;
  walletAddress?: string;
  isWalletConnected: boolean;
  
  // Currency and Energy
  holosTokens: number;
  gachaTickets: number;
  dailyEnergy: number;
  maxDailyEnergy: number;
  lastEnergyRefresh: string;
  
  // Items
  energyRefills: number;
  arenaPasses: number;
  expBoosters: number;
  rankSkips: number;
  
  // Game Progress
  level: number;
  experience: number;
  player_rank: PlayerRank;
  prestige_count: number;
  
  // Collections
  holobots: Record<string, Holobot>;
  blueprints: Record<string, number>;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  avatarUrl?: string;
  bio?: string;
  stats: UserStats;
  preferences: UserPreferences;
  achievements: Achievement[];
  activeQuests?: string[];
  completedQuests?: string[];
}

export interface Quest {
  id: string;
  startTime: string;
  endTime: string;
  type: 'exploration' | 'boss';
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
}