import { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType } from "./types";
import { UserProfile, mapDatabaseToUserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ensureWelcomeGift, clearStaleAuthSessions, refreshTokenIfNeeded } from "./authUtils";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
        // Clear any stale auth sessions first
        await clearStaleAuthSessions();
        
        // Check if user has active session
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          console.log("Found session with user:", data.session.user.id);
          
          // Refresh token if needed
          await refreshTokenIfNeeded();
          
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id as any)
            .maybeSingle();
          
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            setCurrentUser(null);
            setError(profileError.message);
          } else if (profile) {
            // Successfully found profile
            console.log("Found user profile:", profile);
            const mappedProfile = mapDatabaseToUserProfile(profile);
            setCurrentUser(mappedProfile);
            
            // Ensure new users get their welcome gift of 500 Holos tokens
            await ensureWelcomeGift(data.session.user.id, currentUser, setCurrentUser);
          } else {
            console.log("User exists in auth but not in profiles");
            setCurrentUser(null);
          }
        } else {
          console.log("No session found, user is not logged in");
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setError(err instanceof Error ? err.message : "Authentication error");
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Set up an event listener for sign in/out
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id as any)
            .maybeSingle();
        
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            setCurrentUser(null);
            setError(profileError.message);
          } else if (profile) {
            console.log("Setting user from auth state change:", profile);
            const mappedProfile = mapDatabaseToUserProfile(profile);
            setCurrentUser(mappedProfile);
          
            // Ensure new users get their welcome gift of 500 Holos tokens
            await ensureWelcomeGift(session.user.id, currentUser, setCurrentUser);
          }
        } catch (err) {
          console.error("Error handling sign-in:", err);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setCurrentUser(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login function with improved error handling and retry logic
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try up to 3 times to sign in
      let retryCount = 0;
      const maxRetries = 2;
      let success = false;
      
      while (retryCount <= maxRetries && !success) {
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            if (retryCount >= maxRetries) throw signInError;
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
          
          success = true;
          toast({
            title: "Login Successful",
            description: "You have been logged in",
          });
          
          return;
        } catch (retryError) {
          if (retryCount >= maxRetries) throw retryError;
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (err) {
      console.error("Login error:", err);
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

  // Logout function with improved handling
  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Clear all auth related data from localStorage first
      if (typeof localStorage !== 'undefined') {
        const keys = Object.keys(localStorage);
        const supabaseKeys = keys.filter(key => key.startsWith('supabase.auth'));
        supabaseKeys.forEach(key => localStorage.removeItem(key));
      }
      
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        throw signOutError;
      }
      
      setCurrentUser(null);
      navigate('/');
      
      toast({
        title: "Logged Out",
        description: "You have been logged out",
      });
    } catch (err) {
      console.error("Logout error:", err);
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
      const { error: signUpError } = await supabase.auth.signUp({
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
      
      toast({
        title: "Signup Successful",
        description: "Your account has been created",
      });
    } catch (err) {
      console.error("Signup error:", err);
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
      
      console.log("Updating user profile with:", dbUpdates);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id as any);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update the local user state with the new values
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      
      // Log the updated state
      console.log("User profile updated successfully:", updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated",
      });
    } catch (error) {
      console.error("Error updating user:", error);
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
      console.error("Error searching players:", error);
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as any)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      return data ? mapDatabaseToUserProfile(data) : null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
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
    getUserProfile
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
