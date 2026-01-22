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
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Background Arena */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-slate-900/40 flex items-center justify-center">
        <div className="text-9xl font-bold text-purple-500/10">VS</div>
      </div>

      {/* Battle Status */}
      <div className="relative z-10 text-center space-y-4">
        {/* Turn Counter */}
        <div className="bg-black/50 backdrop-blur rounded-lg px-6 py-3 inline-block">
          <p className="text-sm text-gray-400 uppercase tracking-wide">Turn</p>
          <p className="text-4xl font-bold text-white">{battle.turnNumber}</p>
        </div>

        {/* Current Actor Indicator */}
        <div className="bg-yellow-500/20 backdrop-blur border border-yellow-400 rounded-lg px-4 py-2 inline-block">
          <p className="text-sm text-yellow-400 font-bold">
            {battle.currentActorId === battle.player.holobotId
              ? '▼ YOUR TURN'
              : '▲ OPPONENT\'S TURN'}
          </p>
        </div>

        {/* Counter Window Indicator */}
        {battle.counterWindowOpen && (
          <div className="bg-cyan-500/30 backdrop-blur border border-cyan-400 rounded-lg px-4 py-2 inline-block animate-pulse">
            <p className="text-sm text-cyan-300 font-bold">
              ⚡ COUNTER WINDOW OPEN!
            </p>
          </div>
        )}
      </div>

      {/* Battle Log (Recent Actions) */}
      {recentActions.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur rounded-lg p-3 max-h-32 overflow-y-auto">
          <p className="text-xs text-gray-400 uppercase mb-2">Battle Log</p>
          <div className="space-y-1">
            {recentActions.map((action) => (
              <div key={action.id} className="text-xs text-gray-300">
                <span className={action.actorRole === 'player' ? 'text-blue-400' : 'text-red-400'}>
                  {action.actorRole === 'player' ? 'You' : 'Opponent'}
                </span>
                {' '}
                <span className="text-white">{action.card.name}</span>
                {action.damageDealt > 0 && (
                  <span className="text-yellow-400"> • {action.actualDamage} DMG</span>
                )}
                {action.perfectDefense && (
                  <span className="text-cyan-400"> • PERFECT!</span>
                )}
                {action.triggeredCombo && (
                  <span className="text-orange-400"> • COMBO!</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
