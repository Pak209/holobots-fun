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
  }>;
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
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{ user, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 