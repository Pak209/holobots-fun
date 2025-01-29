import { createContext, useContext, useEffect, useState } from "react";
import { AuthState, UserProfile } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "holobots_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check localStorage first
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      setState(prev => ({
        ...prev,
        user: JSON.parse(storedUser),
        loading: false
      }));
    }

    // This will be used when we switch to Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // We'll implement this when we integrate with Supabase
          // For now, we're using localStorage
        }
        if (event === "SIGNED_OUT") {
          setState({ user: null, loading: false, error: null });
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    );

    setState(prev => ({ ...prev, loading: false }));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // For now, create a mock user. This will be replaced with Supabase auth
      const mockUser: UserProfile = {
        id: Math.random().toString(36).substring(7),
        username: email.split('@')[0],
        holobots: [],
        dailyEnergy: 100,
        maxDailyEnergy: 100,
        holosTokens: 1000,
        stats: {
          wins: 0,
          losses: 0
        },
        lastEnergyRefresh: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setState({ user: mockUser, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false
      }));
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // This will be replaced with Supabase auth
      const mockUser: UserProfile = {
        id: Math.random().toString(36).substring(7),
        username,
        holobots: [],
        dailyEnergy: 100,
        maxDailyEnergy: 100,
        holosTokens: 1000,
        stats: {
          wins: 0,
          losses: 0
        },
        lastEnergyRefresh: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setState({ user: mockUser, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false
      }));
    }
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, loading: false, error: null });
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    setState(prev => ({ ...prev, user: updatedUser }));
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