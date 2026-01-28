# Defensive Stance - Corrected Mechanics ✅

**Date**: January 27, 2026  
**Status**: ✅ Fixed - Attack Cooldown on Defender, Not Attacker

---

## 🎯 Corrected Behavior

### ❌ **OLD (Incorrect):**
- Defense card locks **OPPONENT** from attacking
- Opponent has to wait while you defend
- You could spam attacks while they wait

### ✅ **NEW (Correct):**
- Defense card locks **YOU** from attacking (committed to defense)
- You can't attack for 2 seconds after using defense
- Opponent can attack you anytime, but takes reduced damage
- Creates risk/reward: commit to defense or stay aggressive

---

## ⏰ Corrected Timing Breakdown

```
0.0s: You Use Defense Card
      ├─ Restore +2 stamina (+4 if Perfect Evade)
      ├─ Activate defensive stance
      └─ Lock yourself from attacking

0.0s - 2.0s: YOU CANNOT ATTACK
      ├─ Committed to defensive stance
      ├─ If opponent attacks: Damage reduced (up to 70%)
      ├─ If opponent attacks: Counter/Evade chance
      └─ Try to attack → Error: "Still in defensive stance! Wait X.Xs"

2.0s - 3.0s: YOU CAN ATTACK AGAIN
      ├─ Damage reduction still active if attacked
      ├─ Can exit stance by attacking (clears defenseActive)
      └─ Or stay defensive for full 3s protection

3.0s+: Stance Expires
      └─ Normal damage resumes if attacked
```

---

## 🎮 Strategic Implications

### 1. **Commitment to Defense**
- Using defense card is a **trade-off**
- You gain protection but lose offensive pressure
- Can't chain attacks immediately after defending

### 2. **Tactical Windows**
- **0-2s**: Best time for opponent to attack (you're locked)
- **2-3s**: You can attack OR stay defensive
- **After 3s**: Must use another defense card for protection

### 3. **Aggressive vs Defensive Playstyles**
- **Aggressive**: Rarely use defense, maximize damage output
- **Defensive**: Chain defense cards, wait for openings
- **Balanced**: Use defense strategically, attack when safe

---

## 💻 Technical Changes

### PvP (`src/hooks/useRealtimeArena.ts`):

**Before:**
```typescript
// Checked if OPPONENT was defending (wrong!)
if (opponent.defenseActive && opponent.defendedAt) {
  throw new Error(`Opponent defending! Wait...`);
}
```

**After:**
```typescript
// Check if I'M defending (correct!)
if (card.type !== 'defense' && myPlayer.defenseActive && myPlayer.defendedAt) {
  const timeSinceDefense = Date.now() - myPlayer.defendedAt;
  const COOLDOWN_MS = 2000;
  
  if (timeSinceDefense < COOLDOWN_MS) {
    throw new Error(`Still in defensive stance! Wait ${...}s`);
  }
}
```

**Defensive Stance Activation:**
```typescript
if (card.type === 'defense') {
  // Activate MY defensive stance
  updateData[`players.${myRole}.defenseActive`] = true;
  updateData[`players.${myRole}.defendedAt`] = Date.now();
} else if (card.type === 'strike' || card.type === 'combo' || card.type === 'finisher') {
  // Clear MY defensive stance when I attack
  updateData[`players.${myRole}.defenseActive`] = false;
}
```

### Arena V2 (`src/lib/arena/combat-engine.ts`):

**Attack Cooldown Check:**
```typescript
// Check if ACTOR just used defense (not target!)
if (card.type !== 'defense' && actor.defenseActive && actor.defendedAt) {
  const timeSinceDefense = now - actor.defendedAt;
  const COOLDOWN_MS = 2000;
  
  if (timeSinceDefense < COOLDOWN_MS) {
    console.warn('[Arena V2] Still in defensive stance! Cannot attack yet.');
    return state; // Block the attack
  }
}
```

**Clear Stance on Attack:**
```typescript
// Clear ACTOR's defensive stance when attacking
if (card.type === 'strike' || card.type === 'combo' || card.type === 'finisher') {
  actor.defenseActive = false;
}
```

---

## 🧪 Testing Scenarios

### Test 1: Attack Cooldown
1. Use defense card
2. **Immediately** try to use strike card
3. **Expected**: Error "Still in defensive stance! Wait 2.0s"
4. Wait 2 seconds
5. Try strike again
6. **Expected**: Attack succeeds, stance cleared

### Test 2: Damage Reduction While Defending
1. Use defense card (30 DEF)
2. Opponent attacks with Finisher (100 dmg)
3. **Expected**: Take only 40 damage (60% blocked)
4. Your defenseActive = false (broken)
5. **Expected**: Next attack takes normal damage

### Test 3: Exit Stance Early
1. Use defense card
2. Wait 2 seconds
3. Use strike card
4. **Expected**: Attack succeeds, defenseActive cleared
5. Opponent attacks you
6. **Expected**: Normal damage (no reduction)

### Test 4: Chain Defense
1. Use defense card
2. Wait 2 seconds
3. Use ANOTHER defense card
4. **Expected**: Stance refreshed, defendedAt updated
5. Get 3 more seconds of protection

---

## 🎯 Benefits of Corrected Mechanics

1. **Risk/Reward Balance**: Defense requires commitment
2. **No Spam**: Can't abuse defense to lock opponents
3. **Tactical Choices**: When to defend vs attack matters
4. **Counter-Play**: Opponent can attack during your defense
5. **Fair Balance**: Both players have offensive/defensive options

---

## 📊 Playstyle Examples

### Tank Build (High DEF):
```
Turn 1: Defense card (70% reduction for 3s)
Turn 2: Wait or defend again
Turn 3: Attack when safe
Strategy: Outlast with damage reduction
```

### Glass Cannon (High ATK):
```
Turn 1: Strike
Turn 2: Combo
Turn 3: Finisher
Strategy: Never defend, maximize damage
```

### Balanced:
```
Turn 1: Strike
Turn 2: Defense (opponent attacks, reduced)
Turn 3: Counter with Finisher
Strategy: Mix offense and defense tactically
```

---

## ✅ Status: CORRECTED

Both PvP and Arena V2 now have the correct defensive stance mechanics:
- ✅ Attack cooldown applies to defender (not attacker)
- ✅ Defender can't attack for 2 seconds
- ✅ Damage reduction lasts 3 seconds when attacked
- ✅ Attacking clears your own defensive stance

**The system is now balanced and strategic!** 🛡️⚔️
