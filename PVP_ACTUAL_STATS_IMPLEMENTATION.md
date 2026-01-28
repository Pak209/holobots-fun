# PvP: Use Actual Holobot Stats & TCG Cards

## Current Issues
1. ❌ PvP uses emoji avatars instead of Holobot PNG/TCG cards
2. ❌ PvP uses base stats (Ace: 150 HP) instead of actual stats (Ace: 250 HP with +100 from boosts)
3. ❌ Damage calculations don't consider Attack/Defense stats

## Goals
1. ✅ Display Holobot TCG cards (like Arena V2)
2. ✅ Use actual user stats (base + level boosts + equipment + SP upgrades)
3. ✅ Make damage scale with Attack/Defense stats

---

## Implementation Plan

### Phase 1: Stats Calculator Utility ✅ DONE
**File**: `src/utils/holobotStatsCalculator.ts`

Created a utility function that:
- Takes a holobot key and user profile
- Calculates: base stats + level boosts + equipment + SP upgrades
- Returns complete `HolobotStats` object
- Matches Arena V2's calculation logic

---

### Phase 2: Update RealtimeBattleRoom Component

**File**: `src/components/arena/RealtimeBattleRoom.tsx`

#### Changes Needed:

1. **Import Stats Calculator & Dependencies**:
```typescript
import { calculateActualHolobotStats } from '@/utils/holobotStatsCalculator';
import { useAuth } from '@/contexts/auth';
import { useHolobotPartsStore } from '@/stores/holobotPartsStore';
import { useSyncPointsStore } from '@/stores/syncPointsStore';
import { HolobotCard } from '@/components/HolobotCard';
```

2. **Calculate Actual Stats Before Creating/Joining Room**:
```typescript
const handleCreateRoom = async () => {
  const actualStats = calculateActualHolobotStats(
    selectedHolobot,
    user,
    getEquippedParts,
    getHolobotAttributeLevel
  );
  const roomCode = await createRoom(actualStats);
};
```

3. **Replace Emoji Avatars with TCG Cards**:
Currently shows: `<div className="text-6xl">🤖</div>`

Replace with:
```typescript
<div className="transform scale-75">
  <HolobotCard 
    stats={myPlayer.holobot}
    variant="blue"
  />
</div>
```

4. **Update HP Bars to Show Actual Max HP**:
Currently: `150/150`
Should show: `250/250` (if Ace has +100 HP from boosts)

---

### Phase 3: Update useRealtimeArena Hook

**File**: `src/hooks/useRealtimeArena.ts`

#### Changes Needed:

1. **Store Full HolobotStats in BattleRoom**:
Currently stores: `{ uid, username, holobot: { name, attack, defense } }`

Should store: Full `HolobotStats` object with all calculated stats

2. **Update Damage Calculations**:
Currently: Fixed damage values (8, 12, 24, 80)

Should be:
```typescript
// Attack damage = cardBaseDamage * (attackerAttack / 100)
const attackMultiplier = myPlayer.holobot.attack / 100;
const actualDamage = Math.floor(card.baseDamage * attackMultiplier);

// Defense reduces damage
const defenseReduction = opponent.holobot.defense * 0.5;
const finalDamage = Math.max(1, actualDamage - defenseReduction);
```

3. **Initialize HP from Actual Stats**:
```typescript
const room = {
  players: {
    p1: {
      ...p1Data,
      health: p1Holobot.maxHealth,  // ← Use actual maxHealth (e.g., 250)
      maxHealth: p1Holobot.maxHealth,
    }
  }
};
```

---

### Phase 4: Update Battle Room Types

**File**: `src/types/battle-room.ts`

#### Changes Needed:

Update `BattleRoomPlayer` interface:
```typescript
export interface BattleRoomPlayer {
  uid: string;
  username: string;
  holobot: HolobotStats;  // ← Full stats object instead of partial
  health: number;
  maxHealth: number;      // ← Use actual maxHealth
  stamina: number;
  maxStamina: number;
  specialMeter: number;
  // ... rest
}
```

---

## Example: Ace with Boosts

### Current Behavior:
```
Pak209 selects Ace
├─ HP: 150/150 (base stats)
├─ Attack: 7
├─ Defense: 5
└─ Damage: Fixed (12 dmg from Hook card)
```

### After Implementation:
```
Pak209 selects Ace (Level 41, +100 HP boost)
├─ HP: 250/250 (150 base + 100 boost)
├─ Attack: 28 (8 base + 20 boost)
├─ Defense: 20 (6 base + 14 boost)
└─ Damage: Scaled (Hook card: 12 * (28/100) * attackMultiplier = ~20 dmg)
```

---

## Testing Checklist

After implementation:

- [ ] PvP shows Holobot TCG cards instead of emojis
- [ ] HP bars show actual maxHealth (e.g., Ace: 250/250)
- [ ] Attack stat shows actual value (e.g., Ace: 28 instead of 7)
- [ ] Defense stat shows actual value (e.g., Ace: 20 instead of 5)
- [ ] Damage scales with Attack stat (higher attack = more damage)
- [ ] Defense reduces incoming damage
- [ ] Holobots with equipment show equipment bonuses
- [ ] Level-up boosts apply correctly
- [ ] SP upgrades apply correctly

---

## Damage Formula

### Base Damage:
```typescript
baseDamage = cardBaseDamage  // Strike: 8-12, Combo: 18-24, Finisher: 80
```

### Attack Multiplier:
```typescript
attackMultiplier = attackerAttack / 100
// Attack 50 = 0.5x damage
// Attack 100 = 1.0x damage
// Attack 200 = 2.0x damage
```

### Defense Reduction:
```typescript
defenseReduction = defenderDefense * 0.5
// Defense 20 = -10 damage
// Defense 40 = -20 damage
```

### Final Damage:
```typescript
finalDamage = Math.max(1, Math.floor(baseDamage * attackMultiplier) - defenseReduction)
```

### Example:
```
Ace (Attack: 28) uses Hook (baseDamage: 12)
vs
Kuma (Defense: 15)

attackMultiplier = 28 / 100 = 0.28
rawDamage = 12 * 0.28 = 3.36 → 3
defenseReduction = 15 * 0.5 = 7.5 → 7
finalDamage = max(1, 3 - 7) = 1

Conclusion: Ace needs higher attack to deal significant damage!
```

---

## Benefits

1. **Progression Matters**: Leveling up and upgrading stats makes your Holobot stronger in PvP
2. **Strategy**: Players can optimize builds (glass cannon vs tank)
3. **Visual Consistency**: PvP matches Arena V2 aesthetic with TCG cards
4. **Fair Battles**: Actual stats reflect player investment

---

## Next Steps

Would you like me to proceed with implementing these changes? I'll go through each phase systematically.
