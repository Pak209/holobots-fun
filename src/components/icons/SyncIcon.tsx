import React from 'react';
import { cn } from '@/lib/utils';
import SyncSvg from '@/assets/icons/Sync.svg';

interface SyncIconProps {
  isActive?: boolean;
  className?: string;
}

/**
 * Sync Training Icon Component  
 */
export const SyncIcon: React.FC<SyncIconProps> = ({ isActive = false, className = '' }) => {
  return (
    <img 
      src={SyncSvg}
      alt="Sync"
      className={cn(
        'object-contain transition-all duration-300',
        isActive ? 'brightness-125 saturate-150' : '',
        className
      )}
    />
  );
};
