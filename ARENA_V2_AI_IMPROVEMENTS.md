# Arena V2 AI Improvements - Competitive Battle Card System

## 🎯 Overview

The opponent AI has been significantly upgraded to make Arena V2 battles more competitive and strategic. Opponents now use the same battle card system as players and manage their stamina intelligently instead of spamming attacks and exhausting themselves.

---

## ✅ What Was Fixed

### 1. **Proactive Stamina Management System**

**Problem:** Opponents were attacking constantly until they ran out of stamina, then being stuck in defense mode.

**Solution:** Added intelligent stamina planning that prevents exhaustion:

```typescript
// NEW: AI now checks stamina BEFORE making decisions
private needsStaminaRecovery(
  self: ArenaFighter, 
  opponent: ArenaFighter,
  staminaBuffer: number
): boolean {
  // Prevents AI from exhausting itself
  // Recovers proactively instead of reactively
  // Considers opponent state and game context
}
```

**Key Features:**
- **Stamina Buffer System**: AI maintains a reserve (3-5 stamina) and won't drop below it
- **Proactive Recovery**: Recovers stamina BEFORE running out, not after
- **Context-Aware**: Considers opponent HP, stamina state, and hand composition
- **Adaptive**: Different difficulties manage stamina differently

---

### 2. **Improved Card Scoring System**

**Problem:** AI wasn't properly evaluating the long-term cost of playing cards.

**Solution:** Completely revamped card scoring to prioritize sustainability:

```typescript
// Stamina sustainability is now a PRIMARY factor
const staminaAfter = self.stamina - card.staminaCost;
const staminaBuffer = this.getStaminaBuffer();

// HEAVY penalties for unsustainable plays
if (staminaAfter < staminaBuffer) {
  score -= 60; // Make this very unattractive
}

// BONUS for sustainable plays (leaves us with good stamina)
if (staminaAfter >= 5) {
  score += 25; // Reward sustainable aggression
}
```

**New Scoring Priorities:**
1. **Stamina Efficiency**: Damage per stamina cost (increased weight)
2. **Sustainability Penalties**: Heavy penalties for moves that would exhaust AI
3. **Buffer Awareness**: Won't play cards that drop below stamina buffer
4. **Reward Conservation**: Bonus points for plays that maintain good stamina

---

### 3. **Better Defense Card Usage**

**Problem:** AI would use attacks even with low stamina, ignoring defense cards.

**Solution:** Defense cards are now properly prioritized:

- **Increased Score** for defense when stamina < 4 (up from < 3)
- **Free Card Bonus**: Defense cards with 0 cost get +20 score
- **Earlier Recovery**: AI recovers at 4 stamina instead of waiting until 3 or less
- **Exhaustion Priority**: Guaranteed defense mode when exhausted or gassed

---

### 4. **Updated AI Personalities**

All difficulty levels now have better stamina conservation:

| Difficulty | Stamina Conservation | Recovery Threshold | Changes |
|------------|---------------------|-------------------|---------|
| **Easy**   | 0.5 (↑ from 0.3)    | 4 (↓ from 5)      | More conservative |
| **Medium** | 0.7 (↑ from 0.5)    | 4 (stays same)    | Better management |
| **Hard**   | 0.8 (↑ from 0.7)    | 4 (↑ from 3)      | Very strategic |
| **Expert** | 0.9 (stays same)    | 4 (↑ from 3)      | Near-perfect timing |

**Recovery Threshold**: The stamina level where AI prioritizes defense to recover.

---

### 5. **Strategic Action Pacing**

**Problem:** AI was attacking as fast as possible (every 1 second) with no tactical pacing.

**Solution:** More human-like, strategic timing:

```typescript
// OLD: Fixed 1 second cooldown, acted with 1+ stamina
const AI_COOLDOWN_MS = 1000;
if (regeneratedState.opponent.stamina >= 1 && timeSinceLastAI >= AI_COOLDOWN_MS) {
  // Attack immediately
}

// NEW: Variable cooldown, waits for good opportunities
const baseAICooldown = 1200; // 1.2 seconds base
const randomVariance = Math.random() * 600; // +0 to +0.6 seconds
const AI_COOLDOWN_MS = baseAICooldown + randomVariance;

// Only act with 2+ stamina (so AI has real options)
const canAct = regeneratedState.opponent.stamina >= 2 && timeSinceLastAI >= AI_COOLDOWN_MS;
```

**Benefits:**
- **1.2-1.8 second** between actions (instead of fixed 1 second)
- **Random variance** makes AI feel less robotic
- **Minimum 2 stamina** required to act (ensures AI has card choices)
- **Natural pacing** that feels more competitive

---

### 6. **Enhanced Decision Logging**

Added comprehensive logging to see AI decision-making:

```
[AI Decision] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[AI] Opponent state: {
  stamina: '5/7',
  staminaState: 'working',
  hp: '85/100',
  handSize: 7,
  specialMeter: 45
}
[AI] ✅ Selected card: Hook
[AI] Card type: strike
[AI] Stamina cost: 1
[AI] Damage: 12
[AI] Confidence: 87.3%
[AI] Reasoning: Best card by scoring (74.2 points)
[AI] Stamina after: 4
[AI Decision] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎮 Battle Card System Parity

### ✅ Opponents Now Have:

1. **Same Card Pool System**
   - Strike cards (Jab, Cross, Hook, etc.)
   - Defense cards (Block, Retreat) that restore stamina
   - Combo cards (One-Two, Jab-Cross)
   - Finisher cards (when special meter = 100%)

2. **Same Hand Management**
   - 7 card hand
   - Cards removed after use
   - New card drawn immediately
   - Finishers only appear at 100% special meter

3. **Same Stamina Mechanics**
   - Stamina = current hand resource
   - Regenerates over time (1 per 2 seconds)
   - Defense cards restore +2 stamina
   - Exhaustion states affect performance

---

## 📊 Expected Gameplay Changes

### Before:
- ❌ Opponents spam attacks constantly
- ❌ Run out of stamina quickly
- ❌ Stuck in defense mode for long periods
- ❌ Predictable and easy to beat
- ❌ No strategic card usage

### After:
- ✅ Opponents manage stamina intelligently
- ✅ Mix attacks and defense strategically
- ✅ Maintain pressure without exhausting
- ✅ Competitive and challenging battles
- ✅ Smart card selection based on game state

---

## 🎯 AI Decision Priority (In Order)

1. **Stamina Management Check** ⚡
   - "Do I need to recover stamina proactively?"
   - Checks stamina buffer threshold
   - Considers opponent state

2. **Critical Situations** 🚨
   - Exhausted/Gassed state → Mandatory defense
   - Finisher available + opponent vulnerable → Use it
   - Opponent defending → Press the attack

3. **Strategic Evaluation** 🧠
   - Large HP lead → Play conservatively
   - Large HP deficit → Take calculated risks
   - Opponent low stamina → Can afford to trade

4. **Card Scoring** 📊
   - Score all playable cards
   - Consider damage, efficiency, sustainability
   - Factor in personality traits
   - Pick best card with confidence rating

---

## 🔧 Technical Implementation

### Files Modified:

1. **`src/lib/arena/ai-controller.ts`**
   - Added `needsStaminaRecovery()` method
   - Added `getStaminaBuffer()` method
   - Improved `scoreCard()` with stamina penalties/bonuses
   - Updated `generatePersonality()` with better conservation values
   - Enhanced decision-making flow

2. **`src/stores/arena-battle-store.ts`**
   - Improved `processAITurn()` with detailed logging
   - Updated game loop with strategic pacing (1.2-1.8s cooldown)
   - Added minimum stamina requirement (2) for AI actions
   - Enhanced random variance for natural feel

---

## 🧪 Testing Recommendations

### What to Test:

1. **Stamina Management**
   - Does AI recover before exhaustion?
   - Does AI maintain stamina buffer?
   - Are defense cards used appropriately?

2. **Battle Pacing**
   - Are battles more competitive?
   - Does AI feel "smart" instead of spammy?
   - Is timing more natural and less robotic?

3. **Difficulty Scaling**
   - Easy: Still beatable but competent
   - Medium: Challenging, good opponent
   - Hard: Very strategic, tough to beat
   - Expert: Near-optimal play, intense

4. **Card Usage**
   - Does AI use combos when it has stamina?
   - Does AI save finishers for good opportunities?
   - Does AI mix attack and defense well?

---

## 🎓 How AI Now Thinks

### Example Decision Process:

```
Turn Start:
├─ Current Stamina: 3/7
├─ Stamina Buffer: 4 (need to maintain)
└─ Status: BELOW BUFFER! 🚨

Check 1: Stamina Recovery Needed?
├─ Stamina (3) < Buffer (4): YES
├─ Opponent HP: 65 (not critical)
└─ Decision: RECOVER STAMINA

Available Defense Cards:
├─ Block (cost: 0, restore: +2)
└─ Retreat (cost: 0, restore: +2)

Selected: Block
├─ Confidence: 95%
├─ Reasoning: "Stamina management: 3/7 - recovering proactively"
└─ Result: Stamina becomes 5/7 ✅
```

---

## 💡 Future Enhancements (Optional)

1. **Adaptive Learning**
   - Track player patterns
   - Adjust personality mid-battle
   - Counter player tendencies

2. **Card Prediction**
   - Predict player card usage
   - Bait certain moves
   - Set up counters

3. **Team Synergy**
   - Multi-bot battles
   - Coordinated attacks
   - Support abilities

4. **Meta Adaptation**
   - Adjust to popular strategies
   - Counter common builds
   - Evolve with player base

---

## 📝 Summary

The opponent AI is now a **truly competitive** combatant that:
- ✅ Uses the same battle card system as players
- ✅ Manages stamina intelligently
- ✅ Makes strategic decisions
- ✅ Provides challenging, fair gameplay
- ✅ Feels like a skilled human opponent

**No more spam attacks!** Opponents now play like they're trying to win, not just attacking mindlessly. 🎮🔥
