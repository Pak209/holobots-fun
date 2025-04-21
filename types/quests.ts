import { HolobotKey, Holobot } from './holobots';

export interface QuestTier {
  level: number;
  energyCost: number;
  rewards: {
    blueprintPieces: number;
    holosTokens: number;
    gachaTickets?: number;
    xpMultiplier?: number;
    squadXp?: number;
  };
}

export interface QuestTiers {
  [key: string]: QuestTier;
}

export interface HolobotCooldowns {
  [key: string]: string; // ISO date string
}

export interface QuestHolobot extends Holobot {
  key: HolobotKey;
  isOnCooldown: boolean;
  cooldownTimeRemaining: string;
}

export interface SquadExpResult {
  name: string;
  xp: number;
  levelUp: boolean;
  newLevel: number;
}

export interface BlueprintReward {
  holobotKey: HolobotKey;
  amount: number;
}

// Constants
export const EXPLORATION_TIERS: QuestTiers = {
  normal: { 
    level: 5, 
    energyCost: 10, 
    rewards: { 
      blueprintPieces: 1,
      holosTokens: 50
    }
  },
  challenge: { 
    level: 15, 
    energyCost: 20, 
    rewards: { 
      blueprintPieces: 2,
      holosTokens: 100
    }
  },
  extreme: { 
    level: 30, 
    energyCost: 30, 
    rewards: { 
      blueprintPieces: 3,
      holosTokens: 200
    }
  }
};

export const BOSS_TIERS: QuestTiers = {
  tier1: { 
    level: 10, 
    energyCost: 40, 
    rewards: { 
      blueprintPieces: 5,
      holosTokens: 1000,
      gachaTickets: 5,
      xpMultiplier: 1,
      squadXp: 50
    }
  },
  tier2: { 
    level: 25, 
    energyCost: 60, 
    rewards: { 
      blueprintPieces: 10,
      holosTokens: 2500,
      gachaTickets: 10,
      xpMultiplier: 2,
      squadXp: 100
    }
  },
  tier3: { 
    level: 50, 
    energyCost: 80, 
    rewards: { 
      blueprintPieces: 15,
      holosTokens: 5000,
      gachaTickets: 15,
      xpMultiplier: 3,
      squadXp: 200
    }
  }
}; 