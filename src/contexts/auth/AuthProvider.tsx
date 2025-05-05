
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType } from './types';
import { UserProfile, mapDatabaseToUserProfile } from '@/types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session) {
          // On login/token refresh - fetch user profile
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          // On logout/session expiration
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError('Failed to initialize authentication');
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        throw profileError;
      }

      if (profile) {
        setUser(mapDatabaseToUserProfile(profile));
      } else {
        // Handle case where auth exists but profile doesn't
        console.log("Auth exists but no profile found, creating new profile");
        await createUserProfile(userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  // Create a new user profile
  const createUserProfile = async (userId: string) => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        throw new Error('No authenticated user found');
      }

      // Create initial profile
      const newProfile = {
        id: userId,
        username: authUser.user.email?.split('@')[0] || `user_${userId.substring(0, 8)}`,
        holobots: [],
        daily_energy: 100,
        max_daily_energy: 100,
        holos_tokens: 500, // Starting tokens
        gacha_tickets: 5, // Starting tickets
        wins: 0,
        losses: 0,
        level: 1,
        arena_passes: 3,
        last_energy_refresh: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile]);

      if (insertError) {
        throw insertError;
      }

      // Fetch the newly created profile
      await fetchUserProfile(userId);
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Failed to create user profile');
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // No need to manually fetch profile here as onAuthStateChange will handle it
      navigate('/dashboard');
      return data;
    } catch (error: any) {
      console.error('Error logging in:', error);
      setError(error.message || 'Failed to log in');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Register with email and password
  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Notify user to check email for confirmation
      return data;
    } catch (error: any) {
      console.error('Error registering:', error);
      setError(error.message || 'Failed to register');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      navigate('/');
    } catch (error: any) {
      console.error('Error logging out:', error);
      setError(error.message || 'Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) {
      setError('No user logged in');
      return null;
    }

    try {
      setLoading(true);
      
      // Prepare database format updates
      const dbUpdates: any = {};
      
      // Map user profile fields to database fields
      if (updates.username) dbUpdates.username = updates.username;
      if (updates.holobots) dbUpdates.holobots = updates.holobots;
      if (updates.dailyEnergy !== undefined) dbUpdates.daily_energy = updates.dailyEnergy;
      if (updates.maxDailyEnergy !== undefined) dbUpdates.max_daily_energy = updates.maxDailyEnergy;
      if (updates.holosTokens !== undefined) dbUpdates.holos_tokens = updates.holosTokens;
      if (updates.gachaTickets !== undefined) dbUpdates.gacha_tickets = updates.gachaTickets;
      if (updates.stats) {
        if (updates.stats.wins !== undefined) dbUpdates.wins = updates.stats.wins;
        if (updates.stats.losses !== undefined) dbUpdates.losses = updates.stats.losses;
      }
      if (updates.level !== undefined) dbUpdates.level = updates.level;
      if (updates.arena_passes !== undefined) dbUpdates.arena_passes = updates.arena_passes;
      if (updates.exp_boosters !== undefined) dbUpdates.exp_boosters = updates.exp_boosters;
      if (updates.energy_refills !== undefined) dbUpdates.energy_refills = updates.energy_refills;
      if (updates.rank_skips !== undefined) dbUpdates.rank_skips = updates.rank_skips;
      if (updates.blueprints !== undefined) dbUpdates.blueprints = updates.blueprints;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      return data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError(error.message || 'Failed to update user');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const authContextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
