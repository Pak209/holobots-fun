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
import { supabase } from '@/integrations/supabase/client';

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

          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('User not authenticated');
          }

          console.log('✅ User authenticated:', user.id);

          // Get the selected holobot's stats from the user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('holobots, username, daily_energy')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('❌ Profile error:', profileError);
            throw new Error(`Failed to get user profile: ${profileError.message}`);
          }

          console.log('✅ Profile data retrieved:', {
            username: profile.username,
            daily_energy: profile.daily_energy,
            holobots_type: typeof profile.holobots,
            holobots_count: Array.isArray(profile.holobots) ? profile.holobots.length : 'not array'
          });

          // Parse holobots JSON and find selected holobot
          let holobots: any[] = [];
          try {
            if (Array.isArray(profile.holobots)) {
              holobots = profile.holobots;
            } else if (typeof profile.holobots === 'string') {
              holobots = JSON.parse(profile.holobots);
            } else if (profile.holobots && typeof profile.holobots === 'object') {
              holobots = [profile.holobots];
            } else {
              holobots = [];
            }
            console.log('✅ Parsed holobots successfully:', holobots.length, 'holobots found');
            console.log('Holobot names:', holobots.map(h => h.name));
          } catch (e) {
            console.error('❌ Error parsing holobots JSON:', e);
            throw new Error('Failed to parse holobots data');
          }

          const selectedHolobot = holobots.find((h: any) => h.name === holobotName);
          
          if (!selectedHolobot) {
            console.error('❌ Holobot not found. Available holobots:', holobots.map(h => h.name));
            throw new Error(`Selected holobot "${holobotName}" not found in your collection. Available: ${holobots.map(h => h.name).join(', ')}`);
          }

          console.log('✅ Selected holobot found:', selectedHolobot);

          // Use the correct battle_pool_entries table instead of battles
          const poolEntryData = {
            pool_id: poolId,
            user_id: user.id,
            holobot_name: holobotName,
            holobot_stats: {
              name: selectedHolobot.name,
              level: selectedHolobot.level || 1,
              attack: selectedHolobot.attack || 100,
              defense: selectedHolobot.defense || 100,
              speed: selectedHolobot.speed || 100,
              maxHealth: selectedHolobot.maxHealth || 100,
              specialMove: selectedHolobot.specialMove || 'Basic Attack',
              intelligence: selectedHolobot.intelligence || 100,
            },
            fitness_bonus: {}, // Will be calculated by the fitness system
            is_active: true
          };

          console.log('📝 Pool entry data to insert:', JSON.stringify(poolEntryData, null, 2));

          const { error: insertError, data: insertedData } = await supabase
            .from('battle_pool_entries' as any)
            .insert(poolEntryData)
            .select();

          if (insertError) {
            console.error('❌ Insert error:', insertError);
            console.error('Insert error details:', {
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              code: insertError.code
            });
            throw new Error(`Failed to create pool entry: ${insertError.message}`);
          }

          console.log('✅ Pool entry created successfully:', insertedData);

          // Deduct energy
          const newEnergyLevel = Math.max(0, (profile.daily_energy || 10) - 1);
          console.log('⚡ Updating energy from', profile.daily_energy, 'to', newEnergyLevel);

          const { error: energyError } = await supabase
            .from('profiles')
            .update({ 
              daily_energy: newEnergyLevel
            })
            .eq('id', user.id);

          if (energyError) {
            console.warn('⚠️ Failed to deduct energy (non-critical):', energyError);
          } else {
            console.log('✅ Energy deducted successfully');
          }
          
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

          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('User not authenticated');
          }

          console.log('✅ User authenticated:', user.id);

          // Get the selected holobot's stats from the user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('holobots, username, daily_energy')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('❌ Profile error:', profileError);
            throw new Error(`Failed to get user profile: ${profileError.message}`);
          }

          console.log('✅ Profile data retrieved:', {
            username: profile.username,
            daily_energy: profile.daily_energy,
            holobots_type: typeof profile.holobots,
            holobots_count: Array.isArray(profile.holobots) ? profile.holobots.length : 'not array'
          });

          // Parse holobots JSON and find selected holobot
          let holobots: any[] = [];
          try {
            if (Array.isArray(profile.holobots)) {
              holobots = profile.holobots;
            } else if (typeof profile.holobots === 'string') {
              holobots = JSON.parse(profile.holobots);
            } else if (profile.holobots && typeof profile.holobots === 'object') {
              holobots = [profile.holobots];
            } else {
              holobots = [];
            }
            console.log('✅ Parsed holobots successfully:', holobots.length, 'holobots found');
            console.log('Holobot names:', holobots.map(h => h.name));
          } catch (e) {
            console.error('❌ Error parsing holobots JSON:', e);
            throw new Error('Failed to parse holobots data');
          }

          const selectedHolobot = holobots.find((h: any) => h.name === holobotName);
          
          if (!selectedHolobot) {
            console.error('❌ Holobot not found. Available holobots:', holobots.map(h => h.name));
            throw new Error(`Selected holobot "${holobotName}" not found in your collection. Available: ${holobots.map(h => h.name).join(', ')}`);
          }

          console.log('✅ Selected holobot found:', selectedHolobot);

          // Use the correct async_battles table for PvE league battles
          const battleData = {
            battle_type: 'pve_league',
            league_id: leagueId,
            player1_id: user.id,
            player1_holobot: {
              name: selectedHolobot.name,
              level: selectedHolobot.level || 1,
              attack: selectedHolobot.attack || 100,
              defense: selectedHolobot.defense || 100,
              speed: selectedHolobot.speed || 100,
              maxHealth: selectedHolobot.maxHealth || 100,
              health: selectedHolobot.maxHealth || 100,
              specialMove: selectedHolobot.specialMove || 'Basic Attack',
              intelligence: selectedHolobot.intelligence || 100,
              is_cpu: false,
            },
            player2_id: null, // PvE has no second player
            player2_holobot: {
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
            battle_status: 'pending',
            rewards: {
              holos: 50 + (leagueId * 25),
              exp: 100 + (leagueId * 50)
            },
            scheduled_at: new Date().toISOString()
          };

          console.log('📝 League battle data to insert:', JSON.stringify(battleData, null, 2));

          const { error: insertError, data: insertedData } = await supabase
            .from('async_battles' as any)
            .insert(battleData)
            .select();

          if (insertError) {
            console.error('❌ Insert error:', insertError);
            console.error('Insert error details:', {
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              code: insertError.code
            });
            throw new Error(`Failed to create league battle: ${insertError.message}`);
          }

          console.log('✅ League battle created successfully:', insertedData);

          // Deduct energy
          const newEnergyLevel = Math.max(0, (profile.daily_energy || 10) - 1);
          console.log('⚡ Updating energy from', profile.daily_energy, 'to', newEnergyLevel);

          const { error: energyError } = await supabase
            .from('profiles')
            .update({ 
              daily_energy: newEnergyLevel
            })
            .eq('id', user.id);

          if (energyError) {
            console.warn('⚠️ Failed to deduct energy (non-critical):', energyError);
          } else {
            console.log('✅ Energy deducted successfully');
          }
          
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
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('User not authenticated');
          }

          console.log('✅ User authenticated:', user.id);

          // Fetch all league battles for counting
          const { data: leagueBattles, error: countsError } = await supabase
            .from('async_battles' as any)
            .select('league_id')
            .eq('battle_type', 'pve_league')
            .not('battle_status', 'eq', 'completed');

          if (countsError) {
            console.error('❌ Error fetching league battles:', countsError);
            throw new Error('Failed to fetch league battles');
          }

          console.log('✅ League battles retrieved:', leagueBattles);

          // Count battles per league
          const counts: Record<number, number> = {};
          leagueBattles?.forEach((battle: any) => {
            if (battle.league_id) {
              counts[battle.league_id] = (counts[battle.league_id] || 0) + 1;
            }
          });

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