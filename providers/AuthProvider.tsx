import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';
import { ensureWelcomeGift } from '@/utils/authUtils';

// Helper function to map database profile to our app's user profile format
const mapDatabaseToUserProfile = (data: any): UserProfile => {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    holobots: data.holobots || [],
    dailyEnergy: data.daily_energy,
    maxDailyEnergy: data.max_daily_energy,
    holosTokens: data.holos_tokens,
    gachaTickets: data.gacha_tickets,
    stats: {
      wins: data.wins || 0,
      losses: data.losses || 0,
    },
    lastEnergyRefresh: data.last_energy_refresh,
    arena_passes: data.arena_passes,
    exp_boosters: data.exp_boosters,
    energy_refills: data.energy_refills,
    rank_skips: data.rank_skips,
    blueprints: data.blueprints || {},
    walletAddress: data.wallet_address,
    isLinked: !!data.wallet_address,
    activeQuests: data.active_quests || [],
    completedQuests: data.completed_quests || [],
  };
};

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  searchPlayers: (query: string) => Promise<UserProfile[]>;
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
  addBlueprints: (blueprintType: string, count: number) => Promise<void>;
  startQuest: (questId: string, questType: 'exploration' | 'boss', difficulty: string, duration: number) => Promise<void>;
  completeQuest: (questId: string) => Promise<{blueprints: Record<string, number>, experience?: number}>;
  refreshEnergy: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track component mount state
  const isMounted = useRef(true);

  useEffect(() => {
    // Set up mount status ref
    isMounted.current = true;
    
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthChange);
    
    return () => {
      isMounted.current = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Check for energy refresh on app load and when user changes
  useEffect(() => {
    if (user && isMounted.current) {
      refreshEnergy();
    }
  }, [user?.id]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        if (isMounted.current) {
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleAuthChange = async (event: string, session: any) => {
    if (event === 'SIGNED_IN' && session?.user) {
      await fetchUserProfile(session.user.id);
    } else if (event === 'SIGNED_OUT') {
      if (isMounted.current) {
        setUser(null);
        router.replace('/(auth)');
      }
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const mappedProfile = mapDatabaseToUserProfile(data);
      
      if (isMounted.current) {
        setUser(mappedProfile);
      }
      
      await ensureWelcomeGift(userId, mappedProfile, (newProfile) => {
        if (isMounted.current) {
          setUser(newProfile);
        }
      });
      
      // Store profile in AsyncStorage for offline access
      await AsyncStorage.setItem('user_profile', JSON.stringify(mappedProfile));
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (isMounted.current) {
        setUser(null);
        Alert.alert('Error', 'Failed to load profile');
      }
    }
  };

  const login = async (email: string, password: string) => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Profile will be fetched by auth state listener
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Login error:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Invalid credentials');
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local storage
      await AsyncStorage.multiRemove(['user_profile', 'auth_token']);
      
      router.replace('/(auth)');
    } catch (err) {
      console.error('Logout error:', err);
      Alert.alert('Error', 'Logout failed');
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });
      
      if (error) throw error;
      
      Alert.alert(
        'Success',
        'Account created! Please check your email for verification.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (err) {
      console.error('Signup error:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user || !isMounted.current) return;

    try {
      const dbUpdates: any = {
        username: updates.username,
        holos_tokens: updates.holosTokens,
        gacha_tickets: updates.gachaTickets,
        daily_energy: updates.dailyEnergy,
        max_daily_energy: updates.maxDailyEnergy,
        last_energy_refresh: updates.lastEnergyRefresh,
        wins: updates.stats?.wins,
        losses: updates.stats?.losses,
        arena_passes: updates.arena_passes,
        exp_boosters: updates.exp_boosters,
        energy_refills: updates.energy_refills,
        rank_skips: updates.rank_skips,
        holobots: updates.holobots,
        blueprints: updates.blueprints,
        active_quests: updates.activeQuests,
        completed_quests: updates.completedQuests,
      };

      // Filter out undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) throw error;

      const updatedUser = { ...user, ...updates };
      
      if (isMounted.current) {
        setUser(updatedUser);
      }
      
      await AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Profile update error:', err);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const searchPlayers = async (query: string): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(10);

      if (error) throw error;
      return data?.map(mapDatabaseToUserProfile) || [];
    } catch (err) {
      console.error('Player search error:', err);
      return [];
    }
  };

  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data ? mapDatabaseToUserProfile(data) : null;
    } catch (err) {
      console.error('Get user profile error:', err);
      return null;
    }
  };

  // Add blueprints to user's collection
  const addBlueprints = async (blueprintType: string, count: number) => {
    if (!user || !isMounted.current) return;

    try {
      setLoading(true);

      const currentBlueprints = user.blueprints || {};
      const updatedBlueprints = {
        ...currentBlueprints,
        [blueprintType]: (currentBlueprints[blueprintType] || 0) + count
      };

      await updateUser({ blueprints: updatedBlueprints });
      
      if (isMounted.current) {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error adding blueprints:', err);
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Start a new quest
  const startQuest = async (questId: string, questType: 'exploration' | 'boss', difficulty: string, duration: number) => {
    if (!user || !isMounted.current) return;

    try {
      setLoading(true);

      const now = new Date();
      const endTime = new Date(now.getTime() + duration * 60 * 60 * 1000); // Convert hours to milliseconds

      const newQuest = {
        id: questId,
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        type: questType,
        difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'boss'
      };

      const activeQuests = [...(user.activeQuests || []), newQuest];
      
      await updateUser({ activeQuests });
      
      if (isMounted.current) {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error starting quest:', err);
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Complete a quest and get rewards
  const completeQuest = async (questId: string) => {
    if (!user || !isMounted.current) return { blueprints: {} };

    try {
      setLoading(true);

      // Find the quest in active quests
      const quest = user.activeQuests?.find(q => q.id === questId);
      if (!quest) {
        throw new Error('Quest not found');
      }

      // Generate rewards based on quest difficulty
      const blueprintRewards: Record<string, number> = {};
      let experience = 0;

      switch (quest.difficulty) {
        case 'easy':
          blueprintRewards.common = Math.floor(Math.random() * 2) + 1; // 1-2
          break;
        case 'medium':
          blueprintRewards.common = Math.floor(Math.random() * 2) + 1; // 1-2
          blueprintRewards.uncommon = Math.floor(Math.random() * 2) + 1; // 1-2
          break;
        case 'hard':
          blueprintRewards.common = Math.floor(Math.random() * 2) + 1; // 1-2
          blueprintRewards.uncommon = Math.floor(Math.random() * 2) + 1; // 1-2
          blueprintRewards.rare = Math.floor(Math.random() * 2) + 1; // 1-2
          break;
        case 'boss':
          blueprintRewards.uncommon = Math.floor(Math.random() * 3) + 2; // 2-4
          blueprintRewards.rare = Math.floor(Math.random() * 2) + 1; // 1-2
          blueprintRewards.epic = Math.floor(Math.random() * 2); // 0-1
          experience = 50; // XP for boss battles
          break;
      }

      // Update user's blueprints
      const currentBlueprints = user.blueprints || {};
      const updatedBlueprints = { ...currentBlueprints };

      Object.entries(blueprintRewards).forEach(([type, count]) => {
        updatedBlueprints[type] = (updatedBlueprints[type] || 0) + count;
      });

      // Remove from active quests and add to completed quests
      const updatedActiveQuests = user.activeQuests?.filter(q => q.id !== questId) || [];
      const updatedCompletedQuests = [...(user.completedQuests || []), questId];

      await updateUser({
        blueprints: updatedBlueprints,
        activeQuests: updatedActiveQuests,
        completedQuests: updatedCompletedQuests
      });

      if (isMounted.current) {
        setLoading(false);
      }
      
      return { 
        blueprints: blueprintRewards,
        experience: quest.type === 'boss' ? experience : undefined
      };
    } catch (err) {
      console.error('Error completing quest:', err);
      if (isMounted.current) {
        setLoading(false);
      }
      return { blueprints: {} };
    }
  };

  // Refresh energy based on last refresh time
  const refreshEnergy = async () => {
    if (!user || !isMounted.current) return;

    try {
      const now = new Date();
      const lastRefresh = user.lastEnergyRefresh ? new Date(user.lastEnergyRefresh) : new Date(0);
      
      // Check if it's a new day (24 hours passed)
      const hoursPassed = Math.floor((now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60));
      
      if (hoursPassed >= 24) {
        // Reset energy to max
        await updateUser({
          dailyEnergy: user.maxDailyEnergy || 100,
          lastEnergyRefresh: now.toISOString()
        });
        
        console.log('Energy refreshed to max:', user.maxDailyEnergy);
      } else {
        // Calculate energy regeneration (10 energy per hour, up to max)
        const energyToAdd = Math.min(
          hoursPassed * 10, // 10 energy per hour
          (user.maxDailyEnergy || 100) - (user.dailyEnergy || 0) // Can't exceed max
        );
        
        if (energyToAdd > 0) {
          const newEnergy = (user.dailyEnergy || 0) + energyToAdd;
          await updateUser({
            dailyEnergy: newEnergy,
            lastEnergyRefresh: now.toISOString()
          });
          
          console.log(`Energy regenerated: +${energyToAdd}, new total: ${newEnergy}`);
        }
      }
    } catch (err) {
      console.error('Energy refresh error:', err);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    signup,
    updateUser,
    searchPlayers,
    getUserProfile,
    addBlueprints,
    startQuest,
    completeQuest,
    refreshEnergy,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}