# Arena V2 - Real-Time Combat Implementation

## Overview
Converted Arena V2 from turn-based combat to **real-time, stamina-driven combat** as specified in the original PRD.

## What Changed

### ❌ Removed (Turn-Based System)
- **Turn-based restrictions** - No more waiting for your turn
- **`currentActorId` switching** - No longer blocks actions based on whose turn it is
- **Turn-based AI delays** - AI doesn't wait for turns

### ✅ Added (Real-Time System)

#### 1. **Real-Time Stamina Regeneration** (`combat-engine.ts`)
```typescript
static regenerateStamina(state: BattleState): BattleState
```
- Stamina regenerates automatically over time
- Base rate: **1 stamina per 3 seconds**
- Both fighters regenerate simultaneously
- No more waiting for turn-based stamina recovery

#### 2. **Game Loop System** (`arena-battle-store.ts`)
```typescript
startGameLoop() / stopGameLoop()
```
- Runs every **500ms**
- Continuously regenerates stamina for both fighters
- Triggers AI actions when stamina is available
- Replaces turn-based logic

#### 3. **Continuous AI Attacks**
- AI attacks whenever it has stamina (≥1)
- No longer waits for "its turn"
- Creates dynamic, real-time combat feel
- Player must react quickly!

#### 4. **Simultaneous Actions**
- Player can play cards anytime (when they have stamina)
- No turn restrictions
- Both fighters can act at the same time
- True real-time combat

## Technical Changes

### `src/lib/arena/combat-engine.ts`
- ✅ Added `regenerateStamina()` method
- ✅ Removed turn advancement logic
- ✅ Removed `getNextActor()` usage
- ✅ Keep `turnNumber` as action counter only

### `src/stores/arena-battle-store.ts`
- ✅ Added `gameLoopIntervalId` state
- ✅ Added `startGameLoop()` / `stopGameLoop()` methods
- ✅ Modified `initializeBattle()` to start game loop instead of turn-based logic
- ✅ Updated `processAITurn()` to only control opponent (not turn-based)
- ✅ Removed turn-checking delays from `playCard()`
- ✅ Updated `endBattle()` and `abandonBattle()` to stop game loop

### `src/components/arena/BattleArenaView.tsx`
- ✅ Removed turn-based `disabled` check from `ActionCardHand`
- ✅ Now only checks if battle is `active` (not whose turn it is)
- ✅ Removed turn-based `isActive` indicators

## How It Works Now

```
┌─────────────────────────────────────────────┐
│         REAL-TIME GAME LOOP (500ms)         │
├─────────────────────────────────────────────┤
│  1. Regenerate stamina for both fighters    │
│  2. Check if opponent has stamina           │
│  3. If yes → AI attacks immediately         │
│  4. Repeat continuously                     │
└─────────────────────────────────────────────┘

         ↓                        ↓
    
   PLAYER                    OPPONENT (AI)
   ------                    -------------
   • Play cards              • Attacks when
     anytime with              stamina available
     stamina                 • No waiting
   • No turn wait            • Continuous pressure
   • React to AI             • Real-time threat
```

## Player Experience

### Before (Turn-Based) ❌
1. Play card
2. Wait for opponent's turn
3. Opponent plays
4. Wait again
5. Your turn again

**Result:** Slow, static, boring

### After (Real-Time) ✅
1. Stamina regenerates automatically
2. Play card when you have stamina
3. Opponent attacks immediately when they have stamina
4. Both can act simultaneously
5. Fast-paced, dynamic combat!

**Result:** Exciting, strategic, engaging

## Stamina Management

### Regeneration
- **Rate:** 1 stamina per 3 seconds (base)
- **Continuous:** Always regenerating in real-time
- **Both fighters:** Regenerate simultaneously

### Strategy
- **Plan ahead:** Know when your next stamina will be available
- **Quick decisions:** AI won't wait for you
- **Defense mode:** Strategic stamina recovery option
- **Timing matters:** Use cards when you have stamina advantage

## Next Steps (Future Enhancements)

### Possible Improvements
1. **Variable stamina regen rates** based on Holobot INT stat
2. **Stamina boost cards** for burst actions
3. **Slow effects** that reduce opponent's regen rate
4. **Speed stat** affects action animation duration
5. **Combo windows** for rapid-fire card plays

## Testing

To test the real-time combat:
1. Navigate to Arena V2
2. Select a Holobot and tier
3. Start battle
4. Notice:
   - ✅ Stamina regenerates automatically
   - ✅ You can play cards anytime with stamina
   - ✅ Opponent attacks continuously
   - ✅ No waiting for turns
   - ✅ Fast-paced, dynamic combat

## Performance

- **Game loop:** 500ms interval (minimal CPU usage)
- **Stamina updates:** Only when regeneration occurs
- **AI actions:** Only when stamina available
- **UI updates:** React efficiently handles state changes

---

**Status:** ✅ COMPLETE - Real-time combat system fully implemented
**Date:** 2026-01-21
