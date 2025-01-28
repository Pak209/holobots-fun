import { HolobotStats } from "@/types/holobot";

export class BattleSystem {
  private leftHolobot: HolobotStats;
  private rightHolobot: HolobotStats;
  private maxRounds: number;
  private currentRound: number;
  private startTime: number;

  constructor(leftHolobot: HolobotStats, rightHolobot: HolobotStats, maxRounds: number = 10) {
    this.leftHolobot = { ...leftHolobot };
    this.rightHolobot = { ...rightHolobot };
    this.maxRounds = maxRounds;
    this.currentRound = 1;
    this.startTime = Date.now();
  }

  private calculateDamage(attacker: HolobotStats, defender: HolobotStats): number {
    // Calculate damage with fatigue reduction
    const attackWithFatigue = Math.max(1, attacker.attack - (attacker.fatigue || 0));
    const damage = Math.max(0, attackWithFatigue - defender.defense);
    
    // Evasion check based on speed comparison
    const evasionChance = defender.speed / (defender.speed + attacker.speed);
    if (Math.random() < evasionChance) {
      return 0;
    }
    
    // Increment special attack gauge on successful hit
    if (damage > 0 && attacker.specialAttackGauge !== undefined) {
      attacker.specialAttackGauge = Math.min(
        (attacker.specialAttackThreshold || 5),
        attacker.specialAttackGauge + 1
      );
    }
    
    return Math.floor(damage);
  }

  private applyHackBoost(holobot: HolobotStats, type: 'attack' | 'speed' | 'heal'): HolobotStats {
    if (holobot.gasTokens && holobot.gasTokens >= 5 && !holobot.hackUsed) {
      const newStats = { ...holobot };
      newStats.gasTokens -= 5;
      newStats.hackUsed = true;
      
      switch (type) {
        case 'attack':
          newStats.attack += Math.floor(newStats.attack * 0.2);
          break;
        case 'speed':
          newStats.speed += Math.floor(newStats.speed * 0.2);
          break;
        case 'heal':
          newStats.maxHealth = Math.min(100, newStats.maxHealth + 30);
          break;
      }
      return newStats;
    }
    return holobot;
  }

  private applySpecialAttack(holobot: HolobotStats): HolobotStats {
    if (holobot.specialAttackGauge && holobot.specialAttackGauge >= (holobot.specialAttackThreshold || 5)) {
      const newStats = { ...holobot };
      
      switch (holobot.specialMove) {
        case "1st Strike":
          newStats.attack += 10;
          newStats.speed += 5;
          break;
        case "Sharp Claws":
          newStats.attack += 15;
          break;
        default:
          newStats.attack += 10;
          newStats.defense += 5;
      }
      
      newStats.specialAttackGauge = 0;
      return newStats;
    }
    return holobot;
  }

  private gainExperience(holobot: HolobotStats, damage: number): HolobotStats {
    const newStats = { ...holobot };
    const xpGained = Math.floor(damage * 2);
    const currentXp = newStats.xp || 0;
    const newXp = currentXp + xpGained;
    
    // Level up if XP threshold is reached
    if (newXp >= 100) {
      newStats.level = (newStats.level || 1) + 1;
      newStats.xp = newXp - 100;
      // Stat increases on level up
      newStats.maxHealth += 10;
      newStats.attack += 2;
      newStats.defense += 1;
      newStats.speed += 1;
    } else {
      newStats.xp = newXp;
    }
    
    return newStats;
  }

  public processTurn(): {
    leftHolobot: HolobotStats;
    rightHolobot: HolobotStats;
    events: string[];
    isComplete: boolean;
  } {
    const events: string[] = [];
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    events.push(`Round ${this.currentRound}: Elapsed Time: ${elapsedTime.toFixed(2)}s`);

    // Apply fatigue after 3 rounds
    if (this.leftHolobot.fatigue && this.leftHolobot.fatigue > 2) {
      this.leftHolobot.fatigue++;
    }
    if (this.rightHolobot.fatigue && this.rightHolobot.fatigue > 2) {
      this.rightHolobot.fatigue++;
    }

    // Determine turn order based on speed
    const [attacker, defender] = this.leftHolobot.speed > this.rightHolobot.speed 
      ? [this.leftHolobot, this.rightHolobot] 
      : [this.rightHolobot, this.leftHolobot];

    // Calculate and apply damage
    const damage = this.calculateDamage(attacker, defender);
    if (damage > 0) {
      defender.maxHealth = Math.max(0, defender.maxHealth - damage);
      events.push(`${attacker.name} attacks ${defender.name} for ${damage} damage!`);
      
      // Apply experience gain
      if (attacker === this.leftHolobot) {
        this.leftHolobot = this.gainExperience(attacker, damage);
      } else {
        this.rightHolobot = this.gainExperience(attacker, damage);
      }
    } else {
      events.push(`${defender.name} evaded the attack!`);
    }

    // Check for special attacks
    if (attacker.specialAttackGauge && attacker.specialAttackGauge >= (attacker.specialAttackThreshold || 5)) {
      if (attacker === this.leftHolobot) {
        this.leftHolobot = this.applySpecialAttack(attacker);
      } else {
        this.rightHolobot = this.applySpecialAttack(attacker);
      }
      events.push(`${attacker.name} used their special attack!`);
    }

    this.currentRound++;
    const isComplete = this.currentRound > this.maxRounds || 
                      this.leftHolobot.maxHealth <= 0 || 
                      this.rightHolobot.maxHealth <= 0;

    if (isComplete) {
      const winner = this.leftHolobot.maxHealth > 0 ? this.leftHolobot.name : this.rightHolobot.name;
      events.push(`Battle complete! ${winner} wins!`);
    }

    return {
      leftHolobot: this.leftHolobot,
      rightHolobot: this.rightHolobot,
      events,
      isComplete
    };
  }

  public getState(): {
    leftHolobot: HolobotStats;
    rightHolobot: HolobotStats;
    currentRound: number;
    maxRounds: number;
  } {
    return {
      leftHolobot: this.leftHolobot,
      rightHolobot: this.rightHolobot,
      currentRound: this.currentRound,
      maxRounds: this.maxRounds
    };
  }
}