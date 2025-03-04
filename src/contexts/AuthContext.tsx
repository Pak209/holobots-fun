
import { createContext, useContext, useState, useEffect } from "react";
import { AuthState, UserProfile, mapDatabaseToUserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  searchPlayers: (query: string) => Promise<UserProfile[]>;
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
}

// Create a placeholder user profile for when not authenticated
const defaultGuestUser: UserProfile = {
  id: "guest",
  username: "Guest User",
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
};

const STORAGE_KEY = "holobots_user_data";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initially check if the user is logged in
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      
      try {
        // Get the current authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // User is authenticated - fetch their profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            setCurrentUser(null);
            setError(profileError.message);
          } else if (profile) {
            // Map the database profile to our UserProfile type
            setCurrentUser(mapDatabaseToUserProfile(profile));
          }
        } else {
          // No authenticated user - set to guest
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
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        // User signed in - fetch their profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setCurrentUser(null);
          setError(profileError.message);
        } else if (profile) {
          setCurrentUser(mapDatabaseToUserProfile(profile));
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        setCurrentUser(null);
      }
    });
    
    // Clean up the listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Authentication functions
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
      
      // Clear user state
      setCurrentUser(null);
      
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
      // Sign up the user
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
      // Prepare the updates in the format Supabase expects
      const dbUpdates: any = {};
      
      if (updates.username) dbUpdates.username = updates.username;
      if (updates.holosTokens !== undefined) dbUpdates.holos_tokens = updates.holosTokens;
      if (updates.gachaTickets !== undefined) dbUpdates.gacha_tickets = updates.gachaTickets;
      if (updates.dailyEnergy !== undefined) dbUpdates.daily_energy = updates.dailyEnergy;
      if (updates.maxDailyEnergy !== undefined) dbUpdates.max_daily_energy = updates.maxDailyEnergy;
      if (updates.lastEnergyRefresh) dbUpdates.last_energy_refresh = updates.lastEnergyRefresh;
      if (updates.stats?.wins !== undefined) dbUpdates.wins = updates.stats.wins;
      if (updates.stats?.losses !== undefined) dbUpdates.losses = updates.stats.losses;
      
      // For holobots, we need special handling since it's stored as JSON
      if (updates.holobots) {
        // Get the current profile to update the holobots array
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('holobots')
          .eq('id', currentUser.id)
          .single();
        
        dbUpdates.holobots = updates.holobots;
      }
      
      // Update the profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update the local state
      setCurrentUser({ ...currentUser, ...updates });
      
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
      // Search for players in the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      // Map the database profiles to our UserProfile type
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
      // Get a user profile by ID
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Map the database profile to our UserProfile type
      return mapDatabaseToUserProfile(data);
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  };

  // Provide the current user state and auth functions
  const state: AuthState = {
    user: currentUser || defaultGuestUser, // Fallback to guest user if not authenticated
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
