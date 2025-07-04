import { supabase } from '../integrations/supabase/client';
import { 
  BlueprintDropResult, 
  BlueprintDropConfig, 
  GlobalBlueprintStats, 
  PlayerBlueprintState, 
  SeasonConfig, 
  BlueprintSource,
  DEFAULT_SEASON_1_CONFIG,
  DEFAULT_ANTI_WHALE_CONFIG,
  DEFAULT_MINT_CATALYST_CONFIG,
  calculateRarityModifier,
  calculateSeasonProgress,
  isSeasonActive,
  calculateDailyReset
} from '../types/blueprints';
import { HOLOBOT_STATS } from '../types/holobot';

export class BlueprintService {
  private static instance: BlueprintService;
  private globalStats: GlobalBlueprintStats | null = null;
  private currentSeason: SeasonConfig | null = null;
  private lastStatsUpdate: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  private constructor() {}

  static getInstance(): BlueprintService {
    if (!BlueprintService.instance) {
      BlueprintService.instance = new BlueprintService();
    }
    return BlueprintService.instance;
  }

  /**
   * Initialize the blueprint service and load current season data
   */
  async initialize(): Promise<void> {
    try {
      await this.loadCurrentSeason();
      await this.loadGlobalStats();
    } catch (error) {
      console.error('Failed to initialize blueprint service:', error);
      throw error;
    }
  }

  /**
   * Load the current active season
   */
  private async loadCurrentSeason(): Promise<void> {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Failed to load current season:', error);
      // Fallback to default season if none exists
      this.currentSeason = DEFAULT_SEASON_1_CONFIG;
      return;
    }

    this.currentSeason = {
      id: data.id,
      name: data.name,
      startDate: data.start_date,
      endDate: data.end_date,
      maxBlueprintPieces: data.max_blueprint_pieces,
      isActive: data.is_active,
      distributionLimits: data.distribution_limits,
      holobotWeights: data.holobot_weights,
      dailyPlayerCapEnabled: data.daily_player_cap_enabled,
      dailyPlayerCapAmount: data.daily_player_cap_amount,
      legacyConversionRate: data.legacy_conversion_rate
    };
  }

  /**
   * Load global blueprint statistics
   */
  private async loadGlobalStats(): Promise<void> {
    if (!this.currentSeason) {
      throw new Error('No active season loaded');
    }

    const now = Date.now();
    if (this.globalStats && (now - this.lastStatsUpdate) < this.CACHE_DURATION) {
      return; // Use cached data
    }

    const { data, error } = await supabase
      .from('global_blueprint_stats')
      .select('*')
      .eq('season_id', this.currentSeason.id)
      .single();

    if (error) {
      console.error('Failed to load global stats:', error);
      throw error;
    }

    this.globalStats = {
      seasonId: data.season_id,
      totalPiecesDropped: data.total_pieces_dropped,
      totalPiecesUsed: data.total_pieces_used,
      remainingPieces: data.remaining_pieces,
      holobotDistribution: data.holobot_distribution,
      sourceDistribution: data.source_distribution,
      totalMintsCompleted: data.total_mints_completed,
      lastUpdated: data.last_updated
    };

    this.lastStatsUpdate = now;
  }

  /**
   * Get or create player blueprint state for current season
   */
  private async getPlayerState(userId: string): Promise<PlayerBlueprintState> {
    if (!this.currentSeason) {
      throw new Error('No active season loaded');
    }

    const { data, error } = await supabase
      .from('player_blueprint_states')
      .select('*')
      .eq('user_id', userId)
      .eq('season_id', this.currentSeason.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create new player state if it doesn't exist
      const newState: PlayerBlueprintState = {
        userId,
        seasonId: this.currentSeason.id,
        blueprintPieces: {},
        totalPiecesEarned: 0,
        totalPiecesUsed: 0,
        dailyPiecesEarned: 0,
        lastDailyReset: calculateDailyReset(),
        mintCatalysts: 0,
        legacyChips: 0,
        lastBlueprintEarned: new Date().toISOString(),
        sourceBreakdown: {
          quest_rewards: 0,
          sync_training: 0,
          arena_battles: 0,
          league_rewards: 0,
          booster_packs: 0,
          seasonal_events: 0,
          daily_missions: 0,
          achievement_rewards: 0
        }
      };

      const { data: insertData, error: insertError } = await supabase
        .from('player_blueprint_states')
        .insert({
          user_id: userId,
          season_id: this.currentSeason.id,
          blueprint_pieces: newState.blueprintPieces,
          total_pieces_earned: newState.totalPiecesEarned,
          total_pieces_used: newState.totalPiecesUsed,
          daily_pieces_earned: newState.dailyPiecesEarned,
          last_daily_reset: newState.lastDailyReset,
          mint_catalysts: newState.mintCatalysts,
          legacy_chips: newState.legacyChips,
          last_blueprint_earned: newState.lastBlueprintEarned,
          source_breakdown: newState.sourceBreakdown
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return newState;
    }

    if (error) {
      throw error;
    }

    return {
      userId: data.user_id,
      seasonId: data.season_id,
      blueprintPieces: data.blueprint_pieces,
      totalPiecesEarned: data.total_pieces_earned,
      totalPiecesUsed: data.total_pieces_used,
      dailyPiecesEarned: data.daily_pieces_earned,
      lastDailyReset: data.last_daily_reset,
      mintCatalysts: data.mint_catalysts,
      legacyChips: data.legacy_chips,
      lastBlueprintEarned: data.last_blueprint_earned,
      sourceBreakdown: data.source_breakdown
    };
  }

  /**
   * Check if daily reset is needed for a player
   */
  private shouldResetDaily(lastReset: string): boolean {
    const now = new Date();
    const lastResetDate = new Date(lastReset);
    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);
    
    return lastResetDate < todayMidnight;
  }

  /**
   * Reset daily counters for a player
   */
  private async resetDailyCounters(userId: string): Promise<void> {
    if (!this.currentSeason) return;

    await supabase
      .from('player_blueprint_states')
      .update({
        daily_pieces_earned: 0,
        last_daily_reset: calculateDailyReset()
      })
      .eq('user_id', userId)
      .eq('season_id', this.currentSeason.id);
  }

  /**
   * Select random holobot type based on current distribution and weights
   */
  private selectRandomHolobotType(): string {
    if (!this.currentSeason || !this.globalStats) {
      // Fallback to purely random selection
      const holobotTypes = Object.keys(HOLOBOT_STATS);
      return holobotTypes[Math.floor(Math.random() * holobotTypes.length)];
    }

    const holobotTypes = Object.keys(HOLOBOT_STATS);
    const weights: number[] = [];

    // Calculate adjusted weights based on current distribution
    for (const holobotType of holobotTypes) {
      const baseWeight = this.currentSeason.holobotWeights[holobotType] || 1.0;
      const rarityModifier = calculateRarityModifier(holobotType, this.globalStats, this.currentSeason);
      weights.push(baseWeight * rarityModifier);
    }

    // Weighted random selection
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < holobotTypes.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return holobotTypes[i];
      }
    }

    // Fallback to last type
    return holobotTypes[holobotTypes.length - 1];
  }

  /**
   * Check if blueprint drop is allowed based on global and player limits
   */
  private async canDropBlueprint(
    userId: string,
    config: BlueprintDropConfig,
    playerState: PlayerBlueprintState
  ): Promise<{ canDrop: boolean; reason?: string }> {
    if (!this.currentSeason || !this.globalStats) {
      return { canDrop: false, reason: 'Season not loaded' };
    }

    // Check if season is active
    if (!isSeasonActive(this.currentSeason)) {
      return { canDrop: false, reason: 'Season not active' };
    }

    // Check global supply
    if (this.globalStats.remainingPieces <= 0) {
      return { canDrop: false, reason: 'Global supply exhausted' };
    }

    // Check source-specific limits
    const sourceUsed = this.globalStats.sourceDistribution[config.source] || 0;
    const sourceLimit = this.currentSeason.distributionLimits[config.source] || 0;
    if (sourceUsed >= sourceLimit) {
      return { canDrop: false, reason: 'Source limit reached' };
    }

    // Check daily player cap
    if (this.currentSeason.dailyPlayerCapEnabled) {
      if (playerState.dailyPiecesEarned >= this.currentSeason.dailyPlayerCapAmount) {
        return { canDrop: false, reason: 'Daily player cap reached' };
      }
    }

    // Check anti-whale settings
    if (DEFAULT_ANTI_WHALE_CONFIG.enabled) {
      if (playerState.dailyPiecesEarned >= DEFAULT_ANTI_WHALE_CONFIG.dailyCapPerPlayer) {
        return { canDrop: false, reason: 'Anti-whale daily cap reached' };
      }

      // Check cooldown between drops
      const lastDropTime = new Date(playerState.lastBlueprintEarned).getTime();
      const now = Date.now();
      const cooldownMs = DEFAULT_ANTI_WHALE_CONFIG.cooldownBetweenDrops * 60 * 1000;
      if (now - lastDropTime < cooldownMs) {
        return { canDrop: false, reason: 'Drop cooldown active' };
      }
    }

    return { canDrop: true };
  }

  /**
   * Award blueprint pieces to a player
   */
  async awardBlueprintPieces(
    userId: string,
    config: BlueprintDropConfig
  ): Promise<BlueprintDropResult> {
    try {
      await this.initialize();

      if (!this.currentSeason || !this.globalStats) {
        throw new Error('Blueprint service not properly initialized');
      }

      const playerState = await this.getPlayerState(userId);

      // Check if daily reset is needed
      if (this.shouldResetDaily(playerState.lastDailyReset)) {
        await this.resetDailyCounters(userId);
        playerState.dailyPiecesEarned = 0;
        playerState.lastDailyReset = calculateDailyReset();
      }

      // Check if drop is allowed
      const canDropResult = await this.canDropBlueprint(userId, config, playerState);
      if (!canDropResult.canDrop) {
        return {
          success: false,
          piecesAwarded: 0,
          holobotType: '',
          source: config.source,
          remainingGlobalSupply: this.globalStats.remainingPieces,
          playerDailyRemaining: this.currentSeason.dailyPlayerCapAmount - playerState.dailyPiecesEarned,
          rarityBonus: false,
          message: canDropResult.reason || 'Drop not allowed'
        };
      }

      // Calculate pieces to award
      const seasonProgress = calculateSeasonProgress(this.currentSeason);
      let piecesToAward = Math.floor(
        config.basePieces * 
        config.rarityModifier * 
        config.playerLevelModifier * 
        (1 + seasonProgress * (config.seasonProgressModifier - 1))
      );

      // Apply diminishing returns if over threshold
      if (DEFAULT_ANTI_WHALE_CONFIG.enabled && 
          playerState.dailyPiecesEarned >= DEFAULT_ANTI_WHALE_CONFIG.diminishingReturns.threshold) {
        piecesToAward = Math.floor(piecesToAward * DEFAULT_ANTI_WHALE_CONFIG.diminishingReturns.reductionFactor);
      }

      // Ensure we don't exceed global supply
      piecesToAward = Math.min(piecesToAward, this.globalStats.remainingPieces);

      // Select holobot type
      const holobotType = config.guaranteedHolobotType || this.selectRandomHolobotType();

      // Check for rarity bonus (10% chance for double pieces)
      const rarityBonus = Math.random() < 0.1;
      if (rarityBonus) {
        piecesToAward *= 2;
      }

      // Update player state
      const updatedPieces = { ...playerState.blueprintPieces };
      updatedPieces[holobotType] = (updatedPieces[holobotType] || 0) + piecesToAward;

      const updatedSourceBreakdown = { ...playerState.sourceBreakdown };
      updatedSourceBreakdown[config.source] = (updatedSourceBreakdown[config.source] || 0) + piecesToAward;

      await supabase
        .from('player_blueprint_states')
        .update({
          blueprint_pieces: updatedPieces,
          total_pieces_earned: playerState.totalPiecesEarned + piecesToAward,
          daily_pieces_earned: playerState.dailyPiecesEarned + piecesToAward,
          last_blueprint_earned: new Date().toISOString(),
          source_breakdown: updatedSourceBreakdown
        })
        .eq('user_id', userId)
        .eq('season_id', this.currentSeason.id);

      // Record drop history
      await supabase
        .from('blueprint_drop_history')
        .insert({
          user_id: userId,
          season_id: this.currentSeason.id,
          holobot_type: holobotType,
          pieces_awarded: piecesToAward,
          source: config.source,
          rarity_bonus: rarityBonus,
          global_supply_remaining: this.globalStats.remainingPieces - piecesToAward,
          player_daily_remaining: this.currentSeason.dailyPlayerCapAmount - (playerState.dailyPiecesEarned + piecesToAward),
          metadata: {
            config,
            season_progress: seasonProgress,
            player_level: 1 // TODO: Get actual player level
          }
        });

      // Invalidate cache to force reload on next request
      this.globalStats = null;
      this.lastStatsUpdate = 0;

             return {
         success: true,
         piecesAwarded: piecesToAward,
         holobotType,
         source: config.source,
         remainingGlobalSupply: this.globalStats.remainingPieces - piecesToAward,
         playerDailyRemaining: this.currentSeason.dailyPlayerCapAmount - (playerState.dailyPiecesEarned + piecesToAward),
         rarityBonus,
         message: `Awarded ${piecesToAward} ${holobotType} blueprint pieces!${rarityBonus ? ' (Rarity Bonus!)' : ''}`
       };

    } catch (error) {
      console.error('Failed to award blueprint pieces:', error);
      return {
        success: false,
        piecesAwarded: 0,
        holobotType: '',
        source: config.source,
        remainingGlobalSupply: 0,
        playerDailyRemaining: 0,
        rarityBonus: false,
        message: 'Failed to award blueprint pieces'
      };
    }
  }

  /**
   * Get global blueprint statistics
   */
  async getGlobalStats(): Promise<GlobalBlueprintStats | null> {
    await this.loadGlobalStats();
    return this.globalStats;
  }

  /**
   * Get player blueprint state
   */
  async getPlayerBlueprintState(userId: string): Promise<PlayerBlueprintState> {
    await this.initialize();
    return this.getPlayerState(userId);
  }

  /**
   * Get current season configuration
   */
  async getCurrentSeason(): Promise<SeasonConfig | null> {
    await this.loadCurrentSeason();
    return this.currentSeason;
  }

  /**
   * Check if player can mint a holobot
   */
  async canMintHolobot(userId: string, holobotType: string, mintType: 'common' | 'legendary'): Promise<{
    canMint: boolean;
    reason?: string;
    piecesRequired: number;
    piecesAvailable: number;
    catalystRequired: boolean;
    catalystAvailable: number;
  }> {
    const playerState = await this.getPlayerState(userId);
    const piecesRequired = mintType === 'common' ? 10 : 100;
    const piecesAvailable = playerState.blueprintPieces[holobotType] || 0;
    const catalystRequired = mintType === 'legendary';
    const catalystAvailable = playerState.mintCatalysts;

    if (piecesAvailable < piecesRequired) {
      return {
        canMint: false,
        reason: `Need ${piecesRequired} ${holobotType} pieces, have ${piecesAvailable}`,
        piecesRequired,
        piecesAvailable,
        catalystRequired,
        catalystAvailable
      };
    }

    if (catalystRequired && catalystAvailable < 1) {
      return {
        canMint: false,
        reason: 'Need 1 mint catalyst for legendary holobot',
        piecesRequired,
        piecesAvailable,
        catalystRequired,
        catalystAvailable
      };
    }

    return {
      canMint: true,
      piecesRequired,
      piecesAvailable,
      catalystRequired,
      catalystAvailable
    };
  }

  /**
   * Mint a holobot using blueprint pieces
   */
  async mintHolobot(userId: string, holobotType: string, mintType: 'common' | 'legendary'): Promise<{
    success: boolean;
    message: string;
    holobotData?: any;
  }> {
    const canMintResult = await this.canMintHolobot(userId, holobotType, mintType);
    
    if (!canMintResult.canMint) {
      return {
        success: false,
        message: canMintResult.reason || 'Cannot mint holobot'
      };
    }

    try {
      const playerState = await this.getPlayerState(userId);
      const piecesRequired = mintType === 'common' ? 10 : 100;

      // Update player state
      const updatedPieces = { ...playerState.blueprintPieces };
      updatedPieces[holobotType] = (updatedPieces[holobotType] || 0) - piecesRequired;

      let catalystUpdate = {};
      if (mintType === 'legendary') {
        catalystUpdate = { mint_catalysts: playerState.mintCatalysts - 1 };
      }

      await supabase
        .from('player_blueprint_states')
        .update({
          blueprint_pieces: updatedPieces,
          total_pieces_used: playerState.totalPiecesUsed + piecesRequired,
          ...catalystUpdate
        })
        .eq('user_id', userId)
        .eq('season_id', this.currentSeason!.id);

      // Record the mint
      const holobotData = {
        type: holobotType,
        mintType,
        mintedAt: new Date().toISOString(),
        level: 1,
        experience: 0,
        stats: HOLOBOT_STATS[holobotType]
      };

      await supabase
        .from('blueprint_mints')
        .insert({
          user_id: userId,
          season_id: this.currentSeason!.id,
          holobot_type: holobotType,
          pieces_used: piecesRequired,
          catalyst_used: mintType === 'legendary',
          mint_type: mintType,
          holobot_data: holobotData
        });

      return {
        success: true,
        message: `Successfully minted ${mintType} ${holobotType} holobot!`,
        holobotData
      };

    } catch (error) {
      console.error('Failed to mint holobot:', error);
      return {
        success: false,
        message: 'Failed to mint holobot'
      };
    }
  }
}

// Export singleton instance
export const blueprintService = BlueprintService.getInstance();