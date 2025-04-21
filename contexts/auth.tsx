
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  holobots: Array<{
    name: string;
    level: number;
    experience: number;
    nextLevelExp: number;
    attributePoints: number;
    boostedAttributes: {
      attack?: number;
      defense?: number;
      speed?: number;
      health?: number;
    };
    rank?: string; // Holobot tier/rank
    prestiged?: boolean; // Track if the holobot is prestiged
  }>;
  player_rank?: string; // Player rank based on holobot collection
  prestige_count?: number; // Total number of prestiged holobots
  blueprints?: Record<string, number>; // Blueprint pieces per holobot
}

interface AuthContextType {
  user: User | null;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  updateUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const updateUser = async (updates: Partial<User>) => {
    // Ensure we can properly update blueprints
    if (updates.blueprints) {
      // Make sure to handle the blueprint update properly
      const updatedBlueprints = {
        ...(user?.blueprints || {}),
        ...updates.blueprints
      };
      
      // Update the user state with the merged blueprints
      setUser(prev => prev ? { 
        ...prev, 
        ...updates,
        blueprints: updatedBlueprints
      } : null);
    } else {
      // Regular update without blueprints
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
