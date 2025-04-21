import React from 'react';
import { Text, View } from 'react-native';
import { PlayerRank } from '../constants/playerRanks';
import { getPlayerRankColor, formatRankName } from '../utils/playerRanks';

interface PlayerRankBadgeProps {
  rank: PlayerRank;
  showBorder?: boolean;
  size?: 'sm' | 'md' | 'lg';
  prestige?: number;
}

export const PlayerRankBadge: React.FC<PlayerRankBadgeProps> = ({
  rank,
  showBorder = true,
  size = 'md',
  prestige,
}) => {
  const rankColor = getPlayerRankColor(rank);
  
  // Size-based styles
  const containerStyles = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  };

  const textStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <View className={`
      flex-row items-center gap-1.5
      rounded-full
      ${containerStyles[size]}
      ${showBorder ? 'border' : ''}
    `}
    style={{
      borderColor: rankColor,
      backgroundColor: `${rankColor}15`, // 15 = 10% opacity in hex
    }}>
      <Text
        className={`
          font-semibold
          ${textStyles[size]}
        `}
        style={{ color: rankColor }}>
        {formatRankName(rank)}
      </Text>
      
      {prestige !== undefined && prestige > 0 && (
        <>
          <Text style={{ color: rankColor }}>•</Text>
          <Text
            className={`
              font-medium
              ${textStyles[size]}
            `}
            style={{ color: rankColor }}>
            {prestige}
          </Text>
        </>
      )}
    </View>
  );
}; 