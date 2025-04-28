import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BattleResult, BattleTicket, League, LeagueTier, PlayerSnapshot } from '@/types/league';
import { leagueService } from '@/services/league-service';
import { Holobot } from '@/types/holobot';
import { generateUUID } from '@/utils/battleUtils';

interface LeagueState {
  leagues: League[];
  selectedLeague: League | null;
  battleTickets: BattleTicket[];
  battleResults: BattleResult[];
  currentBattle: BattleResult | null;
  activeHolobot: Holobot | null;
  leaderboard: Record<LeagueTier, PlayerSnapshot[]>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLeagues: () => Promise<void>;
  selectLeague: (leagueId: string) => void;
  fetchBattleTickets: () => Promise<void>;
  fetchBattleResults: () => Promise<void>;
  fetchLeaderboard: (tier: LeagueTier) => Promise<void>;
  startPvEBattle: (opponentId: string, holobot: Holobot, dailySteps: number) => Promise<BattleResult>;
  startPvPBattle: (holobot: Holobot, dailySteps: number) => Promise<BattleResult>;
  claimRewards: (battleId: string) => Promise<void>;
  purchaseTickets: () => Promise<void>;
  setActiveHolobot: (holobot: Holobot) => void;
}

export const useLeagueStore = create<LeagueState>()(
  persist(
    (set, get) => ({
      leagues: [],
      selectedLeague: null,
      battleTickets: [],
      battleResults: [],
      currentBattle: null,
      activeHolobot: null,
      leaderboard: {
        junkyard: [],
        'city-scraps': [],
        'neon-core': [],
        overlord: []
      },
      isLoading: false,
      error: null,
      
      fetchLeagues: async () => {
        set({ isLoading: true, error: null });
        try {
          const leagues = await leagueService.getLeagues();
          set({ leagues, isLoading: false });
        } catch (error) {
          console.error('Error fetching leagues:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch leagues', 
            isLoading: false 
          });
        }
      },
      
      selectLeague: (leagueId: string) => {
        const { leagues } = get();
        const selectedLeague = leagues.find(league => league.id === leagueId) || null;
        set({ selectedLeague });
      },
      
      fetchBattleTickets: async () => {
        set({ isLoading: true, error: null });
        try {
          const battleTickets = await leagueService.getBattleTickets();
          set({ battleTickets, isLoading: false });
        } catch (error) {
          console.error('Error fetching battle tickets:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch battle tickets', 
            isLoading: false 
          });
        }
      },
      
      fetchBattleResults: async () => {
        set({ isLoading: true, error: null });
        try {
          const battleResults = await leagueService.getBattleResults();
          set({ battleResults, isLoading: false });
        } catch (error) {
          console.error('Error fetching battle results:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch battle results', 
            isLoading: false 
          });
        }
      },
      
      fetchLeaderboard: async (tier: LeagueTier) => {
        set({ isLoading: true, error: null });
        try {
          const leaderboardData = await leagueService.getLeaderboard(tier);
          set(state => ({
            leaderboard: {
              ...state.leaderboard,
              [tier]: leaderboardData
            },
            isLoading: false
          }));
        } catch (error) {
          console.error('Error fetching leaderboard:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch leaderboard', 
            isLoading: false 
          });
        }
      },
      
      startPvEBattle: async (opponentId: string, holobot: Holobot, dailySteps: number) => {
        set({ isLoading: true, error: null });
        try {
          const { selectedLeague } = get();
          if (!selectedLeague) {
            throw new Error('No league selected');
          }
          
          const opponent = selectedLeague.opponents.find(o => o.id === opponentId);
          if (!opponent) {
            throw new Error('Opponent not found');
          }
          
          // Calculate step buffs
          const stepBuffs = {
            totalSteps: dailySteps,
            healthBonus: Math.min(dailySteps / 10000, 0.2), // Max 20% bonus
            attackBonus: Math.min(dailySteps / 15000, 0.15), // Max 15% bonus
            meterChargeBonus: Math.min(dailySteps / 8000, 0.25), // Max 25% bonus
          };
          
          // Simulate battle result
          const userWinChance = 0.5 + (holobot.level / 100) - (opponent.difficulty === 'easy' ? -0.2 : 
                                                              opponent.difficulty === 'medium' ? 0 : 
                                                              opponent.difficulty === 'hard' ? 0.2 : 0.3);
          
          const randomOutcome = Math.random();
          const winner = randomOutcome < userWinChance ? 'user' : 'opponent';
          
          // Create battle result
          const battleResult: BattleResult = {
            id: generateUUID(),
            userHolobot: {
              id: holobot.id,
              name: holobot.name,
              level: holobot.level,
              image: holobot.image || `https://source.unsplash.com/random/300x300?robot&sig=${holobot.id}`,
              stats: {
                health: holobot.health || 100,
                attack: holobot.attack || 50,
                defense: holobot.defense || 30,
                speed: holobot.speed || 40
              }
            },
            opponentHolobot: opponent.holobot,
            winner,
            battleLog: [
              'Battle started!',
              `${holobot.name} vs ${opponent.holobot.name}`,
              winner === 'user' ? `${holobot.name} wins!` : `${opponent.holobot.name} wins!`
            ],
            rewards: winner === 'user' ? {
              holos: selectedLeague.rewards.holos,
              experience: selectedLeague.rewards.experience,
              gachaTickets: selectedLeague.rewards.gachaTickets
            } : undefined,
            createdAt: new Date(),
            isPvP: false,
            leagueId: selectedLeague.id,
            opponentId,
            stepBuffs
          };
          
          // Update state with new battle result
          set(state => ({
            battleResults: [battleResult, ...state.battleResults],
            currentBattle: battleResult,
            isLoading: false
          }));
          
          return battleResult;
        } catch (error) {
          console.error('Error starting PvE battle:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to start battle', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      startPvPBattle: async (holobot: Holobot, dailySteps: number) => {
        set({ isLoading: true, error: null });
        try {
          const { battleTickets } = get();
          
          // Find an available ticket
          const availableTicket = battleTickets.find(
            ticket => !ticket.used && new Date(ticket.expiresAt) > new Date()
          );
          
          if (!availableTicket) {
            throw new Error('No available battle tickets');
          }
          
          // Mark ticket as used
          await leagueService.useTicket(availableTicket.id);
          
          // Calculate step buffs
          const stepBuffs = {
            totalSteps: dailySteps,
            healthBonus: Math.min(dailySteps / 10000, 0.2), // Max 20% bonus
            attackBonus: Math.min(dailySteps / 15000, 0.15), // Max 15% bonus
            meterChargeBonus: Math.min(dailySteps / 8000, 0.25), // Max 25% bonus
          };
          
          // Generate a random opponent
          const opponentLevel = Math.max(1, Math.min(20, holobot.level + Math.floor(Math.random() * 5) - 2));
          const opponentTypes = ['Balanced', 'Attacker', 'Defender', 'Speed'];
          const opponentType = opponentTypes[Math.floor(Math.random() * opponentTypes.length)];
          
          // Create a random opponent holobot
          const opponentHolobot = {
            id: generateUUID(),
            name: `${opponentType} Holobot`,
            level: opponentLevel,
            image: `https://source.unsplash.com/random/300x300?robot&sig=${opponentLevel}`,
            stats: {
              health: 80 + (opponentLevel * 10) + (opponentType === 'Defender' ? 30 : 0),
              attack: 40 + (opponentLevel * 5) + (opponentType === 'Attacker' ? 20 : 0),
              defense: 30 + (opponentLevel * 3) + (opponentType === 'Defender' ? 15 : 0),
              speed: 35 + (opponentLevel * 2) + (opponentType === 'Speed' ? 15 : 0)
            }
          };
          
          // Simulate battle result
          const userWinChance = 0.5 + ((holobot.level - opponentLevel) * 0.05);
          const randomOutcome = Math.random();
          const winner = randomOutcome < userWinChance ? 'user' : 'opponent';
          
          // Create battle result
          const battleResult: BattleResult = {
            id: generateUUID(),
            userHolobot: {
              id: holobot.id,
              name: holobot.name,
              level: holobot.level,
              image: holobot.image || `https://source.unsplash.com/random/300x300?robot&sig=${holobot.id}`,
              stats: {
                health: holobot.health || 100,
                attack: holobot.attack || 50,
                defense: holobot.defense || 30,
                speed: holobot.speed || 40
              }
            },
            opponentHolobot,
            winner,
            battleLog: [
              'PvP Battle started!',
              `${holobot.name} vs ${opponentHolobot.name}`,
              winner === 'user' ? `${holobot.name} wins!` : `${opponentHolobot.name} wins!`
            ],
            rewards: winner === 'user' ? {
              holos: 100 + (opponentLevel * 5),
              experience: 50 + (opponentLevel * 3),
              gachaTickets: Math.random() < 0.2 ? 1 : 0 // 20% chance to get a gacha ticket
            } : undefined,
            createdAt: new Date(),
            isPvP: true,
            opponentId: opponentHolobot.id,
            stepBuffs
          };
          
          // Update state with new battle result and mark ticket as used
          set(state => ({
            battleResults: [battleResult, ...state.battleResults],
            currentBattle: battleResult,
            battleTickets: state.battleTickets.map(ticket => 
              ticket.id === availableTicket.id ? { ...ticket, used: true } : ticket
            ),
            isLoading: false
          }));
          
          return battleResult;
        } catch (error) {
          console.error('Error starting PvP battle:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to start PvP battle', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      claimRewards: async (battleId: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call an API to claim rewards
          await leagueService.claimBattleRewards(battleId);
          
          // Update battle results to remove rewards (indicating they've been claimed)
          set(state => ({
            battleResults: state.battleResults.map(battle => 
              battle.id === battleId ? { ...battle, rewards: undefined } : battle
            ),
            isLoading: false
          }));
        } catch (error) {
          console.error('Error claiming rewards:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to claim rewards', 
            isLoading: false 
          });
        }
      },
      
      purchaseTickets: async () => {
        set({ isLoading: true, error: null });
        try {
          await leagueService.purchaseTickets();
          await get().fetchBattleTickets();
          set({ isLoading: false });
        } catch (error) {
          console.error('Error purchasing tickets:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to purchase tickets', 
            isLoading: false 
          });
        }
      },
      
      setActiveHolobot: (holobot: Holobot) => {
        set({ activeHolobot: holobot });
      }
    }),
    {
      name: 'league-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        battleResults: state.battleResults,
        battleTickets: state.battleTickets,
        currentBattle: state.currentBattle,
      }),
    }
  )
);