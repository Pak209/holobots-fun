# Arena V2 - TCG Cards Implementation

## Summary
Added Holobot TCG (Trading Card Game) cards to Arena V2, similar to the display in Arena V1. Now both player and opponent Holobots are displayed as TCG cards during battles.

## Changes Made

### 1. Updated `FighterDisplay` Component
**File**: `src/components/arena/FighterDisplay.tsx`

- Added import for `HolobotCard` component and `HolobotStats` type
- Created conversion logic to transform `ArenaFighter` data into `HolobotStats` format for TCG card display
- Integrated TCG card display into the fighter display layout
- Cards are scaled to 75% (`scale-75`) to fit appropriately in the battle UI
- Player's card displays with blue variant (bottom position)
- Opponent's card displays with red variant (top position)

**Key Features:**
- TCG cards show next to the fighter avatar
- Cards display all relevant stats: HP, Attack, Defense, Speed
- Special move and ability description are shown on the card
- Cards maintain the same visual style as Arena V1

### 2. Updated `ArenaFighter` Type
**File**: `src/types/arena.ts`

Added optional fields to support TCG card display:
```typescript
// Optional TCG Card Display Fields
specialMove?: string;
abilityDescription?: string;
```

These fields allow fighters to include specific ability information that displays on their TCG cards.

### 3. Updated Fighter Initialization
**File**: `src/pages/Index.tsx`

Modified both player and opponent fighter initialization in the `ArenaV2Wrapper` component:

**Player Fighter:**
- Added `specialMove` from `userHolobotStats.specialMove`
- Added `abilityDescription` from `userHolobotStats.abilityDescription`
- Falls back to defaults if stats are unavailable

**Opponent Fighter:**
- Added `specialMove` from `opponentBaseStats.specialMove`
- Added `abilityDescription` from `opponentBaseStats.abilityDescription`
- Falls back to defaults if stats are unavailable

## Visual Layout

```
┌──────────────────────────────────────────────────────┐
│  HOLOBOTS ARENA V2                                   │
│  Round 1/3 • Wins: 0                                 │
├──────────────────────────────────────────────────────┤
│  Opponent Section (Top)                              │
│  ┌──────────┐  ┌────────┐  ┌──────────────┐        │
│  │ TCG Card │  │ Avatar │  │ HP/Stats Bar │        │
│  │  (Red)   │  │  Image │  │              │        │
│  └──────────┘  └────────┘  └──────────────┘        │
├──────────────────────────────────────────────────────┤
│  Battlefield Center                                  │
├──────────────────────────────────────────────────────┤
│  Player Section (Bottom)                             │
│  ┌──────────────┐  ┌────────┐  ┌──────────┐        │
│  │ HP/Stats Bar │  │ Avatar │  │ TCG Card │        │
│  │              │  │  Image │  │  (Blue)  │        │
│  └──────────────┘  └────────┘  └──────────┘        │
│                                                      │
│  [Action Cards Hand]                                 │
│  [Battle Controls]                                   │
└──────────────────────────────────────────────────────┘
```

## TCG Card Display Features

Each TCG card shows:
1. **Header**: HOLOBOTS branding + Holobot name + Level
2. **Image**: Pixelated Holobot sprite
3. **Ability Section**: Special move name and description
4. **Stats**: HP, Attack, Defense, Speed in compact format
5. **Footer**: Level and Rank display
6. **Color Coding**:
   - Blue border for player (bottom)
   - Red border for opponent (top)
   - Rank-based colors for owned Holobots

## Benefits

1. **Visual Consistency**: Matches the TCG card style from Arena V1
2. **Enhanced Information**: Players can see detailed stats and abilities at a glance
3. **Improved UX**: Clear visual distinction between player and opponent
4. **Maintains Style**: Uses the same `HolobotCard` component throughout the app

## Testing

The changes have been implemented and hot-reloaded in the development server. To test:

1. Navigate to the Arena section
2. Select Arena V2
3. Choose a Holobot and enter battle
4. Observe TCG cards displayed for both player (bottom, blue) and opponent (top, red)

## Related Files

- `src/components/HolobotCard.tsx` - The reusable TCG card component
- `src/components/arena/FighterDisplay.tsx` - Fighter display with TCG cards
- `src/types/arena.ts` - ArenaFighter type definition
- `src/pages/Index.tsx` - Arena V2 battle initialization
- `src/components/arena/BattleArenaView.tsx` - Main battle view component

## Future Enhancements

Potential improvements:
1. Add animation effects when cards take damage
2. Show special move activation visually on the card
3. Add glow effects based on fighter status (defending, combo, etc.)
4. Scale adjustment based on screen size for mobile optimization
5. Add card flip animation on fighter switch between rounds
