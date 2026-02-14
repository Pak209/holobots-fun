import React from 'react';
import { cn } from '@/lib/utils';
import { DashboardIcon } from './DashboardIcon';
import { ArenaIcon } from './ArenaIcon';
import { SyncIcon } from './SyncIcon';
import { MarketplaceIcon } from './MarketplaceIcon';

interface NavIconProps {
  iconName: 'dashboard' | 'arena' | 'sync' | 'marketplace';
  isActive?: boolean;
  className?: string;
}

/**
 * NavIcon - Wrapper component for navigation SVG icons
 * Applies proper styling based on active state following the mecha-fitness design system
 */
export const NavIcon: React.FC<NavIconProps> = ({ iconName, isActive = false, className }) => {
  const getIconComponent = () => {
    switch (iconName) {
      case 'dashboard':
        return <DashboardIcon isActive={isActive} className={className} />;
      case 'arena':
        return <ArenaIcon isActive={isActive} className={className} />;
      case 'sync':
        return <SyncIcon isActive={isActive} className={className} />;
      case 'marketplace':
        return <MarketplaceIcon isActive={isActive} className={className} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        isActive ? 'text-[#FFC627]' : 'text-[#33C3F0]',
        'hover:scale-110 hover:text-[#FFC627]'
      )}
    >
      {getIconComponent()}
    </div>
  );
};
