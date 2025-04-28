// Define player ranks
export type PlayerRank = 'Rookie' | 'Scout' | 'Champion' | 'Elite' | 'Legend' | 'Mythic';

// Define rank progression
const RANK_ORDER: PlayerRank[] = ['Rookie', 'Scout', 'Champion', 'Elite', 'Legend', 'Mythic'];

// Function to get the next rank in progression
export function getNextRank(currentRank: PlayerRank): PlayerRank | null {
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  if (currentIndex < 0 || currentIndex >= RANK_ORDER.length - 1) {
    return null; // Invalid rank or already at max rank
  }
  return RANK_ORDER[currentIndex + 1];
}

// Define the requirements for each rank
export const playerRankRequirements: Record<PlayerRank, string> = {
  'Rookie': 'Starting rank',
  'Scout': 'Collect 1 Rare Holobot',
  'Champion': 'Collect 1 Champion Holobot',
  'Elite': 'Collect 10 Elite Holobots',
  'Legend': 'Collect 10 Legendary Holobots',
  'Mythic': 'Collect 10 Legendary and 5 Prestiged Holobots',
}; 