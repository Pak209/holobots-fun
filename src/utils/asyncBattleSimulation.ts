import { 
  BattleHolobot, 
  BattleLogEntry, 
  BattleSimulationResult, 
  FitnessBonus,
  FITNESS_BONUS_THRESHOLDS 
} from '@/types/asyncBattle';
import { HOLOBOT_STATS } from '@/types/holobot';

export class AsyncBattleSimulator {
  private battleLog: BattleLogEntry[] = [];
  private round = 0;

  /**
   * Simulate a battle between two Holobots
   */
  async simulateBattle(
    player1: BattleHolobot, 
    player2: BattleHolobot,
    player1Steps: number = 0,
    player2Steps: number = 0
  ): Promise<BattleSimulationResult> {
    // Reset battle state
    this.battleLog = [];
    this.round = 0;

    // Apply fitness bonuses
    const enhancedPlayer1 = this.applyFitnessBonuses(player1, player1Steps);
    const enhancedPlayer2 = this.applyFitnessBonuses(player2, player2Steps);

    // Initialize battle
    enhancedPlayer1.health = enhancedPlayer1.maxHealth;
    enhancedPlayer2.health = enhancedPlayer2.maxHealth;

    this.addBattleLog(
      0, 
      'system', 
      'system', 
      'battle_start',
      0,
      'Battle begins!',
      enhancedPlayer1.health,
      enhancedPlayer2.health
    );

    let maxRounds = 50; // Prevent infinite battles
    
    // Battle loop
    while (enhancedPlayer1.health > 0 && enhancedPlayer2.health > 0 && this.round < maxRounds) {
      this.round++;
      
      // Determine turn order based on speed
      const player1First = enhancedPlayer1.speed >= enhancedPlayer2.speed;
      
      if (player1First) {
        if (enhancedPlayer1.health > 0) {
          await this.executeTurn(enhancedPlayer1, enhancedPlayer2);
        }
        if (enhancedPlayer2.health > 0) {
          await this.executeTurn(enhancedPlayer2, enhancedPlayer1);
        }
      } else {
        if (enhancedPlayer2.health > 0) {
          await this.executeTurn(enhancedPlayer2, enhancedPlayer1);
        }
        if (enhancedPlayer1.health > 0) {
          await this.executeTurn(enhancedPlayer1, enhancedPlayer2);
        }
      }
    }

    // Determine winner
    const winner = enhancedPlayer1.health > 0 ? enhancedPlayer1 : enhancedPlayer2;
    const winnerId = winner.owner_id || (winner === enhancedPlayer1 ? 'player1' : 'player2');
    
    this.addBattleLog(
      this.round,
      'system',
      'system',
      'battle_end',
      0,
      `${winner.name} wins the battle!`,
      enhancedPlayer1.health,
      enhancedPlayer2.health
    );

    return {
      winner_id: winnerId,
      winner_name: winner.name,
      battle_log: this.battleLog,
      final_stats: {
        player1_hp: enhancedPlayer1.health,
        player2_hp: enhancedPlayer2.health
      },
      battle_duration: this.round,
      rewards: this.calculateRewards(winner, enhancedPlayer1, enhancedPlayer2)
    };
  }

  /**
   * Execute a single turn for a Holobot
   */
  private async executeTurn(attacker: BattleHolobot, defender: BattleHolobot): Promise<void> {
    // Calculate evasion chance
    const evasionChance = this.calculateEvasionChance(attacker, defender);
    const evaded = Math.random() < evasionChance;

    if (evaded) {
      this.addBattleLog(
        this.round,
        attacker.name,
        defender.name,
        'evade',
        0,
        `${defender.name} evades ${attacker.name}'s attack!`,
        attacker.name === 'player1' ? attacker.health : defender.health,
        attacker.name === 'player1' ? defender.health : attacker.health
      );
      return;
    }

    // Check for special attack (20% chance if conditions are met)
    const useSpecial = Math.random() < 0.2 && this.round > 2;
    
    if (useSpecial) {
      await this.executeSpecialAttack(attacker, defender);
    } else {
      await this.executeNormalAttack(attacker, defender);
    }

    // Check for counter-attack (15% chance)
    const counterChance = this.calculateCounterChance(attacker, defender);
    if (Math.random() < counterChance && defender.health > 0) {
      await this.executeCounterAttack(defender, attacker);
    }
  }

  /**
   * Execute normal attack
   */
  private async executeNormalAttack(attacker: BattleHolobot, defender: BattleHolobot): Promise<void> {
    const damage = this.calculateDamage(attacker, defender);
    defender.health = Math.max(0, defender.health - damage);

    this.addBattleLog(
      this.round,
      attacker.name,
      defender.name,
      'attack',
      damage,
      `${attacker.name} attacks ${defender.name} for ${damage} damage!`,
      attacker.name === 'player1' ? attacker.health : defender.health,
      attacker.name === 'player1' ? defender.health : attacker.health
    );
  }

  /**
   * Execute special attack
   */
  private async executeSpecialAttack(attacker: BattleHolobot, defender: BattleHolobot): Promise<void> {
    const specialDamage = this.calculateDamage(attacker, defender) * 1.5;
    defender.health = Math.max(0, defender.health - specialDamage);

    this.addBattleLog(
      this.round,
      attacker.name,
      defender.name,
      'special',
      specialDamage,
      `${attacker.name} uses ${attacker.specialMove} on ${defender.name} for ${specialDamage} damage!`,
      attacker.name === 'player1' ? attacker.health : defender.health,
      attacker.name === 'player1' ? defender.health : attacker.health
    );
  }

  /**
   * Execute counter-attack
   */
  private async executeCounterAttack(attacker: BattleHolobot, defender: BattleHolobot): Promise<void> {
    const counterDamage = this.calculateDamage(attacker, defender) * 0.7;
    defender.health = Math.max(0, defender.health - counterDamage);

    this.addBattleLog(
      this.round,
      attacker.name,
      defender.name,
      'counter',
      counterDamage,
      `${attacker.name} counter-attacks ${defender.name} for ${counterDamage} damage!`,
      attacker.name === 'player1' ? attacker.health : defender.health,
      attacker.name === 'player1' ? defender.health : attacker.health
    );
  }

  /**
   * Calculate damage between two Holobots
   */
  private calculateDamage(attacker: BattleHolobot, defender: BattleHolobot): number {
    const baseAttack = attacker.attack + (attacker.boosted_attributes?.attack || 0);
    const baseDefense = defender.defense + (defender.boosted_attributes?.defense || 0);
    
    // Apply fitness bonuses
    const attackBonus = attacker.fitness_bonuses?.attack_bonus || 0;
    const allStatsBonus = attacker.fitness_bonuses?.all_stats_bonus || 0;
    
    const finalAttack = baseAttack + attackBonus + allStatsBonus;
    const defenseReduction = baseDefense * 0.3;
    
    const damage = Math.max(1, finalAttack - defenseReduction);
    const levelMultiplier = 1 + (attacker.level * 0.05);
    
    return Math.floor(damage * levelMultiplier);
  }

  /**
   * Calculate evasion chance
   */
  private calculateEvasionChance(attacker: BattleHolobot, defender: BattleHolobot): number {
    const speedDiff = defender.speed - attacker.speed;
    const baseEvasion = 0.05;
    const speedBonus = Math.max(0, speedDiff * 0.01);
    return Math.min(0.3, baseEvasion + speedBonus);
  }

  /**
   * Calculate counter-attack chance
   */
  private calculateCounterChance(attacker: BattleHolobot, defender: BattleHolobot): number {
    const defenseBonus = defender.defense * 0.02;
    const intelligenceBonus = defender.intelligence * 0.01;
    return Math.min(0.25, defenseBonus + intelligenceBonus);
  }

  /**
   * Apply fitness bonuses to a Holobot
   */
  private applyFitnessBonuses(holobot: BattleHolobot, steps: number): BattleHolobot {
    // Create a deep copy to avoid mutating the original object
    const enhanced: BattleHolobot = {
      ...holobot,
      // Deep copy nested objects
      fitness_bonuses: { ...holobot.fitness_bonuses },
      boosted_attributes: { ...holobot.boosted_attributes },
      equipped_parts: holobot.equipped_parts ? { ...holobot.equipped_parts } : undefined
    };
    
    const bonuses: FitnessBonus = {};

    // Calculate fitness bonuses based on steps
    if (steps >= FITNESS_BONUS_THRESHOLDS.HP_BONUS) {
      bonuses.hp_bonus = Math.floor(enhanced.maxHealth * 0.05);
      enhanced.maxHealth += bonuses.hp_bonus;
    }

    if (steps >= FITNESS_BONUS_THRESHOLDS.ATTACK_BONUS) {
      bonuses.attack_bonus = Math.floor(enhanced.attack * 0.03);
      enhanced.attack += bonuses.attack_bonus;
    }

    if (steps >= FITNESS_BONUS_THRESHOLDS.SPECIAL_BONUS) {
      bonuses.special_charge_bonus = 10;
    }

    if (steps >= FITNESS_BONUS_THRESHOLDS.ALL_STATS) {
      bonuses.all_stats_bonus = Math.floor(enhanced.attack * 0.05);
      enhanced.attack += bonuses.all_stats_bonus;
      enhanced.defense += bonuses.all_stats_bonus;
      enhanced.speed += bonuses.all_stats_bonus;
    }

    enhanced.fitness_bonuses = bonuses;
    return enhanced;
  }

  /**
   * Add entry to battle log
   */
  private addBattleLog(
    round: number,
    attacker: string,
    defender: string,
    action: BattleLogEntry['action'],
    damage: number,
    message: string,
    player1Hp: number,
    player2Hp: number
  ): void {
    this.battleLog.push({
      round,
      attacker,
      defender,
      action,
      damage,
      hp_remaining: {
        player1: Math.max(0, player1Hp),
        player2: Math.max(0, player2Hp)
      },
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Calculate battle rewards
   */
  private calculateRewards(
    winner: BattleHolobot, 
    player1: BattleHolobot, 
    player2: BattleHolobot
  ): { winner_rewards: any; loser_rewards: any } {
    const isPlayer1Winner = winner === player1;
    
    const winnerRewards = {
      holos: 100,
      exp: 200,
      rating_change: 25
    };

    const loserRewards = {
      holos: 25,
      exp: 50,
      rating_change: -10
    };

    return {
      winner_rewards: winnerRewards,
      loser_rewards: loserRewards
    };
  }
}

/**
 * Generate a CPU opponent for PvE battles
 */
export function generateCPUOpponent(
  cpuLevel: number, 
  playerLevel: number = 1
): BattleHolobot {
  const holobotKeys = Object.keys(HOLOBOT_STATS);
  const randomKey = holobotKeys[Math.floor(Math.random() * holobotKeys.length)];
  const baseStats = HOLOBOT_STATS[randomKey];

  // Scale stats based on CPU level and player level
  const scalingFactor = 1 + (cpuLevel * 0.1);
  const playerAdjustment = Math.max(0.8, 1 + (playerLevel - cpuLevel) * 0.05);

  return {
    name: `CPU ${baseStats.name}`,
    level: cpuLevel,
    attack: Math.floor(baseStats.attack * scalingFactor * playerAdjustment),
    defense: Math.floor(baseStats.defense * scalingFactor * playerAdjustment),
    speed: Math.floor(baseStats.speed * scalingFactor * playerAdjustment),
    maxHealth: Math.floor(baseStats.maxHealth * scalingFactor * playerAdjustment),
    health: Math.floor(baseStats.maxHealth * scalingFactor * playerAdjustment),
    specialMove: baseStats.specialMove || 'Basic Attack',
    intelligence: Math.floor(baseStats.intelligence * scalingFactor * playerAdjustment),
    is_cpu: true,
    fitness_bonuses: {},
    boosted_attributes: {}
  };
}

/**
 * Convert UserHolobot to BattleHolobot format
 */
export function convertToBattleHolobot(
  holobot: any,
  userId: string,
  equippedParts?: any
): BattleHolobot {
  const baseStats = HOLOBOT_STATS[holobot.name.toLowerCase()];
  
  if (!baseStats) {
    throw new Error(`Invalid holobot: ${holobot.name}`);
  }

  // Calculate total stats including boosts and parts
  let totalAttack = baseStats.attack + (holobot.boostedAttributes?.attack || 0);
  let totalDefense = baseStats.defense + (holobot.boostedAttributes?.defense || 0);
  let totalSpeed = baseStats.speed + (holobot.boostedAttributes?.speed || 0);
  let totalMaxHealth = baseStats.maxHealth + (holobot.boostedAttributes?.health || 0);

  // Apply parts bonuses if equipped
  if (equippedParts) {
    Object.values(equippedParts).forEach((part: any) => {
      if (part?.baseStats) {
        totalAttack += part.baseStats.attack || 0;
        totalDefense += part.baseStats.defense || 0;
        totalSpeed += part.baseStats.speed || 0;
      }
    });
  }

  return {
    name: holobot.name,
    level: holobot.level || 1,
    attack: totalAttack,
    defense: totalDefense,
    speed: totalSpeed,
    maxHealth: totalMaxHealth,
    health: totalMaxHealth,
    specialMove: baseStats.specialMove || 'Basic Attack',
    intelligence: baseStats.intelligence || 5,
    owner_id: userId,
    is_cpu: false,
    fitness_bonuses: {},
    boosted_attributes: holobot.boostedAttributes || {},
    equipped_parts: equippedParts
  };
}

/**
 * Calculate ELO rating change
 */
export function calculateELOChange(
  winnerRating: number,
  loserRating: number,
  isWinner: boolean,
  kFactor: number = 32
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const actualScore = isWinner ? 1 : 0;
  return Math.round(kFactor * (actualScore - expectedScore));
} 