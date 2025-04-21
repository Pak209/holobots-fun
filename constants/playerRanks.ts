export type PlayerRank = 'Rookie' | 'Scout' | 'Champion' | 'Elite' | 'Legend' | 'Mythic';

export const playerRankColors: Record<PlayerRank, string> = {
  Rookie: '#cccccc',
  Scout: '#4caf50',
  Champion: '#2196f3',
  Elite: '#9c27b0',
  Legend: '#ff9800',
  Mythic: '#f44336',
} as const;

// Rank requirements for reference
export const playerRankRequirements = {
  Rookie: 'No Elite or Legendary Holobots',
  Scout: '≥1 Rare Holobot',
  Champion: '≥1 Champion Holobot',
  Elite: '≥10 Elite Holobots',
  Legend: '≥10 Legendary Holobots',
  Mythic: '≥10 Legendary AND ≥5 Prestiged Holobots',
} as const;

// For ordering and comparison
export const playerRankOrder: PlayerRank[] = [
  'Rookie',
  'Scout',
  'Champion',
  'Elite',
  'Legend',
  'Mythic',
] as const; 