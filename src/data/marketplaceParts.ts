import { Part } from '../types/holobotParts';

export interface MarketplacePartBase {
  id: string;
  name: string;
  slot: Part['slot'];
  description: string;
  baseStats: Part['baseStats'];
  visualEffects?: Part['visualEffects'];
  passiveTraits?: Part['passiveTraits'];
  specialAttackVariant?: Part['specialAttackVariant'];
  synergySet?: string;
}

export interface MarketplacePartTier {
  tier: Part['tier'];
  price: number;
}

export interface MarketplacePart extends MarketplacePartBase {
  tiers: MarketplacePartTier[];
}

export const MARKETPLACE_PARTS: MarketplacePart[] = [
  // Head Parts
  {
    id: 'part-head-scanner',
    name: 'Advanced Scanner',
    slot: 'head',
    description: 'A scanning unit with enhanced reconnaissance capabilities.',
    baseStats: {
      attack: 2,
      defense: 1,
      speed: 0,
      intelligence: 3,
    },
    visualEffects: {
      glowColor: '#9CA3AF',
    },
    tiers: [
      { tier: 'common', price: 150 },
      { tier: 'rare', price: 450 },
      { tier: 'epic', price: 1200 },
      { tier: 'legendary', price: 3000 },
      { tier: 'mythic', price: 7500 },
    ],
  },
  
  // Torso Parts
  {
    id: 'part-torso-chassis',
    name: 'Reinforced Chassis',
    slot: 'torso',
    description: 'Durable frame providing enhanced protection.',
    baseStats: {
      attack: 0,
      defense: 5,
      speed: -1,
      intelligence: 0,
    },
    visualEffects: {
      glowColor: '#9CA3AF',
    },
    tiers: [
      { tier: 'common', price: 200 },
      { tier: 'rare', price: 600 },
      { tier: 'epic', price: 1600 },
      { tier: 'legendary', price: 4000 },
      { tier: 'mythic', price: 10000 },
    ],
  },

  // Arms Parts
  {
    id: 'part-arms-cannons',
    name: 'Plasma Cannons',
    slot: 'arms',
    description: 'High-energy plasma weapons with enhanced targeting.',
    baseStats: {
      attack: 8,
      defense: 2,
      speed: 1,
      intelligence: 2,
    },
    passiveTraits: [
      {
        id: 'trait-001',
        name: 'Energy Burst',
        description: 'Chance to deal bonus energy damage',
        effect: {
          type: 'special_effect',
          value: 15,
          duration: 3,
        },
      },
    ],
    specialAttackVariant: {
      id: 'special-001',
      name: 'Plasma Storm',
      elementType: 'electric',
      baseDamage: 45,
      effects: [
        {
          type: 'bonus',
          value: 25,
          duration: 0,
        },
      ],
      animationKey: 'plasma-storm',
    },
    visualEffects: {
      glowColor: '#3B82F6',
      animationKey: 'blue-glow',
    },
    tiers: [
      { tier: 'common', price: 300 },
      { tier: 'rare', price: 800 },
      { tier: 'epic', price: 2000 },
      { tier: 'legendary', price: 5000 },
      { tier: 'mythic', price: 12500 },
    ],
  },

  // Legs Parts
  {
    id: 'part-legs-boosters',
    name: 'Turbo Boosters',
    slot: 'legs',
    description: 'Advanced propulsion system for enhanced mobility.',
    baseStats: {
      attack: 1,
      defense: 3,
      speed: 12,
      intelligence: 1,
    },
    passiveTraits: [
      {
        id: 'trait-002',
        name: 'Speed Boost',
        description: 'Increases movement speed in battle',
        effect: {
          type: 'stat_boost',
          value: 20,
        },
      },
    ],
    visualEffects: {
      glowColor: '#3B82F6',
      animationKey: 'speed-trail',
    },
    tiers: [
      { tier: 'common', price: 250 },
      { tier: 'rare', price: 650 },
      { tier: 'epic', price: 1800 },
      { tier: 'legendary', price: 4500 },
      { tier: 'mythic', price: 11000 },
    ],
  },

  // Core Parts
  {
    id: 'part-core-quantum',
    name: 'Quantum Core',
    slot: 'core',
    description: 'A quantum-powered energy core with reality-bending capabilities.',
    baseStats: {
      attack: 6,
      defense: 6,
      speed: 6,
      intelligence: 15,
    },
    passiveTraits: [
      {
        id: 'trait-003',
        name: 'Quantum Entanglement',
        description: 'Synchronizes with other quantum parts',
        effect: {
          type: 'synergy',
          value: 30,
        },
      },
      {
        id: 'trait-004',
        name: 'Reality Shift',
        description: 'Chance to phase through attacks',
        effect: {
          type: 'special_effect',
          value: 15,
          duration: 2,
        },
      },
    ],
    specialAttackVariant: {
      id: 'special-002',
      name: 'Quantum Collapse',
      elementType: 'psychic',
      baseDamage: 60,
      effects: [
        {
          type: 'confusion',
          value: 40,
          duration: 4,
        },
      ],
      animationKey: 'quantum-collapse',
    },
    visualEffects: {
      glowColor: '#8B5CF6',
      animationKey: 'quantum-shimmer',
      particleEffect: 'quantum-particles',
    },
    tiers: [
      { tier: 'common', price: 400 },
      { tier: 'rare', price: 1000 },
      { tier: 'epic', price: 2500 },
      { tier: 'legendary', price: 6000 },
      { tier: 'mythic', price: 15000 },
    ],
  },
];

// Helper function to create a Part from MarketplacePart and tier
export function createPartFromMarketplace(marketplacePart: MarketplacePart, tier: Part['tier']): Part {
  const tierMultiplier = {
    common: 1,
    rare: 1.1,
    epic: 1.2,
    legendary: 1.3,
    mythic: 1.4,
  };

  const multiplier = tierMultiplier[tier];
  
  return {
    id: `${marketplacePart.id}-${tier}-${Date.now()}`,
    slot: marketplacePart.slot,
    tier,
    name: `${marketplacePart.name} (${tier.charAt(0).toUpperCase() + tier.slice(1)})`,
    description: marketplacePart.description,
    baseStats: {
      attack: Math.floor(marketplacePart.baseStats.attack * multiplier),
      defense: Math.floor(marketplacePart.baseStats.defense * multiplier),
      speed: Math.floor(marketplacePart.baseStats.speed * multiplier),
      intelligence: Math.floor(marketplacePart.baseStats.intelligence * multiplier),
    },
    visualEffects: marketplacePart.visualEffects,
    passiveTraits: marketplacePart.passiveTraits,
    specialAttackVariant: marketplacePart.specialAttackVariant,
    synergySet: marketplacePart.synergySet,
  };
} 