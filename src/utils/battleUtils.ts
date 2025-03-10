
import { HolobotStats } from "@/types/holobot";

const BASE_XP = 100; // Base experience points
const LEVEL_SCALING_FACTOR = 10; // k factor for XP scaling

export const calculateDamage = (attacker: HolobotStats, defender: HolobotStats) => {
  const evasionChance = (defender.speed - attacker.speed) * 0.05;
  const willEvade = Math.random() < Math.max(0, Math.min(0.25, evasionChance));

  if (willEvade) {
    return 0;
  }

  const attackWithFatigue = Math.max(1, attacker.attack - (attacker.fatigue || 0));
  const damage = Math.max(1, attackWithFatigue - (defender.defense * 0.5));
  
  return Math.floor(damage);
};

export const calculateExperience = (level: number) => {
  return Math.floor(BASE_XP * Math.pow(level, 2));
};

export const calculateBattleExperience = (winnerLevel: number, loserLevel: number) => {
  const levelDifference = Math.abs(winnerLevel - loserLevel);
  return Math.floor(BASE_XP * (1 + levelDifference / LEVEL_SCALING_FACTOR));
};

export const getNewLevel = (currentXp: number, currentLevel: number) => {
  const requiredXp = calculateExperience(currentLevel);
  if (currentXp >= requiredXp && currentLevel < 50) {
    return currentLevel + 1;
  }
  return currentLevel;
};

export const applyHackBoost = (stats: HolobotStats, type: 'attack' | 'speed' | 'heal'): HolobotStats => {
  const newStats = { ...stats };
  
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

// Update holobot experience and level without changing the base stats
export const updateHolobotExperience = (holobots, holobotName, newExperience, newLevel) => {
  if (!holobots || !Array.isArray(holobots)) {
    return [];
  }
  
  return holobots.map(holobot => {
    if (holobot.name.toLowerCase() === holobotName.toLowerCase()) {
      return {
        ...holobot,
        level: newLevel,
        experience: newExperience,
        nextLevelExp: calculateExperience(newLevel)
      };
    }
    return holobot;
  });
};
