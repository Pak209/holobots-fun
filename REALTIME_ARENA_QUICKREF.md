# Real-Time Arena - Quick Reference Card

## Import

```typescript
import { useRealtimeArena } from '@/hooks/useRealtimeArena';
```

## Basic Usage

```typescript
const {
  room,              // Current battle room
  myRole,           // 'p1' | 'p2' | null
  isMyTurn,         // boolean
  createRoom,       // Create new room
  joinRoom,         // Join by code
  playAction,       // Submit action
  leaveRoom,        // Leave battle
} = useRealtimeArena();
```

## Common Patterns

### Create Room

```typescript
const roomCode = await createRoom(HOLOBOT_STATS.ace);
console.log('Share this code:', roomCode); // e.g., "ABC123"
```

### Join Room

```typescript
await joinRoom('ABC123', HOLOBOT_STATS.kuma);
```

### Quick Match

```typescript
await enterMatchmaking(HOLOBOT_STATS.ace, 'pvp');
```

### Play Action

```typescript
await playAction({ actionType: 'attack' });
await playAction({ actionType: 'defense' });
await playAction({ actionType: 'special' });
```

### Leave Battle

```typescript
await leaveRoom();
```

## Room States

| Status | Description |
|--------|-------------|
| `waiting` | Room created, waiting for player 2 |
| `active` | Battle in progress |
| `completed` | Battle finished |
| `abandoned` | Player disconnected |

## Turn Phases

| Phase | Description | Actions |
|-------|-------------|---------|
| `selection` | Choose action | Players submit actions |
| `resolution` | Calculating | Auto - waits for both actions |
| `animation` | Playing effects | Auto - plays animations |

## Player Data Access

```typescript
// Your player
const myPlayer = room.players[myRole];
console.log(myPlayer.health);
console.log(myPlayer.stamina);
console.log(myPlayer.specialMeter);

// Opponent
const opponent = room.players[opponentRole];
```

## Check Action Status

```typescript
const myAction = myRole === 'p1' ? room.p1Action : room.p2Action;
const hasSubmitted = myAction !== null;
```

## Battle Log

```typescript
room.actionHistory.forEach(turn => {
  console.log(`Turn ${turn.turnNumber}`);
  console.log(`P1: ${turn.p1Outcome.result} (${turn.p1DamageDealt} dmg)`);
  console.log(`P2: ${turn.p2Outcome.result} (${turn.p2DamageDealt} dmg)`);
});
```

## Animations

```typescript
const lastTurn = room.actionHistory[room.actionHistory.length - 1];

lastTurn.animationSequence.forEach(anim => {
  // Play animation
  playAnimation(anim.animationId, anim.actorRole, anim.targetRole);
  
  // Wait for duration
  await sleep(anim.duration);
});
```

## Error Handling

```typescript
const { error } = useRealtimeArena();

useEffect(() => {
  if (error) {
    console.error('Arena error:', error);
    toast.error(error);
  }
}, [error]);
```

## Connection Status

```typescript
const { connectionStatus } = useRealtimeArena();

// 'connected' | 'disconnected' | 'reconnecting'
```

## Conditional Rendering

```typescript
// No room - show lobby
if (!room) {
  return <Lobby />;
}

// Battle in progress
if (room.status === 'active') {
  return <BattleScreen />;
}

// Battle finished
if (room.status === 'completed') {
  return <ResultsScreen winner={room.winner} />;
}
```

## Common Checks

```typescript
// Can player submit action?
const canAct = room?.turnPhase === 'selection' && !myAction;

// Are both actions submitted?
const bothReady = room?.p1Action && room?.p2Action;

// Is battle over?
const isOver = room?.status === 'completed';

// Did I win?
const didWin = room?.winner === myRole;
```

## TypeScript Types

```typescript
import {
  BattleRoom,
  BattleRoomPlayer,
  PlayerAction,
  ResolvedTurn,
  ActionOutcome,
} from '@/types/battle-room';
```

## Firestore Collections

- `battle_rooms` - Active battle rooms
- `battle_pool_entries` - Matchmaking queue

## Cloud Functions

- `matchmaker` - Auto-matches players
- `cleanupAbandonedRooms` - Removes old rooms

## Testing Tips

```typescript
// Test with two browser windows
// Window 1: Create room
// Window 2: Join with code

// Test matchmaking
// Both windows: Click "Quick Match"

// Test turn resolution
// Both players: Submit actions
// Watch auto-resolution

// Test reconnection
// Refresh page while in battle
// Should automatically rejoin
```

## Performance

- Heartbeat: Every 5 seconds
- Connection timeout: 15 seconds
- Room cleanup: 2 hours
- Matchmaking timeout: 60 seconds

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Room not found" | Invalid code | Check code is correct |
| "Room is full" | Both slots taken | Create new room |
| "Must be logged in" | No auth | Login first |
| "Cannot play action" | Wrong phase | Wait for selection phase |

## Debug Helpers

```typescript
// Log room state
console.log('Room:', room);

// Log my state
console.log('My role:', myRole);
console.log('My player:', room?.players[myRole]);

// Log turn info
console.log('Turn:', room?.currentTurn);
console.log('Phase:', room?.turnPhase);
console.log('My action:', myAction);

// Log connection
console.log('Status:', connectionStatus);
```

## Deploy Checklist

- [ ] `cd functions && npm install`
- [ ] `npm run build`
- [ ] `firebase deploy --only functions`
- [ ] Update Firestore rules
- [ ] Test with two accounts
- [ ] Verify real-time sync

## Quick Links

- Full Guide: `REALTIME_ARENA_GUIDE.md`
- Setup: `REALTIME_ARENA_SETUP.md`
- Hook: `src/hooks/useRealtimeArena.ts`
- Types: `src/types/battle-room.ts`
- Component: `src/components/arena/RealtimeBattleRoom.tsx`
- Functions: `functions/src/index.ts`

---

💡 Pro Tip: Open browser DevTools Network tab and filter by "firestore" to see real-time updates!
