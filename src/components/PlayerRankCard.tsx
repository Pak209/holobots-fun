import { calculatePlayerRank } from '@/types/playerRank';
import { PlayerRankBadge } from './PlayerRankBadge';
import { UserProfile } from '@/types/user';
import React, { useMemo } from 'react';

interface PlayerRankCardProps {
  user: UserProfile;
}

export const PlayerRankCard: React.FC<PlayerRankCardProps> = ({
  user
}) => {
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
    prestigedCount
  });

  // Calculate max level from user's holobots (similar to Leaderboard component)
  const maxLevel = useMemo(() => {
    if (holobots && holobots.length > 0) {
      const levels = holobots.map((h: any) => h.level || 1);
      return Math.max(...levels);
    }
    return 1;
  }, [holobots]);

  return (
    <div className="rounded-xl border border-gray-600 bg-black/40 p-3 mb-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg text-white">Level {maxLevel}</span>
        <PlayerRankBadge rank={currentRank} size="md" />
      </div>
    </div>
  );
};