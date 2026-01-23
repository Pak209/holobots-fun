// ============================================================================
// Battlefield Center
// Central combat visualization area
// ============================================================================

import type { BattleState } from '@/types/arena';

interface BattlefieldCenterProps {
  battle: BattleState;
}

export function BattlefieldCenter({ battle }: BattlefieldCenterProps) {
  const recentActions = battle.actionHistory.slice(-5);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Background Arena - Smaller */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-slate-900/40 flex items-center justify-center opacity-30">
        <div className="text-5xl sm:text-7xl md:text-9xl font-bold text-purple-500/20">VS</div>
      </div>

      {/* Counter Window Indicator - Top if active */}
      {battle.counterWindowOpen && (
        <div className="relative z-10 flex justify-center pt-1 sm:pt-2">
          <div className="bg-cyan-500/30 backdrop-blur border border-cyan-400 rounded-lg px-2 py-1 inline-block animate-pulse">
            <p className="text-[10px] sm:text-xs text-cyan-300 font-bold">
              ⚡ COUNTER WINDOW!
            </p>
          </div>
        </div>
      )}

      {/* Combined Battle Log and Turn Counter - Side by side at top */}
      {recentActions.length > 0 && (
        <div className="relative z-10 mt-1 sm:mt-2 mx-2 flex gap-2">
          {/* Battle Log - Left side, takes most space */}
          <div className="flex-1 bg-black/70 backdrop-blur rounded-lg p-1.5 sm:p-2 max-h-24 sm:max-h-28 overflow-y-auto">
            <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase mb-0.5">Log</p>
            <div className="space-y-0.5">
              {recentActions.map((action) => (
                <div key={action.id} className="text-[9px] sm:text-[10px] text-gray-300">
                  <span className={action.actorRole === 'player' ? 'text-blue-400' : 'text-red-400'}>
                    {action.actorRole === 'player' ? 'You' : 'Opp'}
                  </span>
                  {' '}
                  <span className="text-white">{action.card.name}</span>
                  {action.damageDealt > 0 && (
                    <span className="text-yellow-400"> • {action.actualDamage}</span>
                  )}
                  {action.perfectDefense && (
                    <span className="text-cyan-400"> • ✓</span>
                  )}
                  {action.triggeredCombo && (
                    <span className="text-orange-400"> • C</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Turn Counter - Right side, compact */}
          <div className="bg-black/70 backdrop-blur rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center min-w-[60px] sm:min-w-[70px]">
            <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase">Turn</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{battle.turnNumber}</p>
          </div>
        </div>
      )}
    </div>
  );
}
