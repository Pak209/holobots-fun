import { HolobotStats } from "@/types/holobot";

export const calculateDamage = (attacker: HolobotStats, defender: HolobotStats) => {
  const damage = Math.max(0, attacker.attack - defender.defense);
  if (defender.speed > attacker.speed && Math.random() > 0.8) {
    return 0;
  }
  return damage;
};

export const calculateExperience = (level: number) => {
  return Math.floor(100 * (1 + level * 0.1));
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
      newStats.attack += 5;
      break;
    case 'speed':
      newStats.speed += 3;
      break;
    case 'heal':
      newStats.maxHealth = Math.min(newStats.maxHealth + 25, 100);
      break;
  }
  return newStats;
};