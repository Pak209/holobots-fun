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
    <div className="bg-slate-800/50 backdrop-blur rounded-lg p-2 sm:p-3 md:p-4">
      <div className="flex items-center justify-between mb-1 sm:mb-1.5 md:mb-2">
        <h3 className="text-xs sm:text-sm font-bold text-white">YOUR HAND</h3>
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-400">{cards.length} cards</span>
          <span className="hidden md:inline-block text-xs text-cyan-400">⌨️ S•Strike | D•Defend | C•Combo | F•Finisher</span>
        </div>
      </div>

      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-2">
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
