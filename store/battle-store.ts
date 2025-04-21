```typescript
import { create } from 'zustand';
import { BattleState, BattleAction, BattleEffect, BattleResult } from '@/types/battle';
import { battleService } from '@/services/battle-service';

interface BattleStore {
  currentBattle: BattleState | null;
  battleLog: string[];
  isLoading: boolean;
  error: string | null;
  
  initializeBattle: (battleId: string) => Promise<void>;
  performAction: (action: BattleAction) => Promise<void>;
  useHack: (hackType: string) => Promise<void>;
  endBattle: () => Promise<BattleResult>;
  clearError: () => void;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  currentBattle: null,
  battleLog: [],
  isLoading: false,
  error: null,

  initializeBattle: async (battleId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const battleState = await battleService.initializeBattle(battleId);
      
      battleService.subscribeToBattleUpdates((state) => {
        set({ currentBattle: state });
      });
      
      set({ 
        currentBattle: battleState,
        battleLog: [],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize battle',
        isLoading: false 
      });
    }
  },

  performAction: async (action: BattleAction) => {
    try {
      set({ isLoading: true, error: null });
      
      const { currentBattle } = get();
      if (!currentBattle) throw new Error('No active battle');
      
      const effect = await battleService.performAction(currentBattle.id, action);
      
      set(state => ({ 
        battleLog: [...state.battleLog, effect.message],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to perform action',
        isLoading: false 
      });
    }
  },

  useHack: async (hackType: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { currentBattle } = get();
      if (!currentBattle) throw new Error('No active battle');
      
      const effect = await battleService.useHack(currentBattle.id, hackType);
      
      set(state => ({ 
        battleLog: [...state.battleLog, effect.message],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to use hack',
        isLoading: false 
      });
    }
  },

  endBattle: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { currentBattle } = get();
      if (!currentBattle) throw new Error('No active battle');
      
      const result = await battleService.endBattle(currentBattle.id);
      
      set({ 
        currentBattle: null,
        battleLog: [],
        isLoading: false 
      });
      
      return result;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to end battle',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
```