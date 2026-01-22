# Holobots Arena V2 - Complete Implementation Plan

**Status:** Planning Phase  
**Target:** React + TypeScript + Supabase + Zustand  
**Estimated Implementation Time:** 3-4 weeks (phased approach)

---

## Phase 1: Data Foundation (Week 1)

### 1.1 Database Schema (`supabase/migrations/`)

**File:** `08_arena_v2_schema.sql`

```sql
-- Battle Sessions
CREATE TABLE arena_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_holobot_id UUID REFERENCES holobots(id),
  opponent_holobot_id UUID REFERENCES holobots(id),
  battle_type TEXT NOT NULL, -- 'pvp', 'pve', 'training'
  status TEXT NOT NULL, -- 'active', 'completed', 'abandoned'
  winner_id UUID,
  battle_data JSONB, -- Full battle state snapshot
  replay_data JSONB, -- Action sequence for replays
  rewards JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Battle Action Log (for replays and analysis)
CREATE TABLE battle_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID REFERENCES arena_battles(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  actor_id UUID NOT NULL, -- which holobot acted
  action_type TEXT NOT NULL, -- 'strike', 'defense', 'combo', 'finisher'
  card_played JSONB, -- card details
  target_id UUID,
  damage_dealt INTEGER DEFAULT 0,
  stamina_change INTEGER DEFAULT 0,
  special_meter_change INTEGER DEFAULT 0,
  outcome TEXT, -- 'hit', 'miss', 'blocked', 'countered'
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Arena Rankings
CREATE TABLE arena_rankings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  elo_rating INTEGER DEFAULT 1200,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  season_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card Pool Templates (generated per battle)
CREATE TABLE card_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_name TEXT UNIQUE NOT NULL,
  card_type TEXT NOT NULL, -- 'strike', 'defense', 'combo', 'finisher'
  base_damage INTEGER,
  stamina_cost INTEGER NOT NULL,
  speed_modifier NUMERIC DEFAULT 1.0,
  requirements JSONB, -- conditions to play
  effects JSONB, -- what happens on success
  animation_id TEXT,
  description TEXT
);

-- Indexes
CREATE INDEX idx_arena_battles_player ON arena_battles(player_holobot_id);
CREATE INDEX idx_arena_battles_status ON arena_battles(status);
CREATE INDEX idx_battle_actions_battle_turn ON battle_actions(battle_id, turn_number);
CREATE INDEX idx_arena_rankings_season ON arena_rankings(season_id, elo_rating DESC);
```

**Seed Data:** `scripts/seed-arena-cards.sql`
- 20-30 base card templates
- Strike cards (Jab, Cross, Hook, Uppercut, Elbow, Knee)
- Defense cards (Block, Slip, Parry, Counter, Sprawl, Roll)
- Combo sequences (3-hit, 5-hit combos)
- Finisher moves (3-4 signature moves)

---

### 1.2 TypeScript Type Definitions

**File:** `src/types/arena.ts`

```typescript
// ============================================================================
// Core Arena Types
// ============================================================================

export type BattleStatus = 'preparing' | 'active' | 'paused' | 'completed' | 'abandoned';
export type BattleType = 'pvp' | 'pve' | 'training' | 'ranked';

export type CardType = 'strike' | 'defense' | 'combo' | 'finisher';
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export type StaminaState = 'fresh' | 'working' | 'gassed' | 'exhausted';
export type DefenseOutcome = 'perfect' | 'partial' | 'failed';
export type ActionOutcome = 'hit' | 'blocked' | 'dodged' | 'countered' | 'missed';

// ============================================================================
// Fighter (Holobot in Combat)
// ============================================================================

export interface ArenaFighter {
  holobotId: string;
  userId: string;
  
  // Base Stats (from NFT)
  maxHP: number;
  currentHP: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  
  // Arena-Specific State
  stamina: number; // current hand size
  maxStamina: number; // max hand size
  specialMeter: number; // 0-100
  
  // Current Battle State
  staminaState: StaminaState;
  isInDefenseMode: boolean;
  comboCounter: number;
  lastActionTime: number;
  
  // Modifiers (from Sync Training)
  staminaEfficiency: number; // 1.0 = base, 1.2 = +20% efficiency
  defenseTimingWindow: number; // milliseconds
  counterDamageBonus: number; // multiplier
  
  // Visual
  avatar: string;
  name: string;
  archetype: string; // 'striker', 'grappler', 'technical', 'balanced'
}

// ============================================================================
// Action Cards
// ============================================================================

export interface ActionCard {
  id: string;
  templateId: string;
  name: string;
  type: CardType;
  
  // Costs & Requirements
  staminaCost: number;
  requirements: CardRequirement[];
  
  // Effects
  baseDamage: number;
  speedModifier: number; // affects reaction time
  effects: CardEffect[];
  
  // Metadata
  animationId: string;
  description: string;
  iconUrl?: string;
}

export interface CardRequirement {
  type: 'stamina' | 'combo' | 'special_meter' | 'opponent_state';
  operator: 'gte' | 'lte' | 'equals';
  value: number | string;
}

export interface CardEffect {
  type: 'damage' | 'stamina_gain' | 'special_meter' | 'status' | 'combo_enable';
  target: 'self' | 'opponent';
  value: number;
  duration?: number; // for status effects
}

// ============================================================================
// Battle State
// ============================================================================

export interface BattleState {
  battleId: string;
  battleType: BattleType;
  status: BattleStatus;
  
  // Fighters
  player: ArenaFighter;
  opponent: ArenaFighter;
  
  // Turn State
  turnNumber: number;
  currentActorId: string;
  
  // Action Queue
  pendingActions: BattleAction[];
  actionHistory: BattleAction[];
  
  // Game State
  timer: number; // seconds elapsed
  neutralPhase: boolean; // both recovering stamina
  
  // Player Control
  playerBattleStyle: 'aggressive' | 'balanced' | 'defensive';
  hackUsed: boolean;
  
  // Rewards Preview
  potentialRewards: BattleRewards;
}

export interface BattleAction {
  id: string;
  turnNumber: number;
  actorId: string;
  targetId: string;
  
  card: ActionCard;
  timestamp: number;
  
  // Resolution
  outcome: ActionOutcome;
  damageDealt: number;
  staminaChange: number;
  specialMeterChange: number;
  
  // Context
  wasCountered: boolean;
  triggeredCombo: boolean;
  perfectDefense: boolean;
}

export interface BattleRewards {
  exp: number;
  syncPoints: number;
  holos?: number;
  arenaTokens: number;
  eloChange?: number;
  seasonRewards?: any[];
}

// ============================================================================
// AI & Decision Making
// ============================================================================

export interface AIDecision {
  selectedCard: ActionCard;
  confidence: number; // 0-1
  reasoning: string; // for debugging
  enterDefenseMode: boolean;
}

export interface AIPersonality {
  aggression: number; // 0-1 (how often to attack)
  patience: number; // 0-1 (willingness to wait for counters)
  riskTolerance: number; // 0-1 (use finishers early)
  adaptability: number; // 0-1 (adjust based on opponent)
}

// ============================================================================
// Battle Configuration
// ============================================================================

export interface ArenaBattleConfig {
  battleType: BattleType;
  playerHolobotId: string;
  opponentHolobotId?: string; // null for matchmaking
  
  // Rules
  maxTurns?: number;
  timeLimit?: number; // seconds
  allowPlayerControl: boolean;
  
  // Modifiers (seasonal/event rules)
  globalModifiers?: BattleModifier[];
}

export interface BattleModifier {
  id: string;
  type: 'stamina' | 'damage' | 'speed' | 'special_meter';
  target: 'player' | 'opponent' | 'both';
  multiplier: number;
  description: string;
}
```

**Additional Type Files:**

- `src/types/arena-animations.ts` - Animation states and triggers
- `src/types/arena-rewards.ts` - Reward calculation types
- `src/types/arena-matchmaking.ts` - PvP matchmaking types

---

## Phase 2: Core Combat Engine (Week 1-2)

### 2.1 Combat Engine Core

**File:** `src/lib/arena/combat-engine.ts`

```typescript
import type { ArenaFighter, BattleState, BattleAction, ActionCard } from '@/types/arena';

export class ArenaCombatEngine {
  
  // ============================================================================
  // Initialization
  // ============================================================================
  
  static initializeBattle(
    player: ArenaFighter,
    opponent: ArenaFighter,
    config: ArenaBattleConfig
  ): BattleState {
    // Initialize starting hands (stamina cards)
    // Set up battle state
    // Generate card pools for both fighters
  }
  
  // ============================================================================
  // Action Resolution
  // ============================================================================
  
  static resolveAction(
    state: BattleState,
    action: BattleAction
  ): BattleState {
    // 1. Validate action legality
    // 2. Check interrupt conditions
    // 3. Resolve defense/counter
    // 4. Apply damage and effects
    // 5. Update stamina and meters
    // 6. Check win conditions
  }
  
  static calculateDamage(
    attacker: ArenaFighter,
    defender: ArenaFighter,
    card: ActionCard,
    isCounter: boolean = false
  ): number {
    // Base damage from card
    // Scale by attacker.attack stat
    // Apply stamina state modifier
    // Apply counter bonus if applicable
    // Apply defense reduction
  }
  
  // ============================================================================
  // Defense System
  // ============================================================================
  
  static evaluateDefense(
    defender: ArenaFighter,
    defenseCard: ActionCard,
    incomingAttack: BattleAction,
    timingAccuracy: number // 0-1, how close to perfect timing
  ): DefenseOutcome {
    // Calculate defense success based on:
    // - Timing accuracy
    // - Defense stat
    // - Card matchup (e.g., Slip vs Jab)
    // - Intelligence stat (timing window size)
  }
  
  static openCounterWindow(
    defender: ArenaFighter,
    defenseOutcome: DefenseOutcome
  ): number {
    // Return duration of counter window in ms
    // Affected by Speed and INT stats
  }
  
  // ============================================================================
  // Stamina Management
  // ============================================================================
  
  static consumeStamina(
    fighter: ArenaFighter,
    cost: number
  ): ArenaFighter {
    // Deduct stamina
    // Update stamina state (fresh/working/gassed/exhausted)
    // Apply state penalties
  }
  
  static recoverStamina(
    fighter: ArenaFighter,
    trigger: 'perfect_defense' | 'tempo_reset' | 'combo_complete'
  ): ArenaFighter {
    // Award stamina cards based on trigger
    // Cap at maxStamina
  }
  
  static getStaminaState(currentStamina: number): StaminaState {
    if (currentStamina >= 6) return 'fresh';
    if (currentStamina >= 4) return 'working';
    if (currentStamina >= 2) return 'gassed';
    return 'exhausted';
  }
  
  // ============================================================================
  // Combo System
  // ============================================================================
  
  static validateCombo(
    previousActions: BattleAction[],
    nextCard: ActionCard
  ): boolean {
    // Check if card is part of valid combo sequence
    // Validate timing between cards
  }
  
  static calculateComboMultiplier(comboLength: number): number {
    // Scale damage based on combo length
    // Diminishing returns after 5 hits
  }
  
  // ============================================================================
  // Special Meter & Finishers
  // ============================================================================
  
  static buildSpecialMeter(
    fighter: ArenaFighter,
    action: BattleAction
  ): number {
    // Award meter based on action success
    // Bonus for perfect defense, counters, combos
  }
  
  static canUseFinisher(
    attacker: ArenaFighter,
    defender: ArenaFighter
  ): boolean {
    // Check:
    // - Attacker special meter full
    // - Defender is gassed or exhausted
  }
  
  // ============================================================================
  // Win Conditions
  // ============================================================================
  
  static checkWinCondition(state: BattleState): {
    isComplete: boolean;
    winnerId?: string;
    winType?: 'ko' | 'finisher' | 'timeout' | 'forfeit';
  } {
    // Check HP, finishers, time limit
  }
}
```

**Supporting Files:**

- `src/lib/arena/stat-calculator.ts` - Convert NFT stats to combat stats
- `src/lib/arena/card-matcher.ts` - Card effectiveness matrix
- `src/lib/arena/timing-engine.ts` - Precise timing validation

---

### 2.2 Card Generation System

**File:** `src/lib/arena/card-generator.ts`

```typescript
export class CardPoolGenerator {
  
  static generateBattleHand(
    fighter: ArenaFighter,
    holobot: Holobot,
    equippedParts: Part[]
  ): ActionCard[] {
    // 1. Get base cards from archetype
    // 2. Add cards from equipped parts
    // 3. Add special moves from holobot tier
    // 4. Shuffle and draw starting hand
  }
  
  static getArchetypeCards(archetype: string): ActionCard[] {
    // Striker: More strike cards, aggressive combos
    // Grappler: Clinch, throws, ground control
    // Technical: Counters, precision strikes
    // Balanced: Mix of all
  }
  
  static parsePartAbilities(parts: Part[]): ActionCard[] {
    // Convert part metadata to action cards
    // E.g., "Plasma Fist" part → Plasma Strike card
  }
}
```

---

### 2.3 AI Decision System

**File:** `src/lib/arena/ai-controller.ts`

```typescript
export class ArenaAI {
  
  private personality: AIPersonality;
  
  constructor(difficulty: 'easy' | 'medium' | 'hard' | 'expert') {
    this.personality = this.generatePersonality(difficulty);
  }
  
  selectAction(
    state: BattleState,
    availableCards: ActionCard[]
  ): AIDecision {
    // 1. Evaluate current situation
    // 2. Consider stamina management
    // 3. Look for combo opportunities
    // 4. Decide attack vs defense
    // 5. Apply personality modifiers
  }
  
  shouldEnterDefenseMode(
    selfState: ArenaFighter,
    opponentState: ArenaFighter
  ): boolean {
    // Decision tree based on:
    // - Current stamina
    // - Opponent aggression
    // - HP differential
    // - AI personality
  }
  
  evaluateCardValue(
    card: ActionCard,
    context: BattleState
  ): number {
    // Score each card based on current situation
    // Consider stamina efficiency, combo potential, damage
  }
}
```

---

## Phase 3: State Management (Week 2)

### 3.1 Zustand Battle Store

**File:** `src/stores/arena-battle-store.ts`

```typescript
import { create } from 'zustand';
import type { BattleState, BattleAction, ArenaFighter } from '@/types/arena';

interface ArenaBattleStore {
  // Current Battle
  currentBattle: BattleState | null;
  
  // UI State
  isAnimating: boolean;
  selectedCard: string | null;
  hoveredCard: string | null;
  showDefensePrompt: boolean;
  
  // Player Input Queue
  playerActionQueue: BattleAction[];
  
  // Actions
  startBattle: (config: ArenaBattleConfig) => Promise<void>;
  playCard: (cardId: string) => void;
  enterDefenseMode: () => void;
  useHack: () => void;
  processAction: (action: BattleAction) => void;
  endBattle: (winnerId: string) => Promise<void>;
  
  // Helpers
  getAvailableCards: () => ActionCard[];
  canPlayCard: (cardId: string) => boolean;
  getCurrentFighter: () => ArenaFighter;
  getOpponentFighter: () => ArenaFighter;
}

export const useArenaBattleStore = create<ArenaBattleStore>((set, get) => ({
  // Implementation
}));
```

**Additional Stores:**

- `src/stores/arena-replay-store.ts` - Replay viewing
- `src/stores/arena-matchmaking-store.ts` - PvP queue management

---

### 3.2 React Hooks

**File:** `src/hooks/useArenaBattle.ts`

```typescript
export function useArenaBattle(battleId?: string) {
  const store = useArenaBattleStore();
  const { data: battle, isLoading } = useQuery({
    queryKey: ['arena-battle', battleId],
    queryFn: () => fetchBattle(battleId),
    enabled: !!battleId,
  });
  
  // Real-time battle state updates
  useEffect(() => {
    if (!battleId) return;
    
    const subscription = supabase
      .channel(`battle:${battleId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'arena_battles',
        filter: `id=eq.${battleId}`,
      }, (payload) => {
        store.updateBattleState(payload.new);
      })
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, [battleId]);
  
  return {
    battle: store.currentBattle || battle,
    isLoading,
    playCard: store.playCard,
    enterDefenseMode: store.enterDefenseMode,
    useHack: store.useHack,
  };
}
```

**Additional Hooks:**

- `src/hooks/useArenaMatchmaking.ts` - Find opponents
- `src/hooks/useArenaRewards.ts` - Claim rewards
- `src/hooks/useArenaRankings.ts` - Leaderboard data

---

## Phase 4: UI Components (Week 2-3)

### 4.1 Core Battle Components

**Component Tree:**

```
ArenaScreen.tsx
├── BattleArenaView.tsx
│   ├── FighterDisplay.tsx (x2)
│   │   ├── FighterAvatar.tsx
│   │   ├── HealthBar.tsx
│   │   ├── StaminaIndicator.tsx
│   │   └── SpecialMeterBar.tsx
│   ├── BattlefieldCenter.tsx
│   │   ├── CombatAnimations.tsx
│   │   └── StatusEffects.tsx
│   └── TimerDisplay.tsx
├── ActionCardHand.tsx
│   ├── ActionCardComponent.tsx (repeated)
│   └── DefenseModeToggle.tsx
├── BattleControls.tsx
│   ├── BattleStyleSlider.tsx
│   ├── HackButton.tsx
│   └── SpecialAttackButton.tsx
└── BattleLog.tsx
```

---

**File:** `src/components/arena/BattleArenaView.tsx`

```typescript
interface BattleArenaViewProps {
  battle: BattleState;
  onCardPlay: (cardId: string) => void;
  onDefenseMode: () => void;
  onHack: () => void;
}

export function BattleArenaView({ battle, onCardPlay, onDefenseMode, onHack }: BattleArenaViewProps) {
  const { player, opponent } = battle;
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Top: Opponent */}
      <div className="p-4">
        <FighterDisplay 
          fighter={opponent} 
          position="top"
          isActive={battle.currentActorId === opponent.holobotId}
        />
      </div>
      
      {/* Middle: Battlefield */}
      <div className="flex-1 relative">
        <BattlefieldCenter 
          battle={battle}
          actions={battle.actionHistory.slice(-5)}
        />
        <TimerDisplay elapsed={battle.timer} />
      </div>
      
      {/* Bottom: Player */}
      <div className="p-4">
        <FighterDisplay 
          fighter={player} 
          position="bottom"
          isActive={battle.currentActorId === player.holobotId}
        />
        
        <ActionCardHand
          cards={getPlayerCards(battle)}
          onCardSelect={onCardPlay}
          disabled={battle.status !== 'active'}
        />
        
        <BattleControls
          onDefenseMode={onDefenseMode}
          onHack={onHack}
          hackUsed={battle.hackUsed}
        />
      </div>
    </div>
  );
}
```

---

**File:** `src/components/arena/FighterDisplay.tsx`

```typescript
export function FighterDisplay({ fighter, position, isActive }: FighterDisplayProps) {
  const staminaState = getStaminaState(fighter.stamina);
  
  return (
    <div className={`
      flex items-center gap-4 p-4 rounded-lg
      ${isActive ? 'ring-2 ring-yellow-400 animate-pulse-subtle' : ''}
      ${position === 'top' ? 'flex-row' : 'flex-row-reverse'}
    `}>
      <FighterAvatar 
        src={fighter.avatar}
        archetype={fighter.archetype}
        className="w-20 h-20"
      />
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-white">{fighter.name}</span>
          <span className="text-sm text-gray-300">
            {fighter.currentHP} / {fighter.maxHP}
          </span>
        </div>
        
        <HealthBar 
          current={fighter.currentHP}
          max={fighter.maxHP}
          className="mb-2"
        />
        
        <div className="flex gap-2">
          <StaminaIndicator 
            current={fighter.stamina}
            max={fighter.maxStamina}
            state={staminaState}
          />
          
          <SpecialMeterBar 
            value={fighter.specialMeter}
            canUseFinisher={fighter.specialMeter >= 100 && staminaState === 'gassed'}
          />
        </div>
      </div>
      
      {fighter.isInDefenseMode && (
        <DefenseModeBadge />
      )}
    </div>
  );
}
```

---

**File:** `src/components/arena/ActionCardComponent.tsx`

```typescript
export function ActionCardComponent({ card, onPlay, disabled }: ActionCardProps) {
  const canPlay = !disabled && card.staminaCost <= currentStamina;
  
  return (
    <motion.button
      onClick={() => onPlay(card.id)}
      disabled={!canPlay}
      className={`
        relative w-24 h-32 rounded-lg p-2
        flex flex-col items-center justify-between
        ${getCardTypeColor(card.type)}
        ${canPlay ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'}
        transition-transform
      `}
      whileHover={canPlay ? { scale: 1.05, y: -5 } : {}}
      whileTap={canPlay ? { scale: 0.95 } : {}}
    >
      {/* Card Icon */}
      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
        <img src={card.iconUrl} alt={card.name} className="w-8 h-8" />
      </div>
      
      {/* Card Name */}
      <span className="text-xs font-bold text-white text-center">
        {card.name}
      </span>
      
      {/* Stamina Cost */}
      <div className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
        <span className="text-xs text-yellow-400 font-bold">
          {card.staminaCost}
        </span>
      </div>
      
      {/* Damage Badge (for strike cards) */}
      {card.baseDamage > 0 && (
        <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-red-500 rounded text-xs text-white font-bold">
          {card.baseDamage}
        </div>
      )}
    </motion.button>
  );
}
```

---

### 4.2 Animation System

**File:** `src/components/arena/CombatAnimations.tsx`

Uses Framer Motion for:
- Strike impacts
- Defense reactions (slip, parry, block)
- Combo sequences
- Finisher cinematics
- Damage numbers
- Status effects

```typescript
export function CombatAnimations({ actions }: CombatAnimationsProps) {
  return (
    <AnimatePresence mode="wait">
      {actions.map(action => (
        <ActionAnimation 
          key={action.id}
          action={action}
          onComplete={() => {}}
        />
      ))}
    </AnimatePresence>
  );
}
```

---

## Phase 5: Integration & Polish (Week 3-4)

### 5.1 Integration Points

**Holobot Stats → Fighter Stats**

`src/lib/arena/holobot-converter.ts`

```typescript
export function holobotToFighter(
  holobot: Holobot,
  syncProgress: SyncProgress
): ArenaFighter {
  // Convert NFT stats to combat stats
  // Apply Sync Training modifiers
  // Calculate max stamina from rank + INT
  // Set archetype based on stat distribution
}
```

**Sync Training → Arena Bonuses**

- Higher Sync Level → Better stamina efficiency
- Consistent daily activity → Larger timing windows
- Player Rank → Max stamina bonus

**Rewards System**

`src/lib/arena/reward-calculator.ts`

```typescript
export function calculateBattleRewards(
  battle: BattleState,
  winner: ArenaFighter
): BattleRewards {
  // Base rewards
  // Performance bonuses (perfect defenses, combos)
  // Win streak multipliers
  // Sync points for fitness integration
}
```

---

### 5.2 Testing & Balancing

**Unit Tests** (`src/lib/arena/__tests__/`)

- `combat-engine.test.ts` - Core mechanics
- `card-generator.test.ts` - Card pool generation
- `ai-controller.test.ts` - AI decision making
- `stat-calculator.test.ts` - Damage formulas

**Integration Tests**

- Full battle simulation
- Stamina edge cases
- Combo validation
- Win condition triggers

**Balance Testing**

- Stat distribution impact analysis
- Card usage frequency tracking
- AI win rate by difficulty
- Average battle duration

---

### 5.3 Performance Optimization

- Memoize fighter displays
- Lazy load animations
- Battle state diffing (only update changed values)
- Optimize Supabase queries
- Client-side prediction for player actions

---

## File Structure Summary

```
src/
├── types/
│   ├── arena.ts
│   ├── arena-animations.ts
│   └── arena-rewards.ts
│
├── lib/
│   └── arena/
│       ├── combat-engine.ts
│       ├── card-generator.ts
│       ├── ai-controller.ts
│       ├── stat-calculator.ts
│       ├── timing-engine.ts
│       ├── holobot-converter.ts
│       └── reward-calculator.ts
│
├── stores/
│   ├── arena-battle-store.ts
│   ├── arena-replay-store.ts
│   └── arena-matchmaking-store.ts
│
├── hooks/
│   ├── useArenaBattle.ts
│   ├── useArenaMatchmaking.ts
│   ├── useArenaRewards.ts
│   └── useArenaRankings.ts
│
├── components/
│   └── arena/
│       ├── BattleArenaView.tsx
│       ├── FighterDisplay.tsx
│       ├── FighterAvatar.tsx
│       ├── HealthBar.tsx
│       ├── StaminaIndicator.tsx
│       ├── SpecialMeterBar.tsx
│       ├── BattlefieldCenter.tsx
│       ├── CombatAnimations.tsx
│       ├── ActionCardHand.tsx
│       ├── ActionCardComponent.tsx
│       ├── BattleControls.tsx
│       ├── BattleLog.tsx
│       ├── DefenseModeBadge.tsx
│       └── TimerDisplay.tsx
│
└── pages/
    ├── ArenaScreen.tsx
    ├── ArenaMatchmakingScreen.tsx
    └── ArenaRankingsScreen.tsx

supabase/
└── migrations/
    └── 08_arena_v2_schema.sql

scripts/
└── seed-arena-cards.sql
```

---

## Implementation Order (Week-by-Week)

### Week 1: Foundation
1. ✅ Database schema
2. ✅ TypeScript types
3. ✅ Combat engine core
4. ✅ Card generation system
5. ✅ Basic AI controller

### Week 2: State & UI
1. ✅ Zustand stores
2. ✅ React hooks
3. ✅ Fighter display components
4. ✅ Card UI components
5. ✅ Basic battle flow

### Week 3: Polish & Animation
1. ✅ Combat animations
2. ✅ Defense mode UI
3. ✅ Special attacks
4. ✅ Battle log
5. ✅ Victory/defeat screens

### Week 4: Integration & Testing
1. ✅ Holobot stats integration
2. ✅ Sync Training bonuses
3. ✅ Rewards system
4. ✅ Testing & balancing
5. ✅ Performance optimization

---

## Key Dependencies

**New Packages to Install:**

```json
{
  "framer-motion": "^11.0.0",
  "use-sound": "^4.0.1",
  "lottie-react": "^2.4.0"
}
```

**Existing Dependencies:**
- Zustand ✅
- React Query ✅
- Supabase ✅
- Tailwind CSS ✅
- TypeScript ✅

---

## Risk Mitigation

1. **Performance Concerns**
   - Profile battle state updates early
   - Consider WebWorkers for AI computation
   - Optimize animation frame budget

2. **Balance Issues**
   - Start conservative with multipliers
   - Log all battle data for analysis
   - A/B test AI difficulty

3. **Scope Creep**
   - Phase 1 = Core auto-battle only
   - Manual controls = Phase 2 (future)
   - Team battles = Phase 3 (future)

---

## Success Metrics

- Battle completion rate > 95%
- Average battle duration: 30-60s
- AI win rate at medium difficulty: 45-55%
- Player engagement (battles per day) increases 2x
- Sync Training correlation to Arena performance visible

---

## Next Steps

1. Review and approve this plan
2. Create database migration
3. Build type definitions
4. Implement combat engine
5. Iterate with playable prototype by end of Week 1
