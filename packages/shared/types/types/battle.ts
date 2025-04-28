import { HolobotStats } from "@/types/holobot";

export interface BattleEffect {
  type: string;
  value: number;
  message: string;
}

export interface BattleState {
  id: string;
  playerHolobot: Holobot;
  opponentHolobot: Holobot;
  turn: number;
  isPlayerTurn: boolean;
  battleLog: string[];
  status: 'active' | 'completed';
  winner: string | null;
  availableHacks: string[];
  hackUsed: boolean;
  specialGaugeCharge: number;
}

export interface BattleAction {
  type: 'attack' | 'special' | 'hack';
  value?: string; // For hack type selection
}

export interface BattleResult {
  winner: string;
  loser: string;
  rewards: {
    exp: number;
    tokens: number;
    items?: any[];
  };
  battleLog: string[];
}

export class Holobot {
  name: string;
  maxHealth: number;
  health: number;
  attack: number;
  baseDefense: number;
  defense: number;
  baseSpeed: number;
  speed: number;
  specialMove: string;
  level: number;
  hackGauge: number;
  maxHackGauge: number;
  attackBoost: number;
  specialAttackActive: boolean;
  attackBoostTurns: number;
  defenseBoostTurns: number;
  speedBoostTurns: number;
  specialAttackGauge: number;
  maxSpecialAttackGauge: number;

  constructor(stats: HolobotStats) {
    this.name = stats.name;
    this.maxHealth = stats.maxHealth || 100;
    this.health = stats.maxHealth || 100;
    this.attack = stats.attack;
    this.baseDefense = stats.defense;
    this.defense = stats.defense;
    this.baseSpeed = stats.speed;
    this.speed = stats.speed;
    this.specialMove = stats.specialMove || '';
    this.level = stats.level || 1;
    this.hackGauge = 0;
    this.maxHackGauge = 100;
    this.attackBoost = 0;
    this.specialAttackActive = false;
    this.attackBoostTurns = 0;
    this.defenseBoostTurns = 0;
    this.speedBoostTurns = 0;
    this.specialAttackGauge = 0;
    this.maxSpecialAttackGauge = 100;
  }

  // ... rest of the Holobot class methods
}