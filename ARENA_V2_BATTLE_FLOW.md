# Arena V2 Battle Flow & State Machine

A visual guide to how combat flows in Arena V2.

---

## High-Level Battle Loop

```
START BATTLE
    ↓
[Initialize Fighters]
    ↓
[Draw Starting Hands] (stamina = cards)
    ↓
╔═══════════════════════════════════╗
║       MAIN BATTLE LOOP            ║
╠═══════════════════════════════════╣
║                                   ║
║  1. Determine Current Actor       ║
║      (Speed-based initiative)     ║
║           ↓                       ║
║  2. AI/Player Action Selection    ║
║      - Select card from hand      ║
║      - OR enter Defense Mode      ║
║           ↓                       ║
║  3. Action Resolution             ║
║      - Check interrupts           ║
║      - Evaluate defense           ║
║      - Apply damage/effects       ║
║      - Update meters              ║
║           ↓                       ║
║  4. Stamina Management            ║
║      - Consume stamina            ║
║      - Check recovery triggers    ║
║      - Update stamina state       ║
║           ↓                       ║
║  5. Check Win Condition           ║
║      - HP <= 0?                   ║
║      - Finisher landed?           ║
║      - Timeout?                   ║
║           ↓                       ║
║  6. [No] → Back to step 1         ║
║     [Yes] → END BATTLE            ║
║                                   ║
╚═══════════════════════════════════╝
    ↓
[Calculate Rewards]
    ↓
[Update Rankings/Stats]
    ↓
END
```

---

## Fighter State Machine

Each fighter transitions through states based on stamina:

```
┌─────────────────────────────────────────────┐
│                                             │
│  FRESH (6-7 stamina)                        │
│  • Full damage output                       │
│  • Fastest reaction times                   │
│  • All combos available                     │
│  • Widest timing windows                    │
│                                             │
└──────────────┬──────────────────────────────┘
               │ Use 2-3 cards
               ↓
┌─────────────────────────────────────────────┐
│                                             │
│  WORKING (4-5 stamina)                      │
│  • Normal damage                            │
│  • Standard timing                          │
│  • Most combos available                    │
│  • Balanced state                           │
│                                             │
└──────────────┬──────────────────────────────┘
               │ Use 2-3 more cards
               ↓
┌─────────────────────────────────────────────┐
│                                             │
│  GASSED (2-3 stamina)                       │
│  • -25% damage penalty                      │
│  • Tighter timing windows                   │
│  • Limited combo options                    │
│  • VULNERABLE TO FINISHERS                  │
│  • Should enter Defense Mode                │
│                                             │
└──────────────┬──────────────────────────────┘
               │ Use 1-2 more cards
               ↓
┌─────────────────────────────────────────────┐
│                                             │
│  EXHAUSTED (0-1 stamina)                    │
│  • -50% damage penalty                      │
│  • NO combos allowed                        │
│  • NO finishers allowed                     │
│  • MUST recover stamina                     │
│  • Extremely vulnerable                     │
│                                             │
└──────────────┬──────────────────────────────┘
               │
               │ Perfect Defense / Tempo Reset
               │
               ↓
         [RECOVER STAMINA]
               │
               └────> Back to WORKING/FRESH
```

---

## Defense Mode Flow

```
Player/AI decides: "I need to recover stamina"
    ↓
[Enter Defense Mode]
    ↓
╔═══════════════════════════════════════════════╗
║           DEFENSE MODE ACTIVE                 ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  • Strike cards DISABLED                      ║
║  • Combo cards DISABLED                       ║
║  • Defense cards ENABLED                      ║
║  • Waiting for opponent's attack...           ║
║                                               ║
╚═══════════════════════════════════════════════╝
    ↓
[Opponent Attacks]
    ↓
[Timing Check: How accurate was the defense?]
    ↓
┌────────────────────────────────────────────────┐
│                                                │
│  PERFECT TIMING (within INT-based window)     │
│  └─> Defense Outcome: PERFECT                 │
│      • Take 0 damage                          │
│      • Gain +1 stamina card                   │
│      • Cancel opponent's combo                │
│      • Open counter window (if Slip/Parry)    │
│                                                │
└────────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────────┐
│                                                │
│  GOOD TIMING (outside window but close)       │
│  └─> Defense Outcome: PARTIAL                 │
│      • Take 30-50% damage                     │
│      • No stamina gain                        │
│      • No counter window                      │
│                                                │
└────────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────────┐
│                                                │
│  POOR TIMING (way off / wrong card)           │
│  └─> Defense Outcome: FAILED                  │
│      • Take full damage                       │
│      • Lose 1 stamina                         │
│      • May get stunned                        │
│                                                │
└────────────────────────────────────────────────┘
    ↓
[Exit Defense Mode]
    ↓
[Back to normal battle loop]
```

---

## Counter Window Mechanic

```
[Perfect Defense with Slip/Parry]
    ↓
╔═══════════════════════════════════════════════╗
║        COUNTER WINDOW OPENED                  ║
║                                               ║
║  Duration: 0.6s - 1.5s (based on Speed/INT)   ║
║                                               ║
║  During window:                               ║
║  • Defender can immediately strike            ║
║  • Counter attacks gain priority              ║
║  • +30-50% damage bonus                       ║
║  • Guaranteed to interrupt                    ║
║                                               ║
╚═══════════════════════════════════════════════╝
    ↓
[Player/AI Responds]
    ↓
    ├─> [Strike during window]
    │       ↓
    │   ✅ COUNTER STRIKE LANDS
    │       • Bonus damage
    │       • Combo starter
    │       • Special meter boost
    │
    └─> [No action / too slow]
            ↓
        ❌ Window closes
            • Back to normal


```

---

## Combo System Flow

```
[Play Combo Starter Card]
    ↓
[Combo Counter = 1]
    ↓
╔═══════════════════════════════════════════════╗
║           COMBO STATE ACTIVE                  ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  Next card played MUST be:                    ║
║  • Valid next card in sequence                ║
║  • Played within timing window (0.5-1.0s)     ║
║  • User has enough stamina                    ║
║                                               ║
║  Combo Benefits:                              ║
║  • Damage multiplier increases                ║
║  • Special meter builds faster                ║
║  • Cannot be interrupted mid-combo            ║
║                                               ║
╚═══════════════════════════════════════════════╝
    ↓
[Valid Next Card Played]
    ↓
[Combo Counter += 1]
    ↓
[Repeat until...]
    ↓
    ├─> Combo finisher card played
    │       ↓
    │   ✅ COMBO COMPLETE
    │       • Full damage with multiplier
    │       • Special meter reward
    │       • Optional: Stamina recovery
    │
    ├─> Invalid card / too slow
    │       ↓
    │   ❌ COMBO BROKEN
    │       • Reduced damage
    │       • Vulnerability window
    │
    └─> Opponent perfect defense
            ↓
        ❌ COMBO CANCELLED
            • No damage
            • Lost stamina
            • Opponent gains advantage
```

---

## Special Meter & Finisher Flow

```
[Actions during battle]
    ↓
[Build Special Meter]
    ↓
    Meter gains from:
    • Successful strikes (+10-20)
    • Perfect defenses (+15)
    • Counter strikes (+25)
    • Combo completions (+30-60)
    ↓
[Special Meter reaches 100]
    ↓
✨ FINISHER AVAILABLE ✨
    ↓
[Check Finisher Requirements]
    ↓
╔═══════════════════════════════════════════════╗
║         FINISHER REQUIREMENTS                 ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  ✅ Special meter = 100                       ║
║  ✅ Opponent is GASSED or EXHAUSTED           ║
║  ✅ User has 6+ stamina to cast               ║
║                                               ║
║  If all conditions met:                       ║
║  → Finisher button becomes active             ║
║                                               ║
╚═══════════════════════════════════════════════╝
    ↓
[Player/AI Activates Finisher]
    ↓
╔═══════════════════════════════════════════════╗
║          FINISHER ANIMATION                   ║
║                                               ║
║  • Cinematic cutscene (2-4 seconds)           ║
║  • Massive damage (80-120)                    ║
║  • Cannot be defended                         ║
║  • High chance of KO                          ║
║                                               ║
╚═══════════════════════════════════════════════╝
    ↓
[Check if opponent HP <= 0]
    ↓
    ├─> Yes: VICTORY by FINISHER
    │           (bonus rewards)
    │
    └─> No: Opponent survives
                ↓
            Continue battle
            (meter resets to 0)
```

---

## Tempo Reset (Stamina Recovery Event)

```
[Both fighters pause attacking]
    ↓
[No actions for ≈ 1.0 second]
    ↓
╔═══════════════════════════════════════════════╗
║          TEMPO RESET TRIGGERED                ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  "Both fighters catch their breath"           ║
║                                               ║
║  • Both fighters gain +1 stamina card         ║
║  • Combo states reset                         ║
║  • Defense mode exits                         ║
║  • Battle returns to neutral                  ║
║                                               ║
║  Visual cue: Brief pause animation            ║
║                                               ║
╚═══════════════════════════════════════════════╝
    ↓
[Resume Battle]
    ↓
[Back to action selection]
```

**Purpose:** Prevents stalemates, rewards pacing over button mashing.

---

## Turn-Based Timeline (Speed-Based Initiative)

```
Turn Start
    ↓
[Calculate Initiative]
    ↓
    Formula: Base = Speed stat
             + Random(0-10)
             - Stamina penalty (if gassed/exhausted)
    ↓
[Higher initiative goes first]
    ↓
╔═══════════════════════════════════════════════╗
║        FIGHTER A ACTS (faster)                ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  1. Select action card                        ║
║  2. Check if Fighter B can interrupt          ║
║      (only if Perfect Defense or Counter)     ║
║  3. Resolve action                            ║
║  4. Apply effects                             ║
║                                               ║
╚═══════════════════════════════════════════════╝
    ↓
[0.2-0.5s delay for animation]
    ↓
╔═══════════════════════════════════════════════╗
║        FIGHTER B ACTS (slower)                ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  1. Select action card                        ║
║  2. Resolve action                            ║
║  3. Apply effects                             ║
║                                               ║
╚═══════════════════════════════════════════════╝
    ↓
[Turn Complete]
    ↓
[Increment turn counter]
    ↓
[Check win conditions]
    ↓
[Start next turn]
```

---

## Win Condition Check (Every Turn)

```
After each action resolves
    ↓
╔═══════════════════════════════════════════════╗
║         CHECK WIN CONDITIONS                  ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  1. Either fighter HP <= 0?                   ║
║     → YES: Victory by KO                      ║
║                                               ║
║  2. Finisher landed successfully?             ║
║     → YES: Victory by FINISHER                ║
║                                               ║
║  3. Turn limit reached? (e.g. 50 turns)       ║
║     → YES: Victory by HP % remaining          ║
║                                               ║
║  4. Fighter forfeits/disconnects?             ║
║     → YES: Victory by FORFEIT                 ║
║                                               ║
║  5. None of above?                            ║
║     → CONTINUE BATTLE                         ║
║                                               ║
╚═══════════════════════════════════════════════╝
    ↓
If win condition met:
    ↓
[End Battle]
    ↓
[Show Victory/Defeat Screen]
    ↓
[Calculate Rewards]
    ↓
[Update Leaderboards]
    ↓
[Save Battle Replay]
```

---

## AI Decision Tree (Simplified)

```
[AI Turn Begins]
    ↓
╔═══════════════════════════════════════════════╗
║          AI EVALUATES SITUATION               ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  Check 1: Am I exhausted/gassed?              ║
║    └─> YES: Enter Defense Mode (80% chance)   ║
║    └─> NO: Continue evaluation                ║
║                                               ║
║  Check 2: Can I use a finisher?               ║
║    └─> YES: Use finisher (60-90% chance)      ║
║    └─> NO: Continue evaluation                ║
║                                               ║
║  Check 3: Is opponent in Defense Mode?        ║
║    └─> YES: Aggressive strike (70% chance)    ║
║    └─> NO: Continue evaluation                ║
║                                               ║
║  Check 4: Am I winning on HP?                 ║
║    └─> YES: Play safer, control pace          ║
║    └─> NO: Be more aggressive                 ║
║                                               ║
║  Check 5: Apply personality modifiers         ║
║    • Aggression level (0-1)                   ║
║    • Risk tolerance (0-1)                     ║
║    • Patience (0-1)                           ║
║                                               ║
╚═══════════════════════════════════════════════╝
    ↓
[Score all available cards]
    ↓
    Scoring factors:
    • Damage potential
    • Stamina efficiency
    • Combo opportunity
    • Special meter gain
    • Current battle state
    ↓
[Select highest-scoring card]
    ↓
[Play selected card]
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────┐
│                 FRONTEND (React)                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ArenaScreen.tsx                                    │
│      ↓                                              │
│  useArenaBattle() hook                              │
│      ↓                                              │
│  useArenaBattleStore (Zustand)                      │
│      ↓                                              │
│  BattleArenaView component                          │
│      ↓                                              │
│  [User clicks card or auto-battle triggers]        │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────┐
│              COMBAT ENGINE (Logic)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ArenaCombatEngine.resolveAction()                  │
│      ↓                                              │
│  1. Validate card play                              │
│  2. Check interrupts                                │
│  3. Calculate damage                                │
│  4. Update fighter states                           │
│  5. Check win conditions                            │
│      ↓                                              │
│  Return updated BattleState                         │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────┐
│              STATE STORE (Zustand)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  currentBattle state updated                        │
│      ↓                                              │
│  React components re-render                         │
│      ↓                                              │
│  Animations trigger                                 │
│      ↓                                              │
│  If battle complete:                                │
│      └─> Save to Supabase                           │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────┐
│              DATABASE (Supabase)                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Tables:                                            │
│  • arena_battles (final state)                      │
│  • battle_actions (action log)                      │
│  • arena_rankings (updated on win/loss)             │
│                                                     │
│  Used for:                                          │
│  • Replays                                          │
│  • Leaderboards                                     │
│  • Analytics                                        │
│  • Rewards distribution                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Battle Performance Optimization

### Client-Side Prediction

```
User clicks card
    ↓
[Immediate UI feedback]
    • Card animation starts
    • Optimistic state update
    • Show predicted damage
    ↓
[Compute action result locally]
    ↓
[Update local state]
    ↓
[Save to Supabase async]
    • Non-blocking
    • Happens in background
```

### State Diffing

```
Previous BattleState
    ↓
[Action occurs]
    ↓
New BattleState
    ↓
[Diff states]
    • Only animate changed values
    • Only update changed components
    • Prevents full re-render
```

---

## Summary: Key State Transitions

| Event | State Change | Effect |
|-------|-------------|--------|
| Use Strike Card | stamina -= cost | Damage opponent, build meter |
| Perfect Defense | stamina += 1 | Open counter window |
| Enter Defense Mode | isInDefenseMode = true | Disable attacks, enable defenses |
| Complete Combo | comboCounter = 0 | Damage bonus, meter boost |
| Special Meter Full | canUseFinisher = true | Finisher button active |
| Use Finisher | specialMeter = 0 | Massive damage, possible KO |
| Tempo Reset | Both stamina += 1 | Return to neutral |
| HP <= 0 | status = 'completed' | End battle, show results |

---

## Testing Checklist

Use this flow to test each system:

- [ ] Initialize battle with two mock fighters
- [ ] Play a strike card → HP should decrease
- [ ] Use all stamina → Fighter should become exhausted
- [ ] Enter defense mode → Block incoming attack
- [ ] Perfect defense → Gain 1 stamina
- [ ] Build special meter to 100 → Finisher available
- [ ] Use finisher on gassed opponent → Massive damage
- [ ] Reduce HP to 0 → Battle ends, victory screen
- [ ] Check Supabase → Battle saved correctly
- [ ] Play AI battle → AI makes reasonable decisions
- [ ] Try different archetypes → Different card pools

---

## Next Steps

1. ✅ Read this flow document
2. ✅ Follow `ARENA_V2_QUICKSTART.md` to set up
3. ✅ Implement each system following `ARENA_V2_IMPLEMENTATION_PLAN.md`
4. ✅ Test with manual battles first
5. ✅ Add AI auto-battle
6. ✅ Polish animations
7. ✅ Balance and iterate

---

This battle flow is designed to be **spectator-friendly**, **skill-expressive**, and **fun to watch**—even when fully automated. 🎮🤖
