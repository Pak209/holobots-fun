
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { PlayerRank, playerRankRequirements } from '../constants/playerRanks';
import { getPlayerRankColor, getNextRank } from '../utils/playerRanks';
import { PlayerRankBadge } from './PlayerRankBadge';

interface RankProgressMeterProps {
  currentRank: PlayerRank;
  // Current counts for progression tracking
  counts: {
    rare: number;
    champion: number;
    elite: number;
    legendary: number;
    prestiged: number;
  };
}

export const RankProgressMeter: React.FC<RankProgressMeterProps> = ({
  currentRank,
  counts,
}) => {
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return null; // No progression to show for max rank

  // Calculate progress based on next rank requirements
  const getProgress = (): { current: number; required: number } => {
    switch (nextRank) {
      case 'Scout':
        return { current: counts.rare, required: 1 };
      case 'Champion':
        return { current: counts.champion, required: 1 };
      case 'Elite':
        return { current: counts.elite, required: 10 };
      case 'Legend':
        return { current: counts.legendary, required: 10 };
      case 'Mythic':
        // For Mythic, we show the lower of legendary/prestige progress
        const legendaryProgress = counts.legendary >= 10 ? 1 : counts.legendary / 10;
        const prestigeProgress = counts.prestiged >= 5 ? 1 : counts.prestiged / 5;
        return {
          current: Math.min(counts.legendary, counts.prestiged * 2),
          required: 10, // We'll show progress relative to legendary requirement
        };
      default:
        return { current: 0, required: 1 };
    }
  };

  const progress = getProgress();
  const progressPercent = Math.min((progress.current / progress.required) * 100, 100);
  const nextRankColor = getPlayerRankColor(nextRank);

  return (
    <View className="w-full space-y-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-gray-500">Next Rank:</Text>
        <PlayerRankBadge rank={nextRank} size="sm" />
      </View>
      
      {/* Progress bar */}
      <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <View 
          className="h-full rounded-full"
          style={{ 
            width: `${progressPercent}%`,
            backgroundColor: nextRankColor,
          }} 
        />
      </View>

      {/* Requirements */}
      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-gray-500">
          Progress: {progress.current}/{progress.required}
        </Text>
        <Pressable
          className="px-2 py-1 rounded-md"
          style={{ backgroundColor: `${nextRankColor}15` }}
        >
          <Text style={{ color: nextRankColor }} className="text-xs">
            {playerRankRequirements[nextRank]}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
