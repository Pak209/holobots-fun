import { blueprintService } from './blueprintService';
import { BlueprintDropConfig, BlueprintSource } from '../types/blueprints';

/**
 * Blueprint integration utilities for existing game mechanics
 */

export const BlueprintIntegration = {
  /**
   * Award blueprint pieces from quest completion
   */
  async awardQuestBlueprints(
    userId: string,
    questTier: number,
    questType: 'exploration' | 'boss' | 'combat' | 'training',
    playerLevel: number = 1
  ) {
    const config: BlueprintDropConfig = {
      source: 'quest_rewards',
      basePieces: Math.min(3 + questTier, 10), // 3-10 pieces based on tier
      rarityModifier: questType === 'boss' ? 1.5 : 1.0, // Boss quests give more
      playerLevelModifier: Math.min(1 + (playerLevel - 1) * 0.1, 2.0), // Up to 2x at level 11+
      seasonProgressModifier: 1.2, // 20% boost as season progresses
      allowDuplicates: true,
      cooldownMinutes: 0
    };

    return await blueprintService.awardBlueprintPieces(userId, config);
  },

  /**
   * Award blueprint pieces from sync training
   */
  async awardSyncTrainingBlueprints(
    userId: string,
    distanceTrained: number,
    holobotLevel: number = 1
  ) {
    // Award pieces based on distance (1 piece per 100 meters, max 5 per session)
    const basePieces = Math.min(Math.floor(distanceTrained / 100), 5);
    
    if (basePieces === 0) return null;

    const config: BlueprintDropConfig = {
      source: 'sync_training',
      basePieces,
      rarityModifier: 1.0,
      playerLevelModifier: Math.min(1 + (holobotLevel - 1) * 0.05, 1.5), // Up to 1.5x at level 11+
      seasonProgressModifier: 1.1, // 10% boost as season progresses
      allowDuplicates: true,
      cooldownMinutes: 15 // 15 minute cooldown between sync training drops
    };

    return await blueprintService.awardBlueprintPieces(userId, config);
  },

  /**
   * Award blueprint pieces from arena battles
   */
  async awardArenaBattleBlueprints(
    userId: string,
    isWin: boolean,
    opponentLevel: number = 1,
    playerLevel: number = 1
  ) {
    const config: BlueprintDropConfig = {
      source: 'arena_battles',
      basePieces: isWin ? 4 : 1, // 4 pieces for win, 1 for participation
      rarityModifier: isWin ? 1.2 : 0.8, // Bonus for winning
      playerLevelModifier: Math.min(1 + (playerLevel - 1) * 0.08, 1.8), // Up to 1.8x at level 11+
      seasonProgressModifier: 1.1, // 10% boost as season progresses
      allowDuplicates: true,
      cooldownMinutes: 5 // 5 minute cooldown between arena drops
    };

    return await blueprintService.awardBlueprintPieces(userId, config);
  },

  /**
   * Award blueprint pieces from league progression
   */
  async awardLeagueBlueprints(
    userId: string,
    league: 'junkyard' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond',
    isPromotion: boolean = false,
    playerLevel: number = 1
  ) {
    const leagueMultipliers = {
      junkyard: 1.0,
      bronze: 1.2,
      silver: 1.4,
      gold: 1.6,
      platinum: 1.8,
      diamond: 2.0
    };

    const config: BlueprintDropConfig = {
      source: 'league_rewards',
      basePieces: isPromotion ? 15 : 5, // 15 pieces for promotion, 5 for regular rewards
      rarityModifier: leagueMultipliers[league],
      playerLevelModifier: Math.min(1 + (playerLevel - 1) * 0.1, 2.0),
      seasonProgressModifier: 1.0, // No season progress bonus for league rewards
      allowDuplicates: true,
      cooldownMinutes: 0
    };

    return await blueprintService.awardBlueprintPieces(userId, config);
  },

  /**
   * Award blueprint pieces from booster pack opening
   */
  async awardBoosterPackBlueprints(
    userId: string,
    packType: 'common' | 'rare' | 'epic' | 'legendary' = 'common',
    playerLevel: number = 1
  ) {
    const packMultipliers = {
      common: 1.0,
      rare: 1.5,
      epic: 2.0,
      legendary: 3.0
    };

    const basePieces = {
      common: 3,
      rare: 5,
      epic: 8,
      legendary: 12
    };

    const config: BlueprintDropConfig = {
      source: 'booster_packs',
      basePieces: basePieces[packType],
      rarityModifier: packMultipliers[packType],
      playerLevelModifier: Math.min(1 + (playerLevel - 1) * 0.05, 1.5),
      seasonProgressModifier: 1.0, // No season progress bonus for gacha
      allowDuplicates: true,
      cooldownMinutes: 0
    };

    return await blueprintService.awardBlueprintPieces(userId, config);
  },

  /**
   * Award blueprint pieces from seasonal events
   */
  async awardSeasonalEventBlueprints(
    userId: string,
    eventType: 'daily_login' | 'weekly_challenge' | 'special_event',
    eventTier: number = 1,
    playerLevel: number = 1
  ) {
    const eventMultipliers = {
      daily_login: 0.8,
      weekly_challenge: 1.5,
      special_event: 2.0
    };

    const config: BlueprintDropConfig = {
      source: 'seasonal_events',
      basePieces: 2 + eventTier * 2, // 4, 6, 8, 10... pieces based on tier
      rarityModifier: eventMultipliers[eventType],
      playerLevelModifier: Math.min(1 + (playerLevel - 1) * 0.05, 1.5),
      seasonProgressModifier: 0.8, // Reduced as season progresses to maintain scarcity
      allowDuplicates: true,
      cooldownMinutes: eventType === 'daily_login' ? 0 : 30
    };

    return await blueprintService.awardBlueprintPieces(userId, config);
  },

  /**
   * Award blueprint pieces from daily missions
   */
  async awardDailyMissionBlueprints(
    userId: string,
    missionType: 'combat' | 'training' | 'exploration' | 'social',
    missionTier: number = 1,
    playerLevel: number = 1
  ) {
    const missionMultipliers = {
      combat: 1.2,
      training: 1.0,
      exploration: 1.1,
      social: 0.9
    };

    const config: BlueprintDropConfig = {
      source: 'daily_missions',
      basePieces: 2 + missionTier, // 3, 4, 5... pieces based on tier
      rarityModifier: missionMultipliers[missionType],
      playerLevelModifier: Math.min(1 + (playerLevel - 1) * 0.05, 1.5),
      seasonProgressModifier: 1.0,
      allowDuplicates: true,
      cooldownMinutes: 0
    };

    return await blueprintService.awardBlueprintPieces(userId, config);
  },

  /**
   * Award blueprint pieces from achievement unlocks
   */
  async awardAchievementBlueprints(
    userId: string,
    achievementType: 'milestone' | 'challenge' | 'collection' | 'mastery',
    achievementRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common',
    playerLevel: number = 1
  ) {
    const rarityMultipliers = {
      common: 1.0,
      rare: 1.5,
      epic: 2.0,
      legendary: 3.0
    };

    const typeMultipliers = {
      milestone: 1.2,
      challenge: 1.5,
      collection: 1.0,
      mastery: 2.0
    };

    const basePieces = {
      common: 5,
      rare: 10,
      epic: 20,
      legendary: 50
    };

    const config: BlueprintDropConfig = {
      source: 'achievement_rewards',
      basePieces: basePieces[achievementRarity],
      rarityModifier: rarityMultipliers[achievementRarity] * typeMultipliers[achievementType],
      playerLevelModifier: Math.min(1 + (playerLevel - 1) * 0.05, 1.5),
      seasonProgressModifier: 1.0,
      allowDuplicates: true,
      cooldownMinutes: 0
    };

    return await blueprintService.awardBlueprintPieces(userId, config);
  },

  /**
   * Get blueprint drop chance for a given source and player state
   */
  async getDropChance(
    userId: string,
    source: BlueprintSource,
    baseChance: number = 0.3 // 30% base chance
  ): Promise<{ canDrop: boolean; dropChance: number; reason?: string }> {
    try {
      const [playerState, globalStats, season] = await Promise.all([
        blueprintService.getPlayerBlueprintState(userId),
        blueprintService.getGlobalStats(),
        blueprintService.getCurrentSeason()
      ]);

      if (!globalStats || !season) {
        return { canDrop: false, dropChance: 0, reason: 'Season not active' };
      }

      // Check global supply
      if (globalStats.remainingPieces <= 0) {
        return { canDrop: false, dropChance: 0, reason: 'Global supply exhausted' };
      }

      // Check daily cap
      if (season.dailyPlayerCapEnabled && 
          playerState.dailyPiecesEarned >= season.dailyPlayerCapAmount) {
        return { canDrop: false, dropChance: 0, reason: 'Daily cap reached' };
      }

      // Adjust drop chance based on supply remaining
      const supplyRatio = globalStats.remainingPieces / season.maxBlueprintPieces;
      let adjustedChance = baseChance;

      // Reduce chance as supply dwindles
      if (supplyRatio < 0.1) {
        adjustedChance *= 0.3; // 70% reduction when less than 10% supply
      } else if (supplyRatio < 0.25) {
        adjustedChance *= 0.5; // 50% reduction when less than 25% supply
      } else if (supplyRatio < 0.5) {
        adjustedChance *= 0.7; // 30% reduction when less than 50% supply
      }

      // Adjust based on player's daily progress
      const dailyProgress = playerState.dailyPiecesEarned / season.dailyPlayerCapAmount;
      if (dailyProgress > 0.8) {
        adjustedChance *= 0.5; // Reduce chance as player approaches daily cap
      }

      return { 
        canDrop: true, 
        dropChance: Math.min(adjustedChance, 1.0),
        reason: `${Math.round(adjustedChance * 100)}% chance to drop` 
      };
    } catch (error) {
      console.error('Failed to calculate drop chance:', error);
      return { canDrop: false, dropChance: 0, reason: 'Error calculating drop chance' };
    }
  },

  /**
   * Check if a blueprint drop should occur based on RNG and drop chance
   */
  async shouldDropBlueprint(
    userId: string,
    source: BlueprintSource,
    baseChance: number = 0.3
  ): Promise<boolean> {
    const { canDrop, dropChance } = await this.getDropChance(userId, source, baseChance);
    
    if (!canDrop) return false;
    
    return Math.random() < dropChance;
  }
};

export default BlueprintIntegration;