# PvP: Intelligence + Counter/Evade System ⚡🧠

**Date**: January 27, 2026  
**Status**: ✅ COMPLETE - Tactical Defense Implemented

---

## 🎯 Overview

Added a **tactical defense system** where **Speed + Intelligence** determine if a Holobot can **Counter Attack** or **Perfect Evade** when using defense cards!

### The Secret Sauce: Intelligence (INT)
- **Based on PvP battle experience** (wins/losses per Holobot)
- **Veteran Holobots** (many battles) have high INT → better counters/evades
- **New Holobots** (few battles) have low INT → less tactical advantage

---

## 🧠 Intelligence Calculation

### Formula:
```
INT = BaseINT + (PvP Wins × 2) + floor(Total Battles / 10)
```

### Components:
1. **Base INT**: Starting value from `HOLOBOT_STATS` (3-5)
2. **Win Bonus**: Each PvP win adds **+2 INT**
3. **Experience Bonus**: Every 10 battles adds **+1 INT**

### Examples:
| Holobot Record | Base INT | Win Bonus | Exp Bonus | Final INT |
|----------------|----------|-----------|-----------|-----------|
| 0W - 0L (New) | 5 | 0 | 0 | **5** |
| 5W - 5L | 5 | 10 | 1 | **16** |
| 20W - 10L | 5 | 40 | 3 | **48** |
| 50W - 20L (Veteran) | 5 | 100 | 7 | **112** |

---

## 🥊 Counter/Evade System

### When Defense Cards Are Used:

#### Step 1: Calculate Tactical Scores
```typescript
Defender Score = (Speed × 3) + (INT × 4)
Attacker Score = (Attack × 2) + (Speed × 2)
```

**Why INT is weighted 4x?**
- Speed helps with reaction time
- INT (battle experience) is the REAL advantage!
- Veterans know when to counter/evade

#### Step 2: Check for Advantage
```typescript
if (Defender Score > Attacker Score) {
  scoreDiff = Defender Score - Attacker Score
  counterChance = min(75%, scoreDiff / 2)
  
  Roll dice!
}
```

#### Step 3: Roll for Success
- **Success**: 50/50 chance for Counter Attack or Perfect Evade
- **Fail**: Normal defense card (restore stamina)

---

## 💥 Counter Attack

When successful:
- **Deals damage back to attacker!**
- Damage formula: `15 × (Defender Speed / 20)`
- **Bonus +1 stamina** (on top of normal restore)
- Battle log: `"[Player] COUNTER ATTACKED! (X dmg, +Y stamina)"`

### Example:
```
Defender: 20 Speed
Counter Damage = 15 × (20 / 20) = 15 damage
Total Stamina Restore = 2 (card) + 1 (bonus) = +3 stamina
```

---

## 🌪️ Perfect Evade

When successful:
- **No damage taken** (dodge!)
- **Bonus +2 stamina** (on top of normal restore)
- **+15% special meter** (instead of normal +5%)
- Battle log: `"[Player] PERFECT EVADE! (+Y stamina, +10% special)"`

### Example:
```
Normal Defense: +2 stamina, +5% special
Perfect Evade: +4 stamina, +15% special
```

---

## 📊 Tactical Score Examples

### Scenario 1: Veteran vs Rookie
**Veteran Holobot**: 20 Speed, 50 INT (from 25 PvP wins)
- Defender Score: (20 × 3) + (50 × 4) = **260**

**Rookie Attacker**: 25 ATK, 15 Speed
- Attacker Score: (25 × 2) + (15 × 2) = **80**

**Result:**
- Score Diff: 260 - 80 = 180
- **Counter Chance: 75%** (capped at max)
- **Veteran dominates!** 🔥

### Scenario 2: Balanced Match
**Mid-level Defender**: 18 Speed, 20 INT (10 wins)
- Defender Score: (18 × 3) + (20 × 4) = **134**

**Mid-level Attacker**: 22 ATK, 18 Speed
- Attacker Score: (22 × 2) + (18 × 2) = **80**

**Result:**
- Score Diff: 134 - 80 = 54
- **Counter Chance: 27%**
- **Decent chance for tactical play**

### Scenario 3: Rookie vs Strong Attacker
**New Defender**: 15 Speed, 5 INT (no wins yet)
- Defender Score: (15 × 3) + (5 × 4) = **65**

**Strong Attacker**: 30 ATK, 20 Speed
- Attacker Score: (30 × 2) + (20 × 2) = **100**

**Result:**
- Score Diff: -35 (negative!)
- **Counter Chance: 0%**
- **No tactical advantage - normal defense only**

---

## 🎮 Strategic Implications

### 1. **Speed Matters for Defense**
- High Speed = better positioning for counters/evades
- Speed × 3 weighting makes it valuable

### 2. **Intelligence is the Secret Sauce**
- INT × 4 weighting makes it MOST important
- Veterans have huge advantage in defensive plays
- Rookies need Speed to compensate for low INT

### 3. **Battle Experience Progression**
- Each PvP win makes your Holobot smarter
- More battles = more tactical options
- Incentivizes using the same Holobot repeatedly

### 4. **Counter-Play Depth**
- Attackers with high Speed can reduce counter chances
- Defenders can build INT over time
- Creates interesting min-max strategies

---

## 📁 Files Modified

### 1. **`src/types/user.ts`**
Added PvP tracking to `UserHolobot`:
```typescript
export interface UserHolobot {
  // ... existing fields
  pvpWins?: number;    // Track PvP wins
  pvpLosses?: number;  // Track PvP losses
}
```

### 2. **`src/utils/holobotStatsCalculator.ts`**
Added INT calculation:
```typescript
const pvpWins = userHolobot.pvpWins || 0;
const pvpLosses = userHolobot.pvpLosses || 0;
const totalBattles = pvpWins + pvpLosses;
const baseIntelligence = finalStats.intelligence || 5;
const winBonus = pvpWins * 2;
const experienceBonus = Math.floor(totalBattles / 10);

finalStats.intelligence = baseIntelligence + winBonus + experienceBonus;
```

### 3. **`src/hooks/useRealtimeArena.ts`**

#### Defense Card Handler:
```typescript
if (card.type === 'defense') {
  // Calculate tactical scores
  const defenderScore = (speed × 3) + (INT × 4);
  const attackerScore = (attack × 2) + (speed × 2);
  
  if (defenderScore > attackerScore) {
    const counterChance = Math.min(75, scoreDiff / 2);
    
    if (roll < counterChance) {
      // 50/50: Counter Attack or Perfect Evade
      if (isCounter) {
        // Deal damage back!
      } else {
        // Perfect evade - extra stamina + special meter
      }
    }
  }
}
```

#### Reward Tracking:
```typescript
// Winner: Track pvpWins for their Holobot
const updatedHolobots = holobots.map((bot) => {
  if (bot.name === winnerHolobotName) {
    return {
      ...bot,
      pvpWins: (bot.pvpWins || 0) + 1,
    };
  }
  return bot;
});

// Loser: Track pvpLosses
saveLoserStats(loser.uid, loser.holobot.name);
```

---

## 🧪 Testing Scenarios

### Test 1: New Holobot (0 wins, 5 INT)
- Use defense card
- Should rarely get counters/evades (low INT)
- **Expected**: Normal defense most of the time

### Test 2: Veteran Holobot (20 wins, 45 INT)
- Use defense card
- Should frequently get counters/evades
- **Expected**: 50-75% chance depending on opponent

### Test 3: High Speed, Low INT (25 Speed, 10 INT)
- Speed helps compensate for lack of INT
- **Expected**: ~30-40% counter chance vs normal attackers

### Test 4: After Winning Multiple Battles
- Check Holobot's pvpWins in Firebase
- Next battle should have higher INT
- **Expected**: Counter/evade chances improve over time

---

## 💡 Balance Considerations

### Current Weights:
```
Defender: (Speed × 3) + (INT × 4)
Attacker: (Attack × 2) + (Speed × 2)
```

### Why These Weights?
1. **INT × 4**: Rewards battle experience heavily
2. **Speed × 3**: Makes Speed valuable for defense
3. **Attack × 2**: Attacker's power matters less for counters
4. **Max 75% chance**: Prevents 100% guaranteed counters

### Tuning Options:
If counters/evades are too frequent:
```typescript
const counterChance = Math.min(50, scoreDiff / 3); // Reduce max to 50%
```

If counters/evades are too rare:
```typescript
const counterChance = Math.min(85, scoreDiff / 1.5); // Increase max to 85%
```

---

## 📈 Progression Example

### New Player's Journey:

#### Week 1 (0-5 wins):
- INT: 5-15
- Counter Chance: 0-20%
- **Experience**: Learning the ropes

#### Month 1 (10-20 wins):
- INT: 25-45  
- Counter Chance: 25-50%
- **Experience**: Developing tactics

#### Month 3 (40-60 wins):
- INT: 85-125
- Counter Chance: 50-75%
- **Experience**: Veteran status, tactical mastery!

---

## 🎯 Benefits

1. **Rewards Loyalty**: Using same Holobot builds INT over time
2. **Tactical Depth**: Defense isn't just stamina restore
3. **Skill Expression**: Veterans have mechanical advantage
4. **Counter-Play**: Speed can help rookies compete
5. **Exciting Moments**: Counter attacks and evades are hype!

---

## ✅ Status: LIVE

The intelligence-based counter/evade system is now active!

**Try it out:**
1. Use a defense card in PvP
2. Watch console for: `[Defense] Tactical Check:`
3. See if you get: `🥊 COUNTER ATTACK!` or `🌪️ PERFECT EVADE!`
4. Build up wins to increase INT over time!

**Veterans dominate defense now!** 🧠⚡
