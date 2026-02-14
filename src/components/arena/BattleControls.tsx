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
    <div className="flex gap-2 sm:gap-3">
      {/* Defense Mode */}
      <button
        onClick={onDefenseMode}
        className="flex-1 bg-black hover:bg-blue-600 text-white border-3 border-blue-500 font-black py-3 sm:py-4 px-3 sm:px-4 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] uppercase tracking-widest"
        style={{
          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
        }}
      >
        <span className="text-lg sm:text-xl">🛡️</span>
        <span className="text-xs sm:text-sm">Defend</span>
      </button>

      {/* Hack Ability */}
      <button
        onClick={onHack}
        disabled={hackUsed}
        className={`flex-1 font-black py-3 sm:py-4 px-3 sm:px-4 transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-widest border-3 ${
          hackUsed
            ? 'bg-gray-800 border-gray-700 cursor-not-allowed opacity-50 text-gray-500'
            : 'bg-black hover:bg-cyan-600 border-cyan-500 text-white hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]'
        }`}
        style={{
          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
        }}
      >
        <span className="text-lg sm:text-xl">⚙️</span>
        <span className="text-xs sm:text-sm">{hackUsed ? 'Used' : 'Hack'}</span>
      </button>

      {/* Special Attack */}
      <button
        onClick={onSpecial}
        disabled={!canUseSpecial}
        className={`flex-1 font-black py-3 sm:py-4 px-3 sm:px-4 transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-widest border-3 ${
          canUseSpecial
            ? 'bg-gradient-to-r from-red-700 to-red-900 border-red-500 text-white hover:scale-105 active:scale-95 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)]'
            : 'bg-gray-800 border-gray-700 cursor-not-allowed opacity-50 text-gray-500'
        }`}
        style={{
          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
        }}
      >
        <span className="text-lg sm:text-xl">💥</span>
        <span className="text-xs sm:text-sm">Finisher</span>
      </button>
    </div>
  );
}
