# Client-Side Matchmaking (No Cloud Functions Required)

## How It Works

Instead of Cloud Functions automatically pairing players, we'll use a client-side approach:

1. Player enters matchmaking → Writes to `battle_pool_entries`
2. Player's app **searches** for other waiting players
3. If found, **first player to find the match** creates the room
4. Both apps listen for room creation
5. Automatic join when room is created

## Changes Needed

### 1. Update `useRealtimeArena` Hook

Replace the matchmaking logic to search and create rooms client-side:

```typescript
// In enterMatchmaking function
const enterMatchmaking = useCallback(async (
  holobotStats: HolobotStats,
  battleType: 'pvp' | 'ranked'
): Promise<void> => {
  if (!user) throw new Error('Must be logged in');
  
  setMatchmakingStatus('searching');
  setError(null);
  
  try {
    // 1. Create pool entry
    const poolEntry: BattlePoolEntry = {
      userId: user.id,
      username: user.username,
      holobotStats,
      battleType,
      isActive: true,
      createdAt: serverTimestamp(),
    };
    
    const poolRef = await addDoc(collection(db, 'battle_pool_entries'), poolEntry);
    poolEntryIdRef.current = poolRef.id;
    
    // 2. Search for opponent
    const searchInterval = setInterval(async () => {
      const poolCollection = collection(db, 'battle_pool_entries');
      const q = query(
        poolCollection,
        where('isActive', '==', true),
        where('userId', '!=', user.id),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        clearInterval(searchInterval);
        
        const opponentDoc = snapshot.docs[0];
        const opponent = opponentDoc.data() as BattlePoolEntry;
        
        // 3. Create battle room
        const roomCode = generateRoomCode();
        const roomRef = doc(collection(db, 'battle_rooms'));
        
        await setDoc(roomRef, {
          roomId: roomRef.id,
          roomCode,
          status: 'active',
          createdAt: serverTimestamp(),
          startedAt: serverTimestamp(),
          currentTurn: 1,
          turnPhase: 'selection',
          currentTurnPlayer: 'p1',
          p1Action: null,
          p2Action: null,
          winner: null,
          actionHistory: [],
          players: {
            p1: {
              uid: user.id,
              username: user.username,
              holobot: holobotStats,
              health: holobotStats.maxHealth || 100,
              maxHealth: holobotStats.maxHealth || 100,
              stamina: 10,
              maxStamina: 10,
              specialMeter: 0,
              isReady: false,
              isConnected: true,
              lastHeartbeat: serverTimestamp(),
              damageDealt: 0,
              damageTaken: 0,
              perfectDefenses: 0,
              combosCompleted: 0,
            },
            p2: {
              uid: opponent.userId,
              username: opponent.username,
              holobot: opponent.holobotStats,
              health: opponent.holobotStats.maxHealth || 100,
              maxHealth: opponent.holobotStats.maxHealth || 100,
              stamina: 10,
              maxStamina: 10,
              specialMeter: 0,
              isReady: false,
              isConnected: true,
              lastHeartbeat: serverTimestamp(),
              damageDealt: 0,
              damageTaken: 0,
              perfectDefenses: 0,
              combosCompleted: 0,
            }
          },
          config: DEFAULT_ROOM_CONFIG,
        });
        
        // 4. Mark pool entries as matched
        await updateDoc(doc(db, 'battle_pool_entries', poolRef.id), {
          isActive: false,
          roomId: roomRef.id
        });
        
        await updateDoc(doc(db, 'battle_pool_entries', opponentDoc.id), {
          isActive: false,
          roomId: roomRef.id
        });
        
        // 5. Join the room
        setMatchmakingStatus('matched');
        setMyRole('p1');
        subscribeToRoom(roomRef.id);
      }
    }, 2000); // Search every 2 seconds
    
    // Also listen for being matched by someone else
    const unsubscribe = onSnapshot(poolRef, (snapshot) => {
      const data = snapshot.data() as BattlePoolEntry;
      if (data.roomId && !data.isActive) {
        clearInterval(searchInterval);
        setMatchmakingStatus('matched');
        joinRoomById(data.roomId, holobotStats);
      }
    });
    
    // Timeout after 60 seconds
    setTimeout(() => {
      clearInterval(searchInterval);
      if (matchmakingStatus === 'searching') {
        setMatchmakingStatus('failed');
        setError('Matchmaking timeout');
        cancelMatchmaking();
      }
    }, 60000);
    
  } catch (err: any) {
    setMatchmakingStatus('failed');
    setError(err.message);
    throw err;
  }
}, [user, joinRoomById, matchmakingStatus, subscribeToRoom]);
```

## Pros & Cons

### Client-Side Matchmaking

**Pros:**
- ✅ 100% FREE (no Blaze plan needed)
- ✅ No Cloud Functions to manage
- ✅ Works immediately
- ✅ No deployment needed

**Cons:**
- ❌ Race condition possible (both players try to create room)
- ❌ More client-side code
- ❌ Slightly less reliable
- ❌ Uses more Firestore reads (searching every 2 seconds)

### Cloud Functions Matchmaking (Blaze Plan)

**Pros:**
- ✅ More reliable (server-side logic)
- ✅ No race conditions
- ✅ Instant matching
- ✅ Cleaner code
- ✅ Still FREE within limits

**Cons:**
- ❌ Requires Blaze plan upgrade
- ❌ Need to deploy functions

## Recommendation

**For production**: Upgrade to Blaze (it's still free!)
**For testing**: Use client-side approach

You can always start with client-side and upgrade to Cloud Functions later without changing the UI!
