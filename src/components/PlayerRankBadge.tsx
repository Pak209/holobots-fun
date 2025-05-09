
import { PlayerRank, playerRankColors } from '@/types/playerRank';
import React from 'react';

interface PlayerRankBadgeProps {
  rank: PlayerRank;
  size?: 'sm' | 'md' | 'lg';
}

export const PlayerRankBadge: React.FC<PlayerRankBadgeProps> = ({ rank, size = 'md' }) => {
  const bgColor = playerRankColors[rank];
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  return (
    <div 
      className={`rounded-md ${sizeClasses[size]} font-semibold inline-flex items-center justify-center`}
      style={{ backgroundColor: bgColor, color: '#000000' }}
    >
      {rank}
    </div>
  );
};
