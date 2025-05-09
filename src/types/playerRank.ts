export const PLAYER_RANKS = {
  ROOKIE: 'Rookie',
  CHAMPION: 'Champion',
  RARE: 'Rare',
  ELITE: 'Elite',
  LEGEND: 'Legend',
  MYTHIC: 'Mythic',
} as const;

export type PlayerRank = typeof PLAYER_RANKS[keyof typeof PLAYER_RANKS];

export const playerRankColors = {
  [PLAYER_RANKS.ROOKIE]: '#cccccc',
  [PLAYER_RANKS.CHAMPION]: '#4caf50',
  [PLAYER_RANKS.RARE]: '#2196f3',
  [PLAYER_RANKS.ELITE]: '#9c27b0',
  [PLAYER_RANKS.LEGEND]: '#ff9800',
  [PLAYER_RANKS.MYTHIC]: '#f44336',
} as const;

export const playerRankRequirements = {
  [PLAYER_RANKS.ROOKIE]: {
    eliteCount: 0,
    legendaryCount: 0,
    prestigedCount: 0,
  },
  [PLAYER_RANKS.CHAMPION]: {
    eliteCount: 0,
    legendaryCount: 0,
    prestigedCount: 0,
  },
  [PLAYER_RANKS.RARE]: {
    eliteCount: 0,
    legendaryCount: 0,
    prestigedCount: 0,
  },
  [PLAYER_RANKS.ELITE]: {
    eliteCount: 10,
    legendaryCount: 0,
    prestigedCount: 0,
  },
  [PLAYER_RANKS.LEGEND]: {
    eliteCount: 0,
    legendaryCount: 10,
    prestigedCount: 0,
  },
  [PLAYER_RANKS.MYTHIC]: {
    eliteCount: 0,
    legendaryCount: 10,
    prestigedCount: 5,
  },
} as const;

export interface PlayerRankStats {
  championCount: number;
  rareCount: number;
  eliteCount: number;
  legendaryCount: number;
  prestigedCount: number;
}

export function calculatePlayerRank(stats: PlayerRankStats): PlayerRank {
  const totalChampion = stats.championCount + stats.rareCount + stats.eliteCount + stats.legendaryCount;
  const totalRare = stats.rareCount + stats.eliteCount + stats.legendaryCount;
  const totalElite = stats.eliteCount + stats.legendaryCount;
  if (stats.legendaryCount >= 10 && stats.prestigedCount >= 5) {
    return PLAYER_RANKS.MYTHIC;
  }
  if (stats.legendaryCount >= 10) {
    return PLAYER_RANKS.LEGEND;
  }
  if (totalElite >= 10) {
    return PLAYER_RANKS.ELITE;
  }
  if (totalRare >= 10) {
    return PLAYER_RANKS.RARE;
  }
  if (totalChampion >= 10) {
    return PLAYER_RANKS.CHAMPION;
  }
  return PLAYER_RANKS.ROOKIE;
} 