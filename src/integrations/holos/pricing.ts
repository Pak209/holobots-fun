/**
 * Pricing calculation logic for rental-to-NFT conversions
 * Implements the discount stacking system from RentalConversionManager.sol
 */

import { CONVERSION_CONFIG, type TierType, type ConversionPricing } from './index';
import { UserProfile } from '@/types/user';

export interface PlayerDiscountData {
  playerRank: number;        // 0-7 (ROOKIE to LEGENDARY)
  stockpileStakeAmount: number; // Amount staked in Stockpile contract
  questBonusUSD: number;     // Quest achievement bonus in USD cents
  hasGenesisNFT: boolean;    // Whether player owns Genesis NFT
}

/**
 * Calculate player rank discount (0-30% based on level/rank)
 */
export const calculatePlayerRankDiscount = (user: UserProfile): number => {
  const playerLevel = user.level || 1;
  
  // Map player level to rank discount percentage
  if (playerLevel >= 100) return 30;      // LEGENDARY - 30%
  if (playerLevel >= 75) return 25;       // MASTER - 25%
  if (playerLevel >= 50) return 20;       // DIAMOND - 20%
  if (playerLevel >= 35) return 15;       // PLATINUM - 15%
  if (playerLevel >= 20) return 10;       // GOLD - 10%
  if (playerLevel >= 10) return 5;        // SILVER - 5%
  if (playerLevel >= 5) return 2;         // BRONZE - 2%
  return 0;                               // ROOKIE - 0%
};

/**
 * Calculate quest bonus based on user achievements
 */
export const calculateQuestBonus = (user: UserProfile): number => {
  const wins = user.stats?.wins || 0;
  const level = user.level || 1;
  
  // Base quest bonus calculation
  let bonus = 0;
  
  // Victory-based bonus
  if (wins >= 100) bonus += 5;
  if (wins >= 500) bonus += 3;
  if (wins >= 1000) bonus += 2;
  
  // Level-based bonus
  if (level >= 25) bonus += 3;
  if (level >= 50) bonus += 4;
  if (level >= 75) bonus += 3;
  
  // Cap at min/max
  return Math.min(
    Math.max(bonus, CONVERSION_CONFIG.DISCOUNTS.QUEST_BONUS_MIN),
    CONVERSION_CONFIG.DISCOUNTS.QUEST_BONUS_MAX
  );
};

/**
 * Calculate total conversion pricing with all discounts
 */
export const calculateConversionPricing = (
  tier: TierType,
  user: UserProfile,
  stockpileStakeAmount: number = 0,
  payWithHolos: boolean = false
): ConversionPricing => {
  const basePricing = CONVERSION_CONFIG.TIER_PRICING[tier];
  const basePriceUSD = basePricing.usdCents / 100; // Convert cents to dollars
  
  // Calculate individual discounts
  const playerRankDiscount = calculatePlayerRankDiscount(user);
  const stockpileDiscount = stockpileStakeAmount > 0 ? CONVERSION_CONFIG.DISCOUNTS.STOCKPILE_STAKE : 0;
  const questBonus = calculateQuestBonus(user);
  const holosDiscount = payWithHolos ? CONVERSION_CONFIG.DISCOUNTS.HOLOS_PAYMENT : 0;
  
  // Apply percentage discounts first
  let discountedPrice = basePriceUSD;
  discountedPrice *= (1 - playerRankDiscount / 100);
  discountedPrice *= (1 - stockpileDiscount / 100);
  discountedPrice *= (1 - holosDiscount / 100);
  
  // Apply fixed quest bonus (subtract from price)
  discountedPrice = Math.max(0, discountedPrice - questBonus);
  
  const finalPriceUSD = Math.max(1, discountedPrice); // Minimum $1
  
  // Calculate payment amounts (placeholder - would need price oracles)
  const usdcAmount = (finalPriceUSD * 1000000).toString(); // 6 decimals
  const ethAmount = (finalPriceUSD / 3000 * 10**18).toString(); // Assume $3000 ETH
  const holosAmount = basePricing.holosTokens.toString(); // 18 decimals
  
  return {
    basePriceUSD,
    playerRankDiscount,
    stockpileDiscount,
    questBonus,
    holosDiscount,
    finalPriceUSD,
    paymentAmounts: {
      usdc: usdcAmount,
      eth: ethAmount,
      holos: holosAmount
    }
  };
};

/**
 * Get tier from blueprint count (matches current system)
 */
export const getTierFromBlueprintCount = (blueprintCount: number): TierType => {
  if (blueprintCount >= 80) return 'LEGENDARY';
  if (blueprintCount >= 40) return 'ELITE';
  if (blueprintCount >= 20) return 'RARE';
  if (blueprintCount >= 10) return 'CHAMPION';
  if (blueprintCount >= 5) return 'COMMON';
  return 'COMMON'; // Default to COMMON if less than 5
};

/**
 * Check if rental is expiring soon
 */
export const isRentalExpiring = (expiresAt: string): boolean => {
  const expiryDate = new Date(expiresAt);
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + CONVERSION_CONFIG.SEASON.EXPIRY_WARNING_DAYS);
  return expiryDate <= warningDate;
};

/**
 * Check if rental has expired
 */
export const isRentalExpired = (expiresAt: string): boolean => {
  return new Date(expiresAt) <= new Date();
};

/**
 * Calculate rental expiry date from creation
 */
export const calculateRentalExpiry = (createdAt: string): string => {
  const created = new Date(createdAt);
  created.setDate(created.getDate() + CONVERSION_CONFIG.SEASON.RENTAL_DURATION_DAYS);
  return created.toISOString();
};
