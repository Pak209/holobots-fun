# Arena V2 Quick-Start Guide

Get Arena V2 running in your local environment in **under 30 minutes**.

---

## Prerequisites

- ✅ Existing Holobots project running
- ✅ Supabase CLI installed
- ✅ Node.js 18+ and npm
- ✅ Local dev environment setup

---

## Step 1: Install New Dependencies (2 min)

```bash
npm install framer-motion@^11.0.0 use-sound@^4.0.1 lottie-react@^2.4.0
```

---

## Step 2: Create Database Schema (5 min)

### Create Migration File

```bash
cd supabase
npx supabase migration new arena_v2_schema
```

### Copy Schema from Plan

Open the generated migration file and paste the contents from:
`ARENA_V2_IMPLEMENTATION_PLAN.md` → Section 1.1

### Run Migration

```bash
npx supabase db reset  # if local
# OR
npx supabase db push   # if remote
```

### Seed Card Data

```bash
psql YOUR_DATABASE_URL < scripts/seed-arena-cards.sql
```

**Verify:**
```sql
SELECT card_type, COUNT(*) FROM card_templates GROUP BY card_type;
```

You should see:
- strike: ~14 cards
- defense: ~7 cards
- combo: ~5 cards
- finisher: ~4 cards

---

## Step 3: Create Type Definitions (10 min)

```bash
touch src/types/arena.ts
touch src/types/arena-animations.ts
touch src/types/arena-rewards.ts
```

Copy type definitions from `ARENA_V2_IMPLEMENTATION_PLAN.md` → Section 1.2

**Quick validation:**
```typescript
// src/types/arena.ts
import type { ArenaFighter, BattleState } from '@/types/arena';

const testFighter: ArenaFighter = {
  // TypeScript should autocomplete all fields
};
```

---

## Step 4: Create Combat Engine Stub (10 min)

```bash
mkdir -p src/lib/arena
touch src/lib/arena/combat-engine.ts
touch src/lib/arena/card-generator.ts
touch src/lib/arena/ai-controller.ts
```

### Minimal Combat Engine

```typescript
// src/lib/arena/combat-engine.ts
import type { ArenaFighter, BattleState, BattleAction } from '@/types/arena';

export class ArenaCombatEngine {
  static initializeBattle(
    player: ArenaFighter,
    opponent: ArenaFighter
  ): BattleState {
    return {
      battleId: crypto.randomUUID(),
      battleType: 'pve',
      status: 'active',
      player,
      opponent,
      turnNumber: 0,
      currentActorId: player.holobotId,
      pendingActions: [],
      actionHistory: [],
      timer: 0,
      neutralPhase: false,
      playerBattleStyle: 'balanced',
      hackUsed: false,
      potentialRewards: {
        exp: 100,
        syncPoints: 50,
        arenaTokens: 10,
      },
    };
  }

  static resolveAction(
    state: BattleState,
    action: BattleAction
  ): BattleState {
    // TODO: Implement full resolution logic
    console.log('Resolving action:', action);
    return state;
  }

  static calculateDamage(
    attacker: ArenaFighter,
    defender: ArenaFighter,
    baseDamage: number
  ): number {
    // Simple formula for now
    const attackBonus = attacker.attack * 0.1;
    const defenseReduction = defender.defense * 0.05;
    return Math.max(1, baseDamage + attackBonus - defenseReduction);
  }
}
```

### Test It

```bash
# Create test file
touch src/lib/arena/__tests__/combat-engine.test.ts
```

```typescript
import { ArenaCombatEngine } from '../combat-engine';

describe('ArenaCombatEngine', () => {
  it('initializes battle correctly', () => {
    const player: ArenaFighter = {
      holobotId: '1',
      userId: 'user-1',
      maxHP: 100,
      currentHP: 100,
      attack: 50,
      defense: 40,
      speed: 60,
      intelligence: 55,
      stamina: 6,
      maxStamina: 7,
      specialMeter: 0,
      staminaState: 'fresh',
      isInDefenseMode: false,
      comboCounter: 0,
      lastActionTime: 0,
      staminaEfficiency: 1.0,
      defenseTimingWindow: 500,
      counterDamageBonus: 1.0,
      avatar: '/avatar.png',
      name: 'Test Bot',
      archetype: 'balanced',
    };

    const opponent = { ...player, holobotId: '2', name: 'Opponent' };
    const battle = ArenaCombatEngine.initializeBattle(player, opponent);

    expect(battle.status).toBe('active');
    expect(battle.player.currentHP).toBe(100);
  });
});
```

Run test:
```bash
npm test -- combat-engine
```

---

## Step 5: Create Zustand Store (5 min)

```bash
touch src/stores/arena-battle-store.ts
```

```typescript
import { create } from 'zustand';
import type { BattleState } from '@/types/arena';

interface ArenaBattleStore {
  currentBattle: BattleState | null;
  isLoading: boolean;
  
  // Actions
  setBattle: (battle: BattleState) => void;
  clearBattle: () => void;
}

export const useArenaBattleStore = create<ArenaBattleStore>((set) => ({
  currentBattle: null,
  isLoading: false,
  
  setBattle: (battle) => set({ currentBattle: battle }),
  clearBattle: () => set({ currentBattle: null }),
}));
```

---

## Step 6: Create Minimal UI (10 min)

```bash
mkdir -p src/components/arena
touch src/components/arena/BattleArenaView.tsx
touch src/pages/ArenaScreen.tsx
```

### Basic Arena Screen

```typescript
// src/pages/ArenaScreen.tsx
import { useEffect } from 'react';
import { useArenaBattleStore } from '@/stores/arena-battle-store';
import { ArenaCombatEngine } from '@/lib/arena/combat-engine';

export default function ArenaScreen() {
  const { currentBattle, setBattle } = useArenaBattleStore();

  useEffect(() => {
    // Create mock battle for testing
    const mockPlayer = {
      holobotId: 'player-1',
      userId: 'user-1',
      maxHP: 100,
      currentHP: 100,
      attack: 50,
      defense: 40,
      speed: 60,
      intelligence: 55,
      stamina: 6,
      maxStamina: 7,
      specialMeter: 0,
      staminaState: 'fresh' as const,
      isInDefenseMode: false,
      comboCounter: 0,
      lastActionTime: 0,
      staminaEfficiency: 1.0,
      defenseTimingWindow: 500,
      counterDamageBonus: 1.0,
      avatar: '/lovable-uploads/holobot-placeholder.png',
      name: 'Your Holobot',
      archetype: 'balanced',
    };

    const mockOpponent = {
      ...mockPlayer,
      holobotId: 'opponent-1',
      name: 'Enemy Holobot',
      avatar: '/lovable-uploads/opponent-placeholder.png',
    };

    const battle = ArenaCombatEngine.initializeBattle(mockPlayer, mockOpponent);
    setBattle(battle);
  }, [setBattle]);

  if (!currentBattle) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading battle...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-4 text-center">
        <h1 className="text-3xl font-bold text-white">
          HOLOBOTS ARENA V2
        </h1>
      </div>

      {/* Opponent Fighter */}
      <div className="p-4 bg-red-900/30 backdrop-blur rounded-lg m-4">
        <div className="flex items-center gap-4">
          <img 
            src={currentBattle.opponent.avatar} 
            alt={currentBattle.opponent.name}
            className="w-16 h-16 rounded-full"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              {currentBattle.opponent.name}
            </h2>
            <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
              <div 
                className="bg-red-500 h-4 rounded-full transition-all"
                style={{ 
                  width: `${(currentBattle.opponent.currentHP / currentBattle.opponent.maxHP) * 100}%` 
                }}
              />
            </div>
            <p className="text-sm text-gray-300 mt-1">
              HP: {currentBattle.opponent.currentHP} / {currentBattle.opponent.maxHP}
            </p>
            <p className="text-sm text-yellow-400">
              Stamina: {currentBattle.opponent.stamina} / {currentBattle.opponent.maxStamina}
            </p>
          </div>
        </div>
      </div>

      {/* Battle Center */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl font-bold text-white mb-4">
            VS
          </p>
          <p className="text-gray-400">
            Turn {currentBattle.turnNumber}
          </p>
        </div>
      </div>

      {/* Player Fighter */}
      <div className="p-4 bg-blue-900/30 backdrop-blur rounded-lg m-4">
        <div className="flex items-center gap-4">
          <img 
            src={currentBattle.player.avatar} 
            alt={currentBattle.player.name}
            className="w-16 h-16 rounded-full"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              {currentBattle.player.name}
            </h2>
            <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{ 
                  width: `${(currentBattle.player.currentHP / currentBattle.player.maxHP) * 100}%` 
                }}
              />
            </div>
            <p className="text-sm text-gray-300 mt-1">
              HP: {currentBattle.player.currentHP} / {currentBattle.player.maxHP}
            </p>
            <p className="text-sm text-yellow-400">
              Stamina: {currentBattle.player.stamina} / {currentBattle.player.maxStamina}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons (Placeholder) */}
      <div className="p-4 flex gap-4">
        <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition">
          ATTACK
        </button>
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition">
          DEFEND
        </button>
      </div>
    </div>
  );
}
```

### Add to Navigation

```typescript
// src/App.tsx or your router
import ArenaScreen from '@/pages/ArenaScreen';

// Add route:
<Route path="/arena-v2" element={<ArenaScreen />} />
```

---

## Step 7: Test It! (5 min)

```bash
npm run dev
```

Navigate to: `http://localhost:5173/arena-v2`

**You should see:**
- ✅ Arena title
- ✅ Opponent fighter display (top)
- ✅ VS center
- ✅ Player fighter display (bottom)
- ✅ Basic HP and stamina bars
- ✅ Action buttons (non-functional yet)

---

## Next Steps - Week 1

### Day 1-2: Combat Engine Logic
- [ ] Implement damage calculation
- [ ] Add stamina consumption/recovery
- [ ] Build defense evaluation system
- [ ] Add combo validation

### Day 3: Card System
- [ ] Fetch cards from Supabase
- [ ] Generate fighter-specific card pools
- [ ] Display cards as UI components

### Day 4: AI Controller
- [ ] Basic AI decision making
- [ ] Personality-based behavior
- [ ] Auto-battle loop

### Day 5: Testing & Iteration
- [ ] Unit tests for combat engine
- [ ] Balance testing
- [ ] Fix bugs

---

## Useful Commands

```bash
# Run dev server
npm run dev

# Run tests
npm test

# Type check
npm run type-check

# Reset local database
cd supabase && npx supabase db reset

# Generate TypeScript types from Supabase
npx supabase gen types typescript --local > src/types/supabase.ts

# View Supabase studio
npx supabase studio
```

---

## Troubleshooting

### "Cannot find module @/types/arena"
- Make sure `tsconfig.json` has path mapping for `@/*`
- Restart TypeScript server in your IDE

### Cards not loading from database
```sql
-- Check if cards exist
SELECT COUNT(*) FROM card_templates;

-- View all card names
SELECT card_name, card_type FROM card_templates ORDER BY card_type;
```

### Battle state not updating
- Check Zustand devtools in browser
- Verify `setBattle()` is being called
- Look for console errors

### Framer Motion animations not working
```bash
# Reinstall if needed
npm install framer-motion@^11.0.0 --save
```

---

## Project Structure After Setup

```
src/
├── types/
│   ├── arena.ts ✅
│   ├── arena-animations.ts ✅
│   └── arena-rewards.ts ✅
│
├── lib/
│   └── arena/
│       ├── combat-engine.ts ✅
│       ├── card-generator.ts ✅
│       └── ai-controller.ts ✅
│
├── stores/
│   └── arena-battle-store.ts ✅
│
├── components/
│   └── arena/
│       └── BattleArenaView.tsx ✅
│
└── pages/
    └── ArenaScreen.tsx ✅

supabase/
└── migrations/
    └── 08_arena_v2_schema.sql ✅

scripts/
└── seed-arena-cards.sql ✅
```

---

## Success Checklist

- [x] Dependencies installed
- [x] Database migrated
- [x] Cards seeded
- [x] Types defined
- [x] Combat engine stub created
- [x] Store initialized
- [x] Basic UI rendering
- [x] Can navigate to Arena screen

**You're ready to build! 🎮**

Refer to `ARENA_V2_IMPLEMENTATION_PLAN.md` for detailed implementation of each system.

---

## Support & Resources

- **PRD**: `Holobots Arena V2 – Speed Combat PRD` (original spec)
- **Implementation Plan**: `ARENA_V2_IMPLEMENTATION_PLAN.md`
- **Card Data**: `scripts/seed-arena-cards.sql`
- **This Guide**: `ARENA_V2_QUICKSTART.md`

---

Happy coding! 🤖⚡
