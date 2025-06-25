import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { Part, TIER_COLORS, ELEMENTAL_TYPES } from '../../types/holobotParts';
import { cn } from '@/lib/utils';
import { Zap, Star, Diamond, Circle, Flame, Snowflake, Bolt, Brain, Wind, Mountain } from 'lucide-react';

interface PartCardProps {
  part: Part;
  onPress?: () => void;
  isEquipped?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PartCard: React.FC<PartCardProps> = ({
  part,
  onPress,
  isEquipped = false,
  showDetails = true,
  size = 'md',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const sizeClasses = {
    sm: 'w-24 h-32',
    md: 'w-32 h-40',
    lg: 'w-40 h-48',
  };

  const tierColor = TIER_COLORS[part.tier];
  const isMythic = part.tier === 'mythic';

  const getTierIcon = () => {
    switch (part.tier) {
      case 'mythic':
        return <Star className="w-3 h-3" />;
      case 'legendary':
        return <Star className="w-3 h-3" />;
      case 'epic':
        return <Diamond className="w-3 h-3" />;
      case 'rare':
        return <Diamond className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  const getElementIcon = (elementType: string) => {
    switch (elementType) {
      case 'fire':
        return <Flame className="w-3 h-3" />;
      case 'ice':
        return <Snowflake className="w-3 h-3" />;
      case 'electric':
        return <Bolt className="w-3 h-3" />;
      case 'psychic':
        return <Brain className="w-3 h-3" />;
      case 'wind':
        return <Wind className="w-3 h-3" />;
      case 'earth':
        return <Mountain className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  const renderTierBadge = () => (
    <div className={cn(
      'absolute top-1 right-1 px-2 py-1 rounded-full',
      'flex items-center space-x-1',
      isDark ? 'bg-gray-800' : 'bg-gray-100',
      `border border-${tierColor}`
    )}>
      {getTierIcon()}
      <span className={cn(
        'text-xs font-medium',
        isDark ? 'text-gray-200' : 'text-gray-800'
      )}>
        {part.tier.charAt(0).toUpperCase() + part.tier.slice(1)}
      </span>
    </div>
  );

  const renderElementalBadge = () => {
    if (!part.specialAttackVariant) return null;

    return (
      <div className={cn(
        'absolute bottom-1 left-1 px-2 py-1 rounded-full',
        'flex items-center space-x-1',
        isDark ? 'bg-gray-800' : 'bg-gray-100',
        'border border-gray-400'
      )}>
        {getElementIcon(part.specialAttackVariant.elementType)}
        <span className={cn(
          'text-xs font-medium',
          isDark ? 'text-gray-200' : 'text-gray-800'
        )}>
          {part.specialAttackVariant.elementType}
        </span>
      </div>
    );
  };

  const renderStats = () => {
    if (!showDetails) return null;

    return (
      <div className="mt-2 space-y-1">
        {Object.entries(part.baseStats).map(([stat, value]) => (
          <div key={stat} className="flex justify-between">
            <span className={cn(
              'text-xs',
              isDark ? 'text-gray-400' : 'text-gray-600'
            )}>
              {stat.charAt(0).toUpperCase() + stat.slice(1)}
            </span>
            <span className={cn(
              'text-xs font-medium',
              value > 0 ? 'text-green-500' : 'text-red-500'
            )}>
              {value > 0 ? '+' : ''}{value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      onClick={onPress}
      className={cn(
        'relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300',
        sizeClasses[size],
        isDark ? 'bg-gray-800' : 'bg-white',
        'border',
        isEquipped ? 'border-green-500' : `border-${tierColor}`,
        'shadow-lg hover:shadow-xl hover:scale-105',
        part.tier !== 'common' && 'animate-pulse'
      )}
    >
      {/* Tier Glow Effect */}
      {part.tier !== 'common' && (
        <div
          className={cn(
            'absolute inset-0',
            `bg-${tierColor}`,
            'opacity-20'
          )}
        />
      )}

      {/* Content */}
      <div className="p-3 relative z-10">
        <h3 className={cn(
          'font-bold text-lg mb-1',
          isDark ? 'text-white' : 'text-gray-900'
        )}>
          {part.name}
        </h3>
        
        <p className={cn(
          'text-sm mb-2',
          isDark ? 'text-gray-400' : 'text-gray-600'
        )}>
          {part.description}
        </p>

        {renderStats()}
      </div>

      {/* Badges */}
      {renderTierBadge()}
      {renderElementalBadge()}

      {/* Equipped Indicator */}
      {isEquipped && (
        <div className="absolute top-1 left-1">
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
      )}
    </div>
  );
}; 