// ============================================================================
// Real-Time Battle Room Types
// For multiplayer battles on separate devices using Firebase
// ============================================================================

import { HolobotStats } from './holobot';
import { ActionCard } from './arena';
import { Timestamp } from 'firebase/firestore';

export type RoomStatus = 'waiting' | 'active' | 'completed' | 'abandoned';
export type PlayerRole = 'p1' | 'p2';
export type TurnPhase = 'selection' | 'resolution' | 'animation';

// ============================================================================
// Battle Room
// ============================================================================

export interface BattleRoom {
  // Room Identity
  roomId: string;
  roomCode: string; // 6-character code for easy joining
  status: RoomStatus;
  
  // Players
  players: {
    p1: BattleRoomPlayer;
    p2: BattleRoomPlayer;
  };
  
  // Turn State
  currentTurn: number;
  turnPhase: TurnPhase;
  currentTurnPlayer: PlayerRole; // whose turn it is
  
  // Actions (cleared after resolution)
  p1Action: PlayerAction | null;
  p2Action: PlayerAction | null;
  
  // Battle State
  winner: PlayerRole | null;
  
  // Action History (for replay/animations)
  actionHistory: ResolvedTurn[];
  
  // Battle Log (for UI display)
  battleLog?: Array<{ turnNumber: number; message: string; timestamp: number }>;
  
  // Configuration
  config: BattleRoomConfig;
  
  // Timestamps
  createdAt: Timestamp | number;
  startedAt?: Timestamp | number;
  lastActionAt?: Timestamp | number;
  completedAt?: Timestamp | number;
}

// ============================================================================
// Simple Action Cards (for Real-Time PvP)
// ============================================================================

export interface SimpleActionCard {
  id: string;
  name: string;
  type: 'strike' | 'defense' | 'combo' | 'finisher';
  staminaCost: number;
  baseDamage: number;
  staminaRestore?: number;
}

export interface BattleRoomPlayer {
  uid: string;
  username: string;
  holobot: HolobotStats;
  
  // Combat State
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  specialMeter: number;
  
  // Card Hand (Arena V2 style)
  hand: SimpleActionCard[];
  
  // Status
  isReady: boolean;
  isConnected: boolean;
  lastHeartbeat?: Timestamp | number;
  
  // Stats
  damageDealt: number;
  damageTaken: number;
  perfectDefenses: number;
  combosCompleted: number;
  
  // Defensive Stance (from defense cards)
  defendedAt?: number; // Timestamp when defense was used
  defenseActive?: boolean; // Whether defensive stance is active
}

// ============================================================================
// Player Actions
// ============================================================================

export interface PlayerAction {
  playerId: string;
  playerRole: PlayerRole;
  actionType: 'attack' | 'defense' | 'special' | 'pass';
  card?: ActionCard;
  timestamp: Timestamp | number;
}

export interface ResolvedTurn {
  turnNumber: number;
  p1Action: PlayerAction;
  p2Action: PlayerAction;
  
  // Resolution Results
  p1Outcome: ActionOutcome;
  p2Outcome: ActionOutcome;
  
  // State Changes
  p1DamageDealt: number;
  p2DamageDealt: number;
  p1StaminaChange: number;
  p2StaminaChange: number;
  p1SpecialMeterChange: number;
  p2SpecialMeterChange: number;
  
  // Animation Data
  animationSequence: AnimationStep[];
  
  timestamp: Timestamp | number;
}

export interface ActionOutcome {
  result: 'hit' | 'blocked' | 'dodged' | 'countered' | 'missed' | 'critical';
  damageDealt: number;
  effectsApplied: string[];
  wasCountered: boolean;
  triggeredCombo: boolean;
}

export interface AnimationStep {
  id: string;
  type: 'attack' | 'defense' | 'damage' | 'effect' | 'ko';
  actorRole: PlayerRole;
  targetRole: PlayerRole;
  animationId: string;
  duration: number; // milliseconds
  data?: Record<string, any>;
}

// ============================================================================
// Battle Room Configuration
// ============================================================================

export interface BattleRoomConfig {
  battleType: 'pvp' | 'ranked' | 'friendly';
  maxTurns: number;
  turnTimeLimit: number; // seconds
  allowSpectators: boolean;
  isPrivate: boolean;
  
  // Modifiers
  healthMultiplier: number;
  damageMultiplier: number;
  staminaMultiplier: number;
}

// ============================================================================
// Battle Pool Entry (for matchmaking)
// ============================================================================

export interface BattlePoolEntry {
  entryId?: string;
  userId: string;
  username: string;
  holobotStats: HolobotStats;
  
  // Matchmaking Preferences
  battleType: 'pvp' | 'ranked';
  eloRating?: number;
  preferredEloRange?: [number, number];
  
  // Status
  isActive: boolean;
  roomId?: string; // set when matched
  
  // Timestamps
  createdAt: Timestamp | number;
  expiresAt?: Timestamp | number;
}

// ============================================================================
// Hook State & Results
// ============================================================================

export interface UseRealtimeArenaResult {
  // Room State
  room: BattleRoom | null;
  loading: boolean;
  error: string | null;
  
  // Player Info
  myRole: PlayerRole | null;
  opponentRole: PlayerRole | null;
  isMyTurn: boolean;
  
  // Actions
  createRoom: (holobotStats: HolobotStats, config?: Partial<BattleRoomConfig>) => Promise<string>;
  joinRoom: (roomCode: string, holobotStats: HolobotStats) => Promise<void>;
  joinRoomById: (roomId: string, holobotStats: HolobotStats) => Promise<void>;
  leaveRoom: () => Promise<void>;
  
  // Matchmaking
  enterMatchmaking: (holobotStats: HolobotStats, battleType: 'pvp' | 'ranked') => Promise<void>;
  cancelMatchmaking: () => Promise<void>;
  matchmakingStatus: 'idle' | 'searching' | 'matched' | 'failed';
  
  // Turn Actions
  playAction: (action: Omit<PlayerAction, 'playerId' | 'playerRole' | 'timestamp'>) => Promise<void>;
  setReady: (ready: boolean) => Promise<void>;
  
  // Connection
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  sendHeartbeat: () => Promise<void>;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface CreateRoomOptions {
  holobotStats: HolobotStats;
  username: string;
  userId: string;
  config?: Partial<BattleRoomConfig>;
}

export interface JoinRoomOptions {
  roomCodeOrId: string;
  holobotStats: HolobotStats;
  username: string;
  userId: string;
  joinByCode: boolean;
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_ROOM_CONFIG: BattleRoomConfig = {
  battleType: 'pvp',
  maxTurns: 50,
  turnTimeLimit: 30,
  allowSpectators: false,
  isPrivate: false,
  healthMultiplier: 1.0,
  damageMultiplier: 1.0,
  staminaMultiplier: 1.0,
};

// ============================================================================
// Room Code Generation
// ============================================================================

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isRoomActive(room: BattleRoom | null): boolean {
  return room?.status === 'active';
}

export function isRoomWaiting(room: BattleRoom | null): boolean {
  return room?.status === 'waiting';
}

export function canPlayAction(room: BattleRoom | null, playerRole: PlayerRole): boolean {
  if (!room || !isRoomActive(room)) return false;
  if (room.turnPhase !== 'selection') return false;
  
  const action = playerRole === 'p1' ? room.p1Action : room.p2Action;
  return action === null;
}

export function areBothActionsSubmitted(room: BattleRoom): boolean {
  return room.p1Action !== null && room.p2Action !== null;
}
