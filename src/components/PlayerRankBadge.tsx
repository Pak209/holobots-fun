
import React from 'react';
import { Badge } from './ui/badge';
import { getPlayerRankColor } from '@/utils/playerRanks';
import { PlayerRank } from '@/constants/playerRanks';

interface PlayerRankBadgeProps {
  rank: PlayerRank;
  size?: 'sm' | 'md' | 'lg';
}

export const PlayerRankBadge: React.FC<PlayerRankBadgeProps> = ({ 
  rank, 
  size = 'md' 
}) => {
  const rankColor = getPlayerRankColor(rank);
  
  // Determine font size based on the size prop
  const fontSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];
  
  // Determine padding based on the size prop
  const padding = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5',
  }[size];

  return (
    <Badge 
      className={`${fontSize} ${padding} font-medium`}
      style={{ 
        backgroundColor: rankColor,
        color: '#fff',
        textShadow: '0px 1px 2px rgba(0,0,0,0.3)'
      }}
    >
      {rank}
    </Badge>
  );
};
