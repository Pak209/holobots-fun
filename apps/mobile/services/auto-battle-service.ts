import { BattleResult, StepBuffs } from '../types/league';
import { Holobot } from '../types/holobot';
import { generateUUID } from '../utils/battleUtils';

interface BattleSimulationParams {
  userHolobot: Holobot;
  opponentHolobot: any; // This could be a Holobot or a simplified version
  stepBuffs: StepBuffs;
  isPvP: boolean;
  leagueId?: string;
  opponentId: string;
}

class AutoBattleService {
  calculateStepBuffs(dailySteps: number): StepBuffs {
    // Calculate buffs based on daily steps
    // These are percentage bonuses
    const healthBonus = Math.min(dailySteps / 10000, 0.2); // Max 20% bonus
    const attackBonus = Math.min(dailySteps / 15000, 0.15); // Max 15% bonus
    const meterChargeBonus = Math.min(dailySteps / 20000, 0.1); // Max 10% bonus
    
    return {
      totalSteps: dailySteps,
      healthBonus,
      attackBonus,
      meterChargeBonus
    };
  }
  
  async simulateBattle(params: BattleSimulationParams): Promise<BattleResult> {
    const { userHolobot, opponentHolobot, stepBuffs, isPvP, leagueId, opponentId } = params;
    
    // Apply step buffs to user holobot
    const buffedUserHolobot = {
      ...userHolobot,
      stats: {
        ...userHolobot.stats,
        health: Math.floor(userHolobot.stats.health * (1 + stepBuffs.healthBonus)),
        attack: Math.floor(userHolobot.stats.attack * (1 + stepBuffs.attackBonus))
      }
    };
    
    // Simple battle simulation
    // In a real implementation, this would be much more complex
    const userPower = buffedUserHolobot.stats.attack * 2 + buffedUserHolobot.stats.defense + buffedUserHolobot.stats.speed;
    const opponentPower = opponentHolobot.stats.attack * 2 + opponentHolobot.stats.defense + opponentHolobot.stats.speed;
    
    // Add some randomness
    const userRoll = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
    const opponentRoll = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
    
    const finalUserPower = userPower * userRoll;
    const finalOpponentPower = opponentPower * opponentRoll;
    
    // Determine winner
    let winner: 'user' | 'opponent' | 'draw';
    if (finalUserPower > finalOpponentPower * 1.05) {
      winner = 'user';
    } else if (finalOpponentPower > finalUserPower * 1.05) {
      winner = 'opponent';
    } else {
      winner = 'draw';
    }
    
    // Generate battle log
    const battleLog = this.generateBattleLog(buffedUserHolobot, opponentHolobot, winner);
    
    // Calculate rewards
    const rewards = this.calculateRewards(winner, isPvP, leagueId);
    
    // Return battle result
    return {
      id: generateUUID(),
      userHolobot: buffedUserHolobot,
      opponentHolobot,
      winner,
      battleLog,
      rewards,
      createdAt: new Date(),
      isPvP,
      leagueId,
      opponentId,
      stepBuffs
    };
  }
  
  private generateBattleLog(userHolobot: any, opponentHolobot: any, winner: 'user' | 'opponent' | 'draw'): string[] {
    const log: string[] = [];
    
    // Initial entry
    log.push(`Battle begins between ${userHolobot.name} and ${opponentHolobot.name}!`);
    
    // Generate some random battle events
    const rounds = Math.floor(Math.random() * 3) + 3; // 3 to 5 rounds
    
    for (let i = 1; i <= rounds; i++) {
      log.push(`--- Round ${i} ---`);
      
      // User attack
      const userDamage = Math.floor(userHolobot.stats.attack * (Math.random() * 0.5 + 0.75));
      log.push(`${userHolobot.name} attacks for ${userDamage} damage!`);
      
      // Random special move
      if (Math.random() > 0.7) {
        const specialDamage = Math.floor(userHolobot.stats.attack * 1.5);
        log.push(`${userHolobot.name} uses ${userHolobot.stats.specialMove || userHolobot.specialAbility || 'Special Attack'} for ${specialDamage} damage!`);
      }
      
      // Opponent attack
      const opponentDamage = Math.floor(opponentHolobot.stats.attack * (Math.random() * 0.5 + 0.75));
      log.push(`${opponentHolobot.name} attacks for ${opponentDamage} damage!`);
      
      // Random special move
      if (Math.random() > 0.7) {
        const specialDamage = Math.floor(opponentHolobot.stats.attack * 1.5);
        log.push(`${opponentHolobot.name} uses ${opponentHolobot.stats.specialMove || opponentHolobot.specialAbility || 'Special Attack'} for ${specialDamage} damage!`);
      }
    }
    
    // Final result
    if (winner === 'user') {
      log.push(`${userHolobot.name} wins the battle!`);
    } else if (winner === 'opponent') {
      log.push(`${opponentHolobot.name} wins the battle!`);
    } else {
      log.push("The battle ends in a draw!");
    }
    
    return log;
  }
  
  private calculateRewards(winner: 'user' | 'opponent' | 'draw', isPvP: boolean, leagueId?: string): any {
    // Base rewards
    let holos = 0;
    let experience = 0;
    let gachaTickets = 0;
    
    if (winner === 'user') {
      // PvP rewards are higher
      if (isPvP) {
        holos = 100;
        experience = 50;
        gachaTickets = 1;
      } else {
        // League rewards depend on the league
        switch (leagueId) {
          case 'junkyard':
            holos = 50;
            experience = 25;
            break;
          case 'city-scraps':
            holos = 100;
            experience = 50;
            break;
          case 'neon-core':
            holos = 200;
            experience = 100;
            gachaTickets = 1;
            break;
          case 'overlord':
            holos = 500;
            experience = 200;
            gachaTickets = 2;
            break;
          default:
            holos = 50;
            experience = 25;
        }
      }
    } else if (winner === 'draw') {
      // Draw rewards are lower
      if (isPvP) {
        holos = 50;
        experience = 25;
      } else {
        holos = 25;
        experience = 10;
      }
    } else {
      // Consolation rewards for losing
      if (isPvP) {
        holos = 25;
        experience = 10;
      } else {
        holos = 10;
        experience = 5;
      }
    }
    
    return {
      holos,
      experience,
      gachaTickets
    };
  }
}

export const autoBattleService = new AutoBattleService();