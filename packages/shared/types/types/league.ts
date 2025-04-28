import { Holobot } from './holobot';

export type LeagueTier = 'junkyard' | 'city-scraps' | 'neon-core' | 'overlord';

export interface LeagueOpponent {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  holobot: any; // This is a simplified version of Holobot
}

export interface LeagueRewards {
  holos: number;
  experience: number;
  gachaTickets: number;
  blueprints?: string[];
}

export interface League {
  id: string;
  name: string;
  tier: LeagueTier;
  description: string;
  minLevel: number;
  maxLevel: number;
  rewards: LeagueRewards;
  opponents: LeagueOpponent[];
  background: string;
  icon: string;
}

export interface BattleTicket {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

export interface StepBuffs {
  totalSteps: number;
  healthBonus: number;
  attackBonus: number;
  meterChargeBonus: number;
}

export interface BattleResult {
  id: string;
  userHolobot: any; // This is a simplified version of Holobot
  opponentHolobot: any; // This is a simplified version of Holobot
  winner: 'user' | 'opponent' | 'draw';
  battleLog: string[];
  rewards?: {
    holos: number;
    experience: number;
    gachaTickets: number;
  };
  createdAt: Date;
  isPvP: boolean;
  leagueId?: string;
  opponentId: string;
  stepBuffs: StepBuffs;
}

export interface PlayerSnapshot {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  holobot: any; // This is a simplified version of Holobot
  createdAt: Date;
  tier: LeagueTier;
  wins: number;
  losses: number;
}