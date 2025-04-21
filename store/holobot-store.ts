import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Holobot, Battle, HackOption, HOLOBOT_STATS, getRank } from '@/types/holobot';
import { supabase } from '@/lib/supabase';
import { getHolobotImageUrl } from '@/utils/holobotUtils';

interface HolobotState {
  holobots: Holobot[];
  selectedHolobotId: string | null;
  holobot: Holobot | null;
  battles: Battle[];
  activeBattle: Battle | null;
  hackOptions: HackOption[];
  isLoading: boolean;
  error: string | null;
}

interface HolobotStore extends HolobotState {
  fetchHolobots: () => Promise<void>;
  fetchHolobot: () => Promise<void>;
  fetchBattles: () => Promise<void>;
  selectHolobot: (holobotId: string) => void;
  setActiveBattle: (battle: Battle) => void;
  useHack: (battleId: string, hackId: string) => Promise<void>;
  applyWorkoutRewards: (syncPoints: number) => Promise<void>;
  clearError: () => void;
}

const mockHackOptions: HackOption[] = [
  {
    id: 'hack1',
    name: 'Health Boost',
    description: 'Restore 30% of max health',
    icon: 'heart',
    cooldown: 60,
    effect: 'heal'
  },
  {
    id: 'hack2',
    name: 'Power Surge',
    description: 'Increase attack power by 50% for 10 seconds',
    icon: 'zap',
    cooldown: 90,
    effect: 'attack'
  },
  {
    id: 'hack3',
    name: 'Defense Matrix',
    description: 'Reduce incoming damage by 40% for 8 seconds',
    icon: 'shield',
    cooldown: 120,
    effect: 'defense'
  }
];

// Create mock Holobots
const createMockHolobots = (): Holobot[] => {
  const holobotNames = ['ace', 'kuma', 'shadow', 'hare', 'tora'];
  
  return holobotNames.map((name, index) => {
    const stats = HOLOBOT_STATS[name];
    return {
      id: (index + 1).toString(),
      name: stats.name,
      rank: getRank(stats.level || 1),
      level: stats.level || 1,
      energy: 75,
      maxEnergy: 100,
      syncPoints: 1250,
      dailySyncQuota: 5000,
      dailySyncUsed: 2500,
      hackMeter: 80,
      maxHackMeter: 100,
      attributes: {
        strength: stats.attack,
        agility: stats.speed,
        intelligence: stats.intelligence || 0,
        durability: stats.defense
      },
      stats: stats,
      image: getHolobotImageUrl(name),
      nextBattle: {
        time: new Date(Date.now() + 3600000 * (index + 1)).toISOString(),
        opponent: HOLOBOT_STATS[holobotNames[(index + 1) % holobotNames.length]].name
      },
      lastBattle: {
        result: index % 2 === 0 ? 'win' : 'loss',
        opponent: HOLOBOT_STATS[holobotNames[(index + 2) % holobotNames.length]].name
      },
      streak: {
        type: index % 2 === 0 ? 'win' : 'loss',
        count: Math.floor(Math.random() * 5) + 1
      }
    };
  });
};

// Mock battles data
const mockBattles: Battle[] = [
  {
    id: '1',
    startTime: new Date(Date.now() + 3600000).toISOString(),
    duration: 60,
    opponent: {
      id: '101',
      name: HOLOBOT_STATS.kuma.name,
      rank: getRank(HOLOBOT_STATS.kuma.level || 1),
      level: HOLOBOT_STATS.kuma.level || 1,
      stats: HOLOBOT_STATS.kuma
    },
    status: 'upcoming',
    hackUsed: false
  },
  {
    id: '2',
    startTime: new Date(Date.now() - 7200000).toISOString(),
    duration: 60,
    opponent: {
      id: '102',
      name: HOLOBOT_STATS.shadow.name,
      rank: getRank(HOLOBOT_STATS.shadow.level || 1),
      level: HOLOBOT_STATS.shadow.level || 1,
      stats: HOLOBOT_STATS.shadow
    },
    status: 'completed',
    result: 'win',
    hackUsed: true
  }
];

export const useHolobotStore = create<HolobotStore>()(
  persist(
    (set, get) => ({
      holobots: [],
      selectedHolobotId: null,
      holobot: null,
      battles: [],
      activeBattle: null,
      hackOptions: mockHackOptions,
      isLoading: false,
      error: null,

      fetchHolobots: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Try to get current session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Try to fetch holobots from Supabase
            const { data, error } = await supabase
              .from('profiles')
              .select('holobots')
              .eq('id', session.user.id)
              .single();
              
            if (!error && data && data.holobots && Array.isArray(data.holobots)) {
              // Map the holobots from the database to our app's format
              const holobots = data.holobots.map((holobot: any, index: number) => {
                const stats = HOLOBOT_STATS[holobot.name.toLowerCase()] || HOLOBOT_STATS.ace;
                const holobotKey = holobot.name.toLowerCase();
                
                return {
                  id: holobot.id || (index + 1).toString(),
                  name: holobot.name,
                  rank: holobot.rank || getRank(holobot.level || 1),
                  level: holobot.level || 1,
                  energy: holobot.energy || 75,
                  maxEnergy: holobot.maxEnergy || 100,
                  syncPoints: holobot.syncPoints || 0,
                  dailySyncQuota: holobot.dailySyncQuota || 5000,
                  dailySyncUsed: holobot.dailySyncUsed || 0,
                  hackMeter: holobot.hackMeter || 80,
                  maxHackMeter: holobot.maxHackMeter || 100,
                  attributes: holobot.attributes || {
                    strength: stats.attack,
                    agility: stats.speed,
                    intelligence: stats.intelligence || 0,
                    durability: stats.defense
                  },
                  stats: {
                    ...stats,
                    level: holobot.level || 1,
                    experience: holobot.experience || 0,
                    nextLevelExp: holobot.nextLevelExp || 100
                  },
                  image: getHolobotImageUrl(holobotKey),
                  nextBattle: holobot.nextBattle || null,
                  lastBattle: holobot.lastBattle || null,
                  streak: holobot.streak || { type: 'win', count: 0 }
                };
              });
              
              set({ 
                holobots,
                isLoading: false 
              });
              
              // If no holobot is selected, select the first one
              const { selectedHolobotId } = get();
              if (!selectedHolobotId && holobots.length > 0) {
                set({ selectedHolobotId: holobots[0].id });
              }
              
              return;
            }
          }
          
          // Fallback to mock data if no user or error
          const mockHolobots = createMockHolobots();
          set({ 
            holobots: mockHolobots,
            isLoading: false 
          });
          
          // If no holobot is selected, select the first one
          const { selectedHolobotId } = get();
          if (!selectedHolobotId && mockHolobots.length > 0) {
            set({ selectedHolobotId: mockHolobots[0].id });
          }
        } catch (error) {
          console.error('Error fetching holobots:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch Holobots', 
            isLoading: false 
          });
          
          // Fallback to mock data
          const mockHolobots = createMockHolobots();
          set({ holobots: mockHolobots });
        }
      },

      fetchHolobot: async () => {
        try {
          const { holobots, selectedHolobotId } = get();
          
          // If we already have holobots, just select the current one
          if (holobots.length > 0 && selectedHolobotId) {
            const selectedHolobot = holobots.find(h => h.id === selectedHolobotId) || holobots[0];
            set({ holobot: selectedHolobot });
            return;
          }
          
          // Otherwise fetch holobots first
          set({ isLoading: true, error: null });
          await get().fetchHolobots();
          
          // Now select the holobot
          const updatedHolobots = get().holobots;
          const updatedSelectedId = get().selectedHolobotId || (updatedHolobots.length > 0 ? updatedHolobots[0].id : null);
          
          if (updatedSelectedId) {
            const selectedHolobot = updatedHolobots.find(h => h.id === updatedSelectedId) || updatedHolobots[0];
            set({ 
              holobot: selectedHolobot,
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch Holobot', 
            isLoading: false 
          });
        }
      },

      fetchBattles: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Try to get current session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // In a real app, we would fetch battles from the server here
            // For now, use mock data
            set({ battles: mockBattles, isLoading: false });
            return;
          }
          
          // Fallback to mock data
          set({ battles: mockBattles, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch battles', 
            isLoading: false 
          });
          
          // Fallback to mock data
          set({ battles: mockBattles });
        }
      },

      selectHolobot: (holobotId: string) => {
        const { holobots } = get();
        const selectedHolobot = holobots.find(h => h.id === holobotId);
        
        if (selectedHolobot) {
          set({ 
            selectedHolobotId: holobotId,
            holobot: selectedHolobot
          });
        }
      },

      setActiveBattle: (battle: Battle) => {
        set({ activeBattle: battle });
      },

      useHack: async (battleId: string, hackId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, we would call the server to use the hack
          // For now, simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const { battles } = get();
          const updatedBattles = battles.map(battle => 
            battle.id === battleId 
              ? { ...battle, hackUsed: true }
              : battle
          );
          
          set({ 
            battles: updatedBattles,
            activeBattle: null,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to use hack', 
            isLoading: false 
          });
        }
      },

      applyWorkoutRewards: async (syncPoints: number) => {
        try {
          set({ isLoading: true, error: null });
          
          const { holobots, selectedHolobotId } = get();
          
          if (!selectedHolobotId || !holobots.length) {
            throw new Error('No Holobot selected');
          }
          
          // Calculate exp gains based on sync points
          const expGained = Math.floor(syncPoints * 0.5);
          const holosGained = Math.floor(syncPoints * 0.2);
          
          // Update the selected holobot's stats
          const updatedHolobots = holobots.map(holobot => {
            if (holobot.id === selectedHolobotId) {
              // Current exp + new exp
              const currentExp = holobot.stats.experience || 0;
              const currentLevel = holobot.stats.level || 1;
              let totalExp = currentExp + expGained;
              
              // Calculate exp needed for next level
              const nextLevelExp = holobot.stats.nextLevelExp || 100 * currentLevel;
              
              // Check if level up
              let newLevel = currentLevel;
              let remainingExp = totalExp;
              let newNextLevelExp = nextLevelExp;
              
              // Handle potential level up
              if (totalExp >= nextLevelExp) {
                newLevel = currentLevel + 1;
                remainingExp = totalExp - nextLevelExp;
                newNextLevelExp = 100 * newLevel;
              }
              
              // Calculate stat boosts based on level gain
              const levelDiff = newLevel - currentLevel;
              const statBoost = levelDiff * 2; // +2 to each stat per level
              
              return {
                ...holobot,
                level: newLevel,
                syncPoints: holobot.syncPoints + syncPoints,
                stats: {
                  ...holobot.stats,
                  attack: holobot.stats.attack + statBoost,
                  defense: holobot.stats.defense + statBoost,
                  speed: holobot.stats.speed + statBoost,
                  experience: remainingExp,
                  nextLevelExp: newNextLevelExp
                },
                attributes: {
                  ...holobot.attributes,
                  strength: holobot.attributes.strength + statBoost,
                  durability: holobot.attributes.durability + statBoost,
                  agility: holobot.attributes.agility + statBoost,
                }
              };
            }
            return holobot;
          });
          
          // Update the selected holobot
          const updatedSelectedHolobot = updatedHolobots.find(h => h.id === selectedHolobotId) || null;
          
          // Try to update the user's holobots in Supabase
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            try {
              // Update holobots in the database
              await supabase
                .from('profiles')
                .update({ 
                  holobots: updatedHolobots,
                  holos_tokens: supabase.rpc('increment_holos_tokens', { amount: holosGained })
                })
                .eq('id', session.user.id);
              
              // Call the apply_sync_points RPC function
              await supabase.rpc('apply_sync_points', {
                user_id: session.user.id,
                points: syncPoints
              });
            } catch (error) {
              console.error('Error updating holobots in database:', error);
              // Continue with local update even if database update fails
            }
          }
          
          set({ 
            holobots: updatedHolobots,
            holobot: updatedSelectedHolobot,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to apply workout rewards', 
            isLoading: false 
          });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'holobots-store',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);