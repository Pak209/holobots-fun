
export interface UserHolobot {
  name: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  boostedAttributes: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  holobots: UserHolobot[];
  dailyEnergy: number;
  maxDailyEnergy: number;
  holosTokens: number;
  gachaTickets: number;
  stats: {
    wins: number;
    losses: number;
  };
  lastEnergyRefresh: string; // ISO date string
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Add database profile mapping helper
export function mapDatabaseToUserProfile(dbProfile: any): UserProfile {
  return {
    id: dbProfile.id,
    username: dbProfile.username,
    holobots: dbProfile.holobots || [],
    dailyEnergy: dbProfile.daily_energy,
    maxDailyEnergy: dbProfile.max_daily_energy,
    holosTokens: dbProfile.holos_tokens,
    gachaTickets: dbProfile.gacha_tickets || 0,
    stats: {
      wins: dbProfile.wins || 0,
      losses: dbProfile.losses || 0
    },
    lastEnergyRefresh: dbProfile.last_energy_refresh
  };
}
