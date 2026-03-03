# Daily Missions & Styling Updates

## ✅ COMPLETED

### Daily Missions System
1. **Added Arena V2 Tracking**
   - Arena V2 battles now track progress for daily missions
   - Correctly updates `arena_v2_battle` mission type
   - Tracks win/loss for arena streak system

2. **Added New Mission Types**
   - `arena_v2_battle` - Complete Arena V2 battles (Target: 3, Reward: 2 tickets + 100 Holos)
   - `pvp_battle` - Challenge other players in PvP (Target: 2, Reward: 3 tickets + 150 Holos)

3. **Removed Fitness Mission**
   - `sync_fitness` removed from daily mission rotation
   - Now shows 3-4 missions per day (instead of forcing fitness)
   - Daily login always included + 2-3 random missions

4. **Updated Mission Icons**
   - Added icons for Arena V2 and PvP battles
   - All mission types now display correctly

### Files Modified
- `src/types/rewards.ts` - Added new mission types
- `src/stores/rewardStore.ts` - Updated mission generation logic
- `src/stores/arena-battle-store.ts` - Added mission tracking on battle completion
- `src/components/rewards/DailyMissionsPanel.tsx` - Added new mission icons

---

## 🚧 REMAINING TASKS

### 1. Background Styling Changes
**Objective**: Replace black backgrounds with dark gradient + yellow border (like Arena Battle screen)

**Pages to Update**:
- [ ] PvP (`src/pages/PvP.tsx` or similar)
- [ ] Quest (`src/pages/Quest.tsx` or similar)
- [ ] Training (`src/pages/Training.tsx`)
- [ ] Marketplace (`src/pages/Marketplace.tsx`)
- [ ] Booster Packs (`src/pages/BoosterPacks.tsx`)
- [ ] Gacha (`src/pages/Gacha.tsx`)

**Style Pattern to Apply**:
```tsx
<div className="bg-gradient-to-b from-gray-900 via-slate-900 to-black border-2 border-[#F5C400]">
  {/* Content */}
</div>
```

### 2. Booster Packs Horizontal Scroll
**Objective**: Make booster pack sections horizontally scrollable (like Holobots Info)

**File**: `src/pages/BoosterPacks.tsx`

**Pattern**:
```tsx
<div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
  {boosters.map(booster => (
    <div className="flex-shrink-0 snap-start w-64">
      {/* Booster card content */}
    </div>
  ))}
</div>
```

### 3. Replace Arena TCG Cards with HolobotFlipCard
**Objective**: Use full HolobotFlipCard component in Arena HP bars to show stats & rank colors

**File**: `src/components/arena/BattleHPBars.tsx`

**Current**: Simple TCG-style cards with image, name, level
**Target**: Full card like HolobotsInfo with:
- Stats (HP, Attack, Defense, Speed)
- Rank-based border colors (Common, Rare, Epic, Legendary)
- Special ability display

**Import**: `import { HolobotFlipCard } from '@/components/holobots/HolobotFlipCard';`

---

## 📝 NOTES

### Arena V2 Battle Tracking
- Battles are tracked when `endArena()` is called
- Both wins and losses count toward daily mission progress
- Win/loss state is tracked separately for arena streak rewards

### Mission Reset
- Missions reset daily at midnight
- Progress is persisted in localStorage via Zustand persist middleware
- Switching users clears old mission data

### Next Steps
1. Apply background styling to 6 pages
2. Update Booster Packs to horizontal scroll
3. Replace Arena TCG cards with full HolobotFlipCard components

These remaining tasks require larger file modifications and UI restructuring. Each can be done incrementally.
