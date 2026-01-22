// ============================================================================
// Holobot to Fighter Converter
// Convert Holobot NFT data to Arena Fighter format
// ============================================================================

import type { ArenaFighter, FighterArchetype } from '@/types/arena';

// Placeholder Holobot type - replace with actual type from your system
interface Holobot {
  id: string;
  userId: string;
  name: string;
  imageUrl?: string;
  
  // Stats
  hp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  intelligence?: number;
  
  // Metadata
  tier?: number;
  level?: number;
  rank?: number;
}

// Placeholder Sync Progress type
interface SyncProgress {
  level: number;
  totalSteps: number;
  efficiency: number;
}

/**
 * Convert Holobot NFT to Arena Fighter
 */
export function holobotToFighter(
  holobot: Holobot,
  syncProgress?: SyncProgress
): ArenaFighter {
  // Base stats from holobot (with defaults)
  const baseHP = holobot.hp || 100;
  const baseAttack = holobot.attack || 50;
  const baseDefense = holobot.defense || 40;
  const baseSpeed = holobot.speed || 60;
  const baseIntelligence = holobot.intelligence || 55;
  
  // Apply Sync Training modifiers
  const syncModifier = syncProgress ? 1 + (syncProgress.level / 200) : 1.0; // up to +50% at level 100
  const staminaEfficiency = syncProgress ? 1 + (syncProgress.efficiency / 100) : 1.0;
  
  // Calculate max stamina based on tier, intelligence, and sync
  const basestamina = 6;
  const tierBonus = (holobot.tier || 1) >= 3 ? 1 : 0;
  const intBonus = baseIntelligence >= 70 ? 1 : 0;
  const syncBonus = syncProgress && syncProgress.level >= 50 ? 1 : 0;
  const maxStamina = basestamina + tierBonus + intBonus + syncBonus;
  
  // Determine archetype from stat distribution
  const archetype = determineArchetype({
    attack: baseAttack,
    defense: baseDefense,
    speed: baseSpeed,
    intelligence: baseIntelligence,
  });
  
  // Defense timing window scales with INT and Sync
  const defenseTimingWindow = Math.floor(
    500 + (baseIntelligence * 2) + (syncProgress ? syncProgress.level * 5 : 0)
  );
  
  return {
    holobotId: holobot.id,
    userId: holobot.userId,
    name: holobot.name || 'Holobot',
    avatar: holobot.imageUrl || '/placeholder-holobot.png',
    archetype,
    
    // Stats (with sync modifiers)
    maxHP: Math.floor(baseHP * syncModifier),
    currentHP: Math.floor(baseHP * syncModifier),
    attack: Math.floor(baseAttack * syncModifier),
    defense: Math.floor(baseDefense * syncModifier),
    speed: Math.floor(baseSpeed * syncModifier),
    intelligence: Math.floor(baseIntelligence * syncModifier),
    
    // Arena State
    stamina: maxStamina,
    maxStamina,
    specialMeter: 0,
    
    staminaState: 'fresh',
    isInDefenseMode: false,
    comboCounter: 0,
    lastActionTime: 0,
    
    statusEffects: [],
    
    // Sync-based modifiers
    staminaEfficiency,
    defenseTimingWindow,
    counterDamageBonus: 1.0 + (baseSpeed / 200), // faster = better counters
    damageMultiplier: 1.0,
    speedBonus: 0,
    
    hand: [],
    
    totalDamageDealt: 0,
    perfectDefenses: 0,
    combosCompleted: 0,
  };
}

/**
 * Determine fighter archetype from stat distribution
 */
function determineArchetype(stats: {
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
}): FighterArchetype {
  const { attack, defense, speed, intelligence } = stats;
  
  // Find highest stat
  const maxStat = Math.max(attack, defense, speed, intelligence);
  const statDifference = 15; // threshold for specialization
  
  // Check if stats are relatively balanced
  const isBalanced = 
    Math.abs(attack - defense) < statDifference &&
    Math.abs(attack - speed) < statDifference &&
    Math.abs(attack - intelligence) < statDifference;
  
  if (isBalanced) {
    return 'balanced';
  }
  
  // Specialized archetypes
  if (attack === maxStat && speed >= intelligence) {
    return 'striker';
  }
  
  if (defense === maxStat && attack > speed) {
    return 'grappler';
  }
  
  if (intelligence === maxStat || (intelligence >= 70 && speed >= 65)) {
    return 'technical';
  }
  
  // Default
  return 'balanced';
}

/**
 * Calculate stat bonuses from equipped parts
 */
export function calculatePartBonuses(equippedParts: any[]): {
  hpBonus: number;
  attackBonus: number;
  defenseBonus: number;
  speedBonus: number;
  intelligenceBonus: number;
} {
  // TODO: Implement part bonus calculation
  // This would parse equipped parts and sum their stat bonuses
  
  return {
    hpBonus: 0,
    attackBonus: 0,
    defenseBonus: 0,
    speedBonus: 0,
    intelligenceBonus: 0,
  };
}

/**
 * Get Sync Training modifiers for Arena
 */
export function getSyncModifiersForArena(syncLevel: number): {
  staminaEfficiency: number;
  defenseWindowBonus: number;
  damageBonus: number;
} {
  return {
    staminaEfficiency: 1 + (syncLevel / 200), // max +50% at level 100
    defenseWindowBonus: syncLevel * 5, // +5ms per level
    damageBonus: syncLevel / 100, // max +100% at level 100
  };
}

/**
 * Convert player rank to Arena bonuses
 */
export function getPlayerRankBonuses(playerRank: number): {
  maxStaminaBonus: number;
  rewardMultiplier: number;
} {
  return {
    maxStaminaBonus: Math.floor(playerRank / 5), // +1 stamina per 5 ranks
    rewardMultiplier: 1 + (playerRank / 100), // +1% per rank
  };
}
