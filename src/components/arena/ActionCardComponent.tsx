// ============================================================================
// Action Card Component
// Individual card display and interaction
// ============================================================================

import { useState } from 'react';
import type { ActionCard } from '@/types/arena';
import { useArenaBattleStore } from '@/stores/arena-battle-store';

interface ActionCardComponentProps {
  card: ActionCard;
  onPlay: (cardId: string) => void;
  disabled?: boolean;
}

export function ActionCardComponent({ card, onPlay, disabled = false }: ActionCardComponentProps) {
  const canPlayCard = useArenaBattleStore((state) => state.canPlayCard);
  const [isHovered, setIsHovered] = useState(false);

  const canPlay = !disabled && canPlayCard(card.id);

  // Card type colors
  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'strike':
        return 'bg-gradient-to-br from-red-600 to-red-800';
      case 'defense':
        return 'bg-gradient-to-br from-blue-600 to-blue-800';
      case 'combo':
        return 'bg-gradient-to-br from-orange-600 to-orange-800';
      case 'finisher':
        return 'bg-gradient-to-br from-purple-600 to-purple-900';
      case 'special':
        return 'bg-gradient-to-br from-cyan-600 to-cyan-800';
      default:
        return 'bg-gradient-to-br from-gray-600 to-gray-800';
    }
  };

  return (
    <button
      onClick={() => canPlay && onPlay(card.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={!canPlay}
      className={`
        relative w-20 h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 rounded-lg p-1.5 sm:p-2 shrink-0
        flex flex-col items-center justify-between
        border-2 transition-all duration-200
        ${getCardTypeColor(card.type)}
        ${canPlay
          ? 'cursor-pointer hover:scale-105 hover:-translate-y-2 border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/50'
          : 'opacity-50 cursor-not-allowed border-gray-600'
        }
        ${isHovered && canPlay ? 'z-10' : ''}
      `}
    >
      {/* Card Type Badge */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[8px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 rounded-full uppercase">
        {card.type}
      </div>

      {/* Card Icon/Visual */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center mt-1 sm:mt-2">
        <span className="text-xl sm:text-2xl md:text-3xl">
          {card.type === 'strike' && '👊'}
          {card.type === 'defense' && '🛡️'}
          {card.type === 'combo' && '⚡'}
          {card.type === 'finisher' && '💥'}
          {card.type === 'special' && '✨'}
        </span>
      </div>

      {/* Card Name */}
      <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-white text-center leading-tight">
        {card.name}
      </span>

      {/* Stamina Cost */}
      <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-black/80 rounded-full flex items-center justify-center border border-yellow-400">
        <span className="text-[9px] sm:text-[10px] md:text-xs text-yellow-400 font-bold">{card.staminaCost}</span>
      </div>

      {/* Damage (for strike cards) */}
      {card.baseDamage > 0 && (
        <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 px-1.5 sm:px-2 py-0.5 bg-red-600 rounded text-[9px] sm:text-[10px] md:text-xs text-white font-bold">
          {card.baseDamage}
        </div>
      )}

      {/* Hover Tooltip */}
      {isHovered && canPlay && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black/95 text-white text-xs p-2 rounded-lg border border-yellow-400 z-20 pointer-events-none">
          <p className="font-bold mb-1">{card.name}</p>
          <p className="text-gray-300 mb-1">{card.description}</p>
          <div className="flex gap-2 text-xxs">
            <span className="text-yellow-400">Cost: {card.staminaCost}</span>
            {card.baseDamage > 0 && <span className="text-red-400">DMG: {card.baseDamage}</span>}
          </div>
        </div>
      )}
    </button>
  );
}
