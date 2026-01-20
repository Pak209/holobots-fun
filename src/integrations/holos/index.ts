/**
 * Holos Token Integration
 * Connects Holobots.fun with the Holos ecosystem contracts
 */

export const HOLOS_CONTRACTS = {
  // From the Holos submodule - these will need to be deployed
  HOLOS_TOKEN: import.meta.env.VITE_HOLOS_TOKEN_ADDRESS || '',
  RENTAL_CONVERSION_MANAGER: import.meta.env.VITE_RENTAL_CONVERSION_MANAGER_ADDRESS || '',
  TREASURY: import.meta.env.VITE_TREASURY_ADDRESS || '',
  STOCKPILE: import.meta.env.VITE_STOCKPILE_ADDRESS || '',
  GENESIS_NFT_MINTER: import.meta.env.VITE_GENESIS_NFT_MINTER_ADDRESS || '',
  SEASON1_NFT: import.meta.env.VITE_SEASON1_NFT_ADDRESS || '',
} as const;

export const CONVERSION_CONFIG = {
  // Base prices in USD cents (matches frontend tier requirements)
  TIER_PRICING: {
    COMMON: { usdCents: 500, holosTokens: 500 * 10**18, blueprintsRequired: 5, startLevel: 1 },     // $5.00 (5 blueprints → Level 1)
    CHAMPION: { usdCents: 1500, holosTokens: 1500 * 10**18, blueprintsRequired: 10, startLevel: 11 },  // $15.00 (10 blueprints → Level 11)
    RARE: { usdCents: 3500, holosTokens: 3500 * 10**18, blueprintsRequired: 20, startLevel: 21 },      // $35.00 (20 blueprints → Level 21)
    ELITE: { usdCents: 7500, holosTokens: 7500 * 10**18, blueprintsRequired: 40, startLevel: 31 },     // $75.00 (40 blueprints → Level 31)
    LEGENDARY: { usdCents: 12500, holosTokens: 12500 * 10**18, blueprintsRequired: 80, startLevel: 41 } // $125.00 (80 blueprints → Level 41)
  },
  
  // Discount rates
  DISCOUNTS: {
    PLAYER_RANK_MAX: 30, // 30% max discount based on player rank
    STOCKPILE_STAKE: 25, // 25% if staking in Stockpile
    QUEST_BONUS_MIN: 5,  // $5 min quest bonus
    QUEST_BONUS_MAX: 10, // $10 max quest bonus
    HOLOS_PAYMENT: 20    // 20% discount for paying with Holos
  },
  
  // Season configuration
  SEASON: {
    RENTAL_DURATION_DAYS: 90,
    EXPIRY_WARNING_DAYS: 7,
    GRACE_PERIOD_DAYS: 3
  }
} as const;

export type TierType = keyof typeof CONVERSION_CONFIG.TIER_PRICING;
export type PaymentMethod = 'usdc' | 'eth' | 'holos';

export interface ConversionPricing {
  basePriceUSD: number;
  playerRankDiscount: number;
  stockpileDiscount: number;
  questBonus: number;
  holosDiscount: number;
  finalPriceUSD: number;
  paymentAmounts: {
    usdc: string;  // USDC amount (6 decimals)
    eth: string;   // ETH amount (18 decimals)
    holos: string; // HOLOS amount (18 decimals)
  };
}

export interface SeasonalRental {
  id: string;
  holobotKey: string;
  name: string;
  tier: TierType;
  level: number;
  experience: number;
  seasonId: string;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  canConvert: boolean;
  isPermanent?: boolean; // If true, this rental does not expire
  conversionPricing: ConversionPricing;
}

// Type guards and utilities
export const isTierType = (tier: string): tier is TierType => {
  return tier.toUpperCase() in CONVERSION_CONFIG.TIER_PRICING;
};

export const isPaymentMethod = (method: string): method is PaymentMethod => {
  return ['usdc', 'eth', 'holos'].includes(method);
};
