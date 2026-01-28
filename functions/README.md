# Holobots Firebase Cloud Functions

This directory contains Firebase Cloud Functions for the Holobots real-time multiplayer system.

## Functions

### `matchmaker`

Automatically matches players who enter the battle pool.

**Trigger**: `onDocumentCreated` on `battle_pool_entries/{entryId}`

**What it does**:
1. Listens for new matchmaking entries
2. Searches for another active player
3. Creates a battle room with both players
4. Assigns room IDs to both pool entries

**Example Log**:
```
Match found! Pairing user123 with user456
✅ Match created! Room ID: xyz789, Room Code: ABC123
```

### `cleanupAbandonedRooms`

Automatically deletes abandoned or expired rooms.

**Trigger**: `onDocumentCreated` on `battle_rooms/{roomId}`

**What it does**:
1. Starts a 2-hour timer when room is created
2. Checks room status after timer
3. Deletes if status is 'waiting' or 'abandoned'

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Test Locally

```bash
npm run serve
```

This starts the Firebase emulator suite. Your app should connect to:
- Firestore: `localhost:8080`
- Functions: `localhost:5001`

### View Logs

```bash
npm run logs
```

Or:

```bash
firebase functions:log
```

### Deploy

```bash
npm run deploy
```

Or:

```bash
firebase deploy --only functions
```

### Deploy Specific Function

```bash
firebase deploy --only functions:matchmaker
firebase deploy --only functions:cleanupAbandonedRooms
```

## Environment Variables

Functions automatically use Firebase project configuration. No additional env vars needed for basic setup.

For custom configuration, use:

```bash
firebase functions:config:set someservice.key="THE API KEY"
```

Access in code:

```typescript
import { config } from 'firebase-functions';
const apiKey = config().someservice.key;
```

## Monitoring

### Firebase Console

1. Go to Firebase Console
2. Select your project
3. Click "Functions" in left menu
4. View execution logs, errors, and metrics

### Real-time Logs

```bash
firebase functions:log --only matchmaker
```

## Cost Optimization

Current setup is optimized for minimal costs:

- Functions only run when triggered
- Firestore queries limited to 1 result
- Automatic cleanup prevents database bloat
- No scheduled functions (no polling)

**Estimated Cost** (with 1000 battles/day):
- Cloud Functions: ~$0.40/month (free tier covers this)
- Firestore: ~$0.60/month (depends on reads/writes)

## Testing

### Manual Testing

```bash
# Start emulator
firebase emulators:start

# In another terminal, test function trigger
curl -X POST http://localhost:5001/holobots-24046/us-central1/matchmaker
```

### Unit Tests

```bash
npm test
```

(Tests to be implemented)

## Troubleshooting

### Function Not Deploying

**Error**: "Permission denied"

**Solution**:
```bash
firebase login --reauth
firebase use <project-id>
```

### Function Timing Out

**Error**: "Function execution took too long"

**Solution**: Increase timeout in `index.ts`:

```typescript
export const matchmaker = onDocumentCreated(
  { 
    document: "battle_pool_entries/{entryId}",
    timeoutSeconds: 60 // Increase from default 60s
  },
  async (event) => {
    // ...
  }
);
```

### Matchmaking Not Working

1. Check function logs: `firebase functions:log`
2. Verify pool entry was created with `isActive: true`
3. Check Firestore rules allow reading `battle_pool_entries`

## Architecture

```
battle_pool_entries (collection)
│
├── entry1 (document)
│   ├── userId: "user123"
│   ├── isActive: true
│   └── ...
│
└── entry2 (document)
    ├── userId: "user456"
    ├── isActive: true
    └── ...
    
    ↓ (triggers matchmaker function)
    
battle_rooms (collection)
│
└── room_xyz (document)
    ├── roomCode: "ABC123"
    ├── status: "active"
    ├── players:
    │   ├── p1: { uid: "user123", ... }
    │   └── p2: { uid: "user456", ... }
    └── ...
```

## Next Steps

- [ ] Add ELO rating updates
- [ ] Implement tournament creation
- [ ] Add webhook for battle completion
- [ ] Create scheduled cleanup function
- [ ] Add analytics tracking

---

Built with ❤️ for Holobots
