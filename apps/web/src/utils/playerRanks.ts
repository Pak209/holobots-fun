import { PlayerRank } from '@/constants/playerRanks';

/**
 * Returns a color based on the player's rank
 * @param rank The player's rank
 * @returns A CSS color value (hex code)
 */
export function getPlayerRankColor(rank: PlayerRank): string {
  switch (rank) {
    case 'Rookie':
      return '#6B7280'; // gray-500
    case 'Scout':
      return '#10B981'; // emerald-500
    case 'Champion':
      return '#3B82F6'; // blue-500
    case 'Elite':
      return '#8B5CF6'; // violet-500
    case 'Legend':
      return '#F59E0B'; // amber-500
    case 'Mythic':
      return '#EF4444'; // red-500
    default:
      return '#6B7280'; // gray-500 (default)
  }
} 