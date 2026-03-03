// ============================================================================
// Battle Log Display
// Shows recent battle actions and combat history
// ============================================================================

import type { BattleState } from '@/types/arena';

interface BattleLogDisplayProps {
  battle: BattleState;
}

export function BattleLogDisplay({ battle }: BattleLogDisplayProps) {
  const recentActions = battle.actionHistory.slice(-8).reverse(); // Show last 8 actions, newest first

  return (
    <div className="w-full bg-black border-3 border-[#F5C400]/50 p-3 sm:p-4" style={{
      clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
    }}>
      <div className="flex items-center justify-between mb-2 border-b-2 border-[#F5C400]/30 pb-2">
        <h3 className="text-xs sm:text-sm font-black text-[#F5C400] uppercase tracking-widest flex items-center gap-2">
          <span className="text-base">📜</span>
          Battle Log
        </h3>
        <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase">
          {recentActions.length} Actions
        </span>
      </div>

      <div className="space-y-1 max-h-32 sm:max-h-36 overflow-y-auto custom-scrollbar">
        {recentActions.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">Waiting for first action...</p>
        ) : (
          recentActions.map((action, index) => (
            <div 
              key={action.id}
              className={`text-[10px] sm:text-xs p-2 border-l-3 transition-all ${
                action.actorRole === 'player' 
                  ? 'border-cyan-400 bg-cyan-900/20' 
                  : 'border-red-500 bg-red-900/20'
              } ${index === 0 ? 'animate-pulse' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className={`font-black ${action.actorRole === 'player' ? 'text-cyan-400' : 'text-red-400'}`}>
                    {action.actorRole === 'player' ? '⚔️ YOU' : '⚔️ OPP'}
                  </span>
                  {' '}
                  <span className="text-white font-bold">{action.card.name}</span>
                </div>
                
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {action.damageDealt > 0 && (
                    <span className="bg-[#F5C400] text-black px-1.5 py-0.5 font-black text-[9px] sm:text-[10px]">
                      {action.actualDamage} DMG
                    </span>
                  )}
                  {action.perfectDefense && (
                    <span className="bg-cyan-500 text-white px-1.5 py-0.5 font-black text-[9px] sm:text-[10px]">
                      🛡️ PERFECT
                    </span>
                  )}
                  {action.triggeredCombo && (
                    <span className="bg-orange-500 text-white px-1.5 py-0.5 font-black text-[9px] sm:text-[10px]">
                      ⚡ COMBO
                    </span>
                  )}
                </div>
              </div>
              
              {action.staminaCost > 0 && (
                <div className="text-[9px] text-gray-400 mt-0.5">
                  Cost: {action.staminaCost} stamina
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 196, 0, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 196, 0, 0.8);
        }
      `}</style>
    </div>
  );
}
