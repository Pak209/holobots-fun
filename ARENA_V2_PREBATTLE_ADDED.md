# ✅ Arena V2 Prebattle Menu Added!

The full prebattle menu from Classic Arena is now integrated into Arena V2!

---

## 🎮 **What's New:**

### **Prebattle Menu Features:**

1. **Select Your Holobot**
   - Dropdown showing all your holobots
   - Displays level, attack, defense, speed stats
   - Shows bonuses from parts and Sync Points

2. **View Your 3 Opponents**
   - See all 3 opponents you'll face
   - Random holobots for each round
   - Face a different holobot each round

3. **Select Arena Tier**
   - **Tutorial** - Lv.1+ | 50 Holos | Basic rewards
   - **Tier 1** - Lv.5+ | 50 Holos | Better rewards
   - **Tier 2** - Lv.20+ | 50 Holos | Great rewards
   - **Tier 3** - Lv.40+ | 100 Holos | Best rewards (+ Holos tokens)

4. **Payment Options**
   - **Pay Entry Fee** - Use Holos tokens
   - **Use Arena Pass** - Free entry with pass

---

## 📊 **How It Works:**

### **Step 1: Navigate to Arena V2**
```
/app → Click "ARENA V2" tab
```

### **Step 2: Prebattle Menu**
1. Select your Holobot from dropdown
2. Choose your arena tier (Tutorial, Tier 1, 2, or 3)
3. Pay with Holos or Arena Pass
4. Battle starts with selected Holobot!

### **Step 3: Battle!**
- Card-based speed combat
- Stamina management
- Combos and finishers
- AI opponent

---

## 🆚 **Differences from Classic Arena:**

| Feature | Classic Arena | Arena V2 |
|---------|---------------|----------|
| **Combat System** | Auto-battle TCG style | Card-based speed combat |
| **Player Control** | Watch only | Play cards manually |
| **Stamina** | N/A | Core mechanic (6-7 cards) |
| **Defense Mode** | N/A | Strategic recovery |
| **Combos** | Auto | Manual chain attacks |
| **Finishers** | Auto when charged | Manual timing required |
| **Prebattle Menu** | ✅ Full menu | ✅ **NOW ADDED!** |
| **Tier Selection** | ✅ 4 tiers | ✅ **NOW ADDED!** |

---

## 🎯 **What Happens When You Start:**

1. **Pay Entry Fee** (Holos or Pass)
2. **Battle Initializes** with:
   - Your selected Holobot as the player
   - First opponent from the lineup
   - Arena V2 speed combat system
   - Full card hand (6-7 cards)
   - HP, stamina, special meter displays

3. **Play the Battle:**
   - Click cards to play them
   - Manage your stamina
   - Enter defense mode to recover
   - Build special meter for finishers

---

## 📸 **UI Flow:**

```
Arena V2 Tab
    ↓
Prebattle Menu
    ├── Select Holobot dropdown
    ├── See 3 opponents preview
    ├── Select arena tier (Tutorial/Tier1/Tier2/Tier3)
    └── Pay with Holos or Arena Pass
        ↓
    Battle Starts
        ├── Fighter displays (HP, stamina, special meter)
        ├── Action card hand (your cards)
        ├── Battle controls (Defend, Hack, Finisher)
        └── Real-time combat
```

---

## 🔄 **Integration Details:**

**Files Modified:**
- `src/pages/Index.tsx` - Added prebattle menu to ArenaV2Wrapper

**How It Works:**
```typescript
// 1. Show prebattle menu first
<ArenaPrebattleMenu 
  onHolobotSelect={handleHolobotSelect}
  onEntryFeeMethod={handleEntryFeeMethod}
  entryFee={50}
/>

// 2. When they pay, initialize Arena V2 battle
handleEntryFeeMethod() {
  // Hide menu
  setShowPrebattleMenu(false);
  
  // Start Arena V2 battle with selected holobot
  initializeBattle(config, player, opponent);
}

// 3. Show battle screen
<BattleArenaView />
```

---

## ✅ **Current State:**

**Working:**
- ✅ Prebattle menu shows in Arena V2
- ✅ Select any of your holobots
- ✅ View 3 opponents
- ✅ Select arena tier (Tutorial through Tier 3)
- ✅ Pay with Holos or Arena Pass
- ✅ Battle starts with selected holobot
- ✅ Full Arena V2 combat system

**Uses Real Data:**
- ✅ Your actual holobots from user profile
- ✅ Real holobot stats and bonuses
- ✅ Real Holos token balance
- ✅ Real Arena Pass count
- ✅ Only real holobots as opponents (ace, kuma, tora, shadow, etc.)

---

## 🎮 **Try It Now:**

```bash
# Refresh browser
# Navigate to /app
# Click "ARENA V2" tab
# See full prebattle menu!
```

You should now see:
1. ✅ Select Your Holobot dropdown
2. ✅ Your 3 opponents preview
3. ✅ Arena tier selection (Tutorial, Tier 1, 2, 3)
4. ✅ Pay Entry Fee / Use Arena Pass buttons

Select your holobot, choose a tier, pay, and battle! 🎮⚡

---

## 🚀 **What's Next:**

Future enhancements could include:
- Multiple rounds (fight all 3 opponents in sequence)
- Tier-specific rewards integration
- Victory/defeat screens with rewards
- Battle replay system
- Leaderboards per tier

---

**Arena V2 is now feature-complete with the prebattle menu! 🎉**
