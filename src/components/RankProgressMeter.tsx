
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { getNextRank, playerRankRequirements } from '@/constants/playerRanks';
import type { PlayerRank } from '@/constants/playerRanks';

interface RankCounts {
  rare: number;
  champion: number;
  elite: number;
  legendary: number;
  prestiged: number;
}

interface RankProgressMeterProps {
  currentRank: PlayerRank;
  counts: RankCounts;
}

export const RankProgressMeter: React.FC<RankProgressMeterProps> = ({ 
  currentRank, 
  counts 
}) => {
  const nextRank = getNextRank(currentRank);
  
  if (!nextRank) {
    // Already at maximum rank
    return (
      <div className="space-y-2">
        <div className="text-xs text-green-400 font-medium">Maximum Rank Achieved!</div>
        <Progress value={100} className="h-2" />
      </div>
    );
  }

  // Calculate progress percentage based on requirements for the next rank
  const getProgressPercentage = (): number => {
    switch (nextRank) {
      case 'Scout':
        // Need 1 Rare Holobot
        return Math.min(counts.rare / 1 * 100, 100);
      case 'Champion':
        // Need 1 Champion Holobot
        return Math.min(counts.champion / 1 * 100, 100);
      case 'Elite':
        // Need 10 Elite Holobots
        return Math.min(counts.elite / 10 * 100, 100);
      case 'Legend':
        // Need 10 Legendary Holobots
        return Math.min(counts.legendary / 10 * 100, 100);
      case 'Mythic':
        // Need 10 Legendary AND 5 Prestiged Holobots
        const legendaryProgress = Math.min(counts.legendary / 10, 1);
        const prestigedProgress = Math.min(counts.prestiged / 5, 1);
        return Math.min((legendaryProgress + prestigedProgress) / 2 * 100, 100);
      default:
        return 0;
    }
  };

  const progressPercentage = getProgressPercentage();
  const requirement = playerRankRequirements[nextRank];

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-blue-400">Progress to {nextRank}</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="text-xs text-gray-400">
        {requirement}
      </div>
    </div>
  );
};
