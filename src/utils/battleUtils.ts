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
    syncPoints: 0,
    comboChain: 0, // Add combo chain tracking
    maxComboChain: stats.intelligence && stats.intelligence > 5 ? 8 : 5 // Max combo based on intelligence
  };
};

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

export const resetComboChain = (stats: HolobotStats): HolobotStats => {
  return {
    ...stats,
    comboChain: 0
  };
};

export const incrementComboChain = (stats: HolobotStats): HolobotStats => {
  const maxCombo = stats.intelligence && stats.intelligence > 5 ? 8 : 5;
  let newComboChain = ((stats.comboChain || 0) + 1);
  
  // Reset if max reached
  if (newComboChain > maxCombo) {
    newComboChain = 0;
  }
  
  return {
    ...stats,
    comboChain: newComboChain
  };
};

export const generateArenaOpponent = (currentRound: number) => {
  const holobotKeys = ['ace', 'kuma', 'shadow', 'era', 'nova'];
  
  const randomIndex = Math.floor(Math.random() * holobotKeys.length);
  const holobotKey = holobotKeys[randomIndex];
  
  const baseLevel = Math.max(1, Math.min(50, Math.floor(currentRound * 1.5)));
  const attackMod = 1 + (currentRound * 0.1);
  const defenseMod = 1 + (currentRound * 0.05);
  const speedMod = 1 + (currentRound * 0.08);
  
  return {
    name: holobotKey,
    level: baseLevel,
    stats: {
      attack: attackMod,
      defense: defenseMod,
      speed: speedMod
    }
  };
};
