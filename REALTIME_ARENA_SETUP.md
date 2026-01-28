# Real-Time Arena Setup Instructions

## Quick Start

Follow these steps to set up the real-time multiplayer arena system:

## 1. Firebase Cloud Functions Setup

### Install Dependencies

```bash
cd functions
npm install
```

### Build Functions

```bash
npm run build
```

### Deploy to Firebase

```bash
firebase deploy --only functions
```

This will deploy:
- ✅ `matchmaker` - Automatic player matching
- ✅ `cleanupAbandonedRooms` - Room cleanup

## 2. Firestore Security Rules

Update your Firestore rules in the Firebase Console or via `firestore.rules`:

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
    
    // Battle Pool Entries (for matchmaking)
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

Deploy rules:

```bash
firebase deploy --only firestore:rules
```

## 3. Environment Variables

Your Firebase config is already set in `src/lib/firebase.ts`. Make sure it's using the correct project credentials.

## 4. Add Route (Optional)

Create a route for the battle room in your app:

### Option A: Add to existing routes

```typescript
// src/App.tsx or your router file
import { RealtimeBattleRoom } from '@/components/arena/RealtimeBattleRoom';

// Add route
<Route path="/arena/realtime" element={<RealtimeBattleRoom />} />
```

### Option B: Create dedicated page

```typescript
// src/pages/RealtimeArena.tsx
import { RealtimeBattleRoom } from '@/components/arena/RealtimeBattleRoom';

export default function RealtimeArena() {
  return <RealtimeBattleRoom />;
}
```

## 5. Test the System

### Test Locally with Emulators (Recommended)

```bash
# Install emulators if not already
firebase init emulators

# Start emulators
firebase emulators:start
```

Then in your app, connect to the emulator (add to `src/lib/firebase.ts`):

```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectFunctionsEmulator } from 'firebase/functions';

if (process.env.NODE_ENV === 'development' && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

### Test with Two Devices/Windows

#### Test 1: Room Code System
1. Open your app in two browser windows (or use incognito)
2. Login with different accounts
3. Window 1: Click "Create Private Room", note the room code
4. Window 2: Enter the room code and click "Join Room"
5. ✅ Both windows should sync in real-time

#### Test 2: Matchmaking
1. Open your app in two browser windows
2. Login with different accounts
3. Both windows: Click "Quick Match"
4. ✅ Should automatically create a battle room

#### Test 3: Turn Resolution
1. In a battle, both players click "Attack"
2. ✅ Turn should resolve automatically
3. ✅ Both players see the results simultaneously
4. ✅ Health bars update on both devices

## 6. Verify Cloud Functions

Check that your functions are running:

```bash
# View function logs
firebase functions:log

# Or in Firebase Console
# Go to Functions > Dashboard
```

You should see logs like:
```
Match created! Room ID: xyz123, Room Code: ABC123
```

## 7. Database Indexes

Firebase may prompt you to create indexes. If you see errors in the console, click the provided link to auto-create them, or add manually:

```javascript
// Required indexes (if not auto-created):
// Collection: battle_pool_entries
// Fields: isActive (Ascending), userId (Ascending)
```

## Troubleshooting

### Functions not deploying

```bash
# Make sure you're logged in
firebase login

# Check your project
firebase projects:list
firebase use <your-project-id>

# Try deploying again
cd functions
npm run build
firebase deploy --only functions
```

### Matchmaking not working

1. Check Cloud Functions logs: `firebase functions:log`
2. Verify Firestore rules allow creating `battle_pool_entries`
3. Check browser console for errors
4. Make sure you're logged in with Firebase Auth

### Real-time updates not syncing

1. Check connection status indicator (should be green)
2. Verify Firestore rules allow reading `battle_rooms`
3. Check browser console for snapshot errors
4. Ensure both users are authenticated

### "Room not found" error

1. Verify room code is correct (6 characters, no spaces)
2. Check room hasn't expired (rooms auto-delete after 2 hours)
3. Make sure room creator hasn't left

## Performance Tips

### For Production

1. **Enable Firestore indexes** for faster queries
2. **Set up billing alerts** to monitor function invocations
3. **Add rate limiting** to prevent abuse
4. **Monitor function cold starts**

### Optimize Costs

- Functions run only when needed (on document creation)
- Clean up old rooms automatically
- Limit matchmaking pool queries with `.limit(1)`

## Next Steps

1. ✅ Test with real devices on different networks
2. ✅ Add ELO rating system for ranked matches
3. ✅ Implement battle replays
4. ✅ Add spectator mode
5. ✅ Create leaderboards

## Support

- **Firebase Docs**: https://firebase.google.com/docs
- **Cloud Functions**: https://firebase.google.com/docs/functions
- **Firestore**: https://firebase.google.com/docs/firestore

## Deployment Checklist

- [ ] Functions deployed
- [ ] Firestore rules updated
- [ ] Database indexes created
- [ ] Environment variables set
- [ ] Route added to app
- [ ] Tested with two accounts
- [ ] Matchmaking working
- [ ] Real-time sync working
- [ ] Heartbeat system active
- [ ] Error handling tested

---

🎮 Ready to Battle!
