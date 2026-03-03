// ============================================================================
// Pixel Battle Animation
// Retro-style pixel art battle visualization
// ============================================================================

import { useEffect, useState } from 'react';
import type { BattleState } from '@/types/arena';

interface PixelBattleAnimationProps {
  battle: BattleState;
}

export function PixelBattleAnimation({ battle }: PixelBattleAnimationProps) {
  const [animationState, setAnimationState] = useState<'idle' | 'playerAttack' | 'opponentAttack' | 'hit'>('idle');
  const recentAction = battle.actionHistory[battle.actionHistory.length - 1];

  useEffect(() => {
    if (recentAction) {
      // Trigger animation based on recent action
      if (recentAction.actorRole === 'player') {
        setAnimationState('playerAttack');
      } else {
        setAnimationState('opponentAttack');
      }
      
      // Reset to idle after animation
      const timer = setTimeout(() => {
        setAnimationState('idle');
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [recentAction?.id]);

  return (
    <div className="w-full bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 border-3 border-[#F5C400] relative overflow-hidden" 
      style={{
        clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
        minHeight: '280px',
        maxHeight: '320px'
      }}>
      
      {/* Pixel Background - Retro Arena */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(245,196,0,0.1) 4px, rgba(245,196,0,0.1) 8px),
            repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(245,196,0,0.1) 4px, rgba(245,196,0,0.1) 8px)
          `
        }} />
      </div>

      {/* Floor/Ground */}
      <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-amber-900/40 to-transparent border-t-4 border-amber-700/50">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 16px, rgba(180,83,9,0.2) 16px, rgba(180,83,9,0.2) 32px)'
        }} />
      </div>

      {/* Battle Arena Content */}
      <div className="relative h-full flex items-center justify-between px-8 sm:px-12 md:px-16">
        {/* Player Side (Left) - Blue Holobot */}
        <div className={`relative transition-all duration-300 ${
          animationState === 'playerAttack' ? 'translate-x-8 scale-110' : ''
        }`}>
          {/* Placeholder for Player Holobot Sprite */}
          <div className="relative">
            <div className="w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 bg-gradient-to-b from-cyan-500 to-blue-700 border-4 border-cyan-300 relative" style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
              imageRendering: 'pixelated'
            }}>
              {/* Head */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-cyan-400 border-2 border-cyan-200" style={{
                clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
              }}>
                {/* Eyes */}
                <div className="absolute top-4 left-2 w-2 h-2 bg-black" />
                <div className="absolute top-4 right-2 w-2 h-2 bg-black" />
                {/* Visor */}
                <div className="absolute top-5 left-1 right-1 h-1 bg-yellow-400" />
              </div>
              
              {/* Body */}
              <div className="absolute top-14 left-1/2 -translate-x-1/2 w-14 h-12 bg-blue-600 border-2 border-cyan-300">
                {/* Core/Chest detail */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-300 animate-pulse" style={{
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                }} />
              </div>
              
              {/* Arms */}
              <div className="absolute top-16 left-0 w-3 h-8 bg-cyan-500 border-2 border-cyan-300" />
              <div className="absolute top-16 right-0 w-3 h-8 bg-cyan-500 border-2 border-cyan-300" />
              
              {/* Legs */}
              <div className="absolute bottom-1 left-3 w-4 h-6 bg-blue-700 border-2 border-cyan-400" />
              <div className="absolute bottom-1 right-3 w-4 h-6 bg-blue-700 border-2 border-cyan-400" />
            </div>
            
            {/* Level Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-cyan-500 border-2 border-black px-2 py-1 text-[10px] font-black text-white">
              LV.{battle.player.level}
            </div>
          </div>
        </div>

        {/* Center - Turn Counter and Effects */}
        <div className="absolute left-1/2 top-4 -translate-x-1/2 z-20">
          <div className="bg-black border-3 border-[#F5C400] px-4 py-2" style={{
            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
          }}>
            <p className="text-[9px] text-gray-400 uppercase font-bold text-center">TURN</p>
            <p className="text-2xl font-black text-[#F5C400] text-center">{battle.turnNumber}</p>
          </div>
        </div>

        {/* Counter Window Indicator */}
        {battle.counterWindowOpen && (
          <div className="absolute left-1/2 top-20 -translate-x-1/2 z-20">
            <div className="bg-cyan-500 border-3 border-black px-4 py-2 animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.8)]" style={{
              clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
            }}>
              <p className="text-xs text-black font-black uppercase tracking-widest">
                ⚡ COUNTER!
              </p>
            </div>
          </div>
        )}

        {/* Attack Effect */}
        {animationState === 'playerAttack' && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 animate-ping">
            <div className="w-16 h-16 bg-yellow-400 opacity-50" style={{
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
            }} />
          </div>
        )}
        {animationState === 'opponentAttack' && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 animate-ping">
            <div className="w-16 h-16 bg-red-400 opacity-50" style={{
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
            }} />
          </div>
        )}

        {/* Opponent Side (Right) - Red Holobot */}
        <div className={`relative transition-all duration-300 ${
          animationState === 'opponentAttack' ? '-translate-x-8 scale-110' : ''
        }`}>
          {/* Placeholder for Opponent Holobot Sprite */}
          <div className="relative">
            <div className="w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 bg-gradient-to-b from-red-500 to-red-800 border-4 border-red-300 relative" style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
              imageRendering: 'pixelated'
            }}>
              {/* Head */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-red-400 border-2 border-red-200" style={{
                clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
              }}>
                {/* Eyes */}
                <div className="absolute top-4 left-2 w-2 h-2 bg-black" />
                <div className="absolute top-4 right-2 w-2 h-2 bg-black" />
                {/* Visor */}
                <div className="absolute top-5 left-1 right-1 h-1 bg-yellow-400" />
              </div>
              
              {/* Body */}
              <div className="absolute top-14 left-1/2 -translate-x-1/2 w-14 h-12 bg-red-700 border-2 border-red-300">
                {/* Core/Chest detail */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-400 animate-pulse" style={{
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                }} />
              </div>
              
              {/* Arms */}
              <div className="absolute top-16 left-0 w-3 h-8 bg-red-500 border-2 border-red-300" />
              <div className="absolute top-16 right-0 w-3 h-8 bg-red-500 border-2 border-red-300" />
              
              {/* Legs */}
              <div className="absolute bottom-1 left-3 w-4 h-6 bg-red-800 border-2 border-red-400" />
              <div className="absolute bottom-1 right-3 w-4 h-6 bg-red-800 border-2 border-red-400" />
            </div>
            
            {/* Level Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-500 border-2 border-black px-2 py-1 text-[10px] font-black text-white">
              LV.{battle.opponent.level}
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Text */}
      <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 text-[9px] text-gray-400 font-mono">
        PIXEL BATTLE ANIMATION v1.0
      </div>
    </div>
  );
}
