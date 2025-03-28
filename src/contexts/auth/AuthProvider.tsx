import { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType } from "./types";
import { UserProfile, mapDatabaseToUserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ensureWelcomeGift } from "./authUtils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        navigate('/');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      const mappedProfile = mapDatabaseToUserProfile(data);
      setUser(mappedProfile);
      await ensureWelcomeGift(userId, mappedProfile, setUser);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setUser(null);
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast({ title: "Success", description: "Logged in successfully" });
      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Login Failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({ title: "Logged Out", description: "See you next time!" });
    } catch (err) {
      console.error("Logout error:", err);
      toast({ title: "Error", description: "Logout failed", variant: "destructive" });
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;
      toast({ title: "Success", description: "Account created! Please log in." });
      navigate('/login');
    } catch (err) {
      console.error("Signup error:", err);
      toast({
        title: "Signup Failed",
        description: err instanceof Error ? err.message : "Registration failed",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error: null,
    login,
    logout,
    signup,
    updateUser: async (updates) => {
      if (!user) return;

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
      if (updates.holobots) dbUpdates.holobots = updates.holobots;

      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
      
      if (!error) {
        setUser({
          ...user,
          ...updates,
          blueprints: {
            ...(user.blueprints || {}),
            ...(updates.blueprints || {})
          },
          holobots: updates.holobots || user.holobots
        });
      }
    },
    searchPlayers: async (query) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(10);
      return data?.map(mapDatabaseToUserProfile) || [];
    },
    getUserProfile: async (userId) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      return data ? mapDatabaseToUserProfile(data) : null;
    },
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
