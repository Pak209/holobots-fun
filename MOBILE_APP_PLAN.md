# Holobots Mobile App - Implementation Plan

> **📋 See Also:** `.cursor/rules/pwa-mobile-hybrid.md` for complete development guidelines

## 🎯 Goal
Create a React Native mobile app that:
- Auto-tracks steps from HealthKit (iOS) / Google Fit (Android)
- Syncs to Firebase Firestore in real-time
- Shares same backend with PWA (instant bidirectional sync)
- Can also do battles (optional)

## 📚 Documentation
- **Main Rule**: `.cursor/rules/pwa-mobile-hybrid.md` - Comprehensive guide
- **Quick Reference**: `.cursor/rules/QUICK_REFERENCE.md` - Common patterns
- **Architecture**: See diagrams below

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────┐
│          FIREBASE BACKEND (Shared)                  │
│  ┌──────────────────────────────────────────┐      │
│  │  users/{userId}                          │      │
│  │    - syncPoints: number                  │      │
│  │    - todaySteps: number                  │      │
│  │    - lastStepSync: timestamp             │      │
│  │    - holobots: array                     │      │
│  │    - holosTokens: number                 │      │
│  └──────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
           ▲                            ▲
           │ Real-time onSnapshot()    │
           │                            │
     ┌─────┴─────┐              ┌──────┴──────┐
     │           │              │             │
┌────▼─────┐ ┌──▼────────┐ ┌───▼──────┐ ┌────▼─────┐
│   PWA    │ │  Mobile   │ │  PWA     │ │  Mobile  │
│  User A  │ │  User A   │ │  User B  │ │  User B  │
│          │ │           │ │          │ │          │
│ Battles  │◄┤ Steps     ├─┤ Market   ├─┤ Fitness  │
│ Market   │ │ Auto-sync │ │ Battles  │ │ Battles  │
└──────────┘ └───────────┘ └──────────┘ └──────────┘
```

---

## 📦 Project Structure

```
holobots-monorepo/
├── packages/
│   ├── shared/                      # Shared TypeScript code
│   │   ├── src/
│   │   │   ├── types/              # Your existing types/
│   │   │   ├── firebase/           # Firebase config & utils
│   │   │   │   ├── config.ts       # Shared Firebase config
│   │   │   │   ├── firestore.ts    # Firestore helpers
│   │   │   │   └── auth.ts         # Auth helpers
│   │   │   ├── utils/              # Shared utilities
│   │   │   │   ├── syncPoints.ts   # Sync point calculations
│   │   │   │   ├── holobotStats.ts # Holobot stat calculations
│   │   │   │   └── battleLogic.ts  # Battle calculations
│   │   │   └── constants/          # Game constants
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                         # Your existing PWA (Vite + React)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── mobile/                      # New React Native app
│       ├── src/
│       │   ├── screens/            # App screens
│       │   │   ├── FitnessScreen.tsx
│       │   │   ├── BattleScreen.tsx
│       │   │   └── ProfileScreen.tsx
│       │   ├── services/           # Native services
│       │   │   ├── HealthKitService.ts    # iOS step tracking
│       │   │   ├── GoogleFitService.ts    # Android step tracking
│       │   │   └── BackgroundSync.ts      # Background sync
│       │   ├── hooks/              # React hooks
│       │   │   ├── useStepTracking.ts
│       │   │   └── useFirebaseSync.ts
│       │   └── App.tsx
│       ├── ios/
│       ├── android/
│       └── package.json
│
└── package.json                     # Root workspace config
```

---

## 🔧 Implementation Steps

### Phase 1: Set Up Monorepo (Week 1)

1. **Install workspace tools:**
   ```bash
   npm init -w packages/shared -w packages/web -w packages/mobile
   ```

2. **Move existing code to `packages/web/`:**
   ```bash
   # Your current holobots-fun/ becomes packages/web/
   ```

3. **Create `packages/shared/` with common code:**
   - Extract types from `src/types/`
   - Extract Firebase config from `src/lib/firebase.ts`
   - Extract utility functions

### Phase 2: Create React Native App (Week 2)

1. **Initialize React Native:**
   ```bash
   cd packages
   npx react-native@latest init HolobotsMobile --template react-native-template-typescript
   mv HolobotsMobile mobile
   ```

2. **Install Firebase for React Native:**
   ```bash
   cd mobile
   npm install @react-native-firebase/app
   npm install @react-native-firebase/firestore
   npm install @react-native-firebase/auth
   ```

3. **Install Health Tracking:**
   ```bash
   # iOS
   npm install react-native-health
   
   # Android  
   npm install react-native-google-fit
   ```

### Phase 3: Implement Step Tracking (Week 3)

**File: `packages/mobile/src/services/HealthKitService.ts`**

```typescript
import HealthKit, { HealthKitPermissions } from 'react-native-health';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const permissions: HealthKitPermissions = {
  permissions: {
    read: ['StepCount', 'DistanceWalkingRunning'],
  },
};

export class HealthKitService {
  async requestPermissions() {
    try {
      await HealthKit.initHealthKit(permissions);
      console.log('✅ HealthKit permissions granted');
      return true;
    } catch (error) {
      console.error('❌ HealthKit permissions denied:', error);
      return false;
    }
  }

  async getTodaySteps(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const options = {
      startDate: today.toISOString(),
      endDate: new Date().toISOString(),
    };

    try {
      const results = await HealthKit.getDailyStepCountSamples(options);
      
      // Sum all step samples for today
      const totalSteps = results.reduce((sum, sample) => {
        return sum + (sample.value || 0);
      }, 0);

      return Math.floor(totalSteps);
    } catch (error) {
      console.error('Failed to get steps:', error);
      return 0;
    }
  }

  async syncToFirebase(): Promise<void> {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      console.warn('No user logged in');
      return;
    }

    const steps = await this.getTodaySteps();
    
    // Calculate Sync Points (1 SP per 100 steps)
    const syncPointsEarned = Math.floor(steps / 100);

    // Update Firestore (PWA sees this instantly!)
    const userRef = firestore().collection('users').doc(userId);
    
    await userRef.update({
      todaySteps: steps,
      lastStepSync: firestore.FieldValue.serverTimestamp(),
      syncPoints: firestore.FieldValue.increment(syncPointsEarned),
    });

    console.log(`✅ Synced ${steps} steps → +${syncPointsEarned} SP`);
  }

  // Background sync every hour
  startBackgroundSync() {
    setInterval(() => {
      this.syncToFirebase();
    }, 3600000); // 1 hour
  }
}

export const healthKit = new HealthKitService();
```

**File: `packages/mobile/src/hooks/useStepTracking.ts`**

```typescript
import { useState, useEffect } from 'react';
import { healthKit } from '../services/HealthKitService';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export function useStepTracking() {
  const [steps, setSteps] = useState(0);
  const [syncPoints, setSyncPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setup = async () => {
      // 1. Request HealthKit permissions
      await healthKit.requestPermissions();

      // 2. Get initial steps
      const todaySteps = await healthKit.getTodaySteps();
      setSteps(todaySteps);

      // 3. Sync to Firebase
      await healthKit.syncToFirebase();

      // 4. Listen for Firebase changes (real-time!)
      const userId = auth().currentUser?.uid;
      if (userId) {
        unsubscribe = firestore()
          .collection('users')
          .doc(userId)
          .onSnapshot((doc) => {
            const data = doc.data();
            setSteps(data?.todaySteps || 0);
            setSyncPoints(data?.syncPoints || 0);
            setIsLoading(false);
          });
      }

      // 5. Start background sync
      healthKit.startBackgroundSync();
    };

    setup();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const manualSync = async () => {
    await healthKit.syncToFirebase();
  };

  return {
    steps,
    syncPoints,
    isLoading,
    manualSync,
  };
}
```

### Phase 4: Update PWA to Show Mobile Steps (Week 3)

**File: `packages/web/src/hooks/useRealtimeSteps.ts`**

```typescript
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useRealtimeSteps(userId: string) {
  const [todaySteps, setTodaySteps] = useState(0);
  const [syncPoints, setSyncPoints] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const userRef = doc(db, 'users', userId);

    // Real-time listener - updates instantly!
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      
      setTodaySteps(data?.todaySteps || 0);
      setSyncPoints(data?.syncPoints || 0);
      
      if (data?.lastStepSync) {
        setLastSync(data.lastStepSync.toDate());
      }

      console.log('🔄 Steps updated from mobile:', data?.todaySteps);
    });

    return () => unsubscribe();
  }, [userId]);

  return { todaySteps, syncPoints, lastSync };
}
```

**Update your Fitness page to show mobile steps:**

```typescript
// packages/web/src/pages/Fitness.tsx
import { useRealtimeSteps } from '@/hooks/useRealtimeSteps';
import { useAuth } from '@/contexts/auth';

export default function Fitness() {
  const { user } = useAuth();
  const { todaySteps, syncPoints, lastSync } = useRealtimeSteps(user.id);

  return (
    <div className="p-4">
      <h2>Today's Activity</h2>
      
      {/* Show steps synced from mobile app */}
      <div className="bg-green-500/20 p-4 rounded">
        <p className="text-sm text-green-400">Synced from Mobile App</p>
        <p className="text-3xl font-bold">{todaySteps.toLocaleString()}</p>
        <p className="text-sm">steps today</p>
        {lastSync && (
          <p className="text-xs mt-2">
            Last synced: {lastSync.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Show Sync Points */}
      <div className="mt-4">
        <p className="text-2xl">{syncPoints} Sync Points</p>
        <p className="text-sm">Available for battles</p>
      </div>
    </div>
  );
}
```

---

## 🔄 How Bidirectional Sync Works

### Example User Journey:

**Morning (Mobile App):**
```
1. User wakes up, walks 3,000 steps
2. Mobile app auto-syncs to Firebase every hour
3. Firebase updates:
   - todaySteps: 3000
   - syncPoints: +30
```

**Afternoon (PWA on Computer):**
```
4. User opens browser
5. PWA onSnapshot listener fires instantly
6. UI shows: "3,000 steps synced from mobile"
7. User spends 30 Sync Points in a battle
8. Firebase updates:
   - syncPoints: 0 (used in battle)
```

**Evening (Mobile App):**
```
9. User opens mobile app
10. Mobile app onSnapshot listener fires
11. UI shows: "0 Sync Points (used in battle)"
12. User walks 7,000 more steps
13. Firebase updates:
    - todaySteps: 10000
    - syncPoints: +70
```

**Night (PWA):**
```
14. User checks PWA
15. Instantly sees 10,000 steps and 70 SP
16. Enters battle using those points
```

---

## 🚀 Timeline

- **Week 1**: Set up monorepo, extract shared code
- **Week 2**: Initialize React Native app, Firebase integration
- **Week 3**: Implement step tracking, real-time sync
- **Week 4**: Testing, polish, app store prep

---

## 📱 Key Technologies

### Mobile App:
- React Native (same as your Cursor Rule!)
- Firebase SDK for React Native
- react-native-health (iOS)
- react-native-google-fit (Android)
- NativeWind (Tailwind for RN)

### PWA:
- Keep everything as-is
- Add real-time listeners for steps
- Show mobile sync status

---

## 💡 Additional Features

### Mobile App Could Also Have:
- ✅ Quick battles (same logic as PWA)
- ✅ View Holobot collection
- ✅ Daily missions
- ✅ Push notifications for milestones
- ✅ Workout tracking (not just steps)

### Shared Features:
- ✅ Same authentication
- ✅ Same battle system
- ✅ Same marketplace
- ✅ Same progression

---

## 🎯 Benefits

1. **Automatic Step Tracking**: No manual entry needed
2. **Real-time Sync**: Instant updates across all devices
3. **Offline Support**: Both apps work offline, sync when online
4. **One Backend**: Firebase handles everything
5. **Same Codebase**: Shared types, logic, and utilities

---

## 🔐 Security

- Firebase Security Rules ensure users can only update their own data
- Step data verified by native HealthKit/Google Fit APIs
- Same authentication across platforms

---

## Next Steps

Ready to start? I can:
1. Set up the monorepo structure
2. Extract shared code from your PWA
3. Create the React Native app with step tracking
4. Implement real-time Firebase sync

Let me know and I'll begin!
