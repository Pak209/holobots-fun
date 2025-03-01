
import { createContext, useContext } from "react";
import { AuthState, UserProfile, mapDatabaseToUserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { HOLOBOT_STATS } from "@/types/holobot";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  searchPlayers: (query: string) => Promise<UserProfile[]>;
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
}

// Create a mock user profile with actual holobots from HOLOBOT_STATS
const mockUser: UserProfile = {
  id: "mock-user-id",
  username: "Guest User",
  holobots: [
    {
      name: HOLOBOT_STATS["ace"].name,
      level: 8,
      experience: 750,
      nextLevelExp: 1000,
      boostedAttributes: {
        attack: 15,
        defense: 12
      }
    },
    {
      name: HOLOBOT_STATS["kuma"].name,
      level: 5,
      experience: 250,
      nextLevelExp: 500,
      boostedAttributes: {
        attack: 10,
        speed: 12
      }
    },
    {
      name: HOLOBOT_STATS["shadow"].name,
      level: 3,
      experience: 120,
      nextLevelExp: 300,
      boostedAttributes: {
        defense: 8,
        health: 15
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
  lastEnergyRefresh: new Date().toISOString(),
  level: 10
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  
  // Create a mutable copy of the mock user that can be updated
  let currentUser = { ...mockUser };

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

  const updateUser = async (updates: Partial<UserProfile>) => {
    // Update the current user with the provided updates
    currentUser = { ...currentUser, ...updates };
    
    // For holobots array, we need to handle it specially to preserve objects not being updated
    if (updates.holobots) {
      currentUser.holobots = updates.holobots;
    }
    
    // In a real app, this would make an API call to update the user in the database
    toast({
      title: "User Updated",
      description: "User profile has been updated",
    });
    
    return currentUser;
  };

  const searchPlayers = async (): Promise<UserProfile[]> => {
    return [currentUser];
  };

  const getUserProfile = async (): Promise<UserProfile> => {
    return currentUser;
  };

  // Always provide the current user state
  const state: AuthState = {
    user: currentUser,
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
