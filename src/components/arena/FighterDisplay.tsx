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
        relative flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 border-3
        ${isActive ? 'border-[#F5C400] shadow-[0_0_20px_rgba(245,196,0,0.5)]' : 'border-gray-700'}
        ${position === 'top' ? 'flex-row bg-gradient-to-br from-gray-900 to-black' : 'flex-row-reverse bg-gradient-to-br from-gray-900 to-black'}
      `}
      style={{
        clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
      }}
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
        <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 overflow-hidden border-4 bg-black ${position === 'top' ? 'border-red-500' : 'border-cyan-400'}`} style={{
          clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
        }}>
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
        {/* Level Badge */}
        <div className={`absolute -bottom-2 -right-2 text-white text-[10px] sm:text-xs font-black px-2 py-1 border-2 ${position === 'top' ? 'bg-red-500 border-black' : 'bg-cyan-500 border-black'}`} style={{
          clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
        }}>
          <span title="Intelligence">✦{fighter.intelligence}</span>
          <span title="Level" className="ml-1">⬥{fighter.level}</span>
        </div>
      </div>

      {/* Fighter Stats */}
      <div className="flex-1 space-y-1.5 sm:space-y-2">
        {/* Name & Level & HP */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base md:text-lg font-black text-[#F5C400] uppercase tracking-wide">{fighter.name}</h2>
            <span className={`text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 border-2 ${position === 'top' ? 'bg-red-600/30 border-red-500' : 'bg-cyan-600/30 border-cyan-400'}`} style={{
              clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
            }}>
              LV.{fighter.level}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white">
            {fighter.currentHP} / {fighter.maxHP}
          </span>
        </div>

        {/* HP Bar */}
        <div className="w-full bg-gray-800 h-4 sm:h-5 relative overflow-hidden border-2 border-gray-700">
          <div
            className={`${hpBarColor} h-full transition-all duration-300`}
            style={{ width: `${hpPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-black text-white drop-shadow-lg uppercase tracking-widest">
            HP
          </div>
        </div>

        {/* Stamina & Special Meter */}
        <div className="flex gap-2 sm:gap-3">
          {/* Stamina Cards */}
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">Stamina:</span>
              <span className={`text-[10px] sm:text-xs font-black ${staminaColors[staminaState]}`}>
                {fighter.stamina}/{fighter.maxStamina}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: fighter.maxStamina }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 flex-1 border-2 ${
                    i < fighter.stamina ? 'bg-[#F5C400] border-[#F5C400] shadow-[0_0_8px_rgba(245,196,0,0.6)]' : 'bg-gray-900 border-gray-700'
                  }`}
                  style={{
                    clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Special Meter */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">Special:</span>
              <span className="text-[10px] sm:text-xs font-black text-purple-400">{specialPercent}%</span>
            </div>
            <div className="w-full bg-gray-900 h-3 relative overflow-hidden border-2 border-gray-700">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
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
        <div className="absolute top-2 right-2 bg-blue-600 border-2 border-black text-white text-[10px] sm:text-xs px-2 py-1 font-black uppercase animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]" style={{
          clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
        }}>
          🛡️ DEFENSE
        </div>
      )}

      {fighter.comboCounter > 0 && (
        <div className="absolute top-2 right-2 bg-[#F5C400] border-2 border-black text-black text-xs sm:text-sm px-3 py-1 font-black uppercase shadow-[0_0_15px_rgba(245,196,0,0.8)]" style={{
          clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
        }}>
          {fighter.comboCounter}x COMBO
        </div>
      )}
    </div>
  );
}
