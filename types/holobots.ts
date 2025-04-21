export type HolobotKey = string;

export interface HolobotStats {
  name: string;
  level: number;
  attack: number;
  defense: number;
  speed: number;
  health: number;
}

export interface Holobot extends HolobotStats {
  id: string;
  experience: number;
  cooldownUntil?: Date;
  rank?: string;
  energy?: number;
  maxEnergy?: number;
  syncPoints?: number;
  dailySyncQuota?: number;
  dailySyncUsed?: number;
  hackMeter?: number;
  maxHackMeter?: number;
  image?: string;
  streak?: {
    type: string;
    count: number;
  };
  nextBattle?: {
    time: string;
    opponent?: string;
  };
  lastBattle?: {
    result?: 'win' | 'loss' | 'draw';
    opponent?: string;
    rewards?: any;
  };
  attributes?: {
    strength: number;
    agility: number;
    intelligence: number;
    durability: number;
  };
  intelligence?: number;
  specialMove?: string;
} 