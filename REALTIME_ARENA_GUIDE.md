# Real-Time Multiplayer Arena System Guide

## Overview

This guide covers the complete real-time multiplayer arena system for Holobots, allowing players to battle on separate devices using Firebase real-time listeners.

## Architecture

### Components

1. **Types** (`src/types/battle-room.ts`)
   - Battle room data structures
   - Player actions and turn resolution
   - Matchmaking types

2. **Hook** (`src/hooks/useRealtimeArena.ts`)
   - React hook for managing real-time battles
   - Firebase onSnapshot listeners
   - Turn-based state machine
   - Connection management with heartbeat system

3. **Cloud Functions** (`functions/src/index.ts`)
   - Automatic matchmaking
   - Room cleanup
   - Server-side validation

## Features

### ✅ Real-Time Synchronization
- Uses Firebase `onSnapshot` to listen to battle room changes
- Both players see updates instantly on their devices
- Automatic reconnection handling

### ✅ Room Code System
- 6-character alphanumeric codes (e.g., "ABC123")
- Easy sharing between players
- Join by code or direct room ID

### ✅ Turn-Based State Machine
- **Selection Phase**: Players choose their actions
- **Resolution Phase**: Turn resolves when both actions are submitted
- **Animation Phase**: Animations play on both devices
- Automatic transition back to selection phase

### ✅ Matchmaking
- Enter matchmaking pool with your Holobot
- Automatic pairing with available opponents
- ELO-based matching (for ranked battles)
- 60-second timeout with fallback

### ✅ Connection Management
- Heartbeat system (every 5 seconds)
- Connection status tracking
- Automatic cleanup of abandoned rooms

## Usage

### Basic Example

```typescript
import { useRealtimeArena } from '@/hooks/useRealtimeArena';
import { HOLOBOT_STATS } from '@/types/holobot';

function BattleComponent() {
  const {
    room,
    loading,
    error,
    myRole,
    isMyTurn,
    createRoom,
    joinRoom,
    playAction,
    leaveRoom,
  } = useRealtimeArena();

  // Create a new room
  const handleCreateRoom = async () => {
    const roomCode = await createRoom(HOLOBOT_STATS.ace);
    console.log('Room created! Code:', roomCode);
  };

  // Join existing room
  const handleJoinRoom = async (code: string) => {
    await joinRoom(code, HOLOBOT_STATS.kuma);
  };

  // Play an action
  const handleAttack = async () => {
    await playAction({
      actionType: 'attack',
      card: myAttackCard,
    });
  };

  return (
    <div>
      {!room && (
        <button onClick={handleCreateRoom}>Create Room</button>
      )}
      
      {room && (
        <div>
          <p>Room Code: {room.roomCode}</p>
          <p>Your Role: {myRole}</p>
          <p>Turn: {isMyTurn ? 'Your turn!' : "Opponent's turn"}</p>
          
          {isMyTurn && (
            <button onClick={handleAttack}>Attack</button>
          )}
          
          <button onClick={leaveRoom}>Leave Battle</button>
        </div>
      )}
    </div>
  );
}
```

### Matchmaking Example

```typescript
function MatchmakingComponent() {
  const {
    matchmakingStatus,
    enterMatchmaking,
    cancelMatchmaking,
  } = useRealtimeArena();

  const handleQuickMatch = async () => {
    await enterMatchmaking(HOLOBOT_STATS.ace, 'pvp');
  };

  return (
    <div>
      {matchmakingStatus === 'idle' && (
        <button onClick={handleQuickMatch}>Quick Match</button>
      )}
      
      {matchmakingStatus === 'searching' && (
        <div>
          <p>Searching for opponent...</p>
          <button onClick={cancelMatchmaking}>Cancel</button>
        </div>
      )}
      
      {matchmakingStatus === 'matched' && (
        <p>Match found! Loading battle...</p>
      )}
    </div>
  );
}
```

### Complete Battle Flow Example

```typescript
function RealtimeBattle() {
  const {
    room,
    myRole,
    opponentRole,
    isMyTurn,
    playAction,
    connectionStatus,
  } = useRealtimeArena();

  if (!room || !myRole || !opponentRole) return null;

  const myPlayer = room.players[myRole];
  const opponent = room.players[opponentRole];
  const myAction = myRole === 'p1' ? room.p1Action : room.p2Action;
  const opponentAction = opponentRole === 'p1' ? room.p1Action : room.p2Action;

  return (
    <div className="battle-screen">
      {/* Connection Status */}
      <div className="connection-indicator">
        {connectionStatus === 'connected' ? '🟢' : '🔴'} {connectionStatus}
      </div>

      {/* Turn Info */}
      <div className="turn-info">
        Turn {room.currentTurn} - Phase: {room.turnPhase}
      </div>

      {/* Players */}
      <div className="players">
        <div className="player">
          <h3>{myPlayer.username} (You)</h3>
          <div className="health-bar">
            HP: {myPlayer.health}/{myPlayer.maxHealth}
          </div>
          <div className="stamina">Stamina: {myPlayer.stamina}</div>
          <div className="special-meter">
            Special: {myPlayer.specialMeter}%
          </div>
        </div>

        <div className="opponent">
          <h3>{opponent.username}</h3>
          <div className="health-bar">
            HP: {opponent.health}/{opponent.maxHealth}
          </div>
        </div>
      </div>

      {/* Action Status */}
      <div className="action-status">
        <p>Your action: {myAction ? '✅ Ready' : '⏳ Waiting'}</p>
        <p>Opponent action: {opponentAction ? '✅ Ready' : '⏳ Waiting'}</p>
      </div>

      {/* Actions */}
      {room.turnPhase === 'selection' && !myAction && (
        <div className="actions">
          <button onClick={() => playAction({ actionType: 'attack' })}>
            🗡️ Attack
          </button>
          <button onClick={() => playAction({ actionType: 'defense' })}>
            🛡️ Defend
          </button>
          <button onClick={() => playAction({ actionType: 'special' })}>
            ⚡ Special
          </button>
        </div>
      )}

      {/* Waiting for turn resolution */}
      {myAction && opponentAction && room.turnPhase !== 'selection' && (
        <div className="resolving">
          <p>🎬 Turn resolving...</p>
        </div>
      )}

      {/* Battle Log */}
      <div className="battle-log">
        <h4>Battle Log</h4>
        {room.actionHistory.slice(-5).map((turn, i) => (
          <div key={i}>
            Turn {turn.turnNumber}: {turn.p1Outcome.result} vs {turn.p2Outcome.result}
          </div>
        ))}
      </div>

      {/* Winner */}
      {room.status === 'completed' && room.winner && (
        <div className="winner-screen">
          <h2>
            {room.winner === myRole ? '🎉 You Win!' : '😢 You Lose'}
          </h2>
        </div>
      )}
    </div>
  );
}
```

## Firebase Setup

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase Functions

```bash
cd functions
npm install
```

### 3. Deploy Functions

```bash
firebase deploy --only functions
```

### 4. Firestore Rules

Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Battle Rooms
    match /battle_rooms/{roomId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.players.p1.uid || 
         request.auth.uid == resource.data.players.p2.uid);
      allow delete: if request.auth != null && 
        (request.auth.uid == resource.data.players.p1.uid || 
         request.auth.uid == resource.data.players.p2.uid);
    }
    
    // Battle Pool Entries
    match /battle_pool_entries/{entryId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Turn Resolution State Machine

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  SELECTION PHASE                                │
│  - Both players choose actions                  │
│  - Wait for both p1Action and p2Action         │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
         Both actions submitted?
                 │
                 ▼ YES
┌─────────────────────────────────────────────────┐
│                                                 │
│  RESOLUTION PHASE                               │
│  - Calculate damage                             │
│  - Apply state changes                          │
│  - Generate animation sequence                  │
│  - Update health, stamina, special meter        │
│  - Check for winner                             │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  ANIMATION PHASE                                │
│  - Play animations on both devices              │
│  - Show damage numbers                          │
│  - Display effects                              │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
         Battle completed?
                 │
        NO       │       YES
         ◄───────┼───────►
         │               │
         │               ▼
         │       ┌───────────────┐
         │       │               │
         │       │  COMPLETED    │
         │       │  - Show win/  │
         │       │    lose       │
         │       │               │
         │       └───────────────┘
         │
         │ (After animation duration)
         │
         ▼
    Back to SELECTION PHASE
    (Clear actions, increment turn)
```

## Hook API Reference

### `useRealtimeArena()`

Returns an object with the following properties and methods:

#### State

- **`room`** (`BattleRoom | null`): Current battle room data
- **`loading`** (`boolean`): Loading state
- **`error`** (`string | null`): Error message
- **`myRole`** (`'p1' | 'p2' | null`): Your role in the battle
- **`opponentRole`** (`'p1' | 'p2' | null`): Opponent's role
- **`isMyTurn`** (`boolean`): Whether it's your turn
- **`matchmakingStatus`** (`'idle' | 'searching' | 'matched' | 'failed'`): Matchmaking status
- **`connectionStatus`** (`'connected' | 'disconnected' | 'reconnecting'`): Connection status

#### Methods

- **`createRoom(holobotStats, config?)`**: Create a new battle room
  - Returns: `Promise<string>` (room code)

- **`joinRoom(roomCode, holobotStats)`**: Join room by code
  - Returns: `Promise<void>`

- **`joinRoomById(roomId, holobotStats)`**: Join room by ID
  - Returns: `Promise<void>`

- **`leaveRoom()`**: Leave current room
  - Returns: `Promise<void>`

- **`enterMatchmaking(holobotStats, battleType)`**: Enter matchmaking
  - Returns: `Promise<void>`

- **`cancelMatchmaking()`**: Cancel matchmaking
  - Returns: `Promise<void>`

- **`playAction(action)`**: Submit action for current turn
  - Returns: `Promise<void>`

- **`setReady(ready)`**: Set ready status
  - Returns: `Promise<void>`

- **`sendHeartbeat()`**: Manually send heartbeat
  - Returns: `Promise<void>`

## Animations

The system tracks animations in the `animationSequence` array of each resolved turn. Each animation has:

- **`id`**: Unique identifier
- **`type`**: 'attack' | 'defense' | 'damage' | 'effect' | 'ko'
- **`actorRole`**: Player performing the animation
- **`targetRole`**: Target of the animation
- **`animationId`**: Animation asset identifier
- **`duration`**: Duration in milliseconds

Use these to trigger visual effects on both devices:

```typescript
useEffect(() => {
  if (room?.actionHistory.length) {
    const lastTurn = room.actionHistory[room.actionHistory.length - 1];
    
    // Play animations sequentially
    let delay = 0;
    lastTurn.animationSequence.forEach(anim => {
      setTimeout(() => {
        playAnimation(anim.animationId, anim.actorRole, anim.targetRole);
      }, delay);
      delay += anim.duration;
    });
  }
}, [room?.actionHistory]);
```

## Testing

### Local Testing with Emulators

```bash
# Start Firebase emulators
firebase emulators:start

# In your app, use emulator
// src/lib/firebase.ts
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

### Testing Matchmaking

1. Open two browser windows (or use incognito mode)
2. Login with different accounts in each
3. Click "Quick Match" in both windows
4. Should automatically create a battle room

### Testing Room Codes

1. Create room in window 1, note the code
2. In window 2, enter the code
3. Both windows should sync in real-time

## Troubleshooting

### Actions not resolving
- Check that both `p1Action` and `p2Action` are present
- Verify `turnPhase` is 'selection'
- Check browser console for errors

### Connection issues
- Check heartbeat is sending every 5 seconds
- Verify Firebase auth is working
- Check Firestore security rules

### Animations not playing
- Ensure animation duration calculation is correct
- Check that `animationSequence` is populated
- Verify animation assets exist

## Future Enhancements

- [ ] Add ELO rating system
- [ ] Implement spectator mode
- [ ] Add battle replays
- [ ] Create tournament brackets
- [ ] Add voice chat integration
- [ ] Implement custom battle modifiers
- [ ] Add seasonal rankings

## Support

For issues or questions, check:
- Firebase Console logs
- Browser developer console
- Cloud Functions logs: `firebase functions:log`

---

Built with ❤️ for Holobots
