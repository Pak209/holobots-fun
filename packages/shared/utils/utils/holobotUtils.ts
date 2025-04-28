/**
 * Utility functions for Holobots
 */

import { Holobot } from '@/types/holobots';

/**
 * Get the image URL for a Holobot based on its name or key
 * @param nameOrKey The name or key of the Holobot
 * @returns The URL of the Holobot image
 */
export const getHolobotImageUrl = (nameOrKey: string | undefined): string => {
  // Handle undefined or empty nameOrKey
  if (!nameOrKey) {
    return 'https://source.unsplash.com/random/200x200?robot-placeholder';
  }
  
  const key = nameOrKey.toLowerCase();
  
  // Use Supabase storage URLs for Holobot images
  const supabaseBaseUrl = 'https://pfpidggrdnmfgrbncpyl.supabase.co/storage/v1/object/public/holobots';
  
  // Map of available Holobot images in Supabase
  const availableHolobots = ['ace', 'toxin', 'kuma', 'shadow', 'hare', 'tora', 'wake', 'era', 'gama', 'ken', 'kurai', 'tsuin', 'wolf'];
  
  // Check if the Holobot has an image in Supabase
  if (availableHolobots.includes(key)) {
    return `${supabaseBaseUrl}/${key}.png`;
  }
  
  // Legacy fallback images
  if (key === 'ace') {
    return 'https://i.imgur.com/JGkzwKX.png';
  } else if (key === 'toxin') {
    return 'https://i.imgur.com/8YQhxB7.png';
  } else if (key === 'kuma') {
    return 'https://i.imgur.com/pKYuEww.png';
  } else if (key === 'shadow') {
    return 'https://i.imgur.com/L2Xfghe.png';
  } else if (key === 'hare') {
    return 'https://i.imgur.com/QZGn9h7.png';
  } else if (key === 'tora') {
    return 'https://i.imgur.com/vTSFAzV.png';
  }
  
  // For other holobots, use a placeholder image
  return `https://source.unsplash.com/random/200x200?robot-${key}`;
};

/**
 * Get the Holobot key from its name
 * @param name The name of the Holobot
 * @returns The key of the Holobot
 */
export const getHolobotKeyFromName = (name: string): string => {
  if (!name) return '';
  return name.toLowerCase();
};

/**
 * Calculate the experience needed for a level
 * @param level The level to calculate experience for
 * @returns The amount of experience needed
 */
export const calculateExperienceForLevel = (level: number): number => {
  const BASE_XP = 100;
  return Math.floor(BASE_XP * Math.pow(level, 2));
};

/**
 * Check if a Holobot can level up with the given experience
 * @param currentExp Current experience points
 * @param currentLevel Current level
 * @returns Object with new level and remaining experience
 */
export const checkLevelUp = (currentExp: number, currentLevel: number): { newLevel: number, remainingExp: number } => {
  const requiredExp = calculateExperienceForLevel(currentLevel);
  
  if (currentExp >= requiredExp && currentLevel < 50) {
    return {
      newLevel: currentLevel + 1,
      remainingExp: currentExp - requiredExp
    };
  }
  
  return {
    newLevel: currentLevel,
    remainingExp: currentExp
  };
};

export const applyAttributeBoosts = (holobot: Holobot): Holobot => {
  return {
    ...holobot,
    attack: holobot.attack * (1 + (holobot.attributeBoosts?.attack || 0) / 100),
    defense: holobot.defense * (1 + (holobot.attributeBoosts?.defense || 0) / 100),
    speed: holobot.speed * (1 + (holobot.attributeBoosts?.speed || 0) / 100),
    health: holobot.health * (1 + (holobot.attributeBoosts?.health || 0) / 100),
  };
};