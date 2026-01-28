# PvP Tactical Defense - Quick Reference 🥊🌪️

**Last Updated**: January 27, 2026

---

## 🧠 Intelligence Formula

```
INT = BaseINT + (Wins × 2) + floor(Total Battles / 10)
```

**Example:**
- 20 wins, 10 losses → INT = 5 + 40 + 3 = **48**

---

## 🎯 Counter/Evade Formulas

### Tactical Scores:
```
Defender = (Speed × 3) + (INT × 4)
Attacker = (Attack × 2) + (Speed × 2)
```

### Counter Chance:
```
if (Defender > Attacker):
  chance = min(75%, (Defender - Attacker) / 2)
```

---

## 💥 Counter Attack

**Trigger**: 50% of successful tactical rolls

**Damage**: `15 × (Defender Speed / 20)`

**Bonuses**:
- Deal damage to attacker
- +1 bonus stamina
- Normal special meter gain

---

## 🌪️ Perfect Evade

**Trigger**: 50% of successful tactical rolls

**Bonuses**:
- +2 bonus stamina (4 total)
- +15% special meter (instead of +5%)
- Battle log shows "PERFECT EVADE!"

---

## 📊 Quick Examples

### High INT Veteran (50 INT, 20 Speed):
```
Defender: (20 × 3) + (50 × 4) = 260
vs 25 ATK, 15 Speed (80 score)
Counter Chance: 75% (max)
```

### Mid-Level (20 INT, 18 Speed):
```
Defender: (18 × 3) + (20 × 4) = 134
vs 22 ATK, 18 Speed (80 score)
Counter Chance: 27%
```

### Rookie (5 INT, 15 Speed):
```
Defender: (15 × 3) + (5 × 4) = 65
vs 30 ATK, 20 Speed (100 score)
Counter Chance: 0% (no advantage)
```

---

## 🎮 Strategic Tips

1. **Build INT**: Win PvP battles to increase INT
2. **Speed Helps**: High Speed compensates for low INT
3. **Veterans Shine**: 20+ wins = tactical mastery
4. **Use Same Bot**: INT is per-Holobot, not account-wide

---

## 📝 Console Debugging

```javascript
[Defense] Tactical Check: {
  defender: { speed: 20, int: 50, score: 260 },
  attacker: { atk: 25, speed: 15, score: 80 }
}
[Defense] Counter chance: 75.0%, rolled: 45.2
[Defense] 🥊 COUNTER ATTACK!
```

---

## 🔧 Tuning Values

**In `useRealtimeArena.ts`:**

```typescript
// Current weights
const defenderScore = (speed × 3) + (INT × 4);
const attackerScore = (attack × 2) + (speed × 2);
const counterChance = Math.min(75, scoreDiff / 2);
const counterDamage = 15 × (speed / 20);
const perfectEvadeBonus = 15; // Special meter %
```

**Adjust as needed for balance!**
