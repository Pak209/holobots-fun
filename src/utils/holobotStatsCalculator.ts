import { HOLOBOT_STATS, HolobotStats } from '@/types/holobot';
import { UserProfile, UserHolobot } from '@/types/user';

/**
 * Calculate the actual stats for a user's Holobot
 * Includes: base stats + level boosts + equipment bonuses + SP upgrades
 * 
 * This matches Arena V2's stat calculation logic
 */
export function calculateActualHolobotStats(
  holobotKey: string,
  user: UserProfile | null,
  getEquippedParts?: (name: string) => any,
  getHolobotAttributeLevel?: (holobotId: string, attribute: string) => number
): HolobotStats {
  const baseStats = HOLOBOT_STATS[holobotKey as keyof typeof HOLOBOT_STATS];
  
  if (!baseStats) {
    console.error(`[Stats Calculator] Base stats not found for: ${holobotKey}`);
    return {
      name: holobotKey,
      attack: 50,
      defense: 40,
      speed: 60,
      maxHealth: 100,
      level: 1,
    };
  }

  // Start with base stats
  let finalStats: HolobotStats = {
    ...baseStats,
    attack: baseStats.attack,
    defense: baseStats.defense,
    speed: baseStats.speed,
    maxHealth: baseStats.maxHealth || 100,
    level: baseStats.level || 1,
  };

  // Find user's holobot data
  const userHolobot = user?.holobots?.find(
    (h: UserHolobot) => h.name.toLowerCase() === baseStats.name.toLowerCase()
  );

  if (userHolobot) {
    // Update level
    finalStats.level = userHolobot.level || 1;

    // Apply attribute boosts from leveling up
    if (userHolobot.boostedAttributes) {
      finalStats.attack += userHolobot.boostedAttributes.attack || 0;
      finalStats.defense += userHolobot.boostedAttributes.defense || 0;
      finalStats.speed += userHolobot.boostedAttributes.speed || 0;
      finalStats.maxHealth! += userHolobot.boostedAttributes.health || 0;
    }

    // Calculate INTELLIGENCE based on PvP battle experience (SECRET SAUCE!)
    // Formula: baseINT + (wins × 2) + floor(totalBattles / 10)
    // Veterans with many battles get tactical advantages!
    const pvpWins = userHolobot.pvpWins || 0;
    const pvpLosses = userHolobot.pvpLosses || 0;
    const totalBattles = pvpWins + pvpLosses;
    const baseIntelligence = finalStats.intelligence || 5;
    const winBonus = pvpWins * 2; // Each win adds 2 INT
    const experienceBonus = Math.floor(totalBattles / 10); // Every 10 battles adds 1 INT
    
    finalStats.intelligence = baseIntelligence + winBonus + experienceBonus;
    
    console.log(`[Stats Calculator] ${baseStats.name} Intelligence:`, {
      base: baseIntelligence,
      wins: pvpWins,
      losses: pvpLosses,
      winBonus,
      experienceBonus,
      finalINT: finalStats.intelligence
    });

    // Apply parts bonuses (if function is provided)
    if (getEquippedParts) {
      const equippedParts = getEquippedParts(baseStats.name);
      if (equippedParts) {
        Object.values(equippedParts).forEach((part: any) => {
          if (part?.baseStats) {
            finalStats.attack += part.baseStats.attack || 0;
            finalStats.defense += part.baseStats.defense || 0;
            finalStats.speed += part.baseStats.speed || 0;
            finalStats.intelligence = (finalStats.intelligence || 0) + (part.baseStats.intelligence || 0);
          }
        });
      }
    }

    // Apply SP upgrade bonuses (2 points per level, if function is provided)
    if (getHolobotAttributeLevel) {
      const holobotId = userHolobot.name || baseStats.name;
      const spBonuses = {
        attack: getHolobotAttributeLevel(holobotId, 'attack') * 2,
        defense: getHolobotAttributeLevel(holobotId, 'defense') * 2,
        speed: getHolobotAttributeLevel(holobotId, 'speed') * 2,
        hp: getHolobotAttributeLevel(holobotId, 'hp') * 2,
      };
      
      finalStats.attack += spBonuses.attack;
      finalStats.defense += spBonuses.defense;
      finalStats.speed += spBonuses.speed;
      finalStats.maxHealth! += spBonuses.hp;
    }
  }

  console.log(`[Stats Calculator] ${baseStats.name} Final Stats:`, {
    level: finalStats.level,
    hp: finalStats.maxHealth,
    attack: finalStats.attack,
    defense: finalStats.defense,
    speed: finalStats.speed,
    baseHP: baseStats.maxHealth,
    boosts: userHolobot?.boostedAttributes
  });

  return finalStats;
}
