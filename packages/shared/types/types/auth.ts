import { Holobot } from './holobot';

export interface User {
  id: string;
  email: string;
  username: string;
  walletAddress?: string;
  isWalletConnected: boolean;
  holosTokens: number;
  gachaTickets: number;
  dailyEnergy: number;
  maxDailyEnergy: number;
  holobots: Holobot[];
  blueprints?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  connectWallet: (walletAddress: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}