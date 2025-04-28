
import { PlayerRank, playerRankColors, playerRankOrder } from '../constants/playerRanks';

/**
 * Get the color associated with a player rank
 */
export const getPlayerRankColor = (rank: PlayerRank): string => {
  return playerRankColors[rank];
};

/**
 * Compare two player ranks
 * @returns negative if rank1 < rank2, 0 if equal, positive if rank1 > rank2
 */
export const comparePlayerRanks = (rank1: PlayerRank, rank2: PlayerRank): number => {
  return playerRankOrder.indexOf(rank1) - playerRankOrder.indexOf(rank2);
};

/**
 * Check if a player rank meets or exceeds a required rank
 */
export const meetsRankRequirement = (playerRank: PlayerRank, requiredRank: PlayerRank): boolean => {
  return comparePlayerRanks(playerRank, requiredRank) >= 0;
};

/**
 * Get the next rank in the progression
 * @returns the next rank or null if already at max rank
 */
export const getNextRank = (currentRank: PlayerRank): PlayerRank | null => {
  const currentIndex = playerRankOrder.indexOf(currentRank);
  if (currentIndex === playerRankOrder.length - 1) return null;
  return playerRankOrder[currentIndex + 1];
};

/**
 * Format a rank name for display (e.g., for UI elements)
 */
export const formatRankName = (rank: PlayerRank): string => {
  return rank.charAt(0).toUpperCase() + rank.slice(1).toLowerCase();
};
