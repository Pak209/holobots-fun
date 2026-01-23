// ============================================================================
// Arena V2 Type Definitions
// Core types for the real-time speed combat system
// ============================================================================

// ============================================================================
// Enums & Literal Types
// ============================================================================

export type BattleStatus = 'preparing' | 'active' | 'paused' | 'completed' | 'abandoned';
export type BattleType = 'pvp' | 'pve' | 'training' | 'ranked';

export type CardType = 'strike' | 'defense' | 'combo' | 'finisher' | 'special';
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type StaminaState = 'fresh' | 'working' | 'gassed' | 'exhausted';
export type DefenseOutcome = 'perfect' | 'partial' | 'failed';
export type ActionOutcome = 'hit' | 'blocked' | 'dodged' | 'countered' | 'missed' | 'perfect_defense';
export type WinType = 'ko' | 'finisher' | 'timeout' | 'forfeit';

export type FighterArchetype = 'striker' | 'grappler' | 'technical' | 'balanced';
export type BattleStyle = 'aggressive' | 'balanced' | 'defensive';

export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';

// ============================================================================
// Fighter (Holobot in Combat)
// ============================================================================

export interface ArenaFighter {
  // Identity
  holobotId: string;
  userId: string;
  name: string;
  avatar: string;
  archetype: FighterArchetype;
  level: number; // Holobot level (affects stats)
  
  // Base Stats (derived from Holobot NFT + level bonuses)
  maxHP: number;
  currentHP: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  
  // Optional TCG Card Display Fields
  specialMove?: string;
  abilityDescription?: string;
  
  // Arena-Specific State
  stamina: number; // current hand size (number of cards)
  maxStamina: number; // maximum hand size
  specialMeter: number; // 0-100
  
  // Current Battle State
  staminaState: StaminaState;
  isInDefenseMode: boolean;
  comboCounter: number; // current combo length
  lastActionTime: number; // timestamp of last action
  
  // Status Effects
  statusEffects: StatusEffect[];
  
  // Modifiers (from Sync Training, equipment, etc.)
  staminaEfficiency: number; // 1.0 = base, 1.2 = +20% efficiency
  defenseTimingWindow: number; // milliseconds for perfect defense
  counterDamageBonus: number; // multiplier for counter strikes
  damageMultiplier: number; // temporary damage boost/reduction
  speedBonus: number; // percentage speed increase
  
  // Equipped Cards (current hand)
  hand: ActionCard[];
  
  // Statistics (for this battle)
  totalDamageDealt: number;
  perfectDefenses: number;
  combosCompleted: number;
}

export interface StatusEffect {
  id: string;
  type: 'damage_over_time' | 'stamina_drain' | 'speed_boost' | 'damage_boost' | 'defense_boost' | 'stun' | 'slow';
  value: number;
  duration: number; // turns remaining
  appliedBy: string; // card name that applied it
  icon?: string;
}

// ============================================================================
// Action Cards
// ============================================================================

export interface ActionCard {
  id: string;
  templateId: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  
  // Costs & Requirements
  staminaCost: number;
  requirements: CardRequirement[];
  
  // Effects
  baseDamage: number;
  speedModifier: number; // affects reaction time (higher = faster)
  effects: CardEffect[];
  
  // Visual & Meta
  animationId: string;
  description: string;
  flavorText?: string;
  iconUrl?: string;
  
  // State
  canPlay: boolean; // computed based on current battle state
  cooldown?: number; // turns until can use again (for special cards)
}

export interface CardRequirement {
  type: 'stamina' | 'combo' | 'special_meter' | 'opponent_state' | 'archetype' | 'intelligence' | 'speed' | 'hp_threshold';
  operator: 'gte' | 'lte' | 'equals' | 'not_equals';
  value: number | string;
  description?: string; // human-readable explanation
}

export interface CardEffect {
  type: 'damage' | 'stamina_gain' | 'stamina_drain' | 'special_meter' | 'status' | 'combo_enable' | 'counter_window' | 'damage_reduction' | 'card_draw' | 'heal';
  target: 'self' | 'opponent';
  value: number;
  duration?: number; // for status effects (in turns)
  description?: string;
}

// ============================================================================
// Battle State
// ============================================================================

export interface BattleState {
  // Identity
  battleId: string;
  battleType: BattleType;
  status: BattleStatus;
  
  // Fighters
  player: ArenaFighter;
  opponent: ArenaFighter;
  
  // Card Pools (for drawing new cards)
  playerCardPool: CardPool;
  opponentCardPool: CardPool;
  
  // Multi-Round State
  currentRound: number; // 1, 2, or 3
  totalRounds: number; // Usually 3
  opponentLineup: string[]; // List of opponent keys for each round
  roundsWon: number; // How many rounds player has won
  
  // Turn State
  turnNumber: number;
  currentActorId: string; // which fighter's turn it is
  
  // Action Queue & History
  pendingActions: BattleAction[];
  actionHistory: BattleAction[];
  
  // Game State
  timer: number; // seconds elapsed
  lastActionTimestamp: number; // for tempo reset detection
  neutralPhase: boolean; // both recovering stamina
  counterWindowOpen: boolean;
  counterWindowTarget?: string; // holobot that can counter
  counterWindowEndsAt?: number; // timestamp
  
  // Player Control Options
  playerBattleStyle: BattleStyle;
  hackUsed: boolean; // one-time power per battle
  allowPlayerControl: boolean; // true for manual mode, false for auto-battle
  
  // Battle Configuration
  config: ArenaBattleConfig;
  
  // Rewards (calculated at end)
  potentialRewards: BattleRewards;
  
  // Metadata
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface BattleAction {
  id: string;
  battleId: string;
  turnNumber: number;
  actionOrder: number; // multiple actions can happen in one turn
  
  // Actor & Target
  actorId: string; // holobot ID
  actorRole: 'player' | 'opponent';
  targetId: string; // holobot ID
  
  // Action Details
  card: ActionCard;
  actionType: CardType;
  
  // Timing
  timestamp: number; // Unix timestamp
  elapsedMs: number; // milliseconds since battle start
  
  // Resolution
  outcome: ActionOutcome;
  damageDealt: number;
  actualDamage: number; // after defense reduction
  staminaChange: number; // can be negative or positive
  specialMeterChange: number;
  
  // Context Flags
  wasCountered: boolean;
  triggeredCombo: boolean;
  perfectDefense: boolean;
  openedCounterWindow: boolean;
  comboLength?: number; // if part of combo
  
  // Animation Data
  animationId: string;
  animationDuration: number; // milliseconds
}

export interface BattleRewards {
  exp: number;
  syncPoints: number;
  holos?: number;
  arenaTokens: number;
  eloChange?: number; // only for ranked
  
  // Tier-Based Rewards
  gachaTickets?: number;
  boosterPackTickets?: number;
  blueprintRewards?: Array<{
    holobotKey: string;
    amount: number;
  }>;
  
  // Bonus Rewards
  perfectDefenseBonus?: number;
  comboBonus?: number;
  speedBonus?: number; // for fast victories
  
  // Opponent info for blueprints
  opponentName?: string;
  
  // Season/Event Rewards
  seasonRewards?: SeasonReward[];
}

export interface SeasonReward {
  type: 'item' | 'currency' | 'cosmetic' | 'title';
  name: string;
  description: string;
  iconUrl?: string;
  quantity: number;
}

// ============================================================================
// Battle Configuration
// ============================================================================

export interface ArenaBattleConfig {
  battleType: BattleType;
  playerHolobotId: string;
  opponentHolobotId?: string; // null for matchmaking
  
  // Rules
  maxTurns?: number; // battle ends in timeout if reached
  timeLimit?: number; // seconds
  allowPlayerControl: boolean; // false for full auto-battle
  
  // AI Difficulty (for PvE)
  aiDifficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  aiPersonality?: AIPersonality;
  
  // Modifiers (seasonal/event rules)
  globalModifiers?: BattleModifier[];
  
  // Rewards Multiplier
  rewardsMultiplier?: number;
}

export interface BattleModifier {
  id: string;
  name: string;
  type: 'stamina' | 'damage' | 'speed' | 'special_meter' | 'custom';
  target: 'player' | 'opponent' | 'both';
  multiplier: number;
  description: string;
  iconUrl?: string;
}

// ============================================================================
// AI & Decision Making
// ============================================================================

export interface AIDecision {
  selectedCard: ActionCard | null;
  enterDefenseMode: boolean;
  useSpecialAbility: boolean;
  confidence: number; // 0-1 (how confident AI is in this decision)
  reasoning: string; // for debugging and logging
  alternativeCards?: ActionCard[]; // other cards considered
}

export interface AIPersonality {
  // Core Traits (0-1 scale)
  aggression: number; // how often to attack vs defend
  patience: number; // willingness to wait for counters
  riskTolerance: number; // use finishers/specials early
  adaptability: number; // adjust strategy based on opponent
  
  // Playstyle Preferences
  preferredRange: 'close' | 'mid' | 'far' | 'adaptive';
  comboPreference: number; // 0 = single strikes, 1 = always combo
  defenseStyle: 'block' | 'evade' | 'counter' | 'mixed';
  
  // Stamina Management
  staminaConservation: number; // how carefully to manage stamina
  recoveryThreshold: number; // stamina level to enter defense mode
  
  // Advanced
  readOpponent: boolean; // predict opponent patterns
  baitAndPunish: boolean; // intentionally leave openings
  momentumBased: boolean; // play more aggressively when winning
}

// ============================================================================
// Arena Rankings
// ============================================================================

export interface ArenaRanking {
  userId: string;
  
  // Rating
  eloRating: number;
  peakRating: number;
  rankTier: RankTier;
  rankPosition: number; // global rank (1 = best)
  
  // Stats
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number; // calculated: wins / totalBattles
  winStreak: number;
  bestWinStreak: number;
  
  // Victory Types
  koWins: number;
  finisherWins: number;
  timeoutWins: number;
  
  // Season Info
  seasonId: string;
  
  // Achievements
  perfectDefenses: number;
  totalCombos: number;
  totalDamageDealt: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastBattleAt?: string;
}

// ============================================================================
// Matchmaking
// ============================================================================

export interface MatchmakingRequest {
  userId: string;
  holobotId: string;
  battleType: BattleType;
  preferredEloRange?: [number, number]; // min, max
  regionPreference?: string;
  timestamp: number;
}

export interface MatchmakingResult {
  success: boolean;
  battleId?: string;
  opponentUserId?: string;
  opponentHolobotId?: string;
  estimatedWaitTime?: number; // seconds
  error?: string;
}

// ============================================================================
// Replay System
// ============================================================================

export interface BattleReplay {
  battleId: string;
  battle: BattleState;
  actions: BattleAction[];
  duration: number; // total battle duration in ms
  
  // Metadata
  playerName: string;
  opponentName: string;
  winner: string;
  winType: WinType;
  
  // Highlights
  highlights: ReplayHighlight[];
  
  // Timestamps
  recordedAt: string;
}

export interface ReplayHighlight {
  timestamp: number; // ms into battle
  type: 'combo' | 'counter' | 'finisher' | 'perfect_defense' | 'clutch_moment';
  description: string;
  involvedActions: string[]; // action IDs
}

// ============================================================================
// UI State
// ============================================================================

export interface ArenaBattleUIState {
  // Selected Cards
  selectedCardId: string | null;
  hoveredCardId: string | null;
  
  // Modals & Overlays
  showDefensePrompt: boolean;
  showSpecialAttackMenu: boolean;
  showPauseMenu: boolean;
  showVictoryScreen: boolean;
  showDefeatScreen: boolean;
  
  // Animations
  isAnimating: boolean;
  currentAnimationId: string | null;
  animationQueue: string[];
  
  // Battle Log
  visibleLogEntries: number;
  autoScroll: boolean;
  
  // Camera & View
  cameraZoom: number;
  cameraFocus: 'player' | 'opponent' | 'center';
  
  // Sound
  sfxEnabled: boolean;
  musicEnabled: boolean;
  announcerEnabled: boolean;
}

// ============================================================================
// Damage Calculation Context
// ============================================================================

export interface DamageCalculationContext {
  attacker: ArenaFighter;
  defender: ArenaFighter;
  card: ActionCard;
  isCounter: boolean;
  isCombo: boolean;
  comboLength: number;
  defenseOutcome?: DefenseOutcome;
  criticalHit: boolean;
}

export interface DamageResult {
  rawDamage: number;
  finalDamage: number;
  damageReduction: number;
  isCritical: boolean;
  modifiers: DamageModifier[];
}

export interface DamageModifier {
  source: string; // e.g., "Stamina State", "Defense Stat", "Combo Bonus"
  type: 'multiply' | 'add' | 'subtract';
  value: number;
  description: string;
}

// ============================================================================
// Card Pool & Generation
// ============================================================================

export interface CardPool {
  holobotId: string;
  archetype: FighterArchetype;
  
  // Available Cards
  strikeCards: ActionCard[];
  defenseCards: ActionCard[];
  comboCards: ActionCard[];
  finisherCards: ActionCard[];
  specialCards: ActionCard[];
  
  // Stats
  totalCards: number;
  averageStaminaCost: number;
  averageDamage: number;
}

export interface CardGenerationConfig {
  holobotId: string;
  archetype: FighterArchetype;
  tier: number; // Holobot tier affects card quality
  equippedParts: string[]; // Part IDs that grant bonus cards
  syncLevel: number; // Sync Training level affects card pool
  unlockedCards: string[]; // Card template IDs unlocked by player
}

// ============================================================================
// Statistics & Analytics
// ============================================================================

export interface BattleStatistics {
  battleId: string;
  
  // Overall Stats
  totalTurns: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  averageDamagePerTurn: number;
  
  // Action Counts
  strikesUsed: number;
  defensesUsed: number;
  combosCompleted: number;
  finishersAttempted: number;
  
  // Performance Metrics
  perfectDefenses: number;
  successfulCounters: number;
  staminaRecoveries: number;
  damageEfficiency: number; // damage per stamina spent
  
  // Timing
  averageActionSpeed: number; // ms per action
  fastestAction: number;
  slowestAction: number;
  
  // Outcome
  winner: string;
  winType: WinType;
  victoryMargin: number; // HP difference at end
}

// ============================================================================
// Events & Notifications
// ============================================================================

export interface BattleEvent {
  id: string;
  battleId: string;
  type: 'action_played' | 'damage_dealt' | 'stamina_changed' | 'combo_started' | 'combo_completed' | 'finisher_used' | 'battle_ended' | 'status_applied' | 'counter_window_opened';
  timestamp: number;
  data: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

// ============================================================================
// Helper Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Timestamp = number; // Unix timestamp in milliseconds

// ============================================================================
// Validation & Constraints
// ============================================================================

export const STAMINA_STATES = {
  FRESH: { min: 6, max: Infinity, damageModifier: 1.0, label: 'Fresh' },
  WORKING: { min: 4, max: 5, damageModifier: 1.0, label: 'Working' },
  GASSED: { min: 2, max: 3, damageModifier: 0.75, label: 'Gassed' },
  EXHAUSTED: { min: 0, max: 1, damageModifier: 0.5, label: 'Exhausted' },
} as const;

export const SPECIAL_METER_MAX = 100;
export const BASE_HP = 100;
export const MAX_COMBO_LENGTH = 10;
export const TEMPO_RESET_DELAY_MS = 1000;
export const DEFAULT_DEFENSE_WINDOW_MS = 500;
export const MAX_HAND_SIZE = 10;

// ============================================================================
// Type Guards
// ============================================================================

export function isStrikeCard(card: ActionCard): boolean {
  return card.type === 'strike';
}

export function isDefenseCard(card: ActionCard): boolean {
  return card.type === 'defense';
}

export function isComboCard(card: ActionCard): boolean {
  return card.type === 'combo';
}

export function isFinisherCard(card: ActionCard): boolean {
  return card.type === 'finisher';
}

export function canPlayCard(card: ActionCard, fighter: ArenaFighter, battle: BattleState): boolean {
  // Check stamina cost
  if (fighter.stamina < card.staminaCost) return false;
  
  // Check if in defense mode (can only play defense cards)
  if (fighter.isInDefenseMode && !isDefenseCard(card)) return false;
  
  // Check exhausted state (no combos or finishers)
  if (fighter.staminaState === 'exhausted' && (isComboCard(card) || isFinisherCard(card))) {
    return false;
  }
  
  // Check card-specific requirements
  for (const req of card.requirements) {
    if (!checkRequirement(req, fighter, battle)) return false;
  }
  
  return true;
}

function checkRequirement(req: CardRequirement, fighter: ArenaFighter, battle: BattleState): boolean {
  const { type, operator, value } = req;
  
  let actualValue: number | string;
  
  switch (type) {
    case 'stamina':
      actualValue = fighter.stamina;
      break;
    case 'special_meter':
      actualValue = fighter.specialMeter;
      break;
    case 'combo':
      actualValue = fighter.comboCounter;
      break;
    case 'intelligence':
      actualValue = fighter.intelligence;
      break;
    case 'speed':
      actualValue = fighter.speed;
      break;
    case 'archetype':
      actualValue = fighter.archetype;
      break;
    default:
      return true;
  }
  
  switch (operator) {
    case 'gte':
      return Number(actualValue) >= Number(value);
    case 'lte':
      return Number(actualValue) <= Number(value);
    case 'equals':
      return actualValue === value;
    case 'not_equals':
      return actualValue !== value;
    default:
      return true;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getStaminaState(stamina: number): StaminaState {
  if (stamina >= STAMINA_STATES.FRESH.min) return 'fresh';
  if (stamina >= STAMINA_STATES.WORKING.min) return 'working';
  if (stamina >= STAMINA_STATES.GASSED.min) return 'gassed';
  return 'exhausted';
}

export function getStaminaModifier(state: StaminaState): number {
  return STAMINA_STATES[state.toUpperCase() as keyof typeof STAMINA_STATES].damageModifier;
}

export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  return total === 0 ? 0 : Math.round((wins / total) * 100);
}
