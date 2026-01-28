# PvP Quick Reference 🎮

**Last Updated**: January 27, 2026

---

## 🎯 Quick Stats

### Damage Formula
```
Strike/Combo: BaseDmg × (ATK/100) × (100/(100+DEF))
Finisher:     BaseDmg × (ATK/100) × (100/(100+DEF)) × 1.5
```

### Card Types
| Card | Stamina Cost | Base Damage | Special Meter | Notes |
|------|--------------|-------------|---------------|-------|
| **Strike** | 1 | 25 | +10% | Basic attack |
| **Combo** | 2 | 40 | +15% | High risk/reward |
| **Defense** | 0 | 0 | +5% | Restores 2 stamina |
| **Finisher** | 3 | 60 | -100% | Requires 100% meter |

### Stat Effects
| Stat | Impact | Example |
|------|--------|---------|
| **HP** | Starting health | 250 HP = 10+ attacks to KO |
| **ATK** | Damage multiplier | 150 ATK = 1.5x damage |
| **DEF** | Damage reduction | 80 DEF = ~45% reduction |
| **Speed** | (Not yet used) | Future: turn order |

---

## 🔧 Key Files

```
src/utils/holobotStatsCalculator.ts  ← Stats calculation
src/hooks/useRealtimeArena.ts        ← Battle logic
src/components/arena/RealtimeBattleRoom.tsx  ← UI
src/types/battle-room.ts             ← Types
```

---

## 🧪 Testing Commands

```bash
# Start dev server
npm run dev

# Check Firebase rules
firebase deploy --only firestore:rules

# View logs
tail -f /path/to/terminals/1.txt
```

---

## 📊 Example Calculations

### Level 1 Ace vs Level 1 Kuma
**Ace (ATK: 100) uses Strike (25 dmg) on Kuma (DEF: 50):**
```
25 × (100/100) × (100/(100+50))
= 25 × 1.0 × 0.67
= 17 damage
```

### Level 20 Ace vs Level 10 Kuma
**Ace (ATK: 150) uses Finisher (60 dmg) on Kuma (DEF: 60):**
```
60 × (150/100) × (100/(100+60)) × 1.5
= 60 × 1.5 × 0.625 × 1.5
= 84 damage
```

---

## 🎨 UI Components

### Holobot Cards
```tsx
<HolobotCard 
  stats={holobotStats}
  variant="red"  // or "blue"
/>
```

### Battle Cards
```tsx
<RealtimeBattleCards
  hand={player.hand}
  onCardSelect={handlePlayCard}
  playerStamina={player.stamina}
  specialMeter={player.specialMeter}
/>
```

---

## 🐛 Common Issues

### Stats Not Updating
- Clear browser cache (Cmd+Shift+R)
- Check console for `[PvP] Matchmaking with actual stats:`
- Verify `calculateActualHolobotStats()` is called

### Damage Too High/Low
- Check ATK/DEF values in console
- Verify formula: `baseDmg × (atk/100) × (100/(100+def))`
- Finishers should be 1.5x normal damage

### Cards Not Showing
- Check `hand` array is populated
- Verify `generateStartingHand()` returns 5 cards
- Check `drawCard()` is called after each action

---

## 📱 Firebase Structure

### Battle Room
```typescript
{
  roomId: string,
  roomCode: string,
  status: 'waiting' | 'active' | 'completed',
  players: {
    p1: {
      uid: string,
      username: string,
      holobot: HolobotStats,  // Full stats with boosts!
      health: number,
      maxHealth: number,      // From holobot.maxHealth
      stamina: number,
      specialMeter: number,
      hand: SimpleActionCard[]
    },
    p2: { ... }
  }
}
```

---

## ✅ Deployment Checklist

- [ ] Test with level 1 Holobot
- [ ] Test with level 20 Holobot
- [ ] Verify TCG cards display (no emojis)
- [ ] Check damage calculations
- [ ] Test all card types
- [ ] Verify rewards save to Firebase
- [ ] Test matchmaking
- [ ] Test private rooms
- [ ] Check mobile responsiveness

---

## 🚀 Quick Deploy

```bash
# 1. Test locally
npm run dev

# 2. Build for production
npm run build

# 3. Deploy Firebase rules
firebase deploy --only firestore:rules

# 4. Deploy to Vercel/hosting
vercel deploy --prod
```

---

## 📞 Support

**Issues?**
- Check browser console for errors
- Verify Firebase connection
- Clear cache and hard refresh
- Check terminal logs for backend errors

**Questions?**
- See `PVP_STATS_AND_CARDS_IMPLEMENTATION.md` for details
- See `ARENA_V2_QUICKSTART.md` for Arena V2 reference
- See `REALTIME_ARENA_QUICKREF.md` for PvP basics
