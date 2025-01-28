import { HolobotStats } from "@/types/holobot";

export const calculateDamage = (attacker: HolobotStats, defender: HolobotStats) => {
  // Calculate damage with fatigue reduction
  const attackWithFatigue = Math.max(1, attacker.attack - (attacker.fatigue || 0));
  const damage = Math.max(0, attackWithFatigue - defender.defense);
  
  // Evasion check based on speed comparison
  const evasionChance = defender.speed / (defender.speed + attacker.speed);
  if (Math.random() < evasionChance) {
    return 0;
  }
  
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

export const getExperienceProgress = (currentXp: number, level: number) => {
  const requiredXp = calculateExperience(level);
  return {
    currentXp,
    requiredXp,
    progress: (currentXp / requiredXp) * 100
  };
};

export const applySpecialAttack = (stats: HolobotStats) => {
  const newStats = { ...stats };
  
  switch (stats.specialMove) {
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
  
  return newStats;
};