
import { createContext, useContext } from "react";
import { AuthState, UserProfile, mapDatabaseToUserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  searchPlayers: (query: string) => Promise<UserProfile[]>;
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
}

// Create a mock user profile
const mockUser: UserProfile = {
  id: "mock-user-id",
  username: "Guest User",
  holobots: [
    {
      name: "Training Bot",
      level: 5,
      experience: 250,
      nextLevelExp: 500,
      boostedAttributes: {
        attack: 10,
        defense: 8
      }
    }
  ],
  dailyEnergy: 100,
  maxDailyEnergy: 100,
  holosTokens: 750,
  gachaTickets: 3,
  stats: {
    wins: 12,
    losses: 5
  },
  lastEnergyRefresh: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  // Mock authentication functions
  const login = async () => {
    toast({
      title: "Debug Mode",
      description: "Authentication is disabled",
    });
  };

  const logout = async () => {
    toast({
      title: "Debug Mode",
      description: "Authentication is disabled",
    });
  };

  const signup = async () => {
    toast({
      title: "Debug Mode",
      description: "Authentication is disabled",
    });
  };

  const updateUser = async () => {
    toast({
      title: "Debug Mode",
      description: "User updates are disabled",
    });
  };

  const searchPlayers = async (): Promise<UserProfile[]> => {
    return [mockUser];
  };

  const getUserProfile = async (): Promise<UserProfile> => {
    return mockUser;
  };

  // Always provide an authenticated state
  const state: AuthState = {
    user: mockUser,
    loading: false,
    error: null,
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
