
import { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType } from "./types";
import { UserProfile, mapDatabaseToUserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ensureWelcomeGift } from "./authUtils";
import { safeUpdateUserProfile } from "@/integrations/supabase/client";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        // Handle synchronous state updates first
        setLoading(true);
        
        // Use setTimeout to avoid Supabase deadlocks
        setTimeout(async () => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
          
            if (profileError) {
              console.error("Error fetching profile:", profileError);
              setUser(null);
              setError(profileError.message);
            } else if (profile) {
              console.log("Setting user from auth state change:", profile);
              const mappedProfile = mapDatabaseToUserProfile(profile);
              setUser(mappedProfile);

              // Ensure new users get their welcome gift of 500 Holos tokens
              await ensureWelcomeGift(session.user.id, mappedProfile, setUser);
            } else {
              console.log("User exists in auth but not in profiles");
              setUser(null);
            }
          } catch (err) {
            console.error("Error handling sign-in:", err);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });
    
    // THEN check for existing session
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          console.log("Found session with user:", data.session.user.id);
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            setUser(null);
            setError(profileError.message);
          } else if (profile) {
            // Successfully found profile
            console.log("Found user profile:", profile);
            const mappedProfile = mapDatabaseToUserProfile(profile);
            setUser(mappedProfile);
            
            // Ensure new users get their welcome gift of 500 Holos tokens
            await ensureWelcomeGift(data.session.user.id, mappedProfile, setUser);
          } else {
            console.log("User exists in auth but not in profiles");
            setUser(null);
          }
        } else {
          console.log("No session found, user is not logged in");
          setUser(null);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setError(err instanceof Error ? err.message : "Authentication error");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        throw signInError;
      }
      
      if (!data.session) {
        throw new Error("No session returned from login");
      }
      
      toast({
        title: "Login Successful",
        description: "You have been logged in",
      });
      
      return data;
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
      
      setUser(null);
      navigate('/auth');
      
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
  const updateUser = async (userData: Partial<UserProfile>) => {
    if (!user) {
      return;
    }

    try {
      // Convert UserProfile structure to database format
      const dbUserData: any = {};
      
      // Map UserProfile fields to database column names
      if ('holobots' in userData) dbUserData.holobots = userData.holobots;
      if ('dailyEnergy' in userData) dbUserData.daily_energy = userData.dailyEnergy;
      if ('maxDailyEnergy' in userData) dbUserData.max_daily_energy = userData.maxDailyEnergy;
      if ('holosTokens' in userData) dbUserData.holos_tokens = userData.holosTokens;
      if ('gachaTickets' in userData) dbUserData.gacha_tickets = userData.gachaTickets;
      if ('stats' in userData) {
        if (userData.stats?.wins !== undefined) dbUserData.wins = userData.stats.wins;
        if (userData.stats?.losses !== undefined) dbUserData.losses = userData.stats.losses;
      }
      if ('lastEnergyRefresh' in userData) dbUserData.last_energy_refresh = userData.lastEnergyRefresh;
      if ('level' in userData) dbUserData.level = userData.level;
      if ('arena_passes' in userData) dbUserData.arena_passes = userData.arena_passes;
      if ('exp_boosters' in userData) dbUserData.exp_boosters = userData.exp_boosters;
      if ('energy_refills' in userData) dbUserData.energy_refills = userData.energy_refills;
      if ('rank_skips' in userData) dbUserData.rank_skips = userData.rank_skips;
      if ('blueprints' in userData) dbUserData.blueprints = userData.blueprints;

      // Use our safe update function instead of direct supabase call
      const { error } = await safeUpdateUserProfile(user.id, dbUserData);

      if (error) {
        console.error("Error updating user profile:", error);
        return;
      }

      // Update local state with the new data
      setUser(prevUser => {
        if (!prevUser) return null;
        
        return {
          ...prevUser,
          ...userData
        };
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
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
    user,
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
