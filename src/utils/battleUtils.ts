import { HolobotStats } from "@/types/holobot";

export const calculateDamage = (attacker: HolobotStats, defender: HolobotStats) => {
  const baseDamage = Math.max(1, attacker.attack - defender.defense);
  const criticalHit = Math.random() < 0.2;
  const damage = criticalHit ? baseDamage * 1.5 : baseDamage;
  
  if (defender.speed > attacker.speed && Math.random() > 0.8) {
    return 0;
  }
  return Math.floor(damage);
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