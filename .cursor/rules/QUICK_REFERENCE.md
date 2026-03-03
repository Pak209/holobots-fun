# 🚀 Holobots Quick Reference

## 📱 Platform Matrix

| Feature | PWA (Web) | Mobile App | Shared |
|---------|-----------|------------|--------|
| **Battles** | ✅ Primary | ⚡ Optional | Firebase |
| **Marketplace** | ✅ Primary | ❌ No | Firebase |
| **Gacha/Packs** | ✅ Primary | ⚡ Optional | Firebase |
| **Step Tracking** | 📝 Manual | ✅ Auto (HealthKit) | Firebase |
| **Sync Training** | 📝 Manual | ✅ Auto | Firebase |
| **Collection View** | ✅ Yes | ✅ Yes | Firebase |
| **Web3/Wallet** | ✅ Yes | ❌ No | - |

## 🔄 Sync Flow Examples

### Scenario 1: Morning Fitness
```
07:00 - User wakes up, opens mobile app
07:05 - Walks 2,000 steps → Auto-syncs to Firebase
        ├─ todaySteps: 2000
        └─ syncPoints: +20

10:00 - Opens PWA at work
        └─ Instantly sees: "2,000 steps synced from mobile"

12:00 - Uses 20 Sync Points in quick battle (PWA)
        └─ Mobile app instantly sees: syncPoints: 0

18:00 - Walks 8,000 more steps (total: 10,000)
        └─ Mobile syncs: +80 more Sync Points

19:00 - Opens PWA → Uses 80 SP for Arena battle
```

### Scenario 2: Battle Results
```
User A (PWA) battles User B (Mobile)
├─ Both see real-time battle updates
├─ Winner gets rewards → Firebase updates
└─ Loser sees results on next app open
```

## 🔥 Firebase Quick Commands

### Read with Real-time Updates
```typescript
// ✅ DO THIS
const unsubscribe = onSnapshot(
  doc(db, 'users', userId),
  (snapshot) => {
    const data = snapshot.data();
    setSyncPoints(data?.syncPoints);
  }
);

// ❌ NOT THIS (no real-time)
const snap = await getDoc(doc(db, 'users', userId));
```

### Update Atomically
```typescript
// ✅ DO THIS (atomic, no race conditions)
await updateDoc(doc(db, 'users', userId), {
  syncPoints: increment(100),
  todaySteps: 10000,
  lastSync: serverTimestamp()
});

// ❌ NOT THIS (race condition!)
const current = await getCurrentSyncPoints();
await updateDoc(..., { syncPoints: current + 100 });
```

### Batch Updates
```typescript
// Multiple related updates
const batch = writeBatch(db);
batch.update(userRef, { syncPoints: increment(-50) });
batch.update(battleRef, { status: 'completed' });
await batch.commit();
```

## 📊 Data Structure Cheat Sheet

```typescript
// User Document
{
  username: string,
  holobots: [{
    name: string,
    level: number,
    experience: number,
    stats: { attack, defense, speed, intelligence }
  }],
  syncPoints: number,      // Earned from steps/training
  todaySteps: number,      // Auto-synced from mobile
  lastStepSync: timestamp, // Last mobile sync
  holosTokens: number,     // Game currency
  gachaTickets: number,    // For booster packs
  arenaPassses: number,    // Battle tickets
  dailyEnergy: number,     // Daily limit
  wins: number,
  losses: number
}
```

## 🎮 Common Patterns

### Mobile: Sync Steps
```typescript
import firestore from '@react-native-firebase/firestore';

async function syncSteps(userId: string, steps: number) {
  const syncPoints = Math.floor(steps / 100);
  
  await firestore()
    .collection('users')
    .doc(userId)
    .update({
      todaySteps: steps,
      syncPoints: firestore.FieldValue.increment(syncPoints),
      lastStepSync: firestore.FieldValue.serverTimestamp()
    });
}
```

### PWA: Listen to Steps
```typescript
import { doc, onSnapshot } from 'firebase/firestore';

function useSteps(userId: string) {
  const [steps, setSteps] = useState(0);
  
  useEffect(() => {
    return onSnapshot(
      doc(db, 'users', userId),
      (snap) => setSteps(snap.data()?.todaySteps || 0)
    );
  }, [userId]);
  
  return steps;
}
```

### Both: Spend Sync Points
```typescript
// Same logic on both platforms!
await updateDoc(doc(db, 'users', userId), {
  syncPoints: increment(-50) // Spend 50 points
});
```

## ⚡ Performance Tips

### Mobile
- Batch step syncs (every hour, not every step!)
- Use `FlatList` for Holobot lists
- Enable Firestore offline persistence
- Optimize images with `react-native-fast-image`

### PWA
- Code split routes (`React.lazy()`)
- Cache Firebase queries (React Query)
- Use Vite's dynamic imports
- Optimize Tailwind (purge unused)

## 🐛 Common Issues & Solutions

### Issue: Steps not syncing
```typescript
// Check: Is HealthKit permission granted?
const granted = await HealthKit.initHealthKit(permissions);

// Check: Is Firebase auth valid?
const user = auth().currentUser;

// Check: Is document path correct?
firestore().collection('users').doc(userId) // ✅
firestore().collection('user').doc(userId)  // ❌ typo!
```

### Issue: Sync Points out of sync
```typescript
// Solution: Always use increment()
syncPoints: increment(100)  // ✅ Atomic

// NOT:
syncPoints: currentValue + 100  // ❌ Race condition
```

### Issue: Real-time not updating
```typescript
// Check: Did you unsubscribe properly?
useEffect(() => {
  const unsubscribe = onSnapshot(...);
  return () => unsubscribe(); // ✅ Cleanup
}, []);

// Check: Is Firestore offline persistence enabled?
enableIndexedDbPersistence(db); // For PWA
firestore().settings({ persistence: true }); // For mobile
```

## 📱 Mobile-Specific

### Request HealthKit Permission (iOS)
```typescript
import HealthKit from 'react-native-health';

const permissions = {
  permissions: {
    read: ['StepCount', 'DistanceWalkingRunning']
  }
};

await HealthKit.initHealthKit(permissions);
```

### Background Sync
```typescript
import BackgroundFetch from 'react-native-background-fetch';

BackgroundFetch.configure({
  minimumFetchInterval: 60 // minutes
}, async (taskId) => {
  await syncSteps(userId);
  BackgroundFetch.finish(taskId);
});
```

## 💻 PWA-Specific

### Install Prompt
```typescript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show custom install button
});

// On button click:
deferredPrompt.prompt();
const { outcome } = await deferredPrompt.userChoice;
```

### Service Worker
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    manifest: { /* ... */ },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg}']
    }
  })
]
```

## 🔐 Security Rules

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    match /battle_rooms/{roomId} {
      // Anyone can read active battles
      allow read: if request.auth != null;
      // Only players can update their room
      allow write: if request.auth != null 
        && (resource.data.players.p1.uid == request.auth.uid
        || resource.data.players.p2.uid == request.auth.uid);
    }
  }
}
```

## 🎯 Next Steps Checklist

### Phase 1: Setup
- [ ] Create monorepo structure
- [ ] Move web code to `packages/web/`
- [ ] Create `packages/shared/` with types
- [ ] Extract Firebase config to shared

### Phase 2: Mobile App
- [ ] Initialize React Native app
- [ ] Install Firebase SDK
- [ ] Install HealthKit/Google Fit
- [ ] Implement step tracking service

### Phase 3: Sync
- [ ] Add step sync to mobile
- [ ] Add real-time listeners to PWA
- [ ] Test bidirectional sync
- [ ] Add offline support

### Phase 4: Features
- [ ] Mobile: Fitness dashboard
- [ ] PWA: Show mobile steps
- [ ] Both: Spend sync points
- [ ] Both: View updated holobots

### Phase 5: Polish
- [ ] Error handling
- [ ] Loading states
- [ ] Offline indicators
- [ ] Push notifications

---

**Pro Tips:**
- Always test on both platforms after Firebase changes
- Use TypeScript `shared` package for all types
- Enable Firestore offline persistence
- Log sync events for debugging
- Use React DevTools to verify state updates
