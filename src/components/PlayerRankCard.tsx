import { PlayerRank, PLAYER_RANKS, playerRankColors, playerRankRequirements, calculatePlayerRank } from '@/types/playerRank';
import { PlayerRankBadge } from './PlayerRankBadge';
import { Progress } from './ui/progress';
import { UserProfile } from '@/types/user';
import React, { useMemo } from 'react';

interface PlayerRankCardProps {
  user: UserProfile;
}

const getNextRank = (current: PlayerRank): PlayerRank | null => {
  const order = [
    PLAYER_RANKS.ROOKIE,
    PLAYER_RANKS.CHAMPION,
    PLAYER_RANKS.RARE,
    PLAYER_RANKS.ELITE,
    PLAYER_RANKS.LEGEND,
    PLAYER_RANKS.MYTHIC,
  ];
  const idx = order.indexOf(current);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
};

const getRequirementText = (next: PlayerRank | null): string => {
  switch (next) {
    case PLAYER_RANKS.CHAMPION:
      return 'Collect 10 Champion, Rare, Elite, or Legendary Holobots';
    case PLAYER_RANKS.RARE:
      return 'Collect 10 Rare, Elite, or Legendary Holobots';
    case PLAYER_RANKS.ELITE:
      return 'Collect 10 Elite or Legendary Holobots';
    case PLAYER_RANKS.LEGEND:
      return 'Collect 10 Legendary Holobots';
    case PLAYER_RANKS.MYTHIC:
      return 'Collect 10 Legendary Holobots and 5 Prestiged Holobots';
    default:
      return '';
  }
};

const getProgress = (user: UserProfile, current: PlayerRank, next: PlayerRank | null): number => {
  if (!next) return 1;
  const holobots = user.holobots || [];
  const championCount = holobots.filter(h => h.rank === 'Champion').length;
  const rareCount = holobots.filter(h => h.rank === 'Rare').length;
  const eliteCount = holobots.filter(h => h.rank === 'Elite').length;
  const legendaryCount = holobots.filter(h => h.rank === 'Legendary').length;
  const prestigedCount = holobots.filter(h => h.prestiged).length;
  switch (next) {
    case PLAYER_RANKS.CHAMPION:
      return Math.min((championCount + rareCount + eliteCount + legendaryCount) / 10, 1);
    case PLAYER_RANKS.RARE:
      return Math.min((rareCount + eliteCount + legendaryCount) / 10, 1);
    case PLAYER_RANKS.ELITE:
      return Math.min((eliteCount + legendaryCount) / 10, 1);
    case PLAYER_RANKS.LEGEND:
      return Math.min(legendaryCount / 10, 1);
    case PLAYER_RANKS.MYTHIC:
      const leg = Math.min(legendaryCount / 10, 1);
      const pre = Math.min(prestigedCount / 5, 1);
      return (leg + pre) / 2;
    default:
      return 1;
  }
};

export const PlayerRankCard: React.FC<PlayerRankCardProps> = ({ user }) => {
  const holobots = user.holobots || [];
  const championCount = holobots.filter(h => h.rank === 'Champion').length;
  const rareCount = holobots.filter(h => h.rank === 'Rare').length;
  const eliteCount = holobots.filter(h => h.rank === 'Elite').length;
  const legendaryCount = holobots.filter(h => h.rank === 'Legendary').length;
  const prestigedCount = holobots.filter(h => h.prestiged).length;

  const currentRank = calculatePlayerRank({
    championCount,
    rareCount,
    eliteCount,
    legendaryCount,
    prestigedCount,
  });
  const nextRank = useMemo(() => getNextRank(currentRank), [currentRank]);
  const progress = useMemo(() => getProgress(user, currentRank, nextRank), [user, currentRank, nextRank]);
  const requirement = useMemo(() => getRequirementText(nextRank), [nextRank]);

  return (
    <div className="rounded-xl border border-gray-600 bg-black/40 p-4 mb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-lg text-white">Player Rank</span>
        <PlayerRankBadge rank={currentRank} size="md" />
      </div>
      {nextRank && (
        <>
          <div className="text-gray-200 text-sm mb-1">Progress to {nextRank}</div>
          <Progress value={progress * 100} className="h-2 bg-gray-700 mb-1" />
          <div className="text-xs text-blue-400 font-medium mt-1">{requirement}</div>
        </>
      )}
      {!nextRank && (
        <div className="text-green-400 text-sm mt-2">Max Rank Achieved!</div>
      )}
    </div>
  );
}; 