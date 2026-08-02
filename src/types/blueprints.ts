import { z } from 'zod';

// Blueprint Piece Sources
export const BLUEPRINT_SOURCES = [
  'quest_rewards',
  'sync_training', 
  'arena_battles',
  'league_rewards',
  'booster_packs',
  'seasonal_events',
  'daily_missions',
  'achievement_rewards'
] as const;

export type BlueprintSource = typeof BLUEPRINT_SOURCES[number];

// Season Configuration
export interface SeasonConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  maxBlueprintPieces: number;
  isActive: boolean;
  distributionLimits: Record<BlueprintSource, number>;
  holobotWeights: Record<string, number>; // For dynamic rarity adjustment
  dailyPlayerCapEnabled: boolean;
  dailyPlayerCapAmount: number;
  legacyConversionRate: number; // Rate for converting unused blueprints to legacy chips
}

// Global Blueprint Stats
export interface GlobalBlueprintStats {
  seasonId: string;
  totalPiecesDropped: number;
  totalPiecesUsed: number;
  remainingPieces: number;
  holobotDistribution: Record<string, number>; // How many pieces of each type have been distributed
  sourceDistribution: Record<BlueprintSource, number>;
  totalMintsCompleted: number;
  lastUpdated: string;
}

// Player Blueprint State
export interface PlayerBlueprintState {
  userId: string;
  seasonId: string;
  blueprintPieces: Record<string, number>; // holobot type -> count
  totalPiecesEarned: number;
  totalPiecesUsed: number;
  dailyPiecesEarned: number;
  lastDailyReset: string;
  mintCatalysts: number; // Required for minting
  legacyChips: number; // From previous seasons
  lastBlueprintEarned: string;
  sourceBreakdown: Record<BlueprintSource, number>;
}

// Blueprint Drop Configuration
export interface BlueprintDropConfig {
  source: BlueprintSource;
  basePieces: number;
  rarityModifier: number;
  playerLevelModifier: number;
  seasonProgressModifier: number;
  guaranteedHolobotType?: string; // For specific rewards
  allowDuplicates: boolean;
  cooldownMinutes: number;
}

// Blueprint Drop Result
export interface BlueprintDropResult {
  success: boolean;
  piecesAwarded: number;
  holobotType: string;
  source: BlueprintSource;
  remainingGlobalSupply: number;
  playerDailyRemaining: number;
  rarityBonus: boolean;
  message: string;
}

// Mint Catalyst Configuration
export interface MintCatalystConfig {
  holosTokenCost: number;
  requiredActivity: {
    questsCompleted: number;
    battlesWon: number;
    trainingDistance: number;
  };
  craftingCooldown: number; // hours
  maxCatalystsPerDay: number;
}

// Season End Conversion
export interface SeasonEndConversion {
  unusedBlueprints: number;
  legacyChipsAwarded: number;
  conversionRate: number;
  seasonEndDate: string;
  nextSeasonStartDate: string;
}

// Rarity Adjustment System
export interface RarityAdjustment {
  holobotType: string;
  currentSupply: number;
  targetSupply: number;
  adjustmentFactor: number; // Multiplier for drop rates
  lastAdjustment: string;
}

// Anti-Whale Configuration
export interface AntiWhaleConfig {
  enabled: boolean;
  dailyCapPerPlayer: number;
  diminishingReturns: {
    threshold: number;
    reductionFactor: number;
  };
  cooldownBetweenDrops: number; // minutes
  maxDropsPerHour: number;
}

// Schema definitions for validation
export const BlueprintDropConfigSchema = z.object({
  source: z.enum(BLUEPRINT_SOURCES),
  basePieces: z.number().min(1).max(50),
  rarityModifier: z.number().min(0.1).max(3.0),
  playerLevelModifier: z.number().min(0.1).max(2.0),
  seasonProgressModifier: z.number().min(0.1).max(2.0),
  guaranteedHolobotType: z.string().optional(),
  allowDuplicates: z.boolean(),
  cooldownMinutes: z.number().min(0).max(1440)
});

export const SeasonConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  maxBlueprintPieces: z.number().min(1000).max(1000000),
  isActive: z.boolean(),
  distributionLimits: z.record(z.enum(BLUEPRINT_SOURCES), z.number()),
  holobotWeights: z.record(z.string(), z.number()),
  dailyPlayerCapEnabled: z.boolean(),
  dailyPlayerCapAmount: z.number().min(0).max(1000),
  legacyConversionRate: z.number().min(0).max(1)
});

// Default configurations
export const DEFAULT_SEASON_1_CONFIG: SeasonConfig = {
  id: 'season_1',
  name: 'Genesis Season',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
  maxBlueprintPieces: 500000,
  isActive: true,
  distributionLimits: {
    quest_rewards: 200000,
    sync_training: 75000,
    arena_battles: 75000,
    league_rewards: 50000,
    booster_packs: 100000,
    seasonal_events: 50000,
    daily_missions: 25000,
    achievement_rewards: 25000
  },
  holobotWeights: {
    'ace': 1.0,
    'kuma': 1.0,
    'shadow': 1.0,
    'hare': 1.0,
    'tora': 1.0,
    'wake': 1.0,
    'era': 1.0,
    'gama': 1.0,
    'ken': 1.0,
    'kurai': 1.0,
    'tsuin': 1.0,
    'wolf': 1.0
  },
  dailyPlayerCapEnabled: true,
  dailyPlayerCapAmount: 50,
  legacyConversionRate: 0.1
};

export const DEFAULT_MINT_CATALYST_CONFIG: MintCatalystConfig = {
  holosTokenCost: 100,
  requiredActivity: {
    questsCompleted: 5,
    battlesWon: 3,
    trainingDistance: 1000
  },
  craftingCooldown: 24, // 24 hours
  maxCatalystsPerDay: 3
};

export const DEFAULT_ANTI_WHALE_CONFIG: AntiWhaleConfig = {
  enabled: true,
  dailyCapPerPlayer: 50,
  diminishingReturns: {
    threshold: 25,
    reductionFactor: 0.5
  },
  cooldownBetweenDrops: 5, // 5 minutes
  maxDropsPerHour: 10
};

// Utility functions
export function calculateSeasonProgress(season: SeasonConfig): number {
  const now = new Date();
  const start = new Date(season.startDate);
  const end = new Date(season.endDate);
  
  if (now < start) return 0;
  if (now > end) return 1;
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  return elapsed / totalDuration;
}

export function calculateRarityModifier(
  holobotType: string, 
  globalStats: GlobalBlueprintStats,
  seasonConfig: SeasonConfig
): number {
  const currentDistribution = globalStats.holobotDistribution[holobotType] || 0;
  const targetDistribution = seasonConfig.maxBlueprintPieces / 12; // Equal distribution baseline
  
  const ratio = currentDistribution / targetDistribution;
  
  // If oversupplied, reduce drop rate. If undersupplied, increase drop rate
  if (ratio > 1.2) return 0.5; // Heavily reduce
  if (ratio > 1.0) return 0.8; // Moderately reduce
  if (ratio < 0.8) return 1.2; // Moderately increase
  if (ratio < 0.6) return 1.5; // Heavily increase
  
  return 1.0; // Normal rate
}

export function isSeasonActive(season: SeasonConfig): boolean {
  const now = new Date();
  const start = new Date(season.startDate);
  const end = new Date(season.endDate);
  
  return season.isActive && now >= start && now <= end;
}

export function calculateDailyReset(): string {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight.toISOString();
}

export type BlueprintDropConfigType = z.infer<typeof BlueprintDropConfigSchema>;
export type SeasonConfigType = z.infer<typeof SeasonConfigSchema>;