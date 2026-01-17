import { Part } from './holobotParts';

export interface BoosterPackItem {
  id: string;
  type: 'part' | 'blueprint' | 'currency' | 'item';
  tier: 'common' | 'rare' | 'epic' | 'legendary';
  name: string;
  description: string;
  quantity: number;
  // For parts
  part?: Part;
  // For blueprints
  holobotKey?: string;
  blueprintPieces?: number;
  // For currency
  holosTokens?: number;
  gachaTickets?: number;
  // For items
  itemType?: 'arena_pass' | 'energy_refill' | 'exp_booster' | 'rank_skip';
}

export interface BoosterPack {
  id: string;
  name: string;
  description: string;
  cost: {
    holosTokens?: number;
    gachaTickets?: number;
  };
  guaranteed: number; // Number of guaranteed items (1-3)
  rarity: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  contents: BoosterPackItem[];
}

export interface BoosterPackResult {
  packId: string;
  items: BoosterPackItem[];
  openedAt: Date;
}

// Rarity rates for pack generation
export const BOOSTER_PACK_RATES = {
  common: 0.50,
  rare: 0.30,
  epic: 0.15,
  legendary: 0.05
} as const;

// Available booster pack types
export const BOOSTER_PACK_TYPES = {
  standard: {
    id: 'standard',
    name: 'Standard Pack',
    description: 'Contains 1 Blueprint + 1 Part + 1 Item with standard drop rates',
    cost: {
      holosTokens: 100,
      gachaTickets: 10
    },
    guaranteed: 3,
    rarity: BOOSTER_PACK_RATES
  },
  premium: {
    id: 'premium',
    name: 'Premium Pack',
    description: 'Contains 1 Blueprint + 1 Part + 1 Item with increased rare+ drop rates',
    cost: {
      holosTokens: 250,
      gachaTickets: 25
    },
    guaranteed: 3,
    rarity: {
      common: 0.30,
      rare: 0.40,
      epic: 0.25,
      legendary: 0.05
    }
  },
  elite: {
    id: 'elite',
    name: 'Elite Pack',
    description: 'Contains 1 Blueprint + 1 Part + 1 Item with premium drop rates and high-tier guarantees',
    cost: {
      holosTokens: 400,
      gachaTickets: 40
    },
    guaranteed: 3,
    rarity: {
      common: 0.15,
      rare: 0.35,
      epic: 0.40,
      legendary: 0.10
    }
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary Pack',
    description: 'Contains 1 Blueprint + 1 Part + 1 Item with exclusive high-tier rewards',
    cost: {
      holosTokens: 1000,
      gachaTickets: 100
    },
    guaranteed: 3,
    rarity: {
      common: 0.00,
      rare: 0.10,
      epic: 0.50,
      legendary: 0.40
    }
  }
} as const;

export type BoosterPackType = keyof typeof BOOSTER_PACK_TYPES;

// Marketplace Booster Tiers (Rank-based)
export const MARKETPLACE_BOOSTER_TIERS = {
  common: {
    id: 'common',
    name: 'Common Rank Booster',
    description: 'Guaranteed 1 Blueprint + 1 Part + 1 Item with standard drop rates',
    price: 50,
    guaranteed: 3,
    rarity: {
      common: 0.71,
      rare: 0.20,
      epic: 0.08,
      legendary: 0.01
    }
  },
  champion: {
    id: 'champion',
    name: 'Champion Rank Booster',
    description: 'Guaranteed 1 Blueprint + 1 Part + 1 Item with improved drop rates',
    price: 100,
    guaranteed: 3,
    rarity: {
      common: 0.50,
      rare: 0.30,
      epic: 0.15,
      legendary: 0.05
    }
  },
  rare: {
    id: 'rare',
    name: 'Rare Rank Booster',
    description: 'Guaranteed 1 Blueprint + 1 Part + 1 Item with enhanced rare+ chances',
    price: 200,
    guaranteed: 3,
    rarity: {
      common: 0.30,
      rare: 0.40,
      epic: 0.25,
      legendary: 0.05
    }
  },
  elite: {
    id: 'elite',
    name: 'Elite Rank Booster',
    description: 'Guaranteed 1 Blueprint + 1 Part + 1 Item with premium drop rates',
    price: 400,
    guaranteed: 3,
    rarity: {
      common: 0.15,
      rare: 0.35,
      epic: 0.40,
      legendary: 0.10
    }
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary Rank Booster',
    description: 'Guaranteed 1 Blueprint + 1 Part + 1 Item with exclusive high-tier rewards',
    price: 0, // Not purchasable
    guaranteed: 3,
    rarity: {
      common: 0.00,
      rare: 0.10,
      epic: 0.50,
      legendary: 0.40
    }
  }
} as const;

export type MarketplaceBoosterTier = keyof typeof MARKETPLACE_BOOSTER_TIERS;

// Purchasable tiers (excluding legendary)
export const PURCHASABLE_BOOSTER_TIERS: MarketplaceBoosterTier[] = ['common', 'champion', 'rare', 'elite']; 