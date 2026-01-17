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
import { PlayerRank } from '@/types/playerRank';
import { HOLOBOT_STATS } from '@/types/holobot';
import { auth } from '@/lib/firebase';
import { 
  getUserProfile, 
  createBattlePoolEntry, 
  createAsyncBattle, 
  updateUserEnergy, 
  getLeagueBattleCounts 
} from '@/lib/firestore';

// Helper function to compare player ranks
const getPlayerRankOrder = (rank: string): number => {
  const rankOrder = {
    'Rookie': 0,
    'Champion': 1,
    'Rare': 2,
    'Elite': 3,
    'Legend': 4,
    'Mythic': 5
  };
  return rankOrder[rank as keyof typeof rankOrder] || 0;
};

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
  canEnterLeague: (league: BattleLeague, userPlayerRank: PlayerRank) => boolean;
  canEnterPool: (pool: BattlePool, userPlayerRank: PlayerRank) => boolean;
  getTicketsRemaining: () => number;
  getTodaysSteps: () => number;
  
  // New function to get league battle counts
  getLeagueBattleCounts: () => Promise<Record<number, number>>;
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
          console.log('=== ENTERING BATTLE POOL ===');
          console.log('Pool ID:', poolId);
          console.log('Holobot Name:', holobotName);

          const user = auth.currentUser;
          
          if (!user) {
            throw new Error('User not authenticated');
          }

          console.log('✅ User authenticated:', user.uid);

          // Get the selected holobot's stats from the user profile
          const profile = await getUserProfile(user.uid);

          if (!profile) {
            console.error('❌ Profile not found');
            throw new Error('Failed to get user profile');
          }

          console.log('✅ Profile data retrieved:', {
            username: profile.username,
            daily_energy: profile.dailyEnergy,
            holobots_count: profile.holobots?.length || 0
          });

          const holobots = profile.holobots || [];
          console.log('✅ Holobots found:', holobots.length);
          console.log('Holobot names:', holobots.map(h => h.name));

          const selectedHolobot = holobots.find((h: any) => h.name === holobotName);
          
          if (!selectedHolobot) {
            console.error('❌ Holobot not found. Available holobots:', holobots.map(h => h.name));
            throw new Error(`Selected holobot "${holobotName}" not found in your collection. Available: ${holobots.map(h => h.name).join(', ')}`);
          }

          console.log('✅ Selected holobot found:', selectedHolobot);

          const baseStats = HOLOBOT_STATS[holobotName.toLowerCase()] || {
            attack: 100,
            defense: 100,
            speed: 100,
            maxHealth: 100,
            specialMove: 'Basic Attack',
            intelligence: 100
          };

          // Create battle pool entry
          const poolEntryId = await createBattlePoolEntry({
            poolId,
            userId: user.uid,
            holobotName,
            holobotStats: {
              name: selectedHolobot.name,
              level: selectedHolobot.level || 1,
              attack: baseStats.attack || 100,
              defense: baseStats.defense || 100,
              speed: baseStats.speed || 100,
              maxHealth: baseStats.maxHealth || 100,
              specialMove: baseStats.specialMove || 'Basic Attack',
              intelligence: baseStats.intelligence || 100,
            },
            fitnessBonus: {}, // Will be calculated by the fitness system
            isActive: true
          });

          console.log('✅ Pool entry created successfully:', poolEntryId);

          // Deduct energy
          const newEnergyLevel = Math.max(0, (profile.dailyEnergy || 10) - 1);
          console.log('⚡ Updating energy from', profile.dailyEnergy, 'to', newEnergyLevel);

          await updateUserEnergy(user.uid, newEnergyLevel);
          console.log('✅ Energy deducted successfully');
          
          set({ isLoading: false });
          console.log('🎉 Successfully entered battle pool!');
        } catch (error) {
          console.error('💥 enterBattlePool error:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to enter battle pool' 
          });
          throw error;
        }
      },

      enterBattleLeague: async (leagueId: number, holobotName: string) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('=== ENTERING BATTLE LEAGUE ===');
          console.log('League ID:', leagueId);
          console.log('Holobot Name:', holobotName);

          const user = auth.currentUser;
          
          if (!user) {
            throw new Error('User not authenticated');
          }

          console.log('✅ User authenticated:', user.uid);

          // Get the selected holobot's stats from the user profile
          const profile = await getUserProfile(user.uid);

          if (!profile) {
            console.error('❌ Profile not found');
            throw new Error('Failed to get user profile');
          }

          console.log('✅ Profile data retrieved:', {
            username: profile.username,
            daily_energy: profile.dailyEnergy,
            holobots_count: profile.holobots?.length || 0
          });

          const holobots = profile.holobots || [];
          console.log('✅ Holobots found:', holobots.length);
          console.log('Holobot names:', holobots.map(h => h.name));

          const selectedHolobot = holobots.find((h: any) => h.name === holobotName);
          
          if (!selectedHolobot) {
            console.error('❌ Holobot not found. Available holobots:', holobots.map(h => h.name));
            throw new Error(`Selected holobot "${holobotName}" not found in your collection. Available: ${holobots.map(h => h.name).join(', ')}`);
          }

          console.log('✅ Selected holobot found:', selectedHolobot);

          const baseStats = HOLOBOT_STATS[holobotName.toLowerCase()] || {
            attack: 100,
            defense: 100,
            speed: 100,
            maxHealth: 100,
            specialMove: 'Basic Attack',
            intelligence: 100
          };

          // Create async battle for PvE league
          const battleId = await createAsyncBattle({
            battleType: 'pve_league',
            leagueId,
            player1Id: user.uid,
            player1Holobot: {
              name: selectedHolobot.name,
              level: selectedHolobot.level || 1,
              attack: baseStats.attack || 100,
              defense: baseStats.defense || 100,
              speed: baseStats.speed || 100,
              maxHealth: baseStats.maxHealth || 100,
              health: baseStats.maxHealth || 100,
              specialMove: baseStats.specialMove || 'Basic Attack',
              intelligence: baseStats.intelligence || 100,
              is_cpu: false,
            },
            player2Id: null, // PvE has no second player
            player2Holobot: {
              name: 'AI Opponent',
              level: 5 + leagueId,
              attack: 90 + (leagueId * 10),
              defense: 90 + (leagueId * 10),
              speed: 90 + (leagueId * 10),
              maxHealth: 90 + (leagueId * 10),
              health: 90 + (leagueId * 10),
              specialMove: 'CPU Attack',
              intelligence: 90 + (leagueId * 10),
              is_cpu: true,
            },
            battleStatus: 'pending',
            rewards: {
              holos: 50 + (leagueId * 25),
              exp: 100 + (leagueId * 50)
            },
            scheduledAt: new Date().toISOString()
          });

          console.log('✅ League battle created successfully:', battleId);

          // Deduct energy
          const newEnergyLevel = Math.max(0, (profile.dailyEnergy || 10) - 1);
          console.log('⚡ Updating energy from', profile.dailyEnergy, 'to', newEnergyLevel);

          await updateUserEnergy(user.uid, newEnergyLevel);
          console.log('✅ Energy deducted successfully');
          
          set({ isLoading: false });
          console.log('🎉 Successfully entered battle league!');
        } catch (error) {
          console.error('💥 enterBattleLeague error:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to enter battle league' 
          });
          throw error;
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

      canEnterLeague: (league: BattleLeague, userPlayerRank: PlayerRank) => {
        const { battleTickets } = get();
        const tickets = battleTickets?.daily_tickets || 0;
        
        // Check if user meets minimum player rank requirement
        const requiredRankOrder = getPlayerRankOrder(league.min_steps_required.toString()); // This would be changed to min_player_rank in real implementation
        const userRankOrder = getPlayerRankOrder(userPlayerRank);
        
        return (
          userRankOrder >= requiredRankOrder &&
          tickets > 0 &&
          league.is_active
        );
      },

      canEnterPool: (pool: BattlePool, userPlayerRank: PlayerRank) => {
        const { battleTickets } = get();
        const tickets = battleTickets?.daily_tickets || 0;
        
        // Check player rank requirement for ranked pools
        if (pool.entry_requirements.min_player_rank) {
          const requiredRankOrder = getPlayerRankOrder(pool.entry_requirements.min_player_rank);
          const userRankOrder = getPlayerRankOrder(userPlayerRank);
          
          return (
            userRankOrder >= requiredRankOrder &&
            tickets > 0 &&
            pool.is_active
          );
        }
        
        // For casual pools with no rank requirement
        return tickets > 0 && pool.is_active;
      },

      getTicketsRemaining: () => {
        const { battleTickets } = get();
        return (battleTickets?.daily_tickets || 0) + (battleTickets?.bonus_tickets || 0);
      },

      getTodaysSteps: () => {
        const { fitnessActivity } = get();
        return fitnessActivity?.steps || 0;
      },

      // New function to get league battle counts
      getLeagueBattleCounts: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const user = auth.currentUser;
          
          if (!user) {
            throw new Error('User not authenticated');
          }

          console.log('✅ User authenticated:', user.uid);

          // Fetch all league battles for counting
          const counts = await getLeagueBattleCounts();

          console.log('✅ League battle counts retrieved:', counts);

          set({ isLoading: false });
          return counts;
        } catch (error) {
          console.error('💥 getLeagueBattleCounts error:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to get league battle counts' 
          });
          throw error;
        }
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