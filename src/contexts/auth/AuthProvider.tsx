
import { useState, useEffect } from "react";
import { AuthContextType } from "./types";
import { createContext, useContext } from "react";
import { UserProfile, mapDatabaseToUserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { ensureWelcomeGift } from "./authUtils";
import { useAuthSession } from "@/components/auth/AuthSession";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the session provider to get auth state
  const { user: authUser, loading: authLoading } = useAuthSession();

  // Load user profile when auth state changes
  useEffect(() => {
    const loadUserProfile = async () => {
      if (authUser) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
          
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            setCurrentUser(null);
            setError(profileError.message);
          } else if (profile) {
            console.log("Setting user from profile:", profile);
            const mappedProfile = mapDatabaseToUserProfile(profile);
            setCurrentUser(mappedProfile);
            
            // Check for welcome gift (only needs to run once after sign-in)
            setTimeout(async () => {
              await ensureWelcomeGift(authUser.id, currentUser, setCurrentUser);
            }, 0);
            
            // Redirect to dashboard if on auth page
            if (location.pathname === '/auth' || location.pathname === '/') {
              navigate('/dashboard');
            }
          }
        } catch (err) {
          console.error("Error handling profile load:", err);
        }
      } else if (!authLoading) {
        // User is not authenticated and we've finished loading
        setCurrentUser(null);
        
        // Redirect to auth if trying to access protected routes
        const protectedRoutes = ['/dashboard', '/app', '/quests', '/training', '/gacha', '/marketplace'];
        if (protectedRoutes.includes(location.pathname)) {
          navigate('/auth');
        }
      }
    };

    loadUserProfile();
  }, [authUser, authLoading, location.pathname]);

  // Login function
  const login = async (email: string, password: string) => {
    setError(null);
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        throw signInError;
      }
      
      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
      });
      
      // Navigation handled by AuthSession
      return;
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      toast({
        title: "Login Failed",
        description: err instanceof Error ? err.message : "Failed to log in",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    setError(null);
    
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        throw signOutError;
      }
      
      setCurrentUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been logged out",
      });
      
      navigate('/auth');
    } catch (err) {
      console.error("Logout error:", err);
      setError(err instanceof Error ? err.message : "Logout failed");
      toast({
        title: "Logout Failed",
        description: err instanceof Error ? err.message : "Failed to log out",
        variant: "destructive",
      });
    }
  };

  // Signup function
  const signup = async (email: string, password: string, username: string) => {
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
        description: "Your account has been created. Please check your email for verification.",
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
    }
  };

  // Update user function - simplified for clarity
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
      const dbUpdates: Record<string, any> = {};
      
      // Map properties to database column names
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
      if (updates.holobots) dbUpdates.holobots = updates.holobots;
      if (updates.blueprints) dbUpdates.blueprints = updates.blueprints;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update the local user state with the new values
      setCurrentUser({ ...currentUser, ...updates });
      
      console.log("User profile updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
      throw error;
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
        .eq('id', userId)
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
    loading: authLoading,
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
