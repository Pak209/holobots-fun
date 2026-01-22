# Arena V2 Combat System

Core logic for the Holobots Arena V2 speed combat system.

## Files

### `combat-engine.ts`
Core combat mechanics:
- Battle initialization
- Action resolution (strikes, defense, combos, finishers)
- Damage calculation
- Stamina management
- Win conditions

**Key Class:** `ArenaCombatEngine`

### `card-generator.ts`
Card pool generation:
- Archetype-specific cards
- Universal cards
- Finisher generation
- Starting hand drawing

**Key Class:** `CardPoolGenerator`

### `ai-controller.ts`
AI decision-making:
- Difficulty-based personalities
- Card scoring
- Defense mode logic
- Adaptive strategy

**Key Class:** `ArenaAI`

### `holobot-converter.ts`
Integration helpers:
- Convert Holobot NFT → Arena Fighter
- Apply Sync Training modifiers
- Calculate stat bonuses

**Key Function:** `holobotToFighter()`

### `reward-calculator.ts`
Reward calculation:
- Performance bonuses
- ELO rating changes
- Rank progression
- HOLOS distribution

**Key Class:** `RewardCalculator`

## Usage Examples

### Initialize a Battle

```typescript
import { ArenaCombatEngine } from '@/lib/arena/combat-engine';
import { CardPoolGenerator } from '@/lib/arena/card-generator';
import { holobotToFighter } from '@/lib/arena/holobot-converter';

// Convert Holobot to Fighter
const fighter = holobotToFighter(myHolobot, syncProgress);

// Initialize battle
const battle = ArenaCombatEngine.initializeBattle(
  playerFighter,
  opponentFighter,
  config
);
```

### Process an Action

```typescript
const newBattle = ArenaCombatEngine.resolveAction(
  currentBattle,
  selectedCard,
  actorId
);
```

### AI Decision

```typescript
import { ArenaAI } from '@/lib/arena/ai-controller';

const ai = new ArenaAI('medium');
const decision = ai.selectAction(battleState, availableCards);

if (decision.selectedCard) {
  playCard(decision.selectedCard.id);
}
```

### Calculate Rewards

```typescript
import { RewardCalculator } from '@/lib/arena/reward-calculator';

const rewards = RewardCalculator.calculateRewards(
  battle,
  winnerId,
  winType,
  playerLevel,
  playerRank,
  syncLevel
);
```

## Architecture

```
┌─────────────────────────────────────────┐
│     Arena Battle Store (Zustand)       │
│                                         │
│  - Current battle state                 │
│  - Player actions                       │
│  - Auto-battle management               │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│         Combat Engine                   │
│                                         │
│  - Initialize battles                   │
│  - Resolve actions                      │
│  - Calculate damage                     │
│  - Manage stamina                       │
└──────────────┬──────────────────────────┘
               │
               ├─────→ Card Generator
               ├─────→ AI Controller
               ├─────→ Holobot Converter
               └─────→ Reward Calculator
```

## Key Concepts

### Stamina State Machine

```
FRESH (6-7) → WORKING (4-5) → GASSED (2-3) → EXHAUSTED (0-1)
     ↑                                              │
     └──────────── Perfect Defense / Recovery ──────┘
```

### Card Types

- **Strike** - Basic attacks
- **Defense** - Block/evade, recover stamina
- **Combo** - Multi-hit sequences
- **Finisher** - Ultimate moves (requires full special meter)
- **Special** - Archetype-specific abilities

### AI Personality Traits

- **Aggression** - Attack vs defend frequency
- **Patience** - Wait for counters
- **Risk Tolerance** - Early finisher usage
- **Adaptability** - Adjust to opponent

## Testing

```typescript
// Test damage calculation
const damage = ArenaCombatEngine.calculateDamage(
  attacker,
  defender,
  card,
  false,
  0
);
console.log('Damage:', damage.finalDamage);

// Test AI decision
const ai = new ArenaAI('hard');
const decision = ai.selectAction(battle, cards);
console.log('AI choice:', decision.selectedCard?.name);
```

## Performance Notes

- Combat engine is pure functions (no side effects)
- AI decisions cached when possible
- Card pools generated once per battle
- Battle state is immutable (creates new objects)

## Future Enhancements

- [ ] Web Workers for AI computation
- [ ] Battle replay system
- [ ] Advanced combo validation
- [ ] Dynamic difficulty adjustment
- [ ] Machine learning for AI
