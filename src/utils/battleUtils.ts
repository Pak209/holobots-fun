import { HolobotStats } from "@/types/holobot";

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

export const applyHackBoost = (stats: HolobotStats, type: 'attack' | 'speed' | 'heal' | 'defense' | 'special'): HolobotStats => {
  const newStats = { ...stats };
  
  switch (type) {
    case 'attack':
      newStats.attack += Math.floor(newStats.attack * 0.2);
      break;
    case 'speed':
      newStats.speed += Math.floor(newStats.speed * 0.2);
      break;
    case 'defense':
      newStats.defense += Math.floor(newStats.defense * 0.2);
      break;
    case 'heal':
      // Healing will be applied directly in the component
      // This allows different healing amounts based on hack gauge
      newStats.maxHealth = Math.min(100, newStats.maxHealth + 20);
      break;
    case 'special':
      // Special attack will be handled in the battle component
      // This gives a temporary boost to all stats
      newStats.attack += Math.floor(newStats.attack * 0.15);
      newStats.defense += Math.floor(newStats.defense * 0.15);
      newStats.speed += Math.floor(newStats.speed * 0.15);
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

export const updateHolobotExperience = (holobots: any[], holobotName: string, newExperience: number, newLevel: number) => {
  if (!holobots || !Array.isArray(holobots)) {
    return [];
  }

  return holobots.map(holobot => {
    if (holobot.name.toLowerCase() === holobotName.toLowerCase()) {
      // Calculate total experience by adding new experience to existing
      const totalExperience = (holobot.experience || 0) + newExperience;
      
      return {
        ...holobot,
        level: newLevel,
        experience: totalExperience,
        nextLevelExp: calculateExperience(newLevel),
        // Keep current points if already tracked, don't auto-assign
        attributePoints: holobot.attributePoints || 0
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
  
  // Ensure we get a different opponent by using round number as a seed
  // Different round numbers will result in different opponents
  const seed = currentRound + Date.now() % 1000;
  const randomIndex = Math.floor((seed * 13) % holobotKeys.length);
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

export const updateBlueprintCount = (
  currentBlueprints: Record<string, number> | undefined, 
  holobotKey: string, 
  amount: number
): Record<string, number> => {
  const blueprints = currentBlueprints || {};
  
  console.log(`[updateBlueprintCount] Before update:`, blueprints);
  console.log(`[updateBlueprintCount] Adding ${amount} blueprint pieces for ${holobotKey}`);
  
  // Ensure we use lowercase holobot keys for consistency
  const lowerKey = holobotKey.toLowerCase();
  
  const updatedBlueprints = {
    ...blueprints,
    [lowerKey]: (blueprints[lowerKey] || 0) + amount
  };
  
  console.log(`[updateBlueprintCount] After update:`, updatedBlueprints);
  return updatedBlueprints;
};
