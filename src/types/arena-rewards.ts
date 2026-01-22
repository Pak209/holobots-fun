// ============================================================================
// Arena V2 Rewards Types
// Reward calculation, distribution, and tracking
// ============================================================================

import type { WinType } from './arena';

export interface RewardCalculationContext {
  battleId: string;
  winnerId: string;
  loserId: string;
  
  // Battle Details
  battleType: 'pvp' | 'pve' | 'training' | 'ranked';
  winType: WinType;
  duration: number; // seconds
  totalTurns: number;
  
  // Performance Metrics
  perfectDefenses: number;
  combosCompleted: number;
  totalDamageDealt: number;
  
  // Player Stats
  playerLevel: number;
  playerRank: number;
  syncLevel: number;
  
  // Modifiers
  isFirstWinOfDay: boolean;
  winStreak: number;
  eventMultiplier: number;
}

export interface RewardBreakdown {
  // Base Rewards
  baseExp: number;
  baseSyncPoints: number;
  baseArenaTokens: number;
  
  // Bonuses
  performanceBonus: number;
  speedBonus: number;
  perfectDefenseBonus: number;
  comboBonus: number;
  winStreakBonus: number;
  firstWinBonus: number;
  
  // Totals
  totalExp: number;
  totalSyncPoints: number;
  totalArenaTokens: number;
  totalHolos?: number;
  
  // Ranked Specific
  eloChange?: number;
  rankProgressChange?: number;
  
  // Special Items
  items?: RewardItem[];
}

export interface RewardItem {
  id: string;
  type: 'consumable' | 'equipment' | 'cosmetic' | 'currency' | 'blueprint';
  name: string;
  description: string;
  iconUrl?: string;
  quantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface SeasonPass {
  seasonId: string;
  tier: number;
  experience: number;
  experienceToNextTier: number;
  rewards: SeasonPassReward[];
}

export interface SeasonPassReward {
  tier: number;
  unlocked: boolean;
  items: RewardItem[];
}
