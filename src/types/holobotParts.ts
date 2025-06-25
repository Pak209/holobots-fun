import { z } from 'zod';

// Part Slots
export const PART_SLOTS = ['head', 'torso', 'arms', 'legs', 'core'] as const;
export type PartSlot = typeof PART_SLOTS[number];

// Part Tiers
export const PART_TIERS = ['common', 'rare', 'epic', 'legendary', 'mythic'] as const;
export type PartTier = typeof PART_TIERS[number];

// Elemental Types
export const ELEMENTAL_TYPES = ['fire', 'ice', 'electric', 'psychic', 'wind', 'earth'] as const;
export type ElementalType = typeof ELEMENTAL_TYPES[number];

// Tier-specific data
export const TIER_STAT_BOOSTS: Record<PartTier, number> = {
  common: 0,
  rare: 10,
  epic: 20,
  legendary: 30,
  mythic: 40,
} as const;

export const TIER_COLORS: Record<PartTier, string> = {
  common: 'gray-400',
  rare: 'blue-400',
  epic: 'purple-400',
  legendary: 'yellow-400',
  mythic: 'rainbow',
} as const;

// Passive Trait interface
export interface PassiveTrait {
  id: string;
  name: string;
  description: string;
  effect: {
    type: 'stat_boost' | 'special_effect' | 'synergy';
    value: number;
    duration?: number; // in seconds, if applicable
  };
}

// Special Attack Variant
export interface SpecialAttackVariant {
  id: string;
  name: string;
  elementType: ElementalType;
  baseDamage: number;
  effects: {
    type: 'dot' | 'slow' | 'bonus' | 'confusion' | 'pushback' | 'buff';
    value: number;
    duration: number;
  }[];
  animationKey: string;
}

// Part Schema
export const PartSchema = z.object({
  id: z.string().uuid(),
  slot: z.enum(PART_SLOTS),
  tier: z.enum(PART_TIERS),
  name: z.string(),
  description: z.string(),
  baseStats: z.object({
    attack: z.number(),
    defense: z.number(),
    speed: z.number(),
    intelligence: z.number(),
  }),
  passiveTraits: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    effect: z.object({
      type: z.enum(['stat_boost', 'special_effect', 'synergy']),
      value: z.number(),
      duration: z.number().optional(),
    }),
  })).optional(),
  specialAttackVariant: z.object({
    id: z.string(),
    name: z.string(),
    elementType: z.enum(ELEMENTAL_TYPES),
    baseDamage: z.number(),
    effects: z.array(z.object({
      type: z.enum(['dot', 'slow', 'bonus', 'confusion', 'pushback', 'buff']),
      value: z.number(),
      duration: z.number(),
    })),
    animationKey: z.string(),
  }).optional(),
  visualEffects: z.object({
    glowColor: z.string(),
    animationKey: z.string().optional(),
    particleEffect: z.string().optional(),
  }),
  synergySet: z.string().optional(), // For mythic tier set bonuses
});

export type Part = z.infer<typeof PartSchema>;

// Holobot Equipment State
export interface HolobotEquipment {
  head?: Part;
  torso?: Part;
  arms?: Part;
  legs?: Part;
  core?: Part;
}

// Special Attack State
export interface SpecialAttackState {
  currentCharge: number;
  maxCharge: number;
  activeEffects: Array<{
    type: ElementalType;
    duration: number;
    value: number;
  }>;
  lastUsed: number; // timestamp
}

// Elemental Effect Types
export const ELEMENTAL_EFFECTS: Record<ElementalType, {
  name: string;
  description: string;
  effectType: 'dot' | 'slow' | 'bonus' | 'confusion' | 'pushback' | 'buff';
  baseDuration: number;
  baseValue: number;
}> = {
  fire: {
    name: 'Burn',
    description: 'Deals damage over time',
    effectType: 'dot',
    baseDuration: 5,
    baseValue: 10,
  },
  ice: {
    name: 'Frost',
    description: 'Reduces target speed',
    effectType: 'slow',
    baseDuration: 3,
    baseValue: 20,
  },
  electric: {
    name: 'Shock',
    description: 'Bonus damage at full charge',
    effectType: 'bonus',
    baseDuration: 0,
    baseValue: 50,
  },
  psychic: {
    name: 'Confusion',
    description: 'Reduces accuracy',
    effectType: 'confusion',
    baseDuration: 4,
    baseValue: 30,
  },
  wind: {
    name: 'Gale',
    description: 'Pushes target back',
    effectType: 'pushback',
    baseDuration: 1,
    baseValue: 100,
  },
  earth: {
    name: 'Fortify',
    description: 'Increases defense',
    effectType: 'buff',
    baseDuration: 6,
    baseValue: 25,
  },
} as const; 