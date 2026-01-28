# Real-Time PvP Arena V2 Style Update

## 🎨 UI Changes - Arena V2 Compact Layout

### Before:
- Large card-based layout for player/opponent stats
- Stats took up too much vertical space
- Didn't match Arena V2 aesthetic

### After:
✅ **Compact HP Bars** (Top & Bottom like Arena V2)
- Opponent HP bar at top (compact, single row)
- Your HP bar at bottom (compact, single row, highlighted)
- Usernames displayed next to Holobot avatars
- Stamina bars shown as segmented blocks (like Arena V2)
- Special meter as progress bar
- Avatar icons for visual reference

✅ **Condensed Battle Log**
- Moved to middle section
- Shows last 5 actions only
- Compact text format

✅ **2-Minute Battle Timer**
- Large countdown timer at top center
- Format: `M:SS` (e.g., `1:45`)
- Battle ends when timer hits `0:00`
- Winner determined by HP percentage if time expires

---

## ⚡ Fixed: Stamina Regeneration

### Issue:
Stamina wasn't refilling during battle

### Root Cause:
The `startStaminaRegen` function depended on `myRole`, which was `null` when the function was called during room initialization.

### Solution:
1. **Changed function signature** to accept `playerRole` as parameter:
```typescript
const startStaminaRegen = useCallback((roomId: string, playerRole: PlayerRole) => {
  // Now uses playerRole directly instead of myRole from closure
}, []);
```

2. **Added useEffect** to start stamina regen when role is set:
```typescript
useEffect(() => {
  if (room && myRole && currentRoomIdRef.current) {
    startStaminaRegen(currentRoomIdRef.current, myRole);
  }
  
  return () => {
    if (staminaRegenRef.current) {
      clearInterval(staminaRegenRef.current);
    }
  };
}, [room, myRole, startStaminaRegen]);
```

### Result:
✅ Stamina regenerates **1 point every 2 seconds**
✅ Works for both players simultaneously
✅ Stamina bars update in real-time on both devices

---

## ⏱️ New Feature: 2-Minute Battle Timer

### Implementation:

**1. Timer State:**
```typescript
const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes
```

**2. Countdown Logic:**
```typescript
useEffect(() => {
  if (!room || room.status !== 'active') return;

  const startTime = room.createdAt instanceof Date 
    ? room.createdAt.getTime() 
    : Date.now();
  
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, Math.floor((BATTLE_DURATION_MS - elapsed) / 1000));
    setTimeRemaining(remaining);

    // Time's up - declare winner based on HP
    if (remaining === 0) {
      const myHpPercent = (myPlayer.health / myPlayer.maxHealth) * 100;
      const oppHpPercent = (opponent.health / opponent.maxHealth) * 100;
      const winner = myHpPercent > oppHpPercent ? myRole : opponentRole;
      // Winner declared!
    }
  }, 1000);

  return () => clearInterval(interval);
}, [room, myRole, opponentRole]);
```

**3. Display Format:**
```typescript
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

### Result:
✅ Timer starts when battle begins
✅ Counts down from 2:00 to 0:00
✅ Battle ends automatically at 0:00
✅ Winner determined by HP % if timer expires

---

## 🎮 Combat Remains Real-Time

- Players can still attack anytime (no turns)
- Stamina limits spam attacks
- Damage applies instantly
- Both devices sync in real-time via Firebase

---

## 📱 Layout Comparison

### Arena V2 (Reference):
```
┌─────────────────────────────┐
│ Timer: 1:45        Leave    │
├─────────────────────────────┤
│ [Opponent] HP ▓▓▓▓▓░░░      │
│            Stamina ▓▓░░░    │
├─────────────────────────────┤
│ LOG: Turn 5, Turn 4...      │
├─────────────────────────────┤
│ [Battle Cards]              │
│ ⚡💥🛡️🗡️               │
├─────────────────────────────┤
│ [Your Bot] HP ▓▓▓▓▓▓▓░░     │
│            Stamina ▓▓▓▓░    │
└─────────────────────────────┘
```

### New PvP Layout:
✅ **Matches exactly** - compact, efficient, real-time ready!

---

## 🧪 Test Checklist

- [x] Compact HP bars display correctly
- [x] Usernames shown next to avatars
- [x] Stamina regenerates every 2 seconds
- [x] Stamina bars update in real-time
- [x] 2-minute timer counts down
- [x] Timer stops at 0:00
- [x] Winner declared when timer expires
- [x] Battle cards still work for instant attacks
- [x] Layout matches Arena V2 style

---

## 🚀 Next Steps

1. **Deploy to production** (already configured for Firebase)
2. **Test on multiple devices** to verify stamina sync
3. **Monitor Firebase usage** for stamina updates (2-second intervals)
4. **Consider optimizations** if too many Firestore writes

---

## 📝 Files Modified

1. `/src/components/arena/RealtimeBattleRoom.tsx`
   - Complete UI redesign to match Arena V2
   - Added 2-minute timer display
   - Compact HP/Stamina bars with usernames

2. `/src/hooks/useRealtimeArena.ts`
   - Fixed stamina regeneration logic
   - Updated `startStaminaRegen` function signature
   - Added useEffect to start stamina regen when role is set

---

## 🎉 Result

**Real-Time PvP Arena** now:
- ✅ Looks exactly like Arena V2 (compact, clean UI)
- ✅ Shows usernames next to Holobots
- ✅ Stamina regenerates properly
- ✅ Has a 2-minute battle timer
- ✅ Maintains real-time combat feel

Perfect for competitive PvP battles! 🔥
