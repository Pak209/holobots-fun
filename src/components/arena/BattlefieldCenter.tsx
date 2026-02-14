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
    <div className="relative w-full h-full flex flex-col bg-gradient-to-b from-gray-900 to-black">
      {/* Counter Window Indicator - Top if active */}
      {battle.counterWindowOpen && (
        <div className="relative z-10 flex justify-center pt-2">
          <div className="bg-cyan-500 border-3 border-black px-4 py-2 inline-block animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.8)]" style={{
            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
          }}>
            <p className="text-xs sm:text-sm text-black font-black uppercase tracking-widest">
              ⚡ Counter Window!
            </p>
          </div>
        </div>
      )}

      {/* Combined Battle Log and Turn Counter - Side by side at top */}
      {recentActions.length > 0 && (
        <div className="relative z-10 mt-2 mx-2 flex gap-3">
          {/* Battle Log - Left side, takes most space */}
          <div className="flex-1 bg-black border-2 border-[#F5C400]/50 p-2 sm:p-3 max-h-24 sm:max-h-28 overflow-y-auto" style={{
            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
          }}>
            <p className="text-[10px] sm:text-xs text-[#F5C400] uppercase mb-1 font-black tracking-widest">Log</p>
            <div className="space-y-0.5">
              {recentActions.map((action) => (
                <div key={action.id} className="text-[10px] sm:text-xs text-gray-300">
                  <span className={`font-bold ${action.actorRole === 'player' ? 'text-cyan-400' : 'text-red-500'}`}>
                    {action.actorRole === 'player' ? 'You' : 'Opp'}
                  </span>
                  {' '}
                  <span className="text-white font-medium">{action.card.name}</span>
                  {action.damageDealt > 0 && (
                    <span className="text-[#F5C400] font-bold"> • {action.actualDamage}</span>
                  )}
                  {action.perfectDefense && (
                    <span className="text-cyan-400 font-bold"> • ✓</span>
                  )}
                  {action.triggeredCombo && (
                    <span className="text-orange-400 font-bold"> • C</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Turn Counter - Right side, compact */}
          <div className="bg-black border-3 border-[#F5C400] p-3 sm:p-4 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px]" style={{
            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
          }}>
            <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider">Turn</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#F5C400]">{battle.turnNumber}</p>
          </div>
        </div>
      )}
    </div>
  );
}
