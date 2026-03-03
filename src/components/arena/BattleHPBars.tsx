// ============================================================================
// Battle HP Bars
// Side-by-side HP and Stamina display for both fighters
// ============================================================================

import type { ArenaFighter } from '@/types/arena';
import { getStaminaState } from '@/types/arena';
import { HolobotCard } from '@/components/HolobotCard';
import type { HolobotStats } from '@/types/holobot';

interface BattleHPBarsProps {
  player: ArenaFighter;
  opponent: ArenaFighter;
}

export function BattleHPBars({ player, opponent }: BattleHPBarsProps) {
  const playerHPPercent = (player.currentHP / player.maxHP) * 100;
  const opponentHPPercent = (opponent.currentHP / opponent.maxHP) * 100;
  
  const playerStaminaState = getStaminaState(player.stamina);
  const opponentStaminaState = getStaminaState(opponent.stamina);

  const getHPBarColor = (percent: number) => 
    percent > 60 ? 'bg-green-500' : percent > 30 ? 'bg-yellow-500' : 'bg-red-500';

  const staminaColors = {
    fresh: 'text-green-400',
    working: 'text-yellow-400',
    gassed: 'text-orange-400',
    exhausted: 'text-red-400',
  };
  
  // Convert ArenaFighter to HolobotStats format for HolobotCard
  const playerStats: HolobotStats = {
    name: player.name,
    level: player.level,
    maxHealth: player.maxHP,
    attack: player.attack,
    defense: player.defense,
    speed: player.speed,
    intelligence: player.intelligence,
    ability: player.specialMove || 'Special Attack',
    type: player.archetype || 'balanced'
  };
  
  const opponentStats: HolobotStats = {
    name: opponent.name,
    level: opponent.level,
    maxHealth: opponent.maxHP,
    attack: opponent.attack,
    defense: opponent.defense,
    speed: opponent.speed,
    intelligence: opponent.intelligence,
    ability: opponent.specialMove || 'Special Attack',
    type: opponent.archetype || 'balanced'
  };

  return (
    <div className="w-full min-w-0 bg-black border-3 border-[#F5C400] p-2 sm:p-3 overflow-hidden" style={{
      clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
    }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Player (Left) */}
        <div className="flex gap-2 min-w-0">
          {/* Player Card */}
          <div className="w-24 sm:w-28 md:w-32 flex-shrink-0">
            <HolobotCard stats={playerStats} variant="blue" />
          </div>

          {/* Stats Container */}
          <div className="flex-1 min-w-0 space-y-1">

            {/* HP Bar */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-gray-400 font-bold uppercase">HP</span>
                <span className="text-[10px] font-bold text-white">
                  {player.currentHP}/{player.maxHP}
                </span>
              </div>
              <div className="w-full bg-gray-800 h-3 relative overflow-hidden border border-gray-700">
                <div
                  className={`${getHPBarColor(playerHPPercent)} h-full transition-all duration-300`}
                  style={{ width: `${playerHPPercent}%` }}
                />
              </div>
            </div>

            {/* Stamina */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-gray-400 font-bold uppercase">Stamina</span>
                <span className={`text-[10px] font-black ${staminaColors[playerStaminaState]}`}>
                  {player.stamina}/{player.maxStamina}
                </span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: player.maxStamina }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 ${
                      i < player.stamina ? 'bg-cyan-400 shadow-[0_0_4px_rgba(6,182,212,0.6)]' : 'bg-gray-900 border border-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Special Meter */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-gray-400 font-bold uppercase">Special</span>
                <span className="text-[10px] font-black text-purple-400">{player.specialMeter}%</span>
              </div>
              <div className="w-full bg-gray-900 h-2 relative overflow-hidden border border-gray-700">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                  style={{ width: `${player.specialMeter}%` }}
                />
                {player.specialMeter >= 100 && (
                  <div className="absolute inset-0 bg-white/30 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Opponent (Right) */}
        <div className="flex gap-2 flex-row-reverse min-w-0">
          {/* Opponent Card */}
          <div className="w-24 sm:w-28 md:w-32 flex-shrink-0">
            <HolobotCard stats={opponentStats} variant="red" />
          </div>

          {/* Stats Container */}
          <div className="flex-1 min-w-0 space-y-1">

            {/* HP Bar */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white">
                  {opponent.currentHP}/{opponent.maxHP}
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">HP</span>
              </div>
              <div className="w-full bg-gray-800 h-3 relative overflow-hidden border border-gray-700">
                <div
                  className={`${getHPBarColor(opponentHPPercent)} h-full transition-all duration-300 ml-auto`}
                  style={{ width: `${opponentHPPercent}%` }}
                />
              </div>
            </div>

            {/* Stamina */}
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black ${staminaColors[opponentStaminaState]}`}>
                  {opponent.stamina}/{opponent.maxStamina}
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">Stamina</span>
              </div>
              <div className="flex gap-0.5 flex-row-reverse">
                {Array.from({ length: opponent.maxStamina }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 ${
                      i < opponent.stamina ? 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]' : 'bg-gray-900 border border-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Special Meter */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-purple-400">{opponent.specialMeter}%</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">Special</span>
              </div>
              <div className="w-full bg-gray-900 h-2 relative overflow-hidden border border-gray-700">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-300 ml-auto"
                  style={{ width: `${opponent.specialMeter}%` }}
                />
                {opponent.specialMeter >= 100 && (
                  <div className="absolute inset-0 bg-white/30 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicators Row */}
      {(player.isInDefenseMode || player.comboCounter > 0 || opponent.isInDefenseMode || opponent.comboCounter > 0) && (
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-800">
          <div className="flex gap-1">
            {player.isInDefenseMode && (
              <span className="bg-blue-600 border border-black text-white text-[8px] px-1.5 py-0.5 font-black uppercase">
                🛡️ DEF
              </span>
            )}
            {player.comboCounter > 0 && (
              <span className="bg-[#F5C400] border border-black text-black text-[8px] px-1.5 py-0.5 font-black uppercase">
                {player.comboCounter}x
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {opponent.comboCounter > 0 && (
              <span className="bg-red-600 border border-black text-white text-[8px] px-1.5 py-0.5 font-black uppercase">
                {opponent.comboCounter}x
              </span>
            )}
            {opponent.isInDefenseMode && (
              <span className="bg-orange-600 border border-black text-white text-[8px] px-1.5 py-0.5 font-black uppercase">
                🛡️ DEF
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
