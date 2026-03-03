# Holobots Cursor Rules

This directory contains development rules and guidelines for the Holobots project.

## 📋 Available Rules

### `pwa-mobile-hybrid.md`
**Comprehensive guide for PWA + Mobile App development**

Topics covered:
- ✅ Architecture overview and platform responsibilities
- ✅ Firebase Firestore real-time sync patterns
- ✅ Mobile app development (React Native + HealthKit/Google Fit)
- ✅ PWA development (Vite + React + Tailwind)
- ✅ Shared code structure and utilities
- ✅ Bidirectional sync patterns
- ✅ Authentication and security
- ✅ Performance optimization
- ✅ Testing strategies
- ✅ Deployment guidelines

## 🎯 When to Use Each Rule

### Use `pwa-mobile-hybrid.md` when:
- Building new features for either platform
- Implementing Firebase sync logic
- Creating shared utilities or types
- Setting up step tracking or fitness features
- Working on real-time battle systems
- Structuring cross-platform code

## 🚀 Quick Start

1. **Read the architecture overview** to understand platform responsibilities
2. **Follow Firebase patterns** for all data operations
3. **Share code** when possible (types, utilities, game logic)
4. **Use platform-specific features** appropriately (HealthKit on mobile, Web3 on PWA)
5. **Test sync** on both platforms for any state changes

## 📚 Key Files to Reference

```
packages/
├── shared/              # Shared TypeScript code
│   ├── types/           # ALL type definitions
│   ├── firebase/        # Firebase config & utilities
│   └── utils/           # Shared game logic
├── web/                 # PWA (current codebase)
└── mobile/              # React Native app (future)
```

## 🔥 Firebase Collections

```typescript
users/{userId}           // Player profiles, holobots, syncPoints, todaySteps
battle_rooms/{roomId}    // Real-time PvP battles
async_battles/{id}       // Async/scheduled battles
battle_pool_entries/{id} // Matchmaking pool
```

## 💡 Core Pattern

```typescript
// Mobile: Sync steps to Firebase
await firestore().collection('users').doc(userId).update({
  todaySteps: 10000,
  syncPoints: increment(100)
});

// PWA: Real-time listener sees changes instantly
onSnapshot(doc(db, 'users', userId), (snap) => {
  console.log('Updated:', snap.data());
});
```

---

For questions or updates, modify the relevant rule file and commit changes to version control.
