import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserProfile } from '@/types/user';
import { supabase, getActiveSession, refreshSession, clearAuthData } from '@/lib/supabase';
import { router } from 'expo-router';
import { AuthError, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthState {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  session: any | null;
  rateLimitState: RateLimitState;
}

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  isBlocked: boolean;
}

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateProfile: (data: { username?: string; avatar_url?: string }) => Promise<void>;
  linkWallet: (walletAddress: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

// Mock user data for development/testing
const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  username: 'HoloTrainer',
  walletAddress: '0x1234...5678',
  holosTokens: 5000,
  gachaTickets: 10,
  dailyEnergy: 80,
  maxDailyEnergy: 100,
  lastEnergyRefresh: new Date().toISOString(),
  energyRefills: 3,
  arenaPasses: 5,
  expBoosters: 2,
  rankSkips: 1,
  blueprints: {
    ace: 5,
    kuma: 3,
    shadow: 8,
    hare: 2,
    tora: 0
  }
};

// Mock profile data for development/testing
const mockProfile: UserProfile = {
  ...mockUser,
  avatarUrl: 'https://source.unsplash.com/random/200x200?avatar',
  bio: 'Holobot trainer and collector',
  level: 15,
  experience: 2500,
  achievements: [
    {
      id: '1',
      name: 'First Battle',
      description: 'Complete your first battle',
      completed: true,
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'Step Master',
      description: 'Walk 10,000 steps in a day',
      completed: false,
      progress: 8500,
      maxProgress: 10000
    }
  ],
  stats: {
    totalBattles: 25,
    wins: 15,
    losses: 8,
    draws: 2,
    totalSteps: 125000,
    totalSyncPoints: 1250,
    highestWinStreak: 5
  },
  preferences: {
    notifications: true,
    theme: 'dark',
    sound: true,
    vibration: true
  },
  player_rank: 'Rookie',
  prestige_count: 0
};

// Helper function to map database profile to our app's user profile format
const mapDatabaseToUserProfile = (data: any): UserProfile => {
  // First create a base user object with all required fields
  const baseUser: User = {
    id: data.id,
    username: data.username || 'User',
    email: data.email || '',
    holobots: data.holobots || [],
    dailyEnergy: data.daily_energy || 100,
    maxDailyEnergy: data.max_daily_energy || 100,
    holosTokens: data.holos_tokens || 0,
    gachaTickets: data.gacha_tickets || 0,
    energyRefills: data.energy_refills || 0,
    arenaPasses: data.arena_passes || 0,
    expBoosters: data.exp_boosters || 0,
    rankSkips: data.rank_skips || 0,
    lastEnergyRefresh: data.last_energy_refresh || new Date().toISOString(),
    blueprints: data.blueprints || {},
    walletAddress: data.wallet_address
  };

  // Then extend it with profile-specific fields
  return {
    ...baseUser,
    level: data.level || 1,
    experience: data.experience || 0,
    achievements: data.achievements || [],
    stats: {
      wins: data.wins || 0,
      losses: data.losses || 0,
      totalBattles: (data.wins || 0) + (data.losses || 0),
      draws: 0,
      totalSteps: 0,
      totalSyncPoints: 0,
      highestWinStreak: 0
    },
    preferences: {
      notifications: true,
      theme: 'dark',
      sound: true,
      vibration: true
    },
    avatarUrl: data.avatar_url || 'https://source.unsplash.com/random/200x200?avatar',
    bio: data.bio || 'Holobot trainer',
    player_rank: (data.player_rank || 'Rookie') as UserProfile['player_rank'],
    prestige_count: data.prestige_count || 0
  };
};

const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const INITIAL_RATE_LIMIT_STATE: RateLimitState = {
  attempts: 0,
  lastAttempt: 0,
  isBlocked: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      session: null,
      rateLimitState: INITIAL_RATE_LIMIT_STATE,

      initialize: async () => {
        try {
          const session = await getActiveSession();
          set({ 
            session,
            user: session?.user ?? null,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: 'Failed to initialize session',
            isLoading: false 
          });
        }
      },

      signIn: async (email: string, password: string) => {
        const { rateLimitState } = get();
        const now = Date.now();

        // Check rate limiting
        if (rateLimitState.isBlocked && now - rateLimitState.lastAttempt < RATE_LIMIT_WINDOW) {
          throw new Error(`Too many login attempts. Please try again in ${Math.ceil((RATE_LIMIT_WINDOW - (now - rateLimitState.lastAttempt)) / 60000)} minutes.`);
        }

        // Reset rate limiting if window has passed
        if (now - rateLimitState.lastAttempt >= RATE_LIMIT_WINDOW) {
          set({ rateLimitState: INITIAL_RATE_LIMIT_STATE });
        }

        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            isLoading: false,
            rateLimitState: INITIAL_RATE_LIMIT_STATE, // Reset on successful login
          });
        } catch (error) {
          const newAttempts = rateLimitState.attempts + 1;
          const isBlocked = newAttempts >= RATE_LIMIT_MAX_ATTEMPTS;

          set({
            isLoading: false,
            error: (error as AuthError).message,
            rateLimitState: {
              attempts: newAttempts,
              lastAttempt: now,
              isBlocked,
            },
          });

          throw error;
        }
      },

      signUp: async (email: string, password: string, username?: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Sign up the user
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          // If username is provided, update the user's profile with the username
          if (username && data.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ username })
              .eq('id', data.user.id);
              
            if (profileError) {
              console.error('Error updating username:', profileError);
            }
          }

          set({
            user: data.user,
            session: data.session,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: (error as AuthError).message,
          });
          throw error;
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          await clearAuthData();
          set({
            user: null,
            session: null,
            isLoading: false,
            rateLimitState: INITIAL_RATE_LIMIT_STATE,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: (error as AuthError).message,
          });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          if (error) throw error;
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: (error as AuthError).message,
          });
          throw error;
        }
      },

      updateUser: async (userData: Partial<User>) => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not authenticated');
          
          set({ isLoading: true, error: null });
          
          // Update user in Supabase
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Convert to database format
            const dbUpdates: any = {};
            
            if (userData.username) dbUpdates.username = userData.username;
            if (userData.holosTokens !== undefined) dbUpdates.holos_tokens = userData.holosTokens;
            if (userData.gachaTickets !== undefined) dbUpdates.gacha_tickets = userData.gachaTickets;
            if (userData.dailyEnergy !== undefined) dbUpdates.daily_energy = userData.dailyEnergy;
            if (userData.maxDailyEnergy !== undefined) dbUpdates.max_daily_energy = userData.maxDailyEnergy;
            if (userData.lastEnergyRefresh) dbUpdates.last_energy_refresh = userData.lastEnergyRefresh;
            if (userData.blueprints) dbUpdates.blueprints = userData.blueprints;
            if (userData.walletAddress) dbUpdates.wallet_address = userData.walletAddress;
            if (userData.energyRefills !== undefined) dbUpdates.energy_refills = userData.energyRefills;
            if (userData.arenaPasses !== undefined) dbUpdates.arena_passes = userData.arenaPasses;
            if (userData.expBoosters !== undefined) dbUpdates.exp_boosters = userData.expBoosters;
            if (userData.rankSkips !== undefined) dbUpdates.rank_skips = userData.rankSkips;
            
            const { error } = await supabase
              .from('profiles')
              .update(dbUpdates)
              .eq('id', session.user.id);
              
            if (error) throw new Error(error.message);
            
            // Fetch updated profile to ensure we have all the correct data
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profileError) throw new Error(profileError.message);
            
            if (profileData) {
              const updatedProfile = mapDatabaseToUserProfile(profileData);
              set({
                user: updatedProfile,
                profile: updatedProfile,
                isLoading: false
              });
              return;
            }
          }
          
          throw new Error('Failed to update user data');
        } catch (error) {
          console.error('Update user error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update user'
          });
          throw error;
        }
      },

      updateProfile: async (data: { username?: string; avatar_url?: string }) => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.auth.updateUser({
            data: {
              ...data,
              updated_at: new Date().toISOString(),
            },
          });

          if (error) throw error;

          // Refresh session to get updated user data
          const session = await refreshSession();
          set({
            session,
            user: session?.user ?? null,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: (error as AuthError).message,
          });
          throw error;
        }
      },

      linkWallet: async (walletAddress: string) => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not authenticated');
          
          set({ isLoading: true, error: null });
          
          // Update wallet address in Supabase
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const { error } = await supabase
              .from('profiles')
              .update({ wallet_address: walletAddress })
              .eq('id', session.user.id);
              
            if (error) throw new Error(error.message);
            
            // Fetch updated profile to ensure we have all the correct data
            const { data: updatedData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profileError) throw new Error(profileError.message);
            
            if (updatedData) {
              const updatedProfile = mapDatabaseToUserProfile(updatedData);
              set({
                user: updatedProfile,
                profile: updatedProfile,
                isLoading: false
              });
              return;
            }
          }
          
          throw new Error('Failed to update wallet address');
        } catch (error) {
          console.error('Link wallet error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to link wallet'
          });
          throw error;
        }
      },

      refreshUser: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Get current session from Supabase
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Fetch user profile from Supabase
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profileError) {
              console.error('Error fetching profile:', profileError);
              throw new Error('Failed to load user profile');
            }
            
            if (profileData) {
              const userProfile = mapDatabaseToUserProfile(profileData);
              set({
                user: userProfile,
                profile: userProfile,
                isAuthenticated: true,
                isLoading: false
              });
              return;
            }
          }
          
          // If no session or profile data, user is not authenticated
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false
          });
        } catch (error) {
          console.error('Refresh user error:', error);
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to refresh user'
          });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);