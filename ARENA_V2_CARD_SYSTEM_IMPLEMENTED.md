# Arena V2 Card System - Now in PvP!

## ✅ What's Fixed

### 1. **Cards Now Go Away After Use (Like Arena V2!)**
- When you play a card, it's **removed from your hand**
- A new card is **immediately drawn** to replace it
- Hand size stays at 7 cards at all times

### 2. **Finishers Only Appear When Special Meter is 100%**
- **Starting hand:** 7 random cards (Strikes, Defense, Combos)
- **NO finishers in starting hand!**
- **When special meter reaches 100%:** Next card drawn will be a FINISHER
- **After using finisher:** Special meter resets to 0%, no more finishers until 100% again

### 3. **Cards Show Correct Costs**
- **Strike cards:** 1-2 stamina cost, 8-12 damage
- **Combo cards:** 2-3 stamina cost, 18-24 damage
- **Defense cards:** 0 stamina cost, **+2 stamina restore** (green badge)
- **Finisher cards:** 6 stamina cost, 80 damage (only when special meter is 100%)

---

## 🎮 Arena V2 Card Pool

### Starting Hand (7 Cards):
```typescript
// Strike Cards (basic attacks)
{ name: 'Jab', staminaCost: 1, baseDamage: 8 }
{ name: 'Cross', staminaCost: 1, baseDamage: 10 }
{ name: 'Hook', staminaCost: 1, baseDamage: 12 }

// Defense Cards (restore stamina)
{ name: 'Block', staminaCost: 0, staminaRestore: 2 }
{ name: 'Retreat', staminaCost: 0, staminaRestore: 2 }

// Combo Cards (high damage)
{ name: 'Jab-Cross', staminaCost: 3, baseDamage: 24 }
{ name: 'One-Two', staminaCost: 2, baseDamage: 18 }
```

### Finisher Card (Only when special meter = 100%):
```typescript
{ name: 'FINISHER', type: 'finisher', staminaCost: 6, baseDamage: 80 }
```

---

## ⚡ How It Works (Arena V2 Style!)

### Combat Flow:
1. **Start battle** → Both players get 7 random cards
2. **Play a card** → Card is removed, new card drawn instantly
3. **Build special meter** → +5% per action (except finisher)
4. **Reach 100% special** → Next draw gives you a FINISHER card
5. **Use finisher** → Massive damage, special meter resets to 0%

### Card Drawing Logic:
```typescript
// When drawing a new card:
if (specialMeter >= 100) {
  // Give them a FINISHER!
  drawCard = FINISHER_CARD
} else {
  // Draw random card from normal pool (strikes, defense, combos)
  drawCard = randomFrom(CARD_POOL)
}
```

---

## 🎯 Strategic Gameplay

### Offense Strategy:
- **Jabs/Crosses** → Low stamina cost, chip damage
- **Hooks/Combos** → Higher cost, more damage
- **Build special meter** → Save finisher for finishing blow

### Defense Strategy:
- **Block/Retreat** → Restore stamina when low
- **Manage stamina** → Don't run out or you can't attack
- **Time finisher defense** → Predict when opponent has 100% special

### Stamina Management:
- **Starting stamina:** 7 (matches hand size)
- **Max stamina:** 7
- **Auto-regen:** +1 every 2 seconds
- **Defense cards:** +2 instant stamina restore

---

## 📊 Comparison: Before vs After

### Before (Broken):
- ❌ Cards didn't go away
- ❌ Finisher in starting hand
- ❌ No card variety
- ❌ No strategic depth

### After (Arena V2 Style):
- ✅ Cards removed and replaced
- ✅ Finisher only at 100% special
- ✅ 7 different card types
- ✅ Strategic stamina management
- ✅ Real-time card drawing
- ✅ Synced across both devices

---

## 🔧 Technical Implementation

### Files Modified:
1. **`src/types/battle-room.ts`**
   - Added `SimpleActionCard` type
   - Added `hand: SimpleActionCard[]` to `BattleRoomPlayer`

2. **`src/hooks/useRealtimeArena.ts`**
   - Added card pool system (strikes, defense, combos, finishers)
   - Added `generateStartingHand()` - creates 7 random cards (no finishers)
   - Added `drawCard(specialMeter)` - draws finisher if meter is 100%, otherwise random
   - Updated `createRoom()` - generates starting hands for both players
   - Updated `joinRoom()` - generates starting hand for joining player
   - Updated `playAction()` - removes card, draws new one, updates hand in Firebase

3. **`src/components/arena/RealtimeBattleCards.tsx`**
   - Updated to display cards from `hand` prop
   - Shows card name, type, stamina cost, damage
   - Disables cards if not enough stamina or special meter
   - Auto-icons based on card type

4. **`src/components/arena/RealtimeBattleRoom.tsx`**
   - Updated to pass `hand` to battle cards component
   - Shows "Waiting for cards to load..." if hand is empty
   - Updates in real-time as cards are played

---

## 🧪 Test It Now!

1. **Start PvP battle**
   - Both players get 7 random cards ✅
   - No finishers in starting hand ✅

2. **Play cards**
   - Card disappears from hand ✅
   - New card appears instantly ✅
   - Hand stays at 7 cards ✅

3. **Build special meter**
   - Play 20 actions (20 × 5% = 100%) ✅
   - Next card drawn is FINISHER ✅

4. **Use finisher**
   - 80 damage dealt ✅
   - Special meter resets to 0% ✅
   - Finisher card removed, new card drawn ✅

---

## 🎉 Result

PvP now has the **EXACT same card system as Arena V2**:
- ✅ Cards go away and get replaced
- ✅ Finisher only appears at 100% special meter
- ✅ Strategic hand management
- ✅ Real-time Firebase sync
- ✅ Same 7-card starting hand
- ✅ Same card types (strikes, defense, combos, finishers)

**Perfect for competitive TCG-style battles!** 🔥
