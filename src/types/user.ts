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
  rank?: string; // Add rank property to track holobot tier
  attributePoints?: number; // Add attributePoints for tracking available boost points
  receivedLegendaryBonus?: boolean; // Track if the holobot has received the one-time legendary bonus
  prestiged?: boolean; // Add prestiged property to track if holobot is prestiged
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
  level?: number; // Add level property to fix build error
  arena_passes?: number;
  exp_boosters?: number;
  energy_refills?: number;
  rank_skips?: number;
  blueprints?: Record<string, number>; // Add blueprints field to store blueprint pieces per holobot
  inventory?: { // For storing items like common, rare, legendary from arena/quests
    common?: number;
    rare?: number;
    legendary?: number;
    // other specific item keys can be added here
  };
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Add database profile mapping helper
export function mapDatabaseToUserProfile(dbProfile: any): UserProfile {
  if (dbProfile.username) {
    // This is from the profiles table
    return {
      id: dbProfile.id,
      username: dbProfile.username,
      holobots: dbProfile.holobots || [],
      dailyEnergy: dbProfile.daily_energy || 100,
      maxDailyEnergy: dbProfile.max_daily_energy || 100,
      holosTokens: dbProfile.holos_tokens || 0,
      gachaTickets: dbProfile.gacha_tickets || 0,
      stats: {
        wins: dbProfile.wins || 0,
        losses: dbProfile.losses || 0
      },
      lastEnergyRefresh: dbProfile.last_energy_refresh || new Date().toISOString(),
      level: dbProfile.level || 1,
      arena_passes: dbProfile.arena_passes || 0,
      exp_boosters: dbProfile.exp_boosters || 0,
      energy_refills: dbProfile.energy_refills || 0,
      rank_skips: dbProfile.rank_skips || 0,
      blueprints: dbProfile.blueprints || {},
      inventory: dbProfile.inventory || { common: 0, rare: 0, legendary: 0 } // Initialize inventory
    };
  } else {
    // This is from the users table
    return {
      id: dbProfile.id,
      username: dbProfile.wallet_address || `user_${dbProfile.id.substring(0, 8)}`,
      holobots: [],
      dailyEnergy: dbProfile.energy || 100,
      maxDailyEnergy: 100,
      holosTokens: dbProfile.tokens || 0,
      gachaTickets: 0,
      stats: {
        wins: 0,
        losses: 0
      },
      lastEnergyRefresh: new Date().toISOString(),
      level: 1,
      arena_passes: 0,
      exp_boosters: 0,
      energy_refills: 0,
      rank_skips: 0,
      blueprints: {},
      inventory: { common: 0, rare: 0, legendary: 0 } // Initialize inventory
    };
  }
}
