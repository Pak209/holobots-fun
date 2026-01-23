// ============================================================================
// Battle Controls
// Player control buttons for special actions
// ============================================================================

interface BattleControlsProps {
  onDefenseMode: () => void;
  onHack: () => void;
  onSpecial: () => void;
  hackUsed: boolean;
  canUseSpecial: boolean;
}

export function BattleControls({
  onDefenseMode,
  onHack,
  onSpecial,
  hackUsed,
  canUseSpecial,
}: BattleControlsProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2 md:gap-3">
      {/* Defense Mode */}
      <button
        onClick={onDefenseMode}
        className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2"
      >
        <span className="text-base sm:text-lg md:text-xl">🛡️</span>
        <span className="text-xs sm:text-sm md:text-base">DEFEND</span>
      </button>

      {/* Hack Ability */}
      <button
        onClick={onHack}
        disabled={hackUsed}
        className={`flex-1 ${
          hackUsed
            ? 'bg-gray-600 cursor-not-allowed opacity-50'
            : 'bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 hover:scale-105 active:scale-95'
        } text-white font-bold py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2`}
      >
        <span className="text-base sm:text-lg md:text-xl">⚙️</span>
        <span className="text-xs sm:text-sm md:text-base">{hackUsed ? 'USED' : 'HACK'}</span>
      </button>

      {/* Special Attack */}
      <button
        onClick={onSpecial}
        disabled={!canUseSpecial}
        className={`flex-1 ${
          canUseSpecial
            ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 hover:scale-105 active:scale-95 animate-pulse'
            : 'bg-gray-600 cursor-not-allowed opacity-50'
        } text-white font-bold py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2`}
      >
        <span className="text-base sm:text-lg md:text-xl">💥</span>
        <span className="text-xs sm:text-sm md:text-base">FINISHER</span>
      </button>
    </div>
  );
}
