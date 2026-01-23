// ============================================================================
// Fighter Display
// Shows fighter status, HP, stamina, special meter, and TCG card
// ============================================================================

import type { ArenaFighter } from '@/types/arena';
import { getStaminaState } from '@/types/arena';
import { HolobotCard } from '@/components/HolobotCard';
import type { HolobotStats } from '@/types/holobot';

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

  // Convert ArenaFighter to HolobotStats for TCG card
  const holobotStats: HolobotStats = {
    name: fighter.name.toUpperCase(),
    level: fighter.level,
    maxHealth: fighter.maxHP,
    attack: fighter.attack,
    defense: fighter.defense,
    speed: fighter.speed,
    specialMove: fighter.specialMove || fighter.archetype.toUpperCase(),
    abilityDescription: fighter.abilityDescription || `${fighter.archetype} archetype fighter with ${fighter.intelligence} intelligence`,
  };

  return (
    <div
      className={`
        relative flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 rounded-lg
        ${isActive ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse-subtle' : ''}
        ${position === 'top' ? 'flex-row bg-red-900/20 backdrop-blur' : 'flex-row-reverse bg-blue-900/20 backdrop-blur'}
      `}
    >
      {/* TCG Card */}
      <div className="flex-shrink-0 hidden sm:block">
        <div className="transform scale-50 sm:scale-[0.6] md:scale-75 origin-center">
          <HolobotCard 
            stats={holobotStats}
            variant={position === 'top' ? 'red' : 'blue'}
          />
        </div>
      </div>

      {/* Fighter Avatar */}
      <div className="relative">
        <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 bg-slate-800 ${isActive ? 'border-yellow-400' : 'border-gray-600'}`}>
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
        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[8px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <span title="Attack">⚔️{fighter.attack}</span>
            <span title="Defense">🛡️{fighter.defense}</span>
          </div>
        </div>
      </div>

      {/* Fighter Stats */}
      <div className="flex-1 space-y-1 sm:space-y-1.5 md:space-y-2">
        {/* Name & Level & HP */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <h2 className="text-sm sm:text-base md:text-xl font-bold text-white">{fighter.name}</h2>
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[9px] sm:text-[10px] md:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
              Lv.{fighter.level}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs md:text-sm text-gray-300">
            {fighter.currentHP} / {fighter.maxHP}
          </span>
        </div>

        {/* HP Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 sm:h-3.5 md:h-4 relative overflow-hidden">
          <div
            className={`${hpBarColor} h-full rounded-full transition-all duration-300`}
            style={{ width: `${hpPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] md:text-xs font-bold text-white drop-shadow">
            HP
          </div>
        </div>

        {/* Stamina & Special Meter */}
        <div className="flex gap-1.5 sm:gap-2">
          {/* Stamina Cards */}
          <div className="flex-1">
            <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
              <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-400">Stamina:</span>
              <span className={`text-[9px] sm:text-[10px] md:text-xs font-bold ${staminaColors[staminaState]}`}>
                {fighter.stamina}/{fighter.maxStamina}
              </span>
            </div>
            <div className="flex gap-0.5 sm:gap-1">
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
            <div className="flex items-center justify-between mb-0.5 sm:mb-1">
              <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-400">Special:</span>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-cyan-400">{specialPercent}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-300"
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
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-blue-500 text-white text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse">
          🛡️ DEFENSE
        </div>
      )}

      {fighter.comboCounter > 0 && (
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-orange-500 text-white text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold">
          {fighter.comboCounter}x COMBO
        </div>
      )}
    </div>
  );
}
