import { HolobotStats } from "@/types/holobot";
import { HOLOBOT_STATS } from "@/types/holobot";


const BASE_XP = 100; // Base experience points
const LEVEL_SCALING_FACTOR = 10; // k factor for XP scaling

export const calculateDamage = (attacker: HolobotStats, defender: HolobotStats) => {
  // Log the actual values for debugging
  console.log("Battle damage calculation:", {
    attackerStats: attacker,
    defenderStats: defender,
    attackValue: attacker.attack,
    defenseValue: defender.defense
  });

  const evasionChance = (defender.speed - attacker.speed) * 0.05;
  const willEvade = Math.random() < Math.max(0, Math.min(0.25, evasionChance));

  if (willEvade) {
    return 0;
  }

  const attackWithFatigue = Math.max(1, attacker.attack - (attacker.fatigue || 0));
  
  // Use a higher multiplier for defense reduction to make attacks more effective
  const defenseReduction = defender.defense * 0.25; // Further reduced from 0.3 to make attacks more powerful
  const damage = Math.max(1, attackWithFatigue - defenseReduction);
  
  // Apply level scaling to damage calculation - scale higher for high level holobots
  const levelFactor = attacker.level ? (1 + (attacker.level * 0.08)) : 1; // Increased from 0.05 to 0.08
  const scaledDamage = Math.floor(damage * levelFactor);
  
  console.log("Final damage calculation:", {
    attackWithFatigue,
    defenseReduction,
    baseDamage: damage,
    levelFactor,
    finalDamage: scaledDamage
  });
  
  return scaledDamage;
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
    case "Dark Veil":
      newStats.defense += 4;
      newStats.attack += 3;
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
    comboChain: 0,
    maxComboChain: stats.intelligence && stats.intelligence > 5 ? 8 : 5
  };
};

// Updated to ensure attribute points are given when holobots level up
export const updateHolobotExperience = (holobots, holobotName, newExperience, newLevel) => {
  if (!holobots || !Array.isArray(holobots)) {
    return [];
  }
  
  return holobots.map(holobot => {
    if (holobot.name.toLowerCase() === holobotName.toLowerCase()) {
      // Add 1 attribute point for each level gained
      const levelGained = newLevel - (holobot.level || 1);
      const currentAttributePoints = holobot.attributePoints || 0;
      const newAttributePoints = levelGained > 0 ? currentAttributePoints + levelGained : currentAttributePoints;
      
      console.log(`Holobot ${holobotName} leveled up by ${levelGained} levels, new attribute points: ${newAttributePoints}`);
      
      return {
        ...holobot,
        level: newLevel,
        experience: newExperience,
        nextLevelExp: calculateExperience(newLevel),
        attributePoints: newAttributePoints
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
  
  if (newComboChain > maxCombo) {
    newComboChain = 0;
  }
  
  return {
    ...stats,
    comboChain: newComboChain
  };
};

export const generateArenaOpponent = (currentRound: number) => {
  const holobotKeys = ['ace', 'kuma', 'shadow', 'era', 'nova', 'wolf', 'tsuin', 'ken', 'gama', 'kurai', 'tora', 'wake', 'hare'];
  
  // Use a more complex seeding mechanism to ensure variety
  const seed = (currentRound * 13 + Date.now() % 1000) % holobotKeys.length;
  const randomIndex = Math.floor(seed);
  const holobotKey = holobotKeys[randomIndex];
  
  // Scale stats based on round number
  const baseLevel = Math.max(1, Math.min(50, Math.floor(currentRound * 1.5)));
  const attackMod = 1 + (currentRound * 0.1);
  const defenseMod = 1 + (currentRound * 0.05);
  const speedMod = 1 + (currentRound * 0.08);
  
  // Add some randomness to stats
  const randomFactor = 0.8 + (Math.random() * 0.4); // Random factor between 0.8 and 1.2
  
  return {
    name: holobotKey,
    level: baseLevel,
    stats: {
      attack: attackMod * randomFactor,
      defense: defenseMod * randomFactor,
      speed: speedMod * randomFactor,
      maxHealth: 100 + (baseLevel * 2),
      specialMove: HOLOBOT_STATS[holobotKey].specialMove,
      intelligence: Math.min(10, Math.max(1, Math.floor(baseLevel / 5)))
    }
  };
};

export const calculateSquadMemberXp = (
  holobotLevel: number, 
  bossLevel: number, 
  baseXp: number, 
  multiplier: number = 1
): number => {
  const levelDiff = holobotLevel - bossLevel;
  let xpModifier = 1;
  
  if (levelDiff < 0) {
    xpModifier = Math.min(2, 1 + (Math.abs(levelDiff) * 0.05));
  } 
  else if (levelDiff > 10) {
    xpModifier = Math.max(0.2, 1 - (levelDiff * 0.05));
  }
  
  return Math.floor(baseXp * xpModifier * multiplier);
};

export const calculateArenaRewards = (round: number, victoriesCount: number) => {
  // Base rewards values that scale with round and victories
  const baseTokens = 20 * round * (victoriesCount + 1);
  const baseGachaTickets = Math.floor(victoriesCount / 2);
  
  // Blueprint pieces have a chance based on round and victories
  const blueprintChance = 0.3 + (round * 0.1) + (victoriesCount * 0.05);
  const blueprintAmount = victoriesCount > 0 ? Math.ceil(victoriesCount * round / 2) : 0;
  
  // Additional arena pass has a chance based on victories
  const arenaPassChance = 0.2 + (victoriesCount * 0.05);
  const arenaPass = Math.random() < arenaPassChance ? 1 : 0;
  
  // Determine if blueprints will be awarded based on chance
  const hasBlueprintReward = Math.random() < blueprintChance;
  
  // If blueprint is awarded, determine which holobot blueprints
  let blueprintReward = null;
  if (hasBlueprintReward && blueprintAmount > 0) {
    const holobots = ['ace', 'kuma', 'shadow', 'era', 'nova', 'wolf', 'tsuin', 'ken', 'gama', 'kurai', 'tora', 'wake', 'hare'];
    const selectedHolobot = holobots[Math.floor(Math.random() * holobots.length)];
    
    blueprintReward = {
      holobotKey: selectedHolobot,
      amount: blueprintAmount
    };
  }
  
  return {
    holosTokens: baseTokens,
    gachaTickets: baseGachaTickets,
    blueprintReward,
    arenaPass
  };
};


