# Experience Save Fix - Arena V2 & PvP

## Issue
Experience gained from **Arena V2** and **PvP** battles was **not properly saving to Firebase**, while training experience worked perfectly.

## Root Cause
Arena V2's `distributeRewards` function was manually updating the holobots array:
```typescript
// OLD METHOD (didn't work):
const updatedHolobots = [...userData.holobots];
updatedHolobots[holobotIndex] = {
  ...updatedHolobots[holobotIndex],
  experience: updatedHolobots[holobotIndex].experience + Math.floor(rewards.exp),
};
```

This approach:
- Didn't properly update the `nextLevelExp` field
- Didn't handle level-ups correctly
- Wasn't consistent with how training saves experience

## Solution
Updated Arena V2 to use the **same helper function** that training uses:

```typescript
// NEW METHOD (works!):
import { updateHolobotExperience } from '@/lib/firebase';

const updatedHolobots = updateHolobotExperience(
  userData.holobots,
  playerHolobotName,
  newExperience,
  newLevel
);
```

### What Changed in `src/stores/arena-battle-store.ts`:

1. **Imported the helper function**:
   - Added `import { updateHolobotExperience } from '@/lib/firebase'`

2. **Calculate level properly**:
   - Now calculates if holobot leveled up (same formula as training)
   - Uses `nextLevelExp` threshold to determine level-ups

3. **Use the proven helper**:
   - Calls `updateHolobotExperience()` which properly maps through all holobots
   - Updates `experience`, `level`, and `nextLevelExp` fields

4. **Enhanced logging**:
   - Logs current holobots at the start
   - Logs XP before/after
   - Shows level-up calculations
   - Confirms successful save

## Testing
After this fix, Arena V2 battles should:
- ✅ Save experience to Firebase
- ✅ Display updated experience in holobot info
- ✅ Level up holobots when they reach the XP threshold
- ✅ Trigger the level-up modal for stat upgrades

## Files Changed
1. **`src/stores/arena-battle-store.ts`** - Updated `distributeRewards` method
2. **`src/hooks/useRealtimeArena.ts`** - Updated `saveWinnerRewards` method

## PvP Fix
PvP had a similar issue - it was saving experience but **not updating level or nextLevelExp**, so holobots would gain XP but never level up.

### What Changed in PvP:
- Now calculates level-ups using the same formula
- Uses `updateHolobotExperience()` helper
- Then separately updates `pvpWins` counter
- Logs XP changes and level-ups

---

**Status**: ✅ **FIXED!** 
- ✅ **Arena V2** - Experience saves correctly with level-ups
- ✅ **PvP** - Experience saves correctly with level-ups  
- ✅ **Training** - Already working correctly

All three battle modes now use the same battle-tested experience save method!
