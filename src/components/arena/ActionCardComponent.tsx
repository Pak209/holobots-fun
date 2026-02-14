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

  // Card type colors (HUD style)
  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'strike':
        return 'from-red-700 to-red-900 border-red-500';
      case 'defense':
        return 'from-blue-700 to-blue-900 border-blue-400';
      case 'combo':
        return 'from-yellow-600 to-yellow-800 border-[#F5C400]';
      case 'finisher':
        return 'from-purple-700 to-purple-900 border-purple-500';
      case 'special':
        return 'from-cyan-700 to-cyan-900 border-cyan-400';
      default:
        return 'from-gray-700 to-gray-900 border-gray-500';
    }
  };

  return (
    <button
      onClick={() => canPlay && onPlay(card.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={!canPlay}
      className={`
        relative w-24 h-32 sm:w-28 sm:h-40 md:w-32 md:h-44 p-2 sm:p-2.5 shrink-0
        flex flex-col items-center justify-between
        border-3 transition-all duration-200 bg-gradient-to-br
        ${getCardTypeColor(card.type)}
        ${canPlay
          ? 'cursor-pointer hover:scale-105 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(245,196,0,0.7)]'
          : 'opacity-40 cursor-not-allowed border-gray-700'
        }
        ${isHovered && canPlay ? 'z-10' : ''}
      `}
      style={{
        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
      }}
    >
      {/* Card Type Badge */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black border-2 border-[#F5C400] text-[#F5C400] text-[9px] sm:text-[10px] px-2 py-0.5 uppercase font-black tracking-wide" style={{
        clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
      }}>
        {card.type}
      </div>

      {/* Card Icon/Visual */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-black/50 border-2 border-white/20 flex items-center justify-center mt-1" style={{
        clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
      }}>
        <span className="text-2xl sm:text-3xl md:text-4xl">
          {card.type === 'strike' && '👊'}
          {card.type === 'defense' && '🛡️'}
          {card.type === 'combo' && '⚡'}
          {card.type === 'finisher' && '💥'}
          {card.type === 'special' && '✨'}
        </span>
      </div>

      {/* Card Name */}
      <span className="text-[10px] sm:text-xs font-black text-white text-center leading-tight uppercase tracking-wide">
        {card.name}
      </span>

      {/* Stamina Cost */}
      <div className="absolute bottom-2 right-2 w-6 h-6 sm:w-7 sm:h-7 bg-black border-2 border-[#F5C400] flex items-center justify-center" style={{
        clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
      }}>
        <span className="text-[10px] sm:text-xs text-[#F5C400] font-black">LV {card.staminaCost}</span>
      </div>

      {/* Damage (for strike cards) */}
      {card.baseDamage > 0 && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-red-600 border-2 border-black text-[10px] sm:text-xs text-white font-black" style={{
          clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
        }}>
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
