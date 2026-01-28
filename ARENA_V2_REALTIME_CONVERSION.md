# Converting PvP to Arena V2 Real-Time Combat

## Current System (Turn-Based)
- Player 1 selects action → waits
- Player 2 selects action → waits
- Both actions resolve together
- Next turn begins

## Desired System (Real-Time Arena V2)
- Both players can attack anytime
- Actions resolve immediately
- Stamina costs prevent spam
- Stamina regenerates over time
- No waiting for opponent

## Changes Needed

### 1. Remove Turn System
- No more "selection phase" → "resolution phase"
- Actions execute immediately
- No waiting for opponent

### 2. Add Stamina System
- Each action costs stamina
- Stamina regenerates automatically (1 per 2 seconds)
- Can't attack without stamina

### 3. Action Resolution
- Actions apply damage immediately
- Both devices see updates via Firebase realtime sync
- No turn-by-turn resolution

### 4. Battle Flow
```
Player clicks card → 
  Check stamina → 
  Deduct stamina → 
  Apply damage to opponent → 
  Firebase syncs to both devices → 
  Both see updated health/stamina
```

## Implementation Plan

1. Modify BattleRoom type to remove turn phases
2. Update useRealtimeArena to handle immediate actions
3. Add stamina regeneration timer
4. Remove turn resolution logic
5. Make actions apply instantly

This makes it exactly like Arena V2 - fast, real-time, stamina-based!
