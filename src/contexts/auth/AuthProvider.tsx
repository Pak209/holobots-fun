
import { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType } from "./types";
import { UserProfile, mapDatabaseToUserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { ensureWelcomeGift } from "./authUtils";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setLoading(true);
        
        if (session?.user) {
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
              
              // Check for welcome gift (only needs to run once after sign-in)
              setTimeout(async () => {
                await ensureWelcomeGift(session.user.id, currentUser, setCurrentUser);
              }, 0);
              
              // Redirect to dashboard if on auth page
              if (location.pathname === '/auth' || location.pathname === '/') {
                navigate('/dashboard');
              }
            }
          } catch (err) {
            console.error("Error handling sign-in:", err);
          } finally {
            setLoading(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setLoading(false);
        
        // Redirect to auth if trying to access protected routes
        const protectedRoutes = ['/dashboard', '/app', '/quests', '/training', '/gacha', '/marketplace'];
        if (protectedRoutes.includes(location.pathname)) {
          navigate('/auth');
        }
      }
    });
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          console.log("Found existing session with user:", data.session.user.id);
          
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
            console.log("Found user profile:", profile);
            const mappedProfile = mapDatabaseToUserProfile(profile);
            setCurrentUser(mappedProfile);
            
            // Redirect to dashboard if on auth page
            if (location.pathname === '/auth') {
              navigate('/dashboard');
            }
          } else {
            console.log("User exists in auth but not in profiles");
            setCurrentUser(null);
          }
        } else {
          console.log("No session found, user is not logged in");
          setCurrentUser(null);
          
          // Redirect to auth if trying to access protected routes
          const protectedRoutes = ['/dashboard', '/app', '/quests', '/training', '/gacha', '/marketplace'];
          if (protectedRoutes.includes(location.pathname)) {
            navigate('/auth');
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
        setError(err instanceof Error ? err.message : "Authentication error");
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
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
        description: "You have been logged in",
      });
      
      // Navigation handled by onAuthStateChange
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
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
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
      
      // Navigation handled by onAuthStateChange
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
