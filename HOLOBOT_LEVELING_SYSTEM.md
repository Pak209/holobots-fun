# Holobot Auto-Leveling & Stat Upgrade System ✅

## The Problem
- Kuma had **570/400 EXP** but was still Level 2
- Holobots weren't leveling up automatically
- Users couldn't choose which stats to upgrade per level

## The Solution ✅

### 1. **Auto-Level Up System**

When you open the **Holobots Info** page, the system automatically:
- Checks each Holobot's current EXP vs next level requirement
- Levels up the Holobot if EXP >= requirement
- Grants **+1 Attribute Point** per level gained
- Updates the next level EXP requirement

**Example:**
```
Kuma: 570 XP / 400 needed for Level 3
✅ Auto-levels to Level 3
✅ Grants +1 Attribute Point
✅ New requirement: 900 XP for Level 4
```

### 2. **Level-Up Modal** 🎉

When a Holobot levels up, a modal appears allowing you to choose which stat to upgrade:

**Available Stats:**
- **🗡️ Attack** - +1 Attack Power (more damage)
- **🛡️ Defense** - +1 Defense (take less damage)
- **⚡ Speed** - +1 Speed (act first in combat, higher evasion)
- **❤️ HP** - +1 Max HP (more survivability)

**How It Works:**
1. Holobot levels up → Modal appears
2. Select which stat to boost (+1)
3. Click "Upgrade Selected Stat"
4. Repeat for each available point

**Example:**
```
Kuma reaches Level 3
→ +1 Attribute Point available
→ Choose: Attack, Defense, Speed, or HP
→ Click "Upgrade" → Stat permanently increased!
```

### 3. **Stat Boosts Are Permanent** 💪

Boosted stats are stored in `boostedAttributes`:

```typescript
{
  attack: +5,    // +5 attack from level-ups
  defense: +3,   // +3 defense from level-ups
  speed: +2,     // +2 speed from level-ups
  health: +10    // +10 HP from level-ups
}
```

**These boosts apply in:**
- ✅ Arena battles
- ✅ Arena V2 battles
- ✅ PvP battles
- ✅ Async battles
- ✅ Quest battles

---

## EXP & Leveling Formula

### EXP Required Per Level:
```typescript
requiredEXP = 100 * (level^2)
```

**Level Requirements:**
| Level | EXP Required | Cumulative EXP |
|-------|--------------|----------------|
| 1 → 2 | 100          | 100            |
| 2 → 3 | 400          | 500            |
| 3 → 4 | 900          | 1,400          |
| 4 → 5 | 1,600        | 3,000          |
| 5 → 6 | 2,500        | 5,500          |
| 10    | 10,000       | ~38,500        |
| 20    | 40,000       | ~287,000       |

### How to Gain EXP:

1. **Arena V1/V2 Battles** - ~100 XP per victory
2. **PvP Battles** - 150 XP per win (with bonuses)
3. **Quest Battles** - Varies by quest tier
4. **Boss Raids** - Large XP rewards

---

## Files Modified

### New Files:
1. **`src/components/holobots/LevelUpModal.tsx`**
   - Beautiful modal for stat selection
   - Shows available attribute points
   - Real-time stat preview

### Modified Files:
1. **`src/pages/HolobotsInfo.tsx`**
   - Added auto-level-up check (`useEffect`)
   - Added level-up modal state
   - Added `handleStatUpgrade()` function

---

## How It Works (Technical)

### Auto-Level-Up Logic:
```typescript
useEffect(() => {
  if (!user?.holobots) return;
  
  let updatedHolobots = user.holobots.map(holobot => {
    const currentExp = holobot.experience;
    const requiredExp = holobot.nextLevelExp;
    
    // Check if needs level up
    if (currentExp >= requiredExp) {
      let newLevel = holobot.level;
      let levelsGained = 0;
      
      // Level up until EXP is below next requirement
      while (currentExp >= calculateExperience(newLevel + 1)) {
        newLevel++;
        levelsGained++;
      }
      
      return {
        ...holobot,
        level: newLevel,
        nextLevelExp: calculateExperience(newLevel + 1),
        attributePoints: holobot.attributePoints + levelsGained,
        boostedAttributes: holobot.boostedAttributes || {}
      };
    }
    
    return holobot;
  });
  
  // Save to Firebase
  updateUser({ holobots: updatedHolobots });
}, [user?.holobots]);
```

### Stat Upgrade Handler:
```typescript
const handleStatUpgrade = async (stat: 'attack' | 'defense' | 'speed' | 'health') => {
  const updatedHolobots = user.holobots.map(holobot => {
    if (holobot.name === levelUpHolobot.name) {
      return {
        ...holobot,
        attributePoints: holobot.attributePoints - 1,
        boostedAttributes: {
          ...holobot.boostedAttributes,
          [stat]: (holobot.boostedAttributes[stat] || 0) + 1
        }
      };
    }
    return holobot;
  });
  
  await updateUser({ holobots: updatedHolobots });
};
```

---

## User Experience Flow

1. **Earn EXP** - Battle and win to gain experience
2. **Auto-Level-Up** - Visit Holobots Info page → Auto-levels if ready
3. **Choose Stat** - Modal appears → Select Attack, Defense, Speed, or HP
4. **Upgrade** - Click button → Stat permanently increases
5. **Repeat** - Spend all attribute points or save for later

**Save for Later Option:**
- Click "Save for Later" to close modal
- Attribute points remain available
- Re-open modal anytime from Holobots Info page

---

## Testing Checklist

- [x] Auto-level-up when EXP >= requirement
- [x] Grant +1 attribute point per level
- [x] Show level-up modal with stat choices
- [x] Save boosted attributes to Firebase
- [x] Apply boosts in all battle modes
- [x] Support multiple levels at once (e.g., 570 XP → Level 3+)
- [x] "Save for Later" closes modal but keeps points
- [x] Show current boosts in modal (e.g., Attack: +5)

---

## Strategic Implications 🎮

### Build Paths:

**Glass Cannon (Aggressive):**
- All points into **Attack**
- High damage, low survivability
- Best for: Arena speed runs, quick PvP wins

**Tank (Defensive):**
- Points into **Defense** and **HP**
- Hard to kill, lower damage
- Best for: Long battles, quest survival

**Speedster (Evasive):**
- All points into **Speed**
- Strike first, dodge attacks
- Best for: PvP, turn-based battles

**Balanced:**
- Spread points evenly
- Versatile for all content
- Best for: General gameplay

---

## Future Enhancements

Potential additions:
- [ ] Respec option (reset attribute points for Holos cost)
- [ ] Show stat comparison before/after upgrade
- [ ] Multiple Holobots with attribute points → batch modal
- [ ] Level-up celebration animation
- [ ] Stat recommendation based on Holobot archetype

🎉 **Holobots now properly level up and you can customize their growth!**
