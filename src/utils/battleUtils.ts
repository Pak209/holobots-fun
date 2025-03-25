
import { HolobotStats, HOLOBOT_STATS } from "@/types/holobot";
import { UserHolobot } from "@/types/user";

export function calculateDamage(
  attacker: HolobotStats,
  defender: HolobotStats
): number {
  let damage = attacker.attack - defender.defense;
  
  if (attacker.fatigue && attacker.fatigue > 3) {
    damage *= 0.75;
  }
  
  if (damage < 0) {
    damage = 0;
  }
  
  return damage;
}

export function applySpecialAttack(stats: HolobotStats): HolobotStats {
  const updatedStats = { ...stats };
  updatedStats.attack += 5;
  updatedStats.defense += 2;
  return updatedStats;
}

export function applyHackBoost(stats: HolobotStats, type: 'attack' | 'speed' | 'heal'): HolobotStats {
  const updatedStats = { ...stats };
  
  switch(type) {
    case 'attack':
      updatedStats.attack += 3;
      break;
    case 'speed':
      updatedStats.speed += 2;
      break;
    case 'heal':
      if (updatedStats.maxHealth) {
        updatedStats.maxHealth += 20;
      }
      break;
  }
  
  return updatedStats;
}

export function calculateExperience(level: number): number {
  return Math.floor(100 * Math.pow(level, 2));
}

export function getNewLevel(experience: number, currentLevel: number): number {
  let level = currentLevel;
  let requiredXP = calculateExperience(level);
  
  while (experience >= requiredXP) {
    level++;
    requiredXP = calculateExperience(level);
  }
  
  return level;
}

export function getExperienceProgress(experience: number, level: number) {
  const currentLevelXP = level === 1 ? 0 : calculateExperience(level - 1);
  const nextLevelXP = calculateExperience(level);
  
  const current = experience - currentLevelXP;
  const max = nextLevelXP - currentLevelXP;
  
  return {
    current,
    max,
    percentage: Math.min(100, Math.floor((current / max) * 100))
  };
}

export function updateHolobotExperience(
  holobots: UserHolobot[], 
  holobotName: string, 
  newExperience: number,
  newLevel: number
): UserHolobot[] {
  return holobots.map(holobot => {
    if (holobot.name.toLowerCase() === holobotName.toLowerCase()) {
      return {
        ...holobot,
        experience: newExperience,
        level: newLevel,
        nextLevelExp: calculateExperience(newLevel)
      };
    }
    return holobot;
  });
}

export function incrementComboChain(chain: number, maxChain: number): number {
  if (chain >= maxChain) return 0;
  return chain + 1;
}

export function resetComboChain(): number {
  return 0;
}

export function generateArenaOpponent(round: number, levelRange: [number, number] = [1, 10]): { name: string, level: number } {
  // Get all available holobots except ace
  const holobotKeys = Object.keys(HOLOBOT_STATS).filter(key => key !== 'ace');
  
  // Randomly select an opponent
  const randomIndex = Math.floor(Math.random() * holobotKeys.length);
  const opponentKey = holobotKeys[randomIndex];
  
  // Calculate level based on round and level range
  const [minLevel, maxLevel] = levelRange;
  const baseLevel = minLevel + Math.floor((maxLevel - minLevel) * 0.4);
  
  // Increase level with each round
  const levelModifier = round - 1;
  const finalLevel = Math.min(maxLevel, baseLevel + levelModifier);
  
  return {
    name: opponentKey,
    level: finalLevel
  };
}

export function calculateArenaRewards(round: number, victories: number) {
  const rewards = {
    holosTokens: 50 * victories * Math.max(1, round * 0.5),
    gachaTickets: victories > 2 ? 1 : 0,
    arenaPass: victories > 1 && round > 2 ? 1 : 0,
    blueprintReward: victories > 0 ? {
      holobotKey: 'kuma',
      amount: 1
    } : undefined
  };
  
  return rewards;
}

// Add the missing calculateBattleExperience function
export function calculateBattleExperience(playerLevel: number, opponentLevel: number): number {
  // Base XP value
  const baseXP = 50;
  
  // Calculate level difference modifier
  const levelDifference = opponentLevel - playerLevel;
  let levelModifier = 1;
  
  if (levelDifference > 0) {
    // Bonus for defeating higher level opponents
    levelModifier = 1 + (levelDifference * 0.1);
  } else if (levelDifference < 0) {
    // Penalty for defeating lower level opponents
    levelModifier = Math.max(0.5, 1 + (levelDifference * 0.05));
  }
  
  // Calculate final XP
  const finalXP = Math.round(baseXP * levelModifier);
  
  return finalXP;
}
