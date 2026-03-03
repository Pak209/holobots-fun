# 🤖 Holobots Hybrid Platform Rule – PWA + Mobile App

You are an expert in **TypeScript**, **React**, **React Native**, **Firebase Firestore**, and **cross-platform mobile-web architecture**. This project is a **hybrid fitness gaming platform** with:

- **PWA (Web)**: Battles, Marketplace, Gacha, Trading
- **Mobile App**: Automatic step tracking, fitness integration, optional battles
- **Shared Backend**: Firebase Firestore with real-time bidirectional sync

---

## 🏗️ Architecture Overview

### Platform Responsibilities

```
┌─────────────────────────────────────────────────────┐
│          FIREBASE BACKEND (Single Source of Truth)  │
│  ┌──────────────────────────────────────────┐      │
│  │  users/{userId}                          │      │
│  │    - syncPoints: number                  │      │
│  │    - todaySteps: number (mobile)         │      │
│  │    - holobots: array                     │      │
│  │    - holosTokens: number                 │      │
│  │    - lastStepSync: timestamp             │      │
│  └──────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
           ▲                            ▲
           │ Real-time onSnapshot()    │
           │                            │
     ┌─────┴─────┐              ┌──────┴──────┐
     │           │              │             │
┌────▼─────┐ ┌──▼────────┐ ┌───▼──────┐ ┌────▼─────┐
│   PWA    │ │  Mobile   │ │  PWA     │ │  Mobile  │
│          │ │           │ │          │ │          │
│ Battles  │ │ Steps     │ │ Market   │ │ Fitness  │
│ Market   │ │ Auto-sync │ │ Gacha    │ │ Battles  │
│ Trading  │ │ HealthKit │ │ Social   │ │ Offline  │
└──────────┘ └───────────┘ └──────────┘ └──────────┘
```

### Primary Use Cases

**PWA (Web App)**:
- Primary: PvP Battles, Async Battles, Battle Rooms
- Primary: Marketplace trading, NFT integration
- Primary: Gacha/Booster Pack opening
- Secondary: View fitness stats synced from mobile
- Secondary: Manual training entry (fallback)

**Mobile App**:
- Primary: Automatic step tracking (HealthKit/Google Fit)
- Primary: Daily fitness goals and rewards
- Primary: Sync Training with selected Holobot
- Secondary: Quick battles on-the-go
- Secondary: View collection, check progress

---

## 🔧 General Code Style and Structure

### Shared Principles (Both Platforms)
- Write **concise**, **typed** TypeScript using **functional and declarative patterns**
- Avoid class components
- Use **named exports** and **descriptive variables**
- Always enable **strict mode** in TypeScript
- Use **interfaces** for props and data modeling
- Avoid `enum`; prefer `as const` objects with unions

### Modular Structure
```
holobots-monorepo/
├── packages/
│   ├── shared/              # Shared TypeScript code
│   │   ├── types/           # Type definitions
│   │   ├── firebase/        # Firebase config & utilities
│   │   ├── utils/           # Shared logic
│   │   │   ├── syncPoints.ts
│   │   │   ├── holobotStats.ts
│   │   │   └── battleLogic.ts
│   │   └── constants/       # Game constants
│   │
│   ├── web/                 # PWA (Vite + React)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── vite.config.ts
│   │
│   └── mobile/              # React Native App
│       ├── src/
│       │   ├── screens/
│       │   ├── components/
│       │   ├── services/    # Native services
│       │   │   ├── HealthKitService.ts
│       │   │   ├── GoogleFitService.ts
│       │   │   └── BackgroundSync.ts
│       │   └── hooks/
│       └── package.json
```

---

## 🔥 Firebase Integration (Shared Backend)

### Core Principles
1. **Single Source of Truth**: All game state lives in Firestore
2. **Real-time Sync**: Use `onSnapshot()` for live updates on both platforms
3. **Atomic Updates**: Use `increment()`, `arrayUnion()`, `serverTimestamp()`
4. **Optimistic UI**: Update local state, then sync to Firebase
5. **Offline Support**: Enable Firestore offline persistence on both platforms

### Firestore Collections
```typescript
users/{userId}
  - username: string
  - holobots: UserHolobot[]
  - syncPoints: number
  - todaySteps: number          // From mobile app
  - lastStepSync: timestamp     // Last mobile sync
  - holosTokens: number
  - gachaTickets: number
  - arenaPassses: number
  - dailyEnergy: number
  - wins: number
  - losses: number

battle_rooms/{roomId}
  - players: { p1: {}, p2: {} }
  - status: 'waiting' | 'active' | 'completed'
  - currentTurn: number
  - winner: PlayerRole | null

async_battles/{battleId}
  - battleType: 'pve_league' | 'pvp_pool'
  - player1Id: string
  - player2Id: string
  - battleStatus: 'pending' | 'completed'
  - rewards: BattleRewards
```

### Real-time Sync Pattern
```typescript
// ✅ CORRECT: Real-time listener
const userRef = doc(db, 'users', userId);
const unsubscribe = onSnapshot(userRef, (snapshot) => {
  const data = snapshot.data();
  setSyncPoints(data?.syncPoints || 0);
  setTodaySteps(data?.todaySteps || 0);
});

// ❌ WRONG: One-time fetch (no real-time sync)
const userSnap = await getDoc(doc(db, 'users', userId));
const data = userSnap.data();
```

### Atomic Updates
```typescript
// ✅ CORRECT: Atomic increment
await updateDoc(doc(db, 'users', userId), {
  syncPoints: increment(100),
  todaySteps: 10000,
  lastStepSync: serverTimestamp()
});

// ❌ WRONG: Race condition risk
const current = (await getDoc(...)).data().syncPoints;
await updateDoc(..., { syncPoints: current + 100 }); // BAD!
```

---

## 📱 Mobile App Specific (React Native)

### Tech Stack
- **Framework**: React Native (non-Expo, bare workflow)
- **Navigation**: React Navigation v6+
- **Styling**: NativeWind (Tailwind for React Native)
- **State**: Zustand (same stores as web!)
- **Firebase**: `@react-native-firebase/firestore`, `@react-native-firebase/auth`
- **Health**: `react-native-health` (iOS), `react-native-google-fit` (Android)

### Step Tracking Pattern
```typescript
// services/HealthKitService.ts
import HealthKit from 'react-native-health';
import firestore from '@react-native-firebase/firestore';

export class HealthKitService {
  async getTodaySteps(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const results = await HealthKit.getDailyStepCountSamples({
      startDate: today.toISOString(),
      endDate: new Date().toISOString(),
    });
    
    return results.reduce((sum, sample) => sum + sample.value, 0);
  }

  async syncToFirebase(userId: string): Promise<void> {
    const steps = await this.getTodaySteps();
    const syncPointsEarned = Math.floor(steps / 100);

    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        todaySteps: steps,
        syncPoints: firestore.FieldValue.increment(syncPointsEarned),
        lastStepSync: firestore.FieldValue.serverTimestamp(),
      });

    console.log(`✅ Synced ${steps} steps → +${syncPointsEarned} SP`);
  }
}
```

### Background Sync (iOS & Android)
```typescript
// iOS: Use BackgroundTasks
import BackgroundFetch from 'react-native-background-fetch';

BackgroundFetch.configure({
  minimumFetchInterval: 60, // minutes
}, async (taskId) => {
  await healthKit.syncToFirebase(userId);
  BackgroundFetch.finish(taskId);
});

// Android: Use WorkManager via react-native-background-actions
```

### Native Screen Structure
```typescript
// screens/FitnessScreen.tsx
export function FitnessScreen() {
  const { steps, syncPoints } = useStepTracking();
  
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="p-4">
        <Text className="text-3xl font-bold text-[#F5C400]">
          {steps.toLocaleString()} steps
        </Text>
        <Text className="text-white">+{syncPoints} Sync Points</Text>
      </View>
    </SafeAreaView>
  );
}
```

---

## 💻 PWA Specific (Web App)

### Tech Stack
- **Framework**: Vite + React
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Firebase**: `firebase/firestore`, `firebase/auth`
- **UI**: Radix UI + shadcn/ui components

### PWA Features
```typescript
// vite.config.ts - Add PWA plugin
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Holobots',
        short_name: 'Holobots',
        description: 'Web3 Fitness Gaming',
        theme_color: '#F5C400',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});
```

### Real-time Step Display
```typescript
// hooks/useRealtimeSteps.ts
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useRealtimeSteps(userId: string) {
  const [todaySteps, setTodaySteps] = useState(0);
  const [syncPoints, setSyncPoints] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const userRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      
      setTodaySteps(data?.todaySteps || 0);
      setSyncPoints(data?.syncPoints || 0);
      
      if (data?.lastStepSync) {
        setLastSync(data.lastStepSync.toDate());
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return { todaySteps, syncPoints, lastSync };
}
```

### Display Mobile-Synced Data
```typescript
// pages/Fitness.tsx
export default function Fitness() {
  const { user } = useAuth();
  const { todaySteps, syncPoints, lastSync } = useRealtimeSteps(user.id);

  return (
    <div className="p-4">
      {todaySteps > 0 && (
        <div className="bg-green-500/20 border border-green-500 p-4 rounded-lg">
          <p className="text-sm text-green-400">
            📱 Synced from Mobile App
          </p>
          <p className="text-4xl font-bold text-white">
            {todaySteps.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">steps today</p>
          {lastSync && (
            <p className="text-xs text-gray-500 mt-2">
              Last synced: {formatDistanceToNow(lastSync)} ago
            </p>
          )}
        </div>
      )}
      
      <div className="mt-4">
        <p className="text-2xl text-[#F5C400]">{syncPoints} Sync Points</p>
        <p className="text-sm text-gray-400">Available for battles</p>
      </div>
    </div>
  );
}
```

---

## 🔄 Bidirectional Sync Patterns

### Data Flow Examples

**Example 1: Mobile → PWA**
```typescript
// Mobile: User walks 10,000 steps
await firestore().collection('users').doc(userId).update({
  todaySteps: 10000,
  syncPoints: increment(100)
});

// PWA: Real-time listener fires instantly
onSnapshot(doc(db, 'users', userId), (snap) => {
  console.log('Steps updated:', snap.data().todaySteps); // 10000
  console.log('Sync Points:', snap.data().syncPoints);   // +100
});
```

**Example 2: PWA → Mobile**
```typescript
// PWA: User spends Sync Points in battle
await updateDoc(doc(db, 'users', userId), {
  syncPoints: increment(-50) // Spend 50 points
});

// Mobile: Real-time listener fires instantly
firestore().collection('users').doc(userId).onSnapshot((snap) => {
  console.log('Sync Points:', snap.data().syncPoints); // -50
});
```

**Example 3: Both → Battles**
```typescript
// Both platforms can initiate battles using same Firebase logic
const battleRef = doc(collection(db, 'battle_rooms'));
await setDoc(battleRef, {
  players: { p1: { uid: userId, holobot: selectedHolobot } },
  status: 'waiting',
  createdAt: serverTimestamp()
});
```

### Conflict Resolution
- Use **serverTimestamp()** for ordering
- Use **increment()** for counters (atomic)
- Use **arrayUnion()/arrayRemove()** for arrays
- For complex conflicts, use **transaction()** or **batch()**

---

## 🎮 Game Logic (Shared)

### Sync Points Calculation
```typescript
// packages/shared/utils/syncPoints.ts
export const SYNC_CONFIG = {
  stepsToSyncPoints: 100,        // 1 SP per 100 steps
  trainingMinutesToSP: 2,        // 2 SP per minute (manual)
  syncTrainingBonus: 1.5,        // 50% bonus for Sync Training
} as const;

export function calculateStepsSyncPoints(steps: number): number {
  return Math.floor(steps / SYNC_CONFIG.stepsToSyncPoints);
}

export function calculateTrainingSyncPoints(minutes: number): number {
  const baseSP = minutes * SYNC_CONFIG.trainingMinutesToSP;
  return Math.floor(baseSP * SYNC_CONFIG.syncTrainingBonus);
}
```

### Battle Logic (Shared)
```typescript
// packages/shared/utils/battleLogic.ts
export function calculateDamage(
  attacker: HolobotStats,
  defender: HolobotStats,
  card: ActionCard
): number {
  const attackMultiplier = attacker.attack / 20;
  const defenseReduction = 30 / (30 + defender.defense);
  return Math.round(card.baseDamage * attackMultiplier * defenseReduction);
}

// Used identically in both PWA and Mobile
```

---

## 🎨 UI and Styling

### PWA (Tailwind CSS)
- Use **Tailwind CSS** for all styling
- Support **dark mode** with `dark:` utilities
- Use **Flexbox** and responsive design
- Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints

### Mobile (NativeWind)
- Use **NativeWind** (Tailwind for React Native)
- Same class names as web (mostly compatible)
- Use `className` prop instead of `style`
- For platform-specific: `Platform.select()`

```typescript
// Works on both platforms!
<View className="flex-1 bg-black p-4">
  <Text className="text-2xl font-bold text-[#F5C400]">
    Holobots
  </Text>
</View>
```

---

## 🔐 Authentication (Shared)

### Firebase Auth Setup
Both platforms use same Firebase Auth:
- Email/Password
- Wallet-based auth (Web3)
- Custom token auth

```typescript
// packages/shared/firebase/auth.ts
export async function signInUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Works on web and mobile!
```

---

## ⚠️ Platform-Specific Considerations

### Mobile Only
- **Permissions**: Request HealthKit/Google Fit access
- **Background**: Handle background sync with native APIs
- **Battery**: Optimize sync frequency to save battery
- **Notifications**: Use `@react-native-firebase/messaging`

### PWA Only
- **Service Workers**: Cache assets for offline use
- **Web3 Wallets**: MetaMask, WalletConnect integration
- **Install Prompt**: Show A2HS (Add to Home Screen)
- **Desktop Layout**: Optimize for larger screens

---

## 🧪 Testing Strategy

### Shared Logic Tests
```typescript
// packages/shared/utils/syncPoints.test.ts
describe('calculateStepsSyncPoints', () => {
  it('converts 10000 steps to 100 SP', () => {
    expect(calculateStepsSyncPoints(10000)).toBe(100);
  });
});
```

### Integration Testing
- Test Firebase sync between simulated platforms
- Test real-time listener updates
- Test offline → online sync recovery

---

## 📊 Performance Optimization

### Mobile
- Use `React.memo` for expensive components
- Use `FlatList` for long lists (not `ScrollView`)
- Optimize images with `react-native-fast-image`
- Batch Firebase updates when possible

### PWA
- Code split routes with `React.lazy()`
- Use Vite's dynamic imports
- Cache Firebase queries with React Query
- Optimize bundle size

---

## 🚀 Deployment

### Mobile App
- **iOS**: TestFlight → App Store
- **Android**: Internal Testing → Play Store
- Use **CodePush** for OTA updates

### PWA
- **Web**: Deploy to Vercel/Netlify
- **Enable HTTPS** (required for PWA)
- **Configure caching** headers

---

## 📝 Development Workflow

### When working on shared logic:
1. Edit in `packages/shared/`
2. Import in both `web` and `mobile`
3. Test on both platforms

### When working on platform-specific:
1. Mobile fitness features → `packages/mobile/`
2. Web battles/marketplace → `packages/web/`
3. Always update Firebase schema in both

---

## 🎯 Key Principles Summary

1. **Firebase is the single source of truth** - all state syncs through Firestore
2. **Real-time everywhere** - use `onSnapshot()` for live updates
3. **Share everything possible** - types, utilities, game logic
4. **Platform strengths** - mobile for fitness, web for complex battles
5. **Atomic updates** - use Firebase's atomic operations
6. **Offline support** - enable persistence on both platforms
7. **Type safety** - strict TypeScript everywhere
8. **Performance** - optimize for mobile constraints

---

## 🔧 Common Patterns

### Sync Pattern Template
```typescript
// 1. Mobile syncs data to Firebase
await firestore().collection('users').doc(userId).update({
  field: newValue,
  timestamp: firestore.FieldValue.serverTimestamp()
});

// 2. PWA listens and updates UI
onSnapshot(doc(db, 'users', userId), (snap) => {
  setField(snap.data()?.field);
});

// 3. Both can modify and see changes instantly
```

### Error Handling
```typescript
try {
  await updateDoc(userRef, updates);
} catch (error) {
  if (error.code === 'permission-denied') {
    // Handle auth error
  } else if (error.code === 'unavailable') {
    // Handle offline error (queue for retry)
  } else {
    // Log unexpected error
    console.error('Firebase error:', error);
  }
}
```

---

## 📚 References

- Firebase Firestore: https://firebase.google.com/docs/firestore
- React Native: https://reactnative.dev/
- NativeWind: https://www.nativewind.dev/
- React Navigation: https://reactnavigation.org/
- Vite PWA: https://vite-pwa-org.netlify.app/

---

**Remember**: Every change to game state must go through Firebase. Both platforms are just views into the same data, synced in real-time. This ensures consistency and enables the magical cross-platform experience where progress flows seamlessly between mobile fitness tracking and web-based battles.
