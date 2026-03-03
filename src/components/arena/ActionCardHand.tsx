// ============================================================================
// Action Card Hand
// Displays player's current hand of action cards
// ============================================================================

import type { ActionCard } from '@/types/arena';
import { ActionCardComponent } from './ActionCardComponent';

interface ActionCardHandProps {
  cards: ActionCard[];
  onCardSelect: (cardId: string) => void;
  disabled?: boolean;
}

export function ActionCardHand({ cards, onCardSelect, disabled = false }: ActionCardHandProps) {
  if (cards.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 text-center">
        <p className="text-gray-400">No cards available</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 bg-black border-3 border-[#F5C400]/50 p-3 sm:p-4 flex-shrink-0" style={{
      clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
    }}>
      <div className="flex items-center justify-between mb-2 sm:mb-3 border-b-2 border-[#F5C400]/30 pb-2 gap-2 min-w-0">
        <h3 className="text-sm sm:text-base font-black text-[#F5C400] uppercase tracking-widest shrink-0">Your Hand</h3>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
          <span className="text-[10px] sm:text-xs text-white font-bold shrink-0">{cards.length} cards</span>
          <span className="hidden md:inline-block text-[10px] text-gray-400 uppercase truncate">S:Strike | D:Defend | C:Combo | F:Finisher</span>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 min-w-0 -mx-1 px-1">
        {cards.map((card) => (
          <ActionCardComponent
            key={card.id}
            card={card}
            onPlay={onCardSelect}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
