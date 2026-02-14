import React from 'react';
import { cn } from '@/lib/utils';
import InventorySvg from '@/assets/icons/Inventory.svg';

interface DashboardIconProps {
  isActive?: boolean;
  className?: string;
}

/**
 * Dashboard/Inventory Icon Component
 */
export const DashboardIcon: React.FC<DashboardIconProps> = ({ isActive = false, className = '' }) => {
  return (
    <img 
      src={InventorySvg}
      alt="Dashboard"
      className={cn(
        'object-contain transition-all duration-300',
        isActive ? 'brightness-125 saturate-150' : '',
        className
      )}
    />
  );
};
