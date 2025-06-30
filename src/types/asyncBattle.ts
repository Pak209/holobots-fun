export type LeagueType = 'junkyard' | 'city_scraps' | 'neon_core' | 'overlord';
export type BattlePoolType = 'casual' | 'ranked';
export type BattleStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type BattleType = 'pve_league' | 'pvp_pool';

export interface FitnessActivity {
  id: number;
  user_id: string;
  date: string;
  steps: number;
  workout_time: number; // in seconds
  calories_burned: number;
  created_at: string;
  updated_at: string;
}

export interface BattleTickets {
  id: number;
  user_id: string;
  daily_tickets: number;
  bonus_tickets: number;
  last_reset: string;
  created_at: string;
  updated_at: string;
}

export interface BattleLeague {
  id: number;
  league_type: LeagueType;
  name: string;
  description: string;
  min_steps_required: number;
  energy_cost: number;
  cpu_level_range: [number, number];
  rewards: {
    holos?: number;
    exp?: number;
    parts?: number;
    legendary_parts?: number;
  };
  is_active: boolean;
  created_at: string;
}

export interface BattlePool {
  id: number;
  pool_type: BattlePoolType;
  name: string;
  description: string;
  entry_requirements: {
    min_level?: number;
    min_player_rank?: string;
    min_rating?: number;
  };
  rewards: {
    holos?: number;
    exp?: number;
    rating_points?: number;
  };
  is_active: boolean;
  created_at: string;
  cycle_start_time: string;
  cycle_duration: string; // PostgreSQL interval
}

export interface BattlePoolEntry {
  id: number;
  pool_id: number;
  user_id: string;
  holobot_name: string;
  holobot_stats: {
    name: string;
    level: number;
    attack: number;
    defense: number;
    speed: number;
    maxHealth: number;
    specialMove: string;
    intelligence: number;
    boostedAttributes?: {
      attack?: number;
      defense?: number;
      speed?: number;
      health?: number;
    };
    equippedParts?: any;
  };
  fitness_bonus: {
    hp_bonus?: number;
    attack_bonus?: number;
    special_charge_bonus?: number;
    all_stats_bonus?: number;
  };
  submitted_at: string;
  is_active: boolean;
}

export interface AsyncBattle {
  id: number;
  battle_type: BattleType;
  league_id?: number;
  pool_id?: number;
  player1_id: string;
  player1_holobot: BattleHolobot;
  player2_id?: string;
  player2_holobot: BattleHolobot;
  battle_log: BattleLogEntry[];
  winner_id?: string;
  battle_status: BattleStatus;
  rewards: {
    holos?: number;
    exp?: number;
    parts?: number;
    rating_change?: number;
  };
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface BattleHolobot {
  name: string;
  level: number;
  attack: number;
  defense: number;
  speed: number;
  maxHealth: number;
  health: number;
  specialMove: string;
  intelligence: number;
  owner_id?: string;
  is_cpu: boolean;
  fitness_bonuses?: {
    hp_bonus?: number;
    attack_bonus?: number;
    special_charge_bonus?: number;
    all_stats_bonus?: number;
  };
  boosted_attributes?: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
  };
  equipped_parts?: any;
}

export interface BattleLogEntry {
  round: number;
  attacker: string;
  defender: string;
  action: 'attack' | 'special' | 'hack' | 'counter' | 'evade' | 'battle_start' | 'battle_end';
  damage?: number;
  effect?: string;
  hp_remaining: {
    player1: number;
    player2: number;
  };
  message: string;
  timestamp: string;
}

export interface BattleRanking {
  id: number;
  user_id: string;
  pool_id: number;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
  rank_position?: number;
  season_start: string;
  last_battle_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyFitnessReward {
  id: number;
  user_id: string;
  date: string;
  steps_achieved: number;
  target_steps: number;
  rewards_claimed: {
    holos?: number;
    exp?: number;
    battle_tickets?: number;
  };
  battle_bonuses: {
    hp_bonus?: number;
    attack_bonus?: number;
    special_charge_bonus?: number;
    all_stats_bonus?: number;
  };
  is_claimed: boolean;
  created_at: string;
}

// Battle simulation types
export interface BattleSimulationResult {
  winner_id: string;
  winner_name: string;
  battle_log: BattleLogEntry[];
  final_stats: {
    player1_hp: number;
    player2_hp: number;
  };
  battle_duration: number; // in rounds
  rewards: {
    winner_rewards: any;
    loser_rewards: any;
  };
}

export interface FitnessBonus {
  hp_bonus?: number;
  attack_bonus?: number;
  defense_bonus?: number;
  speed_bonus?: number;
  special_charge_bonus?: number;
  all_stats_bonus?: number;
}

// League configuration constants
export const LEAGUE_CONFIGS: Record<LeagueType, {
  name: string;
  description: string;
  icon: string;
  minPlayerRank: string;
  energyCost: number;
  cpuLevelRange: [number, number];
  rewards: {
    boosters: string;
    booster_count: number;
    exp: number;
    parts?: number;
    legendary_parts?: number;
  };
}> = {
  junkyard: {
    name: 'Junkyard League',
    description: 'Easy league for beginners',
    icon: '🔧',
    minPlayerRank: 'Champion',
    energyCost: 5,
    cpuLevelRange: [5, 10],
    rewards: { boosters: 'Common', booster_count: 1, exp: 100 }
  },
  city_scraps: {
    name: 'City Scraps League',
    description: 'Medium difficulty league',
    icon: '🏙️',
    minPlayerRank: 'Rare',
    energyCost: 10,
    cpuLevelRange: [15, 25],
    rewards: { boosters: 'Premium', booster_count: 1, exp: 200, parts: 1 }
  },
  neon_core: {
    name: 'Neon Core League',
    description: 'Hard league for advanced players',
    icon: '💎',
    minPlayerRank: 'Elite',
    energyCost: 15,
    cpuLevelRange: [30, 40],
    rewards: { boosters: 'Elite', booster_count: 1, exp: 400, parts: 2 }
  },
  overlord: {
    name: 'Overlord League',
    description: 'Weekly Legend Tournament - Top 10 get rewards',
    icon: '👑',
    minPlayerRank: 'Legend',
    energyCost: 20,
    cpuLevelRange: [45, 50],
    rewards: { boosters: 'Legendary', booster_count: 1, exp: 800, parts: 3, legendary_parts: 1 }
  }
};

// Fitness-based battle bonus thresholds
export const FITNESS_BONUS_THRESHOLDS = {
  HP_BONUS: 2000,      // +5% HP
  ATTACK_BONUS: 4000,  // +3% Attack
  SPECIAL_BONUS: 6000, // +10% Special charge rate
  ALL_STATS: 8000      // +5% all stats
};

// Battle pool configurations
export const POOL_CONFIGS: Record<BattlePoolType, {
  name: string;
  description: string;
  entryRequirements: {
    min_level?: number;
    min_player_rank?: string;
    min_rating?: number;
  };
  rewards: {
    boosters: string;
    booster_count: number;
    exp: number;
    rating_points?: number;
  };
}> = {
  casual: {
    name: 'Casual Battle Pool',
    description: 'Relaxed PvP battles',
    entryRequirements: { min_level: 1 },
    rewards: { boosters: 'Premium', booster_count: 1, exp: 50 }
  },
  ranked: {
    name: 'Ranked Battle Pool',
    description: 'Competitive PvP battles',
    entryRequirements: { min_level: 5, min_player_rank: 'Rare' },
    rewards: { boosters: 'Elite', booster_count: 1, exp: 200, rating_points: 25 }
  }
};

// Battle ticket constants
export const BATTLE_TICKET_CONFIG = {
  DAILY_TICKETS: 3,
  MAX_BONUS_TICKETS: 10,
  TICKET_COST_HOLOS: 50,
  RESET_HOUR: 0 // UTC hour for daily reset
}; 