// ============================================================================
// useArenaBattle Hook
// React hook for Arena battle management with real-time updates
// ============================================================================

import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useArenaBattleStore } from '@/stores/arena-battle-store';
import { supabase } from '@/integrations/supabase/client';
import type { ArenaBattleConfig, ArenaFighter } from '@/types/arena';

// ============================================================================
// Hook Interface
// ============================================================================

export function useArenaBattle(battleId?: string) {
  const store = useArenaBattleStore();
  
  // Fetch battle from database if battleId provided
  const { data: savedBattle, isLoading } = useQuery({
    queryKey: ['arena-battle', battleId],
    queryFn: async () => {
      if (!battleId) return null;
      
      const { data, error } = await supabase
        .from('arena_battles')
        .select('*')
        .eq('id', battleId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!battleId,
  });
  
  // Real-time subscription to battle updates
  useEffect(() => {
    if (!battleId) return;
    
    const subscription = supabase
      .channel(`battle:${battleId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'arena_battles',
          filter: `id=eq.${battleId}`,
        },
        (payload) => {
          console.log('Battle updated:', payload);
          // Update store with new battle data
          if (payload.new) {
            // Would need to convert DB format to BattleState
            // store._setBattle(payload.new);
          }
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [battleId]);
  
  // Start new battle mutation
  const startBattleMutation = useMutation({
    mutationFn: async ({
      config,
      player,
      opponent,
    }: {
      config: ArenaBattleConfig;
      player: ArenaFighter;
      opponent: ArenaFighter;
    }) => {
      await store.initializeBattle(config, player, opponent);
      
      // Optionally save to database
      // const { data, error } = await supabase
      //   .from('arena_battles')
      //   .insert({...})
      //   .single();
      
      return store.currentBattle;
    },
  });
  
  // Save battle to database
  const saveBattleMutation = useMutation({
    mutationFn: async () => {
      if (!store.currentBattle) throw new Error('No active battle');
      
      const { data, error } = await supabase
        .from('arena_battles')
        .upsert({
          id: store.currentBattle.battleId,
          player_holobot_id: store.currentBattle.player.holobotId,
          opponent_holobot_id: store.currentBattle.opponent.holobotId,
          player_user_id: store.currentBattle.player.userId,
          battle_type: store.currentBattle.battleType,
          status: store.currentBattle.status,
          total_turns: store.currentBattle.turnNumber,
          battle_data: store.currentBattle as any,
          replay_data: store.currentBattle.actionHistory,
        })
        .single();
      
      if (error) throw error;
      return data;
    },
  });
  
  return {
    battle: store.currentBattle,
    savedBattle,
    isLoading,
    
    // Actions
    startBattle: startBattleMutation.mutateAsync,
    saveBattle: saveBattleMutation.mutateAsync,
    playCard: store.playCard,
    enterDefenseMode: store.enterDefenseMode,
    useHack: store.useHack,
    useSpecial: store.useSpecialAttack,
    endBattle: store.endBattle,
    pauseBattle: store.pauseBattle,
    resumeBattle: store.resumeBattle,
    
    // Auto-battle
    startAutoBattle: store.startAutoBattle,
    stopAutoBattle: store.stopAutoBattle,
    isAutoBattleRunning: store.isAutoBattleRunning,
    
    // Getters
    availableCards: store.getAvailableCards(),
    canPlayCard: store.canPlayCard,
    currentFighter: store.getCurrentFighter(),
    opponentFighter: store.getOpponentFighter(),
  };
}
