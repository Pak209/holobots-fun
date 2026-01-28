# PvP: Defensive Stance System 🛡️

**Date**: January 27, 2026  
**Status**: ✅ COMPLETE - Enhanced Defense Cards

---

## 🎯 Overview

Defense cards now create a **Defensive Stance** that provides:
1. ✅ **Stamina Restore** (2-4 stamina)
2. ✅ **Attack Cooldown** (2 seconds - opponent can't attack)
3. ✅ **Damage Reduction** (up to 70% based on DEF stat, lasts 3 seconds)

This makes defense cards **tactical** instead of just stamina management!

---

## 🛡️ How Defensive Stance Works

### When You Use a Defense Card:

#### Immediate Effects:
1. **Restore Stamina**: +2 stamina (or +4 if Perfect Evade)
2. **Activate Defensive Stance**:
   - `defenseActive = true`
   - `defendedAt = current timestamp`
3. **Cannot Attack**: Locked from attacking for 2 seconds

#### Defensive Stance Effects:

**For 2 Seconds:**
- **You Cannot Attack**: Committed to defensive stance
- If you try to attack: `"Still in defensive stance! Wait X.Xs"`
- **If Opponent Attacks You**: Damage reduced + Counter/Evade chance

**For 3 Seconds:**
- **Damage Reduction**: Based on your DEF stat
- Formula: `damageReduction = min(70%, DEF / 50)`
- High DEF = massive damage reduction!
- **Can Attack After 2s**: Attacking clears your stance

### Exiting Defensive Stance:
- **Option 1**: Wait 2 seconds, then attack (clears stance)
- **Option 2**: Get attacked (stance broken immediately)
- **Option 3**: Use another defense card (refreshes stance)

---

## 📊 Damage Reduction Examples

### Formula:
```
damageReduction = min(70%, DEF / 50)
finalDamage = normalDamage × (1 - damageReduction)
```

### Examples:

| DEF Stat | Reduction % | 50 dmg → | 100 dmg → |
|----------|-------------|----------|-----------|
| **10** | 20% | **40 dmg** | **80 dmg** |
| **20** | 40% | **30 dmg** | **60 dmg** |
| **30** | 60% | **20 dmg** | **40 dmg** |
| **35** | 70% (max) | **15 dmg** | **30 dmg** |
| **50+** | 70% (max) | **15 dmg** | **30 dmg** |

**High DEF Holobots are TANKS!** 🛡️

---

## ⏰ Timing Breakdown (CORRECTED!)

### When YOU Use Defense Card:
```
0.0s: You use Defense Card
      ├─ Activate defensive stance
      └─ Restore +2 stamina

0.0s - 2.0s: YOU CANNOT ATTACK
      └─ Committed to defensive stance
      └─ If attacked: Damage reduced + Counter/Evade chance

2.0s - 3.0s: YOU CAN ATTACK AGAIN
      └─ Damage reduction still active if attacked
      └─ Can exit stance early by attacking

3.0s+: Stance expires
      └─ Normal damage resumes if attacked
```

**Key Points:**
- **You** can't attack for 2 seconds (committed to defense)
- **Opponent** can attack you anytime during 0-3 seconds
- **Damage reduction** lasts 3 seconds when opponent attacks you
- **Attacking** clears your defensive stance early

---

## 🎮 Strategic Implications

### 1. **Defensive Play Style**
- High DEF Holobots can **tank** effectively
- Use defense cards to force cooldowns
- Outlast aggressive opponents

### 2. **Timing Matters**
- Use defense right before big attacks expected
- 3-second window to counter-play
- Forces opponent to wait 2 seconds

### 3. **Stamina Management**
- Defense cards are **free** (0 stamina cost)
- Restore 2 stamina while blocking damage
- Can chain multiple defenses if needed

### 4. **Breaking Defensive Stance**
- Any attack breaks opponent's stance
- Light attacks waste their defense cooldown
- Strategic: Use Strike to break, then Finisher!

---

## 🥊 Advanced Tactics

### Tactic 1: Defense Baiting
```
1. Use defense card (activate stance)
2. Opponent waits 2 seconds (cooldown)
3. Opponent attacks with Strike (breaks stance, low damage)
4. Counter with Finisher while they have no stamina!
```

### Tactic 2: Damage Sponge
```
1. High DEF Holobot (35+ DEF)
2. Use defense card before opponent's Finisher
3. 70% damage reduction → Survive finisher!
4. Counter-attack while they recover
```

### Tactic 3: Stamina Drain
```
1. Force opponent to use stamina on attacks
2. Use defense cards to negate damage
3. Opponent runs out of stamina
4. Go on the offensive
```

### Tactic 4: Cooldown Chain
```
1. Use defense card (2s cooldown)
2. Opponent waits
3. Right at 2s, use another defense card
4. Another 2s cooldown → 4s total lockout!
```

---

## 💻 Technical Implementation

### Type Changes (`src/types/battle-room.ts`):
```typescript
export interface BattleRoomPlayer {
  // ... existing fields
  
  // Defensive Stance
  defendedAt?: number;      // Timestamp when defense was used
  defenseActive?: boolean;  // Whether defensive stance is active
}
```

### Logic (`src/hooks/useRealtimeArena.ts`):

#### Attack Cooldown Check:
```typescript
if (card.type !== 'defense' && opponent.defenseActive && opponent.defendedAt) {
  const timeSinceDefense = Date.now() - opponent.defendedAt;
  const COOLDOWN_MS = 2000; // 2 seconds
  
  if (timeSinceDefense < COOLDOWN_MS) {
    throw new Error(`Opponent defending! Wait ${remainingMs / 1000}s`);
  }
}
```

#### Damage Reduction:
```typescript
if (opponent.defenseActive && opponent.defendedAt) {
  const timeSinceDefense = Date.now() - opponent.defendedAt;
  const STANCE_DURATION = 3000; // 3 seconds
  
  if (timeSinceDefense < STANCE_DURATION) {
    const opponentDEF = opponent.holobot.defense || 10;
    const stanceReduction = Math.min(0.70, opponentDEF / 50);
    calculatedDamage *= (1 - stanceReduction);
  }
}
```

#### Defensive Stance Activation:
```typescript
if (card.type === 'defense') {
  updateData[`players.${myRole}.defenseActive`] = true;
  updateData[`players.${myRole}.defendedAt`] = Date.now();
} else if (card.type === 'strike' || card.type === 'combo' || card.type === 'finisher') {
  // Break opponent's defensive stance when attacking
  updateData[`players.${opponentRole}.defenseActive`] = false;
}
```

---

## 📈 Balance Considerations

### Current Settings:
```typescript
COOLDOWN_MS = 2000;          // 2 second attack cooldown
STANCE_DURATION = 3000;      // 3 second damage reduction
MAX_REDUCTION = 70%;         // Maximum damage reduction
DEF_SCALING = DEF / 50;      // How DEF scales to reduction
```

### Tuning Options:

#### If Defense Too Strong:
```typescript
COOLDOWN_MS = 1500;          // Reduce to 1.5 seconds
MAX_REDUCTION = 60%;         // Cap at 60% instead of 70%
DEF_SCALING = DEF / 60;      // Require more DEF for same reduction
```

#### If Defense Too Weak:
```typescript
COOLDOWN_MS = 2500;          // Increase to 2.5 seconds
MAX_REDUCTION = 80%;         // Cap at 80%
STANCE_DURATION = 4000;      // 4 second damage reduction
```

---

## 🧪 Testing Scenarios

### Test 1: Low DEF Holobot (10 DEF)
1. Use defense card
2. Opponent waits 2 seconds
3. Takes Strike (50 dmg) → 40 dmg (20% reduction)
4. **Expected**: Modest damage reduction

### Test 2: High DEF Holobot (35 DEF)
1. Use defense card
2. Opponent waits 2 seconds
3. Takes Finisher (150 dmg) → 45 dmg (70% reduction!)
4. **Expected**: Massive damage reduction, survive finisher

### Test 3: Cooldown Timing
1. Player A uses defense
2. Player B tries to attack immediately
3. **Expected**: Error "Opponent defending! Wait X.Xs"
4. After 2s, attack succeeds

### Test 4: Stance Expiry
1. Use defense card
2. Wait 3.5 seconds (no attack)
3. Opponent attacks
4. **Expected**: Normal damage (stance expired)

---

## 🎯 DEF Stat Value

| DEF Range | Playstyle | Damage Reduction | Rating |
|-----------|-----------|------------------|--------|
| **5-15** | Glass Cannon | 10-30% | ⭐ |
| **15-25** | Balanced | 30-50% | ⭐⭐⭐ |
| **25-35** | Tank | 50-70% | ⭐⭐⭐⭐ |
| **35+** | Fortress | 70% (max) | ⭐⭐⭐⭐⭐ |

**High DEF is now ESSENTIAL for defensive playstyles!**

---

## 📝 Console Debugging

```javascript
// When defense card used:
[Defense Stance] PlayerName activated defensive stance!

// When opponent tries to attack during cooldown:
Error: Opponent defending! Wait 1.2s

// When damage reduced:
[Defense Stance] Damage reduced by 60% (DEF: 30)
PlayerName used Strike (20 dmg) - BLOCKED!

// When stance broken:
[Defense Stance] PlayerName's defensive stance broken!
```

---

## ✅ Benefits

1. **Defense Cards Matter**: No longer just stamina restore
2. **Tactical Depth**: Timing and positioning crucial
3. **DEF Stat Value**: High DEF builds are viable
4. **Counter-Play**: Forces opponent to adapt strategy
5. **Exciting Gameplay**: "BLOCKED!" moments are satisfying

---

## 🔮 Future Enhancements

### Possible Additions:
1. **Shield HP**: Defense cards grant temporary shield HP
2. **Reflect Damage**: Portion of blocked damage reflected back
3. **Stamina Steal**: Successful blocks steal opponent's stamina
4. **Parry Window**: Perfect timing = instant counter
5. **Defense Chains**: Consecutive defenses = stronger stance

---

## ✅ Status: LIVE

The defensive stance system is now active!

**Try it out:**
1. Use a defense card in PvP
2. Watch opponent's attacks get **BLOCKED!**
3. Build high DEF for maximum tank potential
4. Master the timing for tactical plays!

**Defense is no longer passive - it's TACTICAL!** 🛡️⚡
