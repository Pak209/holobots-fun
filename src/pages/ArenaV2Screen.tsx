// ============================================================================
// Arena V2 Screen
// Main battle screen for Arena V2 speed combat system
// ============================================================================

import { useEffect } from 'react';
import { useArenaBattleStore } from '@/stores/arena-battle-store';
import { BattleArenaView } from '@/components/arena/BattleArenaView';
import type { ArenaFighter, ArenaBattleConfig } from '@/types/arena';

export default function ArenaV2Screen() {
  const { 
    currentBattle,
    isLoading,
    error,
    initializeBattle,
  } = useArenaBattleStore();

  useEffect(() => {
    // Initialize a test battle on mount
    if (!currentBattle && !isLoading) {
      // Create mock fighters for testing
      const player: ArenaFighter = {
        holobotId: 'player-holobot-1',
        userId: 'user-1',
        name: 'Your Holobot',
        avatar: '/lovable-uploads/holobot-avatar.png',
        archetype: 'balanced',
        
        maxHP: 100,
        currentHP: 100,
        attack: 50,
        defense: 40,
        speed: 60,
        intelligence: 55,
        
        stamina: 6,
        maxStamina: 7,
        specialMeter: 0,
        
        staminaState: 'fresh',
        isInDefenseMode: false,
        comboCounter: 0,
        lastActionTime: 0,
        
        statusEffects: [],
        
        staminaEfficiency: 1.0,
        defenseTimingWindow: 500,
        counterDamageBonus: 1.3,
        damageMultiplier: 1.0,
        speedBonus: 0,
        
        hand: [],
        
        totalDamageDealt: 0,
        perfectDefenses: 0,
        combosCompleted: 0,
      };

      const opponent: ArenaFighter = {
        ...player,
        holobotId: 'opponent-holobot-1',
        userId: 'ai-opponent',
        name: 'Enemy Holobot',
        avatar: '/lovable-uploads/opponent-avatar.png',
        archetype: 'striker',
        attack: 55,
        defense: 35,
        speed: 65,
      };

      const config: ArenaBattleConfig = {
        battleType: 'pve',
        playerHolobotId: player.holobotId,
        opponentHolobotId: opponent.holobotId,
        allowPlayerControl: true, // Manual control for now
        aiDifficulty: 'medium',
        maxTurns: 50,
      };

      initializeBattle(config, player, opponent);
    }
  }, [currentBattle, isLoading, initializeBattle]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing Battle...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Battle Error</p>
          <p className="text-white">{error}</p>
        </div>
      </div>
    );
  }

  // No battle state
  if (!currentBattle) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <p className="text-white text-lg">No active battle</p>
      </div>
    );
  }

  // Main battle view
  return <BattleArenaView />;
}
