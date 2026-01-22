// ============================================================================
// Fighter Display
// Shows fighter status, HP, stamina, special meter
// ============================================================================

import type { ArenaFighter } from '@/types/arena';
import { getStaminaState } from '@/types/arena';

interface FighterDisplayProps {
  fighter: ArenaFighter;
  position: 'top' | 'bottom';
  isActive: boolean;
}

export function FighterDisplay({ fighter, position, isActive }: FighterDisplayProps) {
  const hpPercent = (fighter.currentHP / fighter.maxHP) * 100;
  const specialPercent = fighter.specialMeter;
  const staminaState = getStaminaState(fighter.stamina);

  // Stamina state colors
  const staminaColors = {
    fresh: 'text-green-400',
    working: 'text-yellow-400',
    gassed: 'text-orange-400',
    exhausted: 'text-red-400',
  };

  const hpBarColor = hpPercent > 60 ? 'bg-green-500' : hpPercent > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div
      className={`
        relative flex items-center gap-4 p-4 rounded-lg
        ${isActive ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse-subtle' : ''}
        ${position === 'top' ? 'flex-row bg-red-900/20 backdrop-blur' : 'flex-row-reverse bg-blue-900/20 backdrop-blur'}
      `}
    >
      {/* Fighter Avatar */}
      <div className="relative">
        <div className={`w-20 h-20 rounded-full overflow-hidden border-2 bg-slate-800 ${isActive ? 'border-yellow-400' : 'border-gray-600'}`}>
          <img
            src={fighter.avatar}
            alt={fighter.name}
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              // Fallback if image doesn't load
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
        {/* Stats Badge */}
        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
          <div className="flex items-center gap-1">
            <span title="Attack">⚔️{fighter.attack}</span>
            <span title="Defense">🛡️{fighter.defense}</span>
          </div>
        </div>
      </div>

      {/* Fighter Stats */}
      <div className="flex-1 space-y-2">
        {/* Name & Level & HP */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">{fighter.name}</h2>
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Lv.{fighter.level}
            </span>
          </div>
          <span className="text-sm text-gray-300">
            {fighter.currentHP} / {fighter.maxHP}
          </span>
        </div>

        {/* HP Bar */}
        <div className="w-full bg-gray-700 rounded-full h-4 relative overflow-hidden">
          <div
            className={`${hpBarColor} h-4 rounded-full transition-all duration-300`}
            style={{ width: `${hpPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
            HP
          </div>
        </div>

        {/* Stamina & Special Meter */}
        <div className="flex gap-2">
          {/* Stamina Cards */}
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-gray-400">Stamina:</span>
              <span className={`text-xs font-bold ${staminaColors[staminaState]}`}>
                {fighter.stamina}/{fighter.maxStamina} ({staminaState.toUpperCase()})
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: fighter.maxStamina }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded ${
                    i < fighter.stamina ? 'bg-yellow-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Special Meter */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Special:</span>
              <span className="text-xs font-bold text-cyan-400">{specialPercent}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${specialPercent}%` }}
              />
              {specialPercent >= 100 && (
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      {fighter.isInDefenseMode && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          🛡️ DEFENSE
        </div>
      )}

      {fighter.comboCounter > 0 && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          {fighter.comboCounter}x COMBO
        </div>
      )}
    </div>
  );
}
