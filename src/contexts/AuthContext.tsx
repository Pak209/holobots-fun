
import { createContext, useContext, useEffect, useState } from "react";
import { AuthState, UserProfile } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthProvider: Initial mount");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === "SIGNED_IN" && session?.user) {
          try {
            console.log("Fetching user profile for:", session.user.id);
            
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.error("Error fetching profile:", error);
              throw error;
            }

            console.log("Profile fetched successfully:", profile);

            const userProfile: UserProfile = {
              id: profile.id,
              username: profile.username,
              holobots: [],
              dailyEnergy: profile.daily_energy,
              maxDailyEnergy: profile.max_daily_energy,
              holosTokens: profile.holos_tokens,
              stats: {
                wins: 0,
                losses: 0
              },
              lastEnergyRefresh: profile.last_energy_refresh
            };

            setState({
              user: userProfile,
              loading: false,
              error: null
            });
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setState(prev => ({
              ...prev,
              error: 'Error loading user profile',
              loading: false
            }));
          }
        }
        if (event === "SIGNED_OUT") {
          console.log("User signed out");
          setState({ user: null, loading: false, error: null });
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.error("Error in initial profile fetch:", error);
              setState({ user: null, loading: false, error: error.message });
            } else {
              console.log("Initial profile loaded:", profile);
              const userProfile: UserProfile = {
                id: profile.id,
                username: profile.username,
                holobots: [],
                dailyEnergy: profile.daily_energy,
                maxDailyEnergy: profile.max_daily_energy,
                holosTokens: profile.holos_tokens,
                stats: {
                  wins: 0,
                  losses: 0
                },
                lastEnergyRefresh: profile.last_energy_refresh
              };
              setState({ user: userProfile, loading: false, error: null });
            }
          });
      } else {
        console.log("No initial session found");
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => {
      console.log("AuthProvider: Cleanup");
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Successfully logged in",
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false
      }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log in",
        variant: "destructive",
      });
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false
      }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Successfully logged out",
      });
    }
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!state.user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null
      }));

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, signup, updateUser }}>
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
