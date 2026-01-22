// ============================================================================
// Arena V2 Reward Calculator
// Calculate and distribute battle rewards
// ============================================================================

import type {
  BattleState,
  ArenaFighter,
  BattleRewards,
  WinType,
} from '@/types/arena';

import type {
  RewardCalculationContext,
  RewardBreakdown,
} from '@/types/arena-rewards';

// ============================================================================
// Reward Calculator
// ============================================================================

export class RewardCalculator {
  
  /**
   * Calculate detailed reward breakdown for a completed battle
   */
  static calculateRewards(
    battle: BattleState,
    winnerId: string,
    winType: WinType,
    playerLevel: number = 1,
    playerRank: number = 1,
    syncLevel: number = 1
  ): RewardBreakdown {
    const winner = winnerId === battle.player.holobotId ? battle.player : battle.opponent;
    const isPlayerWin = winnerId === battle.player.holobotId;
    
    // Base rewards depend on battle type
    const baseRewards = this.getBaseRewards(battle.battleType);
    
    // Calculate performance bonuses
    const performanceBonus = this.calculatePerformanceBonus(winner, battle);
    const speedBonus = this.calculateSpeedBonus(battle.turnNumber);
    const perfectDefenseBonus = winner.perfectDefenses * 20;
    const comboBonus = winner.combosCompleted * 30;
    
    // First win bonus (TODO: check if first win of day)
    const firstWinBonus = 0; // Would need to check database
    
    // Win streak bonus (TODO: get from user profile)
    const winStreakBonus = 0; // Would need to check database
    
    // Calculate totals
    const totalExp = Math.floor(
      baseRewards.exp +
      performanceBonus +
      speedBonus +
      perfectDefenseBonus +
      comboBonus +
      firstWinBonus +
      winStreakBonus
    );
    
    const totalSyncPoints = Math.floor(
      baseRewards.syncPoints * (1 + syncLevel / 100)
    );
    
    const totalArenaTokens = baseRewards.arenaTokens;
    
    // Only winner gets HOLOS (if PvP/Ranked)
    const totalHolos = isPlayerWin && (battle.battleType === 'pvp' || battle.battleType === 'ranked')
      ? this.calculateHolosReward(battle.battleType, winType)
      : undefined;
    
    // ELO change (ranked only)
    const eloChange = battle.battleType === 'ranked' && isPlayerWin
      ? this.calculateEloChange(playerRank, 1200, true) // opponent rank would come from matchmaking
      : undefined;
    
    return {
      baseExp: baseRewards.exp,
      baseSyncPoints: baseRewards.syncPoints,
      baseArenaTokens: baseRewards.arenaTokens,
      
      performanceBonus,
      speedBonus,
      perfectDefenseBonus,
      comboBonus,
      winStreakBonus,
      firstWinBonus,
      
      totalExp,
      totalSyncPoints,
      totalArenaTokens,
      totalHolos,
      
      eloChange,
    };
  }
  
  /**
   * Get base rewards by battle type
   */
  private static getBaseRewards(battleType: string): BattleRewards {
    switch (battleType) {
      case 'ranked':
        return {
          exp: 200,
          syncPoints: 100,
          arenaTokens: 25,
        };
      
      case 'pvp':
        return {
          exp: 150,
          syncPoints: 75,
          arenaTokens: 20,
        };
      
      case 'pve':
        return {
          exp: 100,
          syncPoints: 50,
          arenaTokens: 15,
        };
      
      case 'training':
        return {
          exp: 50,
          syncPoints: 25,
          arenaTokens: 5,
        };
      
      default:
        return {
          exp: 100,
          syncPoints: 50,
          arenaTokens: 10,
        };
    }
  }
  
  /**
   * Calculate performance bonus based on battle stats
   */
  private static calculatePerformanceBonus(fighter: ArenaFighter, battle: BattleState): number {
    let bonus = 0;
    
    // Damage dealt bonus
    const damagePercent = fighter.totalDamageDealt / 500; // Normalized to expected damage
    bonus += Math.floor(damagePercent * 50);
    
    // Perfect defenses
    bonus += fighter.perfectDefenses * 15;
    
    // Combos
    bonus += fighter.combosCompleted * 20;
    
    // HP remaining bonus (finished with high HP)
    const hpPercent = fighter.currentHP / fighter.maxHP;
    if (hpPercent > 0.8) bonus += 30;
    else if (hpPercent > 0.5) bonus += 15;
    
    // Efficiency bonus (low turns, high damage)
    if (battle.turnNumber < 20 && fighter.totalDamageDealt > 100) {
      bonus += 25;
    }
    
    return Math.min(150, bonus); // Cap at 150
  }
  
  /**
   * Calculate speed bonus for fast victories
   */
  private static calculateSpeedBonus(turns: number): number {
    if (turns <= 5) return 100;
    if (turns <= 10) return 75;
    if (turns <= 15) return 50;
    if (turns <= 20) return 25;
    return 0;
  }
  
  /**
   * Calculate HOLOS token reward
   */
  private static calculateHolosReward(battleType: string, winType: WinType): number {
    let baseHolos = 0;
    
    switch (battleType) {
      case 'ranked':
        baseHolos = 50;
        break;
      case 'pvp':
        baseHolos = 25;
        break;
      default:
        baseHolos = 10;
    }
    
    // Finisher bonus
    if (winType === 'finisher') {
      baseHolos *= 1.5;
    }
    
    return Math.floor(baseHolos);
  }
  
  /**
   * Calculate ELO rating change
   * Simplified K-factor formula
   */
  private static calculateEloChange(
    playerElo: number,
    opponentElo: number,
    playerWon: boolean
  ): number {
    const K = 32; // K-factor
    
    // Expected score (probability of winning)
    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    
    // Actual score
    const actualScore = playerWon ? 1 : 0;
    
    // ELO change
    const change = Math.round(K * (actualScore - expectedScore));
    
    return change;
  }
  
  /**
   * Apply rewards to user profile (to be implemented with Supabase)
   */
  static async distributeRewards(
    userId: string,
    rewards: RewardBreakdown
  ): Promise<boolean> {
    try {
      // TODO: Implement Supabase integration
      // 1. Update user EXP
      // 2. Update Sync Points
      // 3. Add Arena Tokens to inventory
      // 4. Add HOLOS to wallet (if applicable)
      // 5. Update ELO rating (if ranked)
      // 6. Log reward transaction
      
      console.log('Distributing rewards to user:', userId, rewards);
      
      return true;
    } catch (error) {
      console.error('Failed to distribute rewards:', error);
      return false;
    }
  }
  
  /**
   * Calculate rank progress from EXP
   */
  static calculateRankProgress(currentExp: number, currentRank: number): {
    currentRank: number;
    expToNextRank: number;
    expInCurrentRank: number;
    progressPercent: number;
  } {
    // Exponential EXP curve
    const expForRank = (rank: number) => Math.floor(100 * Math.pow(1.5, rank - 1));
    
    // Find current rank based on total EXP
    let rank = 1;
    let totalExpForRank = 0;
    
    while (totalExpForRank + expForRank(rank + 1) <= currentExp) {
      totalExpForRank += expForRank(rank);
      rank++;
    }
    
    const expInCurrentRank = currentExp - totalExpForRank;
    const expToNextRank = expForRank(rank + 1);
    const progressPercent = (expInCurrentRank / expToNextRank) * 100;
    
    return {
      currentRank: rank,
      expToNextRank,
      expInCurrentRank,
      progressPercent,
    };
  }
  
  /**
   * Determine rank tier based on ELO
   */
  static getRankTier(eloRating: number): {
    tier: string;
    minElo: number;
    maxElo: number;
  } {
    if (eloRating >= 2000) return { tier: 'master', minElo: 2000, maxElo: 9999 };
    if (eloRating >= 1800) return { tier: 'diamond', minElo: 1800, maxElo: 1999 };
    if (eloRating >= 1600) return { tier: 'platinum', minElo: 1600, maxElo: 1799 };
    if (eloRating >= 1400) return { tier: 'gold', minElo: 1400, maxElo: 1599 };
    if (eloRating >= 1200) return { tier: 'silver', minElo: 1200, maxElo: 1399 };
    return { tier: 'bronze', minElo: 0, maxElo: 1199 };
  }
}
