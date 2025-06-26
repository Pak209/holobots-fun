import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AsyncBattle, 
  BattleLeague, 
  BattlePool, 
  BattlePoolEntry, 
  BattleRanking,
  BattleTickets,
  DailyFitnessReward,
  FitnessActivity,
  LeagueType,
  BattlePoolType 
} from '@/types/asyncBattle';

interface AsyncBattleState {
  // Battle pools and leagues
  battlePools: BattlePool[];
  battleLeagues: BattleLeague[];
  poolEntries: BattlePoolEntry[];
  
  // User's battle data
  userBattles: AsyncBattle[];
  userRankings: BattleRanking[];
  battleTickets: BattleTickets | null;
  fitnessActivity: FitnessActivity | null;
  dailyFitnessRewards: DailyFitnessReward | null;
  
  // UI state
  selectedLeague: LeagueType | null;
  selectedPool: BattlePoolType | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setBattlePools: (pools: BattlePool[]) => void;
  setBattleLeagues: (leagues: BattleLeague[]) => void;
  setPoolEntries: (entries: BattlePoolEntry[]) => void;
  setUserBattles: (battles: AsyncBattle[]) => void;
  setUserRankings: (rankings: BattleRanking[]) => void;
  setBattleTickets: (tickets: BattleTickets) => void;
  setFitnessActivity: (activity: FitnessActivity) => void;
  setDailyFitnessRewards: (rewards: DailyFitnessReward) => void;
  
  // Battle operations
  enterBattlePool: (poolId: number, holobotName: string) => Promise<void>;
  enterBattleLeague: (leagueId: number, holobotName: string) => Promise<void>;
  claimBattleRewards: (battleId: number) => Promise<void>;
  updateFitnessActivity: (steps: number, workoutTime: number) => Promise<void>;
  
  // UI actions
  setSelectedLeague: (league: LeagueType | null) => void;
  setSelectedPool: (pool: BattlePoolType | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getActiveBattles: () => AsyncBattle[];
  getCompletedBattles: () => AsyncBattle[];
  getBattlesByType: (type: 'pve_league' | 'pvp_pool') => AsyncBattle[];
  getUserRankingForPool: (poolId: number) => BattleRanking | null;
  canEnterLeague: (league: BattleLeague) => boolean;
  canEnterPool: (pool: BattlePool) => boolean;
  getTicketsRemaining: () => number;
  getTodaysSteps: () => number;
}

export const useAsyncBattleStore = create<AsyncBattleState>()(
  persist(
    (set, get) => ({
      // Initial state
      battlePools: [],
      battleLeagues: [],
      poolEntries: [],
      userBattles: [],
      userRankings: [],
      battleTickets: null,
      fitnessActivity: null,
      dailyFitnessRewards: null,
      selectedLeague: null,
      selectedPool: null,
      isLoading: false,
      error: null,

      // Setters
      setBattlePools: (pools) => set({ battlePools: pools }),
      setBattleLeagues: (leagues) => set({ battleLeagues: leagues }),
      setPoolEntries: (entries) => set({ poolEntries: entries }),
      setUserBattles: (battles) => set({ userBattles: battles }),
      setUserRankings: (rankings) => set({ userRankings: rankings }),
      setBattleTickets: (tickets) => set({ battleTickets: tickets }),
      setFitnessActivity: (activity) => set({ fitnessActivity: activity }),
      setDailyFitnessRewards: (rewards) => set({ dailyFitnessRewards: rewards }),

      // Battle operations
      enterBattlePool: async (poolId: number, holobotName: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Implementation would call Supabase to create battle pool entry
          console.log(`Entering battle pool ${poolId} with ${holobotName}`);
          
          // This would be replaced with actual API call
          // await supabase.from('battle_pool_entries').insert({...})
          
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to enter battle pool' 
          });
        }
      },

      enterBattleLeague: async (leagueId: number, holobotName: string) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log(`Entering battle league ${leagueId} with ${holobotName}`);
          
          // This would be replaced with actual API call
          // await supabase.from('async_battles').insert({...})
          
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to enter battle league' 
          });
        }
      },

      claimBattleRewards: async (battleId: number) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log(`Claiming rewards for battle ${battleId}`);
          
          // This would be replaced with actual API call to claim rewards
          // and update user profile
          
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to claim rewards' 
          });
        }
      },

      updateFitnessActivity: async (steps: number, workoutTime: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const today = new Date().toISOString().split('T')[0];
          
          // This would be replaced with actual API call
          console.log(`Updating fitness: ${steps} steps, ${workoutTime}s workout`);
          
          const newActivity: FitnessActivity = {
            id: Date.now(), // temp ID
            user_id: 'current_user', // would be actual user ID
            date: today,
            steps,
            workout_time: workoutTime,
            calories_burned: Math.floor(steps * 0.04), // rough estimate
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          set({ fitnessActivity: newActivity, isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to update fitness activity' 
          });
        }
      },

      // UI actions
      setSelectedLeague: (league) => set({ selectedLeague: league }),
      setSelectedPool: (pool) => set({ selectedPool: pool }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Getters
      getActiveBattles: () => {
        const { userBattles } = get();
        return userBattles.filter(battle => 
          battle.battle_status === 'pending' || battle.battle_status === 'in_progress'
        );
      },

      getCompletedBattles: () => {
        const { userBattles } = get();
        return userBattles.filter(battle => battle.battle_status === 'completed');
      },

      getBattlesByType: (type: 'pve_league' | 'pvp_pool') => {
        const { userBattles } = get();
        return userBattles.filter(battle => battle.battle_type === type);
      },

      getUserRankingForPool: (poolId: number) => {
        const { userRankings } = get();
        return userRankings.find(ranking => ranking.pool_id === poolId) || null;
      },

      canEnterLeague: (league: BattleLeague) => {
        const { fitnessActivity, battleTickets } = get();
        const todaysSteps = fitnessActivity?.steps || 0;
        const tickets = battleTickets?.daily_tickets || 0;
        
        return (
          todaysSteps >= league.min_steps_required &&
          tickets > 0 &&
          league.is_active
        );
      },

      canEnterPool: (pool: BattlePool) => {
        const { fitnessActivity, battleTickets } = get();
        const todaysSteps = fitnessActivity?.steps || 0;
        const tickets = battleTickets?.daily_tickets || 0;
        const minSteps = pool.entry_requirements.min_steps || 0;
        
        return (
          todaysSteps >= minSteps &&
          tickets > 0 &&
          pool.is_active
        );
      },

      getTicketsRemaining: () => {
        const { battleTickets } = get();
        return (battleTickets?.daily_tickets || 0) + (battleTickets?.bonus_tickets || 0);
      },

      getTodaysSteps: () => {
        const { fitnessActivity } = get();
        return fitnessActivity?.steps || 0;
      }
    }),
    {
      name: 'async-battle-storage',
      partialize: (state) => ({
        selectedLeague: state.selectedLeague,
        selectedPool: state.selectedPool,
        // Don't persist server data, only UI preferences
      }),
    }
  )
); 