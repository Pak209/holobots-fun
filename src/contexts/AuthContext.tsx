
import { createContext, useContext, useState, useEffect } from "react";
import { AuthState, UserProfile, mapDatabaseToUserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  searchPlayers: (query: string) => Promise<UserProfile[]>;
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
}

// Create a default user with a dynamic username that defaults to "Guest User" but can be updated
const createDefaultUser = (username: string = "Guest User"): UserProfile => ({
  id: "guest",
  username,
  holobots: [],
  dailyEnergy: 100,
  maxDailyEnergy: 100,
  holosTokens: 0,
  gachaTickets: 0,
  stats: {
    wins: 0,
    losses: 0
  },
  lastEnergyRefresh: new Date().toISOString(),
  level: 1
});

const STORAGE_KEY = "holobots_user_data";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Ensure new users get 500 Holos tokens when they sign up
  const ensureWelcomeGift = async (userId: string): Promise<void> => {
    try {
      // Get the current user profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('holos_tokens')
        .eq('id', userId as any)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error fetching profile for welcome gift:", fetchError);
        return;
      }
      
      // If user exists but has 0 tokens, give them 500 tokens
      if (profile && profile.holos_tokens === 0) {
        console.log("Giving welcome gift of 500 Holos tokens to new user");
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            holos_tokens: 500 
          } as any)
          .eq('id', userId as any);
        
        if (updateError) {
          console.error("Error giving welcome gift:", updateError);
        } else {
          console.log("Welcome gift of 500 Holos tokens successfully given");
          
          // Update local state if this is the current user
          if (currentUser && currentUser.id === userId) {
            setCurrentUser({
              ...currentUser,
              holosTokens: 500
            });
          }
        }
      }
    } catch (err) {
      console.error("Error in ensureWelcomeGift:", err);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Use maybeSingle to get profile
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
            // Successfully found profile
            console.log("Found user profile:", profile);
            const mappedProfile = mapDatabaseToUserProfile(profile);
            setCurrentUser(mappedProfile);
            
            // Ensure new users get their welcome gift of 500 Holos tokens
            await ensureWelcomeGift(session.user.id);
          } else {
            // User in auth but not in profiles (rare case)
            console.log("User exists in auth but not in profiles");
            setCurrentUser(null);
          }
        } else {
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
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        // Use maybeSingle to get profile
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
          await ensureWelcomeGift(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
      
      toast({
        title: "Login Successful",
        description: "You have been logged in",
      });
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

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
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

  const signup = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);
    
    try {
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

  const state: AuthState = {
    user: currentUser || createDefaultUser(currentUser?.username),
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      logout, 
      signup, 
      updateUser,
      searchPlayers,
      getUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
