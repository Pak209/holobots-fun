import { SimpleActionCard } from '@/types/battle-room';

interface RealtimeBattleCardsProps {
  hand: SimpleActionCard[];
  onCardSelect: (cardId: string) => void;
  playerStamina: number;
  specialMeter: number;
}

export function RealtimeBattleCards({ hand, onCardSelect, playerStamina, specialMeter }: RealtimeBattleCardsProps) {
  const getCardIcon = (card: SimpleActionCard) => {
    if (card.type === 'finisher') return '⚡';
    if (card.type === 'defense') return '🛡️';
    if (card.type === 'combo') return '💥';
    if (card.baseDamage >= 12) return '💪';
    return '👊';
  };

  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'strike':
        return 'bg-gradient-to-br from-red-600/90 to-orange-700/90';
      case 'combo':
        return 'bg-gradient-to-br from-orange-500/90 to-yellow-600/90';
      case 'defense':
        return 'bg-gradient-to-br from-blue-600/90 to-cyan-700/90';
      case 'finisher':
        return 'bg-gradient-to-br from-purple-600/90 to-pink-700/90';
      default:
        return 'bg-gradient-to-br from-gray-600/90 to-gray-700/90';
    }
  };

  if (!hand || hand.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-400 text-sm">Waiting for cards to load...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 justify-start overflow-x-auto pb-2 px-2">
      {hand.map((card) => {
        // Check if player can afford the card
        const canAffordStamina = card.staminaRestore || playerStamina >= card.staminaCost;
        const hasSpecialMeter = card.type !== 'finisher' || specialMeter >= 100;
        const canPlay = canAffordStamina && hasSpecialMeter;
        
        return (
          <button
            key={card.id}
            onClick={() => canPlay && onCardSelect(card.id)}
            disabled={!canPlay}
            className={`
              relative w-24 h-36 rounded-lg p-2 shrink-0
              flex flex-col items-center justify-between
              border-2 transition-all duration-200
              ${getCardTypeColor(card.type)}
              ${canPlay
                ? 'cursor-pointer hover:scale-105 hover:-translate-y-2 border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/50'
                : 'opacity-50 cursor-not-allowed border-gray-600'
              }
            `}
          >
            {/* Card Type Badge */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full uppercase">
              {card.type}
            </div>

            {/* Card Icon */}
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mt-2">
              <span className="text-3xl">{getCardIcon(card)}</span>
            </div>

            {/* Card Name */}
            <span className="text-xs font-bold text-white text-center leading-tight">
              {card.name}
            </span>

            {/* Stamina Cost or Restore */}
            {card.staminaRestore ? (
              <div className="absolute top-2 right-2 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center border border-green-400">
                <span className="text-xs text-green-400 font-bold">+{card.staminaRestore}</span>
              </div>
            ) : (
              <div className="absolute top-2 right-2 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center border border-yellow-400">
                <span className="text-xs text-yellow-400 font-bold">{card.staminaCost}</span>
              </div>
            )}

            {/* Damage */}
            {card.baseDamage > 0 && (
              <div className="absolute bottom-2 left-2 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center border border-red-400">
                <span className="text-xs text-red-400 font-bold">{card.baseDamage}</span>
              </div>
            )}
            
            {/* Special Meter Requirement (Finisher only) */}
            {card.type === 'finisher' && (
              <div className="absolute bottom-2 right-2 bg-black/90 text-xs px-1.5 py-0.5 rounded border border-purple-400">
                <span className={specialMeter >= 100 ? 'text-purple-400' : 'text-gray-400'}>
                  ⚡{Math.floor(specialMeter)}%
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
