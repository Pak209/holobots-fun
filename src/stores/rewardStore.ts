import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  DailyMission, 
  DailyMissionType, 
  TrainingStreak, 
  ArenaStreak, 
  LeagueProgression,
  RewardSystem,
  DAILY_MISSION_CONFIGS,
  TRAINING_STREAK_REWARDS,
  ARENA_STREAK_REWARDS,
  LEAGUE_TIER_REWARDS
} from '@/types/rewards';

interface RewardStoreState {
  // State
  currentUserId: string | null;
  dailyMissions: DailyMission[];
  trainingStreak: TrainingStreak;
  arenaStreak: ArenaStreak;
  leagueProgression: LeagueProgression;
  lastDailyMissionReset: string;
  
  // Actions
  initializeRewardSystem: (userId: string) => void;
  clearUserData: () => void;
  updateMissionProgress: (missionType: DailyMissionType, progress: number) => void;
  setMissionProgress: (missionType: DailyMissionType, progress: number) => void;
  claimMissionReward: (missionId: string) => Promise<{ gachaTickets: number; holosTokens: number; exp: number }>;
  updateTrainingStreak: (active: boolean) => void;
  updateArenaStreak: (won: boolean) => void;
  updateLeagueProgression: (tier: string) => void;
  resetDailyMissions: () => void;
  
  // Getters
  getCompletedMissions: () => DailyMission[];
  getUnclaimedRewards: () => number;
  getStreakRewards: () => { training: number; arena: number };
  canClaimWeeklyTrainingReward: () => boolean;
  getNextArenaStreakReward: () => number;
}

const createInitialRewardSystem = (): RewardSystem => ({
  dailyMissions: [],
  trainingStreak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    weeklyTicketsEarned: 0,
    lastWeeklyReward: ''
  },
  arenaStreak: {
    currentWinStreak: 0,
    longestWinStreak: 0,
    lastBattleDate: '',
    streakRewardsEarned: 0,
    lastStreakReward: 0
  },
  leagueProgression: {
    currentTier: 'junkyard',
    tiersCompleted: [],
    lastTierCompletedDate: '',
    tierRewardsEarned: 0
  },
  lastDailyMissionReset: new Date().toISOString()
});

const generateDailyMissions = (): DailyMission[] => {
  const missions: DailyMission[] = [];
  
  // Always include daily login
  missions.push({
    id: `daily_login_${Date.now()}`,
    type: 'daily_login',
    name: DAILY_MISSION_CONFIGS.daily_login.name,
    description: DAILY_MISSION_CONFIGS.daily_login.description,
    target: DAILY_MISSION_CONFIGS.daily_login.baseTarget,
    progress: 0,
    completed: false,
    claimed: false,
    reward: DAILY_MISSION_CONFIGS.daily_login.baseReward,
    resetDaily: true
  });
  
  // Always include fitness sync mission (core to sync points system)
  missions.push({
    id: `sync_fitness_${Date.now()}`,
    type: 'sync_fitness',
    name: DAILY_MISSION_CONFIGS.sync_fitness.name,
    description: DAILY_MISSION_CONFIGS.sync_fitness.description,
    target: DAILY_MISSION_CONFIGS.sync_fitness.baseTarget,
    progress: 0,
    completed: false,
    claimed: false,
    reward: DAILY_MISSION_CONFIGS.sync_fitness.baseReward,
    resetDaily: true
  });
  
  // Randomly select 1-2 additional missions from remaining types
  const availableMissions = Object.keys(DAILY_MISSION_CONFIGS).filter(
    type => type !== 'daily_login' && type !== 'sync_fitness'
  ) as DailyMissionType[];
  
  const selectedMissions = availableMissions
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2) + 1); // 1-2 additional missions
  
  selectedMissions.forEach(type => {
    const config = DAILY_MISSION_CONFIGS[type];
    missions.push({
      id: `${type}_${Date.now()}`,
      type,
      name: config.name,
      description: config.description,
      target: config.baseTarget,
      progress: 0,
      completed: false,
      claimed: false,
      reward: config.baseReward,
      resetDaily: true
    });
  });
  
  return missions;
};

export const useRewardStore = create<RewardStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUserId: null,
      dailyMissions: [],
      trainingStreak: createInitialRewardSystem().trainingStreak,
      arenaStreak: createInitialRewardSystem().arenaStreak,
      leagueProgression: createInitialRewardSystem().leagueProgression,
      lastDailyMissionReset: new Date().toISOString(),

      // Initialize reward system
      initializeRewardSystem: (userId: string) => {
        const { currentUserId, lastDailyMissionReset } = get();
        
        // If switching users, clear old data
        if (currentUserId && currentUserId !== userId) {
          set({
            currentUserId: userId,
            dailyMissions: generateDailyMissions(),
            trainingStreak: createInitialRewardSystem().trainingStreak,
            arenaStreak: createInitialRewardSystem().arenaStreak,
            leagueProgression: createInitialRewardSystem().leagueProgression,
            lastDailyMissionReset: new Date().toISOString()
          });
          return;
        }
        
        // Set current user
        if (!currentUserId) {
          set({ currentUserId: userId });
        }
        
        const today = new Date().toISOString().split('T')[0];
        const lastReset = new Date(lastDailyMissionReset).toISOString().split('T')[0];
        
        // Reset daily missions if it's a new day
        if (today !== lastReset) {
          set({
            dailyMissions: generateDailyMissions(),
            lastDailyMissionReset: new Date().toISOString()
          });
        } else if (get().dailyMissions.length === 0) {
          // Initialize if no missions exist
          set({
            dailyMissions: generateDailyMissions()
          });
        }
      },

      // Clear user data when switching accounts
      clearUserData: () => {
        set({
          currentUserId: null,
          dailyMissions: [],
          trainingStreak: createInitialRewardSystem().trainingStreak,
          arenaStreak: createInitialRewardSystem().arenaStreak,
          leagueProgression: createInitialRewardSystem().leagueProgression,
          lastDailyMissionReset: new Date().toISOString()
        });
      },

      // Update mission progress
      updateMissionProgress: (missionType: DailyMissionType, progress: number) => {
        set(state => {
          const currentMissions = state.dailyMissions;
          
          const updatedMissions = currentMissions.map(mission => {
            if (mission.type === missionType && !mission.completed) {
              const newProgress = Math.min(mission.progress + progress, mission.target);
              const completed = newProgress >= mission.target;
              
              return {
                ...mission,
                progress: newProgress,
                completed
              };
            }
            return mission;
          });
          
          return {
            dailyMissions: updatedMissions
          };
        });
      },

      // Set mission progress to absolute value
      setMissionProgress: (missionType: DailyMissionType, progress: number) => {
        set(state => {
          const currentMissions = state.dailyMissions;
          
          const updatedMissions = currentMissions.map(mission => {
            if (mission.type === missionType && !mission.completed) {
              const newProgress = Math.min(progress, mission.target);
              const completed = newProgress >= mission.target;
              
              return {
                ...mission,
                progress: newProgress,
                completed
              };
            }
            return mission;
          });
          
          return {
            dailyMissions: updatedMissions
          };
        });
      },

      // Claim mission reward
      claimMissionReward: async (missionId: string) => {
        const mission = get().dailyMissions.find(m => m.id === missionId);
        if (!mission || !mission.completed || mission.claimed) {
          return { gachaTickets: 0, holosTokens: 0, exp: 0 };
        }

        set(state => ({
          dailyMissions: state.dailyMissions.map(m =>
            m.id === missionId ? { ...m, claimed: true } : m
          )
        }));

        return {
          gachaTickets: mission.reward.gachaTickets,
          holosTokens: mission.reward.holosTokens || 0,
          exp: mission.reward.exp || 0
        };
      },

      // Update training streak
      updateTrainingStreak: (active: boolean) => {
        const today = new Date().toISOString().split('T')[0];
        const { trainingStreak } = get();
        const lastActiveDate = trainingStreak.lastActiveDate.split('T')[0];
        
        if (active) {
          let newStreak = trainingStreak.currentStreak;
          
          if (lastActiveDate !== today) {
            // Check if streak continues (yesterday) or breaks
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (lastActiveDate === yesterdayStr) {
              newStreak += 1; // Continue streak
            } else if (lastActiveDate === today) {
              // Already active today, no change
              return;
            } else {
              newStreak = 1; // Reset streak
            }
            
            set(state => ({
              trainingStreak: {
                ...state.trainingStreak,
                currentStreak: newStreak,
                longestStreak: Math.max(state.trainingStreak.longestStreak, newStreak),
                lastActiveDate: new Date().toISOString()
              }
            }));
          }
        }
      },

      // Update arena streak
      updateArenaStreak: (won: boolean) => {
        const today = new Date().toISOString();
        
        set(state => {
          const newWinStreak = won ? state.arenaStreak.currentWinStreak + 1 : 0;
          
          return {
            arenaStreak: {
              ...state.arenaStreak,
              currentWinStreak: newWinStreak,
              longestWinStreak: Math.max(state.arenaStreak.longestWinStreak, newWinStreak),
              lastBattleDate: today
            }
          };
        });
      },

      // Update league progression
      updateLeagueProgression: (tier: string) => {
        set(state => {
          const { leagueProgression } = state;
          
          if (!leagueProgression.tiersCompleted.includes(tier)) {
            return {
              leagueProgression: {
                ...leagueProgression,
                currentTier: tier as any,
                tiersCompleted: [...leagueProgression.tiersCompleted, tier],
                lastTierCompletedDate: new Date().toISOString(),
                tierRewardsEarned: leagueProgression.tierRewardsEarned + 1
              }
            };
          }
          
          return state;
        });
      },

      // Reset daily missions
      resetDailyMissions: () => {
        set({
          dailyMissions: generateDailyMissions(),
          lastDailyMissionReset: new Date().toISOString()
        });
      },

      // Getters
      getCompletedMissions: () => {
        return get().dailyMissions.filter(mission => mission.completed);
      },

      getUnclaimedRewards: () => {
        return get().dailyMissions
          .filter(mission => mission.completed && !mission.claimed)
          .reduce((total, mission) => total + mission.reward.gachaTickets, 0);
      },

      getStreakRewards: () => {
        const { trainingStreak, arenaStreak } = get();
        
        // Calculate available training rewards
        const weeklyTrainingRewards = Math.floor(trainingStreak.currentStreak / 7) * TRAINING_STREAK_REWARDS.WEEKLY_TICKETS;
        
        // Calculate available arena rewards
        let arenaRewards = 0;
        ARENA_STREAK_REWARDS.STREAK_THRESHOLDS.forEach((threshold, index) => {
          if (arenaStreak.currentWinStreak >= threshold && arenaStreak.lastStreakReward < threshold) {
            arenaRewards += ARENA_STREAK_REWARDS.TICKETS_PER_THRESHOLD[index];
          }
        });
        
        return {
          training: weeklyTrainingRewards,
          arena: arenaRewards
        };
      },

      canClaimWeeklyTrainingReward: () => {
        const { trainingStreak } = get();
        const today = new Date();
        const lastReward = new Date(trainingStreak.lastWeeklyReward);
        const daysSinceLastReward = Math.floor((today.getTime() - lastReward.getTime()) / (1000 * 60 * 60 * 24));
        
        return trainingStreak.currentStreak >= 7 && daysSinceLastReward >= 7;
      },

      getNextArenaStreakReward: () => {
        const { arenaStreak } = get();
        const nextThreshold = ARENA_STREAK_REWARDS.STREAK_THRESHOLDS.find(
          threshold => threshold > arenaStreak.currentWinStreak
        );
        return nextThreshold || 0;
      }
    }),
    {
      name: 'reward-system-storage',
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        dailyMissions: state.currentUserId ? state.dailyMissions : [],
        trainingStreak: state.currentUserId ? state.trainingStreak : createInitialRewardSystem().trainingStreak,
        arenaStreak: state.currentUserId ? state.arenaStreak : createInitialRewardSystem().arenaStreak,
        leagueProgression: state.currentUserId ? state.leagueProgression : createInitialRewardSystem().leagueProgression,
        lastDailyMissionReset: state.currentUserId ? state.lastDailyMissionReset : new Date().toISOString()
      }),
      storage: {
        getItem: (name) => {
          // Get current user from auth context if available
          const authData = localStorage.getItem('sb-cpmydjijulqsalhildbq-auth-token');
          let userId = 'default';
          
          if (authData) {
            try {
              const parsed = JSON.parse(authData);
              userId = parsed?.user?.id || 'default';
            } catch (e) {
              // Fall back to default if parsing fails
            }
          }
          
          const userSpecificKey = `${name}-${userId}`;
          const item = localStorage.getItem(userSpecificKey);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          // Get current user from auth context if available
          const authData = localStorage.getItem('sb-cpmydjijulqsalhildbq-auth-token');
          let userId = 'default';
          
          if (authData) {
            try {
              const parsed = JSON.parse(authData);
              userId = parsed?.user?.id || 'default';
            } catch (e) {
              // Fall back to default if parsing fails
            }
          }
          
          const userSpecificKey = `${name}-${userId}`;
          localStorage.setItem(userSpecificKey, JSON.stringify(value));
        },
        removeItem: (name) => {
          // Get current user from auth context if available
          const authData = localStorage.getItem('sb-cpmydjijulqsalhildbq-auth-token');
          let userId = 'default';
          
          if (authData) {
            try {
              const parsed = JSON.parse(authData);
              userId = parsed?.user?.id || 'default';
            } catch (e) {
              // Fall back to default if parsing fails
            }
          }
          
          const userSpecificKey = `${name}-${userId}`;
          localStorage.removeItem(userSpecificKey);
        }
      }
    }
  )
); 