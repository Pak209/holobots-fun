import { HolobotStats } from "@/types/holobot";

export const calculateDamage = (attacker: HolobotStats, defender: HolobotStats) => {
  // Reduce evasion chance significantly
  const evasionChance = (defender.speed - attacker.speed) * 0.05; // 5% per speed difference
  const willEvade = Math.random() < Math.max(0, Math.min(0.25, evasionChance)); // Cap at 25% max

  if (willEvade) {
    return 0;
  }

  // Calculate base damage
  const attackWithFatigue = Math.max(1, attacker.attack - (attacker.fatigue || 0));
  const damage = Math.max(1, attackWithFatigue - (defender.defense * 0.5));
  
  return Math.floor(damage);
};

export const calculateExperience = (level: number) => {
  return Math.floor(100 * Math.pow(1.2, level - 1));
};

export const getNewLevel = (currentXp: number, currentLevel: number) => {
  const requiredXp = calculateExperience(currentLevel);
  if (currentXp >= requiredXp && currentLevel < 50) {
    return currentLevel + 1;
  }
  return currentLevel;
};

export const applyHackBoost = (stats: HolobotStats, type: 'attack' | 'speed' | 'heal') => {
  if (stats.gasTokens && stats.gasTokens >= 5 && !stats.hackUsed) {
    const newStats = { ...stats };
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
  return stats;
};

export const applySpecialAttack = (stats: HolobotStats): HolobotStats => {
  const newStats = { ...stats };
  
  switch (stats.specialMove) {
    case "1st Strike":
      newStats.attack += 3;
      newStats.speed += 4;
      break;
    case "Sharp Claws":
      newStats.attack += 5;
      break;
    default:
      newStats.attack += 2;
      newStats.defense += 2;
  }
  
  return newStats;
};

export const getExperienceProgress = (currentXp: number, level: number) => {
  const requiredXp = calculateExperience(level);
  return {
    currentXp,
    requiredXp,
    progress: (currentXp / requiredXp) * 100
  };
};

export const initializeHolobotStats = (stats: HolobotStats): HolobotStats => {
  return {
    ...stats,
    fatigue: 0,
    gasTokens: 0,
    hackUsed: false,
    specialAttackGauge: 0,
    specialAttackThreshold: 5,
    syncPoints: 0
  };
};