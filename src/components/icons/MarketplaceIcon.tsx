import React from 'react';
import { cn } from '@/lib/utils';
import MarketplaceSvg from '@/assets/icons/Marketplace.svg';

interface MarketplaceIconProps {
  isActive?: boolean;
  className?: string;
}

/**
 * Marketplace Icon Component
 */
export const MarketplaceIcon: React.FC<MarketplaceIconProps> = ({ isActive = false, className = '' }) => {
  return (
    <img 
      src={MarketplaceSvg}
      alt="Marketplace"
      className={cn(
        'object-contain transition-all duration-300',
        isActive ? 'brightness-125 saturate-150' : '',
        className
      )}
    />
  );
};
