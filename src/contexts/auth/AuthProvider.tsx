
import { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType } from "./types";
import { UserProfile, mapDatabaseToUserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ensureWelcomeGift } from "./authUtils";
import { useRewardStore } from "@/stores/rewardStore";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define a debug mode flag for development environments
const AUTH_DEBUG = process.env.NODE_ENV === 'development';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const navigate = useNavigate();
  const { clearUserData } = useRewardStore();

  // Helper function to log debug information
  const logDebug = (...args: any[]) => {
    if (AUTH_DEBUG) {
      console.log('[Auth Debug]', ...args);
    }
  };

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      logDebug('Fetching profile for user:', userId);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        logDebug('Error fetching profile:', profileError);
        throw profileError;
      }
      
      if (!profile) {
        logDebug('No profile found for user:', userId);
        return null;
      }
      
      logDebug('Profile found:', profile);
      return mapDatabaseToUserProfile(profile);
    } catch (err) {
      logDebug('Exception in fetchUserProfile:', err);
      throw err;
    }
  };

  // Function to handle user session
  const handleSession = async (session: any) => {
    logDebug('Handling session:', session?.user?.id || 'No session');
    
    if (!session?.user) {
      setCurrentUser(null);
      return;
    }

    try {
      const userId = session.user.id;
      const userProfile = await fetchUserProfile(userId);
      
      if (!userProfile) {
        logDebug('No profile after handling session, user may be new');
        setError("Profile not found. Please try logging out and in again.");
        return;
      }
      
      setCurrentUser(userProfile);
      setError(null);
      
      // Process welcome gift outside of critical path
      setTimeout(() => {
        ensureWelcomeGift(userId, currentUser, setCurrentUser)
          .catch(err => logDebug('Welcome gift error:', err));
      }, 0);
    } catch (err) {
      logDebug('Error in handleSession:', err);
      setError(err instanceof Error ? err.message : "Failed to load user profile");
      setCurrentUser(null);
    }
  };

  // Set up auth state management
  useEffect(() => {
    logDebug('Auth provider initialized');
    setLoading(true);
    
    // Create a flag to prevent state updates after unmount
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        logDebug('Setting up auth state listener');
        
        // First set up the auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          logDebug('Auth state changed:', event, session?.user?.id);
          
          if (!isMounted) return;
          
          if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setError(null);
            clearUserData(); // Clear reward system data when signing out
          }
          else if (session) {
            // Defer profile fetching to avoid Supabase deadlocks
            setTimeout(async () => {
              if (!isMounted) return;
              await handleSession(session);
            }, 0);
          }
        });
        
        // Then check for existing session
        logDebug('Checking for existing session');
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          logDebug('Found existing session:', data.session.user.id);
          await handleSession(data.session);
        } else {
          logDebug('No existing session found');
          setCurrentUser(null);
        }
        
        if (isMounted) {
          setLoading(false);
          setAuthInitialized(true);
        }
        
        return () => {
          isMounted = false;
          if (authListener?.subscription) {
            logDebug('Cleaning up auth listener');
            authListener.subscription.unsubscribe();
          }
        };
      } catch (err) {
        logDebug('Error initializing auth:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Authentication error");
          setLoading(false);
          setCurrentUser(null);
        }
        return () => { isMounted = false; };
      }
    };
    
    initializeAuth();
    
    return () => { isMounted = false; };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      logDebug('Attempting login for:', email);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        throw signInError;
      }
      
      if (!data.session) {
        throw new Error("Login successful but no session returned");
      }
      
      logDebug('Login successful:', data.session.user.id);
      
      toast({
        title: "Login Successful",
        description: "You have been logged in",
      });
      
      return;
    } catch (err) {
      logDebug('Login error:', err);
      setError(err instanceof Error ? err.message : "Login failed");
      toast({
        title: "Login Failed",
        description: err instanceof Error ? err.message : "Failed to log in",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      logDebug('Attempting logout');
      
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        throw signOutError;
      }
      
      setCurrentUser(null);
      clearUserData(); // Clear reward system data when logging out
      navigate('/');
      
      toast({
        title: "Logged Out",
        description: "You have been logged out",
      });
    } catch (err) {
      logDebug('Logout error:', err);
      setError(err instanceof Error ? err.message : "Logout failed");
      toast({
        title: "Logout Failed",
        description: err instanceof Error ? err.message : "Failed to log out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);
    
    try {
      logDebug('Attempting signup for:', email);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      logDebug('Signup successful, session:', data.session?.user.id || 'No session');
      
      toast({
        title: "Signup Successful",
        description: "Your account has been created",
      });
    } catch (err) {
      logDebug('Signup error:', err);
      setError(err instanceof Error ? err.message : "Signup failed");
      toast({
        title: "Signup Failed",
        description: err instanceof Error ? err.message : "Failed to create account",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user function
  const updateUser = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    try {
      logDebug('Updating user profile:', updates);
      
      const dbUpdates: any = {};
      
      if (updates.username) dbUpdates.username = updates.username;
      if (updates.holosTokens !== undefined) dbUpdates.holos_tokens = updates.holosTokens;
      if (updates.gachaTickets !== undefined) dbUpdates.gacha_tickets = updates.gachaTickets;
      if (updates.dailyEnergy !== undefined) dbUpdates.daily_energy = updates.dailyEnergy;
      if (updates.maxDailyEnergy !== undefined) dbUpdates.max_daily_energy = updates.maxDailyEnergy;
      if (updates.lastEnergyRefresh) dbUpdates.last_energy_refresh = updates.lastEnergyRefresh;
      if (updates.stats?.wins !== undefined) dbUpdates.wins = updates.stats.wins;
      if (updates.stats?.losses !== undefined) dbUpdates.losses = updates.stats.losses;
      
      if (updates.arena_passes !== undefined) dbUpdates.arena_passes = updates.arena_passes;
      if (updates.exp_boosters !== undefined) dbUpdates.exp_boosters = updates.exp_boosters;
      if (updates.energy_refills !== undefined) dbUpdates.energy_refills = updates.energy_refills;
      if (updates.rank_skips !== undefined) dbUpdates.rank_skips = updates.rank_skips;
      
      if (updates.holobots) {
        dbUpdates.holobots = updates.holobots;
      }
      
      if (updates.blueprints) {
        dbUpdates.blueprints = updates.blueprints;
      }
      
      if (updates.parts) {
        dbUpdates.parts = updates.parts;
      }
      
      if (updates.equippedParts) {
        dbUpdates.equipped_parts = updates.equippedParts;
      }
      
      logDebug('Database updates:', dbUpdates);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update the local user state with the new values
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      
      logDebug('User profile updated successfully:', updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated",
      });
    } catch (error) {
      logDebug('Error updating user:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  // Search players function
  const searchPlayers = async (query: string): Promise<UserProfile[]> => {
    try {
      logDebug('Searching players with query:', query);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      return data.map(profile => mapDatabaseToUserProfile(profile));
    } catch (error) {
      logDebug('Error searching players:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search players",
        variant: "destructive",
      });
      return [];
    }
  };

  // Get user profile function
  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      logDebug('Getting user profile for:', userId);
      return await fetchUserProfile(userId);
    } catch (error) {
      logDebug('Error getting user profile:', error);
      return null;
    }
  };

  // Debug function for development use
  const debugAuth = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return {
      checkSession: async () => {
        const { data } = await supabase.auth.getSession();
        console.log('Current session:', data.session);
        return data.session;
      },
      resetAuthState: () => {
        setLoading(false);
        setError(null);
        console.log('Auth state reset');
      },
      status: {
        initialized: authInitialized,
        loading,
        error,
        user: currentUser,
      }
    };
  };

  // Create the context value
  const contextValue: AuthContextType = {
    user: currentUser,
    loading,
    error,
    login,
    logout,
    signup,
    updateUser,
    searchPlayers,
    getUserProfile,
    ...(AUTH_DEBUG ? { debug: debugAuth() } : {})
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
