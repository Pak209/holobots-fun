import React from 'react';
import { cn } from '@/lib/utils';
import ArenaSvg from '@/assets/icons/Arena.svg';

interface ArenaIconProps {
  isActive?: boolean;
  className?: string;
}

/**
 * Arena Icon Component
 */
export const ArenaIcon: React.FC<ArenaIconProps> = ({ isActive = false, className = '' }) => {
  return (
    <img 
      src={ArenaSvg}
      alt="Arena"
      className={cn(
        'object-contain transition-all duration-300',
        isActive ? 'brightness-125 saturate-150' : '',
        className
      )}
    />
  );
};
