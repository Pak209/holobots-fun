import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
  deleteDoc,
  addDoc,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  BattleRoom,
  BattlePoolEntry,
  PlayerAction,
  PlayerRole,
  UseRealtimeArenaResult,
  DEFAULT_ROOM_CONFIG,
  generateRoomCode,
  areBothActionsSubmitted,
  BattleRoomConfig,
  ResolvedTurn,
  AnimationStep,
  ActionOutcome
} from '@/types/battle-room';
import { HolobotStats } from '@/types/holobot';
import { useAuth } from '@/contexts/auth';
import { getUserProfile as getFirestoreUserProfile } from '@/lib/firestore';
import { auth as firebaseAuth } from '@/lib/firebase';

const COLLECTIONS = {
  BATTLE_ROOMS: 'battle_rooms',
  BATTLE_POOL_ENTRIES: 'battle_pool_entries',
} as const;

// Heartbeat interval in milliseconds
const HEARTBEAT_INTERVAL = 5000;
const CONNECTION_TIMEOUT = 15000;

// ============================================================================
// Card Pool System (Arena V2 Style)
// ============================================================================

import type { SimpleActionCard } from '@/types/battle-room';

const generateCardId = () => Math.random().toString(36).substr(2, 9);

// Card pool for drawing (NO FINISHERS HERE - those are drawn when special meter is full)
const CARD_POOL: Omit<SimpleActionCard, 'id'>[] = [
  // Strike cards (40% of pool)
  { name: 'Jab', type: 'strike', staminaCost: 1, baseDamage: 8 },
  { name: 'Cross', type: 'strike', staminaCost: 1, baseDamage: 10 },
  { name: 'Hook', type: 'strike', staminaCost: 1, baseDamage: 12 },
  { name: 'Low Kick', type: 'strike', staminaCost: 1, baseDamage: 9 },
  // Defense cards (20% of pool)
  { name: 'Block', type: 'defense', staminaCost: 0, baseDamage: 0, staminaRestore: 2 },
  { name: 'Retreat', type: 'defense', staminaCost: 0, baseDamage: 0, staminaRestore: 2 },
  // Combo cards (40% of pool - more variety!)
  { name: 'Jab-Cross', type: 'combo', staminaCost: 3, baseDamage: 24 },
  { name: 'One-Two', type: 'combo', staminaCost: 2, baseDamage: 18 },
  { name: 'Rush Combo', type: 'combo', staminaCost: 3, baseDamage: 22 },
  { name: 'Speed Jab', type: 'combo', staminaCost: 2, baseDamage: 16 },
];

// Finisher cards (only drawn when special meter is 100%)
const FINISHER_CARDS: Omit<SimpleActionCard, 'id'>[] = [
  { name: 'FINISHER', type: 'finisher', staminaCost: 6, baseDamage: 80 },
];

// Generate starting hand (7 cards, NO finishers, GUARANTEED 2 defense cards)
const generateStartingHand = (): SimpleActionCard[] => {
  const hand: SimpleActionCard[] = [];
  
  // GUARANTEE 2 defense cards first (like Arena V2!)
  const defenseCards = CARD_POOL.filter(c => c.type === 'defense');
  hand.push({
    id: generateCardId(),
    ...defenseCards[Math.floor(Math.random() * defenseCards.length)],
  });
  hand.push({
    id: generateCardId(),
    ...defenseCards[Math.floor(Math.random() * defenseCards.length)],
  });
  
  // Fill remaining 5 slots with random cards
  for (let i = 0; i < 5; i++) {
    const randomCard = CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)];
    hand.push({
      id: generateCardId(),
      ...randomCard,
    });
  }
  
  return hand;
};

// Draw a card from pool - Finishers can be drawn at ANY time (10% chance)
// This allows players to "save" finishers for when special meter hits 100%
const drawCard = (specialMeter: number, alreadyHasFinisher: boolean = false): SimpleActionCard => {
  // If they already have a finisher, don't draw another one
  if (alreadyHasFinisher) {
    const randomCard = CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)];
    return {
      id: generateCardId(),
      ...randomCard,
    };
  }
  
  // 20% chance to draw a finisher (can be saved for when special meter is ready!)
  const drawFinisher = Math.random() < 0.2;
  
  if (drawFinisher) {
    const finisher = FINISHER_CARDS[0];
    return {
      id: generateCardId(),
      ...finisher,
    };
  }
  
  // Otherwise, draw from normal pool
  const randomCard = CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)];
  return {
    id: generateCardId(),
    ...randomCard,
  };
};

export function useRealtimeArena(): UseRealtimeArenaResult {
  const { user } = useAuth();
  
  // State
  const [room, setRoom] = useState<BattleRoom | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<PlayerRole | null>(null);
  const [matchmakingStatus, setMatchmakingStatus] = useState<'idle' | 'searching' | 'matched' | 'failed'>('idle');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  
  // Refs
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const poolEntryIdRef = useRef<string | null>(null);
  const currentRoomIdRef = useRef<string | null>(null);
  const staminaRegenRef = useRef<NodeJS.Timeout | null>(null);
  
  // Computed values
  const opponentRole: PlayerRole | null = myRole === 'p1' ? 'p2' : myRole === 'p2' ? 'p1' : null;
  const isMyTurn = room && myRole ? room.currentTurnPlayer === myRole : false;
  
  // ============================================================================
  // Cleanup
  // ============================================================================
  
  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (staminaRegenRef.current) {
      clearInterval(staminaRegenRef.current);
      staminaRegenRef.current = null;
    }
    
    setRoom(null);
    setMyRole(null);
    setMatchmakingStatus('idle'); // ✅ Reset matchmaking status when leaving room
    currentRoomIdRef.current = null;
  }, []);
  
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  // ============================================================================
  // Heartbeat System
  // ============================================================================
  
  const sendHeartbeat = useCallback(async () => {
    if (!room || !myRole || !user) return;
    
    try {
      const roomRef = doc(db, COLLECTIONS.BATTLE_ROOMS, room.roomId);
      await updateDoc(roomRef, {
        [`players.${myRole}.lastHeartbeat`]: serverTimestamp(),
        [`players.${myRole}.isConnected`]: true,
      });
    } catch (err) {
      console.error('Failed to send heartbeat:', err);
      setConnectionStatus('reconnecting');
    }
  }, [room, myRole, user]);
  
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, HEARTBEAT_INTERVAL);
    
    // Send initial heartbeat
    sendHeartbeat();
  }, [sendHeartbeat]);
  
  // ============================================================================
  // Stamina Regeneration System
  // ============================================================================
  
  const startStaminaRegen = useCallback((roomId: string, playerRole: PlayerRole) => {
    if (staminaRegenRef.current) {
      clearInterval(staminaRegenRef.current);
    }
    
    staminaRegenRef.current = setInterval(async () => {
      try {
        const roomRef = doc(db, COLLECTIONS.BATTLE_ROOMS, roomId);
        const roomSnap = await getDoc(roomRef);
        
        if (roomSnap.exists()) {
          const roomData = roomSnap.data() as BattleRoom;
          const player = roomData.players[playerRole];
          
          // Regenerate 1 stamina every 2 seconds (up to max)
          if (player.stamina < player.maxStamina) {
            await updateDoc(roomRef, {
              [`players.${playerRole}.stamina`]: Math.min(player.maxStamina, player.stamina + 1)
            });
          }
        }
      } catch (err) {
        console.error('Stamina regen error:', err);
      }
    }, 2000); // Regenerate every 2 seconds
  }, []);
  
  // Start stamina regen when role is set
  useEffect(() => {
    if (room && myRole && currentRoomIdRef.current) {
      startStaminaRegen(currentRoomIdRef.current, myRole);
    }
    
    return () => {
      if (staminaRegenRef.current) {
        clearInterval(staminaRegenRef.current);
        staminaRegenRef.current = null;
      }
    };
  }, [room, myRole, startStaminaRegen]);
  
  // ============================================================================
  // Room Snapshot Listener
  // ============================================================================
  
  const subscribeToRoom = useCallback((roomId: string) => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    
    const roomRef = doc(db, COLLECTIONS.BATTLE_ROOMS, roomId);
    
    unsubscribeRef.current = onSnapshot(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const roomData = snapshot.data() as BattleRoom;
          setRoom({ ...roomData, roomId: snapshot.id });
          setConnectionStatus('connected');
          
          // No turn resolution needed - real-time combat!
        } else {
          setError('Room no longer exists');
          cleanup();
        }
      },
      (err) => {
        console.error('Room snapshot error:', err);
        setError(err.message);
        setConnectionStatus('disconnected');
      }
    );
    
    currentRoomIdRef.current = roomId;
    startHeartbeat();
  }, [cleanup, startHeartbeat]);
  
  // ============================================================================
  // Turn Resolution (State Machine)
  // ============================================================================
  
  const resolveTurn = useCallback(async (roomId: string, roomData: BattleRoom) => {
    if (!roomData.p1Action || !roomData.p2Action) return;
    
    try {
      const roomRef = doc(db, COLLECTIONS.BATTLE_ROOMS, roomId);
      
      // Move to animation phase
      await updateDoc(roomRef, {
        turnPhase: 'animation',
      });
      
      // Calculate outcomes
      const resolution = calculateTurnResolution(roomData);
      
      // Apply damage and state changes
      const p1NewHealth = Math.max(0, roomData.players.p1.health - resolution.p1DamageTaken);
      const p2NewHealth = Math.max(0, roomData.players.p2.health - resolution.p2DamageTaken);
      
      // Check for winner
      let winner: PlayerRole | null = null;
      let newStatus = roomData.status;
      
      if (p1NewHealth <= 0 && p2NewHealth <= 0) {
        winner = null; // Draw
        newStatus = 'completed';
      } else if (p1NewHealth <= 0) {
        winner = 'p2';
        newStatus = 'completed';
      } else if (p2NewHealth <= 0) {
        winner = 'p1';
        newStatus = 'completed';
      }
      
      // Update room with resolution
      const resolvedTurn: ResolvedTurn = {
        turnNumber: roomData.currentTurn,
        p1Action: roomData.p1Action,
        p2Action: roomData.p2Action,
        p1Outcome: resolution.p1Outcome,
        p2Outcome: resolution.p2Outcome,
        p1DamageDealt: resolution.p1DamageDealt,
        p2DamageDealt: resolution.p2DamageDealt,
        p1StaminaChange: resolution.p1StaminaChange,
        p2StaminaChange: resolution.p2StaminaChange,
        p1SpecialMeterChange: resolution.p1SpecialMeterChange,
        p2SpecialMeterChange: resolution.p2SpecialMeterChange,
        animationSequence: resolution.animationSequence,
        timestamp: serverTimestamp(),
      };
      
      // Calculate next turn player (alternate)
      const nextTurnPlayer: PlayerRole = roomData.currentTurnPlayer === 'p1' ? 'p2' : 'p1';
      
      await updateDoc(roomRef, {
        'players.p1.health': p1NewHealth,
        'players.p2.health': p2NewHealth,
        'players.p1.stamina': Math.min(
          roomData.players.p1.maxStamina,
          roomData.players.p1.stamina + resolution.p1StaminaChange
        ),
        'players.p2.stamina': Math.min(
          roomData.players.p2.maxStamina,
          roomData.players.p2.stamina + resolution.p2StaminaChange
        ),
        'players.p1.specialMeter': Math.min(
          100,
          roomData.players.p1.specialMeter + resolution.p1SpecialMeterChange
        ),
        'players.p2.specialMeter': Math.min(
          100,
          roomData.players.p2.specialMeter + resolution.p2SpecialMeterChange
        ),
        'players.p1.damageDealt': roomData.players.p1.damageDealt + resolution.p1DamageDealt,
        'players.p2.damageDealt': roomData.players.p2.damageDealt + resolution.p2DamageDealt,
        'players.p1.damageTaken': roomData.players.p1.damageTaken + resolution.p2DamageDealt,
        'players.p2.damageTaken': roomData.players.p2.damageTaken + resolution.p1DamageDealt,
        actionHistory: [...roomData.actionHistory, resolvedTurn],
        currentTurn: roomData.currentTurn + 1,
        currentTurnPlayer: nextTurnPlayer,
        turnPhase: 'resolution',
        lastActionAt: serverTimestamp(),
        p1Action: null,
        p2Action: null,
        winner,
        status: newStatus,
      });
      
      // After animation duration, move back to selection phase
      setTimeout(async () => {
        if (newStatus !== 'completed') {
          await updateDoc(roomRef, {
            turnPhase: 'selection',
          });
        }
      }, calculateAnimationDuration(resolution.animationSequence));
      
    } catch (err) {
      console.error('Failed to resolve turn:', err);
      setError('Failed to resolve turn');
    }
  }, []);
  
  // ============================================================================
  // Create Room
  // ============================================================================
  
  const createRoom = useCallback(async (
    holobotStats: HolobotStats,
    config?: Partial<BattleRoomConfig>
  ): Promise<string> => {
    if (!user) throw new Error('Must be logged in to create room');
    
    setLoading(true);
    setError(null);
    
    try {
      const roomCode = generateRoomCode();
      const roomRef = doc(collection(db, COLLECTIONS.BATTLE_ROOMS));
      const roomId = roomRef.id;
      
      const p1Hand = generateStartingHand();
      
      const newRoom: BattleRoom = {
        roomId,
        roomCode,
        status: 'waiting',
        players: {
          p1: {
            uid: user.id,
            username: user.username,
            holobot: holobotStats,
            health: holobotStats.maxHealth || 150,
            maxHealth: holobotStats.maxHealth || 150,
            stamina: 7,
            maxStamina: 7,
            specialMeter: 0,
            hand: p1Hand,
            isReady: false,
            isConnected: true,
            lastHeartbeat: serverTimestamp(),
            damageDealt: 0,
            damageTaken: 0,
            perfectDefenses: 0,
            combosCompleted: 0,
          },
          p2: {
            uid: '',
            username: '',
            holobot: {} as HolobotStats,
            health: 0,
            maxHealth: 0,
            stamina: 0,
            maxStamina: 0,
            specialMeter: 0,
            hand: [],
            isReady: false,
            isConnected: false,
            damageDealt: 0,
            damageTaken: 0,
            perfectDefenses: 0,
            combosCompleted: 0,
          },
        },
        currentTurn: 0, // Just for counting actions
        turnPhase: 'selection', // Always in selection (real-time)
        currentTurnPlayer: 'p1', // Not used in real-time
        p1Action: null,
        p2Action: null,
        winner: null,
        actionHistory: [],
        battleLog: [],
        config: { ...DEFAULT_ROOM_CONFIG, ...config },
        createdAt: serverTimestamp(),
      };
      
      await setDoc(roomRef, newRoom);
      
      setMyRole('p1');
      subscribeToRoom(roomId);
      
      return roomCode;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, subscribeToRoom]);
  
  // ============================================================================
  // Join Room by Code
  // ============================================================================
  
  const joinRoom = useCallback(async (
    roomCode: string,
    holobotStats: HolobotStats
  ): Promise<void> => {
    if (!user) throw new Error('Must be logged in to join room');
    
    setLoading(true);
    setError(null);
    
    try {
      // Search for room by code
      const roomsRef = collection(db, COLLECTIONS.BATTLE_ROOMS);
      const q = query(roomsRef, where('roomCode', '==', roomCode.toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Room not found');
      }
      
      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data() as BattleRoom;
      const roomId = roomDoc.id;
      
      if (roomData.status !== 'waiting') {
        throw new Error('Room is not available');
      }
      
      if (roomData.players.p2.uid) {
        throw new Error('Room is already full');
      }
      
      // Join as player 2
      const p2Hand = generateStartingHand();
      
      const roomRef = doc(db, COLLECTIONS.BATTLE_ROOMS, roomId);
      await updateDoc(roomRef, {
        'players.p2': {
          uid: user.id,
          username: user.username,
          holobot: holobotStats,
          health: holobotStats.maxHealth || 150,
          maxHealth: holobotStats.maxHealth || 150,
          stamina: 7,
          maxStamina: 7,
          specialMeter: 0,
          hand: p2Hand,
          isReady: false,
          isConnected: true,
          lastHeartbeat: serverTimestamp(),
          damageDealt: 0,
          damageTaken: 0,
          perfectDefenses: 0,
          combosCompleted: 0,
        },
        status: 'active',
        startedAt: serverTimestamp(),
      });
      
      setMyRole('p2');
      subscribeToRoom(roomId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, subscribeToRoom]);
  
  // ============================================================================
  // Join Room by ID (direct link)
  // ============================================================================
  
  const joinRoomById = useCallback(async (
    roomId: string,
    holobotStats: HolobotStats
  ): Promise<void> => {
    if (!user) throw new Error('Must be logged in to join room');
    
    setLoading(true);
    setError(null);
    
    try {
      const roomRef = doc(db, COLLECTIONS.BATTLE_ROOMS, roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found');
      }
      
      const roomData = roomSnap.data() as BattleRoom;
      
      // Determine role
      if (roomData.players.p1.uid === user.id) {
        setMyRole('p1');
        subscribeToRoom(roomId);
        return;
      }
      
      if (roomData.players.p2.uid === user.id) {
        setMyRole('p2');
        subscribeToRoom(roomId);
        return;
      }
      
      // Join as p2 if available
      if (!roomData.players.p2.uid && roomData.status === 'waiting') {
        const p2Hand = generateStartingHand();
        
        await updateDoc(roomRef, {
          'players.p2': {
            uid: user.id,
            username: user.username,
            holobot: holobotStats,
            health: holobotStats.maxHealth || 150,
            maxHealth: holobotStats.maxHealth || 150,
            stamina: 7,
            maxStamina: 7,
            specialMeter: 0,
            hand: p2Hand,
            isReady: false,
            isConnected: true,
            lastHeartbeat: serverTimestamp(),
            damageDealt: 0,
            damageTaken: 0,
            perfectDefenses: 0,
            combosCompleted: 0,
          },
          status: 'active',
          startedAt: serverTimestamp(),
        });
        
        setMyRole('p2');
        subscribeToRoom(roomId);
      } else {
        throw new Error('Cannot join this room');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, subscribeToRoom]);
  
  // ============================================================================
  // Leave Room
  // ============================================================================
  
  const leaveRoom = useCallback(async (): Promise<void> => {
    if (!room || !myRole) return;
    
    try {
      const roomRef = doc(db, COLLECTIONS.BATTLE_ROOMS, room.roomId);
      
      await updateDoc(roomRef, {
        [`players.${myRole}.isConnected`]: false,
        status: 'abandoned',
      });
      
      cleanup();
      
      // Reload page to refresh user profile with updated rewards
      console.log('[PvP] Reloading page to show updated rewards...');
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to leave room:', err);
      setError(err.message);
    }
  }, [room, myRole, cleanup]);
  
  // ============================================================================
  // Matchmaking
  // ============================================================================
  
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
      
      const poolRef = await addDoc(collection(db, COLLECTIONS.BATTLE_POOL_ENTRIES), poolEntry);
      poolEntryIdRef.current = poolRef.id;
      
      // 2. Listen for being matched by someone else
      const unsubscribePool = onSnapshot(poolRef, (snapshot) => {
        const data = snapshot.data() as BattlePoolEntry;
        
        if (data.roomId && !data.isActive) {
          clearInterval(searchIntervalRef.current!);
          setMatchmakingStatus('matched');
          setMyRole('p2'); // We're player 2 if someone else created the room
          joinRoomById(data.roomId, holobotStats);
          unsubscribePool();
        }
      });
      
      // 3. Search for opponents every 2 seconds
      const searchIntervalRef = { current: null as NodeJS.Timeout | null };
      searchIntervalRef.current = setInterval(async () => {
        try {
          const poolCollection = collection(db, COLLECTIONS.BATTLE_POOL_ENTRIES);
          const q = query(
            poolCollection,
            where('isActive', '==', true),
            where('userId', '!=', user.id),
            limit(1)
          );
          
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            clearInterval(searchIntervalRef.current!);
            unsubscribePool();
            
            const opponentDoc = snapshot.docs[0];
            const opponent = opponentDoc.data() as BattlePoolEntry;
            
            // 4. Create battle room (we're player 1)
            const roomCode = generateRoomCode();
            const roomRef = doc(collection(db, COLLECTIONS.BATTLE_ROOMS));
            const p1Hand = generateStartingHand();
            const p2Hand = generateStartingHand();
            
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
              battleLog: [],
              players: {
                p1: {
                  uid: user.id,
                  username: user.username,
                  holobot: holobotStats,
                  health: holobotStats.maxHealth || 150,
                  maxHealth: holobotStats.maxHealth || 150,
                  stamina: 7,
                  maxStamina: 7,
                  specialMeter: 0,
                  hand: p1Hand,
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
                  health: opponent.holobotStats.maxHealth || 150,
                  maxHealth: opponent.holobotStats.maxHealth || 150,
                  stamina: 7,
                  maxStamina: 7,
                  specialMeter: 0,
                  hand: p2Hand,
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
              lastActionAt: serverTimestamp(),
            });
            
            // 5. Mark both pool entries as matched
            await updateDoc(doc(db, COLLECTIONS.BATTLE_POOL_ENTRIES, poolRef.id), {
              isActive: false,
              roomId: roomRef.id
            });
            
            await updateDoc(doc(db, COLLECTIONS.BATTLE_POOL_ENTRIES, opponentDoc.id), {
              isActive: false,
              roomId: roomRef.id
            });
            
            // 6. Join the room as player 1
            setMatchmakingStatus('matched');
            setMyRole('p1');
            subscribeToRoom(roomRef.id);
          }
        } catch (err) {
          console.error('Matchmaking search error:', err);
        }
      }, 2000); // Search every 2 seconds
      
      // Timeout after 60 seconds
      setTimeout(() => {
        if (searchIntervalRef.current) {
          clearInterval(searchIntervalRef.current);
        }
        if (matchmakingStatus === 'searching') {
          setMatchmakingStatus('failed');
          setError('Matchmaking timeout - no opponents found');
          cancelMatchmaking();
        }
      }, 60000);
      
    } catch (err: any) {
      setMatchmakingStatus('failed');
      setError(err.message);
      throw err;
    }
  }, [user, joinRoomById, matchmakingStatus, subscribeToRoom]);
  
  const cancelMatchmaking = useCallback(async (): Promise<void> => {
    if (!poolEntryIdRef.current) return;
    
    try {
      const poolRef = doc(db, COLLECTIONS.BATTLE_POOL_ENTRIES, poolEntryIdRef.current);
      await deleteDoc(poolRef);
      poolEntryIdRef.current = null;
      setMatchmakingStatus('idle');
    } catch (err: any) {
      console.error('Failed to cancel matchmaking:', err);
    }
  }, []);
  
  // ============================================================================
  // Play Action
  // ============================================================================
  
  const playAction = useCallback(async (cardId: string): Promise<void> => {
    if (!room || !myRole || !user) {
      throw new Error('Cannot play action: not in a room');
    }
    
    try {
      const roomRef = doc(db, COLLECTIONS.BATTLE_ROOMS, room.roomId);
      
      // Read FRESH state from Firebase before updating (prevents race conditions)
      const freshRoomSnap = await getDoc(roomRef);
      if (!freshRoomSnap.exists()) {
        throw new Error('Room no longer exists');
      }
      
      const freshRoom = freshRoomSnap.data() as BattleRoom;
      const myPlayer = freshRoom.players[myRole];
      const opponentRole: PlayerRole = myRole === 'p1' ? 'p2' : 'p1';
      const opponent = freshRoom.players[opponentRole];
      
      // Find the card in hand
      const card = myPlayer.hand.find(c => c.id === cardId);
      if (!card) {
        throw new Error('Card not found in hand!');
      }
      
      // Check stamina cost
      if (myPlayer.stamina < card.staminaCost) {
        throw new Error('Not enough stamina!');
      }
      
      // Check if finisher requires 100% special meter
      if (card.type === 'finisher' && myPlayer.specialMeter < 100) {
        throw new Error('Special meter not full!');
      }
      
      // CHECK ATTACK COOLDOWN: Did I just use defense? Can't attack yet!
      if (card.type !== 'defense' && myPlayer.defenseActive && myPlayer.defendedAt) {
        const timeSinceDefense = Date.now() - myPlayer.defendedAt;
        const COOLDOWN_MS = 2000; // 2 second attack cooldown
        
        if (timeSinceDefense < COOLDOWN_MS) {
          const remainingMs = COOLDOWN_MS - timeSinceDefense;
          throw new Error(`Still in defensive stance! Wait ${(remainingMs / 1000).toFixed(1)}s`);
        }
      }
      
      let damageDealt = 0;
      let staminaChange = 0;
      let logMessage = '';
      let perfectEvade = false; // Track if perfect evade occurred
      
      // DEFENSE CARDS: Restore stamina + COUNTER/EVADE system!
      if (card.type === 'defense') {
        staminaChange = card.staminaRestore || 2;
        
        // TACTICAL DEFENSE SYSTEM: Speed + INT vs Attack + Speed
        // High Speed + High INT (veteran Holobots) can counter or evade!
        const defenderSpeed = myPlayer.holobot.speed || 10;
        const defenderINT = myPlayer.holobot.intelligence || 5;
        const attackerATK = opponent.holobot.attack || 20;
        const attackerSpeed = opponent.holobot.speed || 10;
        
        // Defender Score: Speed × 3 + INT × 4 (INT is the secret sauce!)
        // Attacker Score: Attack × 2 + Speed × 2
        const defenderScore = (defenderSpeed * 3) + (defenderINT * 4);
        const attackerScore = (attackerATK * 2) + (attackerSpeed * 2);
        
        console.log('[Defense] Tactical Check:', {
          defender: { speed: defenderSpeed, int: defenderINT, score: defenderScore },
          attacker: { atk: attackerATK, speed: attackerSpeed, score: attackerScore }
        });
        
        // If defender has advantage, chance for COUNTER or EVADE
        if (defenderScore > attackerScore) {
          const scoreDiff = defenderScore - attackerScore;
          const counterChance = Math.min(75, scoreDiff / 2); // Max 75% chance
          const roll = Math.random() * 100;
          
          console.log(`[Defense] Counter chance: ${counterChance.toFixed(1)}%, rolled: ${roll.toFixed(1)}`);
          
          if (roll < counterChance) {
            // 50/50 chance: Counter Attack or Perfect Evade
            const isCounter = Math.random() < 0.5;
            
            if (isCounter) {
              // COUNTER ATTACK! Deal damage back
              const counterDamage = Math.round(15 * (defenderSpeed / 20));
              damageDealt = counterDamage; // Damage to opponent!
              staminaChange += 1; // Bonus stamina for successful counter
              logMessage = `${myPlayer.username} COUNTER ATTACKED! (${counterDamage} dmg, +${staminaChange} stamina)`;
              console.log('[Defense] 🥊 COUNTER ATTACK!');
            } else {
              // PERFECT EVADE! Extra stamina + special meter boost
              perfectEvade = true;
              staminaChange += 2; // Extra stamina restore
              logMessage = `${myPlayer.username} PERFECT EVADE! (+${staminaChange} stamina, +10% special)`;
              console.log('[Defense] 🌪️ PERFECT EVADE!');
            }
          } else {
            logMessage = `${myPlayer.username} used ${card.name} (+${staminaChange} stamina)`;
          }
        } else {
          // Normal defense (no tactical advantage)
          logMessage = `${myPlayer.username} used ${card.name} (+${staminaChange} stamina)`;
        }
      }
      // ATTACK CARDS (Strike/Combo): Cost stamina, deal damage
      else if (card.type === 'strike' || card.type === 'combo') {
        staminaChange = -card.staminaCost;
        
        // NEW FORMULA: Much more aggressive scaling!
        // baseDamage × (ATK / 20) × (30 / (30 + DEF))
        const attackMultiplier = (myPlayer.holobot.attack || 20) / 20;
        const defenseReduction = 30 / (30 + (opponent.holobot.defense || 10));
        let calculatedDamage = card.baseDamage * attackMultiplier * defenseReduction;
        
        // DEFENSIVE STANCE: Reduce damage if opponent is defending!
        if (opponent.defenseActive && opponent.defendedAt) {
          const timeSinceDefense = Date.now() - opponent.defendedAt;
          const STANCE_DURATION = 3000; // 3 seconds
          
          if (timeSinceDefense < STANCE_DURATION) {
            const opponentDEF = opponent.holobot.defense || 10;
            // Defense reduction: up to 70% based on DEF stat
            // Formula: min(70%, DEF / 50)
            const stanceReduction = Math.min(0.70, opponentDEF / 50);
            calculatedDamage *= (1 - stanceReduction);
            
            console.log(`[Defense Stance] Damage reduced by ${(stanceReduction * 100).toFixed(0)}% (DEF: ${opponentDEF})`);
            logMessage = `${myPlayer.username} used ${card.name} (${Math.round(calculatedDamage)} dmg) - BLOCKED!`;
          } else {
            logMessage = `${myPlayer.username} used ${card.name} (${Math.round(calculatedDamage)} dmg)`;
          }
        } else {
          logMessage = `${myPlayer.username} used ${card.name} (${Math.round(calculatedDamage)} dmg)`;
        }
        
        damageDealt = Math.round(calculatedDamage);
      }
      // FINISHER CARDS: Cost stamina, deal massive damage
      else if (card.type === 'finisher') {
        staminaChange = -card.staminaCost;
        
        // Finishers get 2x multiplier!
        const attackMultiplier = (myPlayer.holobot.attack || 20) / 20;
        const defenseReduction = 30 / (30 + (opponent.holobot.defense || 10));
        let calculatedDamage = card.baseDamage * attackMultiplier * defenseReduction * 2.0;
        
        // DEFENSIVE STANCE: Reduce damage if opponent is defending!
        if (opponent.defenseActive && opponent.defendedAt) {
          const timeSinceDefense = Date.now() - opponent.defendedAt;
          const STANCE_DURATION = 3000; // 3 seconds
          
          if (timeSinceDefense < STANCE_DURATION) {
            const opponentDEF = opponent.holobot.defense || 10;
            // Defense reduction: up to 70% based on DEF stat
            const stanceReduction = Math.min(0.70, opponentDEF / 50);
            calculatedDamage *= (1 - stanceReduction);
            
            console.log(`[Defense Stance] Finisher reduced by ${(stanceReduction * 100).toFixed(0)}% (DEF: ${opponentDEF})`);
            logMessage = `${myPlayer.username} used ${card.name}! (${Math.round(calculatedDamage)} dmg) - BLOCKED!`;
          } else {
            logMessage = `${myPlayer.username} used ${card.name}! (${Math.round(calculatedDamage)} dmg)`;
          }
        } else {
          logMessage = `${myPlayer.username} used ${card.name}! (${Math.round(calculatedDamage)} dmg)`;
        }
        
        damageDealt = Math.round(calculatedDamage);
      }
      
      // Remove card from hand and draw new one (Arena V2 style!)
      const newHand = myPlayer.hand.filter(c => c.id !== cardId);
      
      // Special meter gain based on action type
      let specialMeterGain = 0;
      if (card.type === 'finisher') {
        specialMeterGain = -100; // Reset to 0%
      } else if (card.type === 'combo') {
        specialMeterGain = 15; // Combos give MORE meter (high risk/reward!)
      } else if (card.type === 'strike') {
        specialMeterGain = 10; // Normal attacks
      } else if (card.type === 'defense') {
        specialMeterGain = perfectEvade ? 15 : 5; // Perfect evade gives 15%, normal defense gives 5%
      }
      
      const newSpecialMeter = Math.max(0, Math.min(100, myPlayer.specialMeter + specialMeterGain));
      
      // Check if player already has a finisher in hand (max 1 finisher at a time)
      const hasFinisher = newHand.some(c => c.type === 'finisher');
      const newCard = drawCard(newSpecialMeter, hasFinisher);
      newHand.push(newCard);
      
      // Apply changes
      const newOpponentHealth = Math.max(0, opponent.health - damageDealt);
      const newMyStamina = Math.max(0, Math.min(myPlayer.maxStamina, myPlayer.stamina + staminaChange));
      
      // Check for winner
      let winner: PlayerRole | null = null;
      let newStatus = freshRoom.status;
      if (newOpponentHealth <= 0) {
        winner = myRole;
        newStatus = 'completed';
      }
      
      // Create battle log entry
      const newLogEntry = {
        turnNumber: freshRoom.currentTurn + 1,
        message: logMessage,
        timestamp: Date.now(),
      };
      
      // Prepare update object
      const updateData: any = {
        [`players.${myRole}.hand`]: newHand,
        [`players.${myRole}.stamina`]: newMyStamina,
        [`players.${myRole}.specialMeter`]: newSpecialMeter,
        [`players.${myRole}.damageDealt`]: myPlayer.damageDealt + damageDealt,
        [`players.${opponentRole}.health`]: newOpponentHealth,
        [`players.${opponentRole}.damageTaken`]: opponent.damageTaken + damageDealt,
        battleLog: [...(freshRoom.battleLog || []), newLogEntry],
        currentTurn: freshRoom.currentTurn + 1,
        lastActionAt: serverTimestamp(),
        winner,
        status: newStatus,
      };
      
      // DEFENSIVE STANCE SYSTEM:
      // 1. If defense card used → Activate defensive stance (locks you from attacking for 2s)
      // 2. If attack card used → You can attack again (clears your own stance)
      if (card.type === 'defense') {
        // Activate defensive stance:
        // - 2 seconds: Can't attack (committed to defense)
        // - 3 seconds: Damage reduction when attacked
        updateData[`players.${myRole}.defenseActive`] = true;
        updateData[`players.${myRole}.defendedAt`] = Date.now();
        console.log(`[Defense Stance] ${myPlayer.username} activated defensive stance! (Can't attack for 2s)`);
      } else if (card.type === 'strike' || card.type === 'combo' || card.type === 'finisher') {
        // Clear your own defensive stance when you attack (you're now on offense)
        updateData[`players.${myRole}.defenseActive`] = false;
        if (myPlayer.defenseActive) {
          console.log(`[Defense Stance] ${myPlayer.username} exited defensive stance to attack!`);
        }
      }
      
      // Apply all updates atomically
      await updateDoc(roomRef, updateData);
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [room, myRole, user]);
  
  // ============================================================================
  // Set Ready
  // ============================================================================
  
  const setReady = useCallback(async (ready: boolean): Promise<void> => {
    if (!room || !myRole) return;
    
    try {
      const roomRef = doc(db, COLLECTIONS.BATTLE_ROOMS, room.roomId);
      await updateDoc(roomRef, {
        [`players.${myRole}.isReady`]: ready,
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [room, myRole]);
  
  // ============================================================================
  // Save Winner Rewards (Arena V2 Style)
  // ============================================================================
  
  // Save Loser Stats (track losses per Holobot for INT calculation)
  const saveLoserStats = useCallback(async (
    loserUid: string,
    loserHolobotName: string
  ): Promise<void> => {
    try {
      const loserRef = doc(db, 'users', loserUid);
      const loserSnap = await getDoc(loserRef);
      
      if (!loserSnap.exists()) {
        console.error('[PvP] Loser document not found:', loserUid);
        return;
      }
      
      const loserData = loserSnap.data();
      const holobots = loserData?.holobots || [];
      
      // Update the losing Holobot's pvpLosses
      const updatedHolobots = holobots.map((bot: any) => {
        if (bot.name === loserHolobotName) {
          return {
            ...bot,
            pvpLosses: (bot.pvpLosses || 0) + 1,
          };
        }
        return bot;
      });
      
      await updateDoc(loserRef, {
        holobots: updatedHolobots,
      });
      
      console.log(`[PvP] ${loserHolobotName} losses updated for ${loserUid}`);
    } catch (err) {
      console.error('[PvP] Error saving loser stats:', err);
    }
  }, []);
  
  const saveWinnerRewards = useCallback(async (
    winnerRole: PlayerRole,
    battleRoom: BattleRoom,
    userId: string
  ): Promise<void> => {
    try {
      const winner = battleRoom.players[winnerRole];
      const loserRole: PlayerRole = winnerRole === 'p1' ? 'p2' : 'p1';
      const loser = battleRoom.players[loserRole];
      
      // Save loser stats asynchronously (don't wait for it)
      saveLoserStats(loser.uid, loser.holobot.name).catch(err => 
        console.error('[PvP] Failed to save loser stats:', err)
      );
      
      // Calculate rewards (Arena V2 style)
      const baseExp = 150;
      const baseGachaTickets = 5; // Give 5 gacha tickets (booster packs!)
      const baseArenaPasses = 3; // Give 3 arena passes (tickets to play!)
      const baseHolos = 100;
      
      // Performance bonuses
      const perfectDefenseBonus = winner.perfectDefenses * 20;
      const comboBonus = winner.combosCompleted * 30;
      const speedBonus = battleRoom.currentTurn < 30 ? 50 : 0;
      
      const totalExp = baseExp + perfectDefenseBonus + comboBonus + speedBonus;
      const totalGachaTickets = baseGachaTickets;
      const totalArenaPasses = baseArenaPasses;
      const totalHolos = baseHolos;
      
      // Read current user data first
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.error('[PvP Rewards] User document not found');
        return;
      }
      
      const userData = userSnap.data();
      const currentPvpWins = userData?.pvpWins || 0;
      const currentHolos = userData?.holosTokens || 0;
      const currentArenaPasses = userData?.arenaPassses || 0; // Note: double 's' is correct!
      const currentGachaTickets = userData?.gachaTickets || 0;
      
      // Get Firebase Auth UID to verify match
      const firebaseAuthUid = firebaseAuth.currentUser?.uid;
      
      console.log('[PvP Rewards] Current Firebase values:', {
        currentHolos,
        currentArenaPasses,
        currentPvpWins,
        providedUserId: userId,
        firebaseAuthUid: firebaseAuthUid,
        idsMatch: userId === firebaseAuthUid
      });
      
      // CRITICAL: Verify user ID matches Firebase Auth UID and use the correct one
      const correctUserId = firebaseAuthUid || userId;
      const correctUserRef = userId === firebaseAuthUid ? userRef : doc(db, 'users', correctUserId);
      
      if (userId !== firebaseAuthUid) {
        console.warn('[PvP Rewards] ⚠️ USER ID MISMATCH! Using Firebase Auth UID.', {
          providedUserId: userId,
          firebaseAuthUid: firebaseAuthUid,
          usingId: correctUserId
        });
      }
      
      const newHolosTotal = currentHolos + totalHolos;
      const newArenaPassesTotal = currentArenaPasses + totalArenaPasses;
      const newGachaTicketsTotal = currentGachaTickets + totalGachaTickets;
      
      // Update Holobot-specific PvP stats (for intelligence calculation!)
      const holobots = userData?.holobots || [];
      const winnerHolobotName = winner.holobot.name;
      
      // Find the winner's holobot to calculate level
      const winnerBot = holobots.find((bot: any) => bot.name === winnerHolobotName);
      
      if (!winnerBot) {
        console.error('[PvP Rewards] ❌ Winner holobot not found in user collection!', winnerHolobotName);
        return;
      }
      
      // Calculate new experience and level (same as training and Arena V2)
      const currentExperience = winnerBot.experience || 0;
      const newExperience = currentExperience + totalExp;
      const nextLevelExp = winnerBot.nextLevelExp || 100;
      const currentLevel = winnerBot.level || 1;
      
      // Calculate new level
      let newLevel = currentLevel;
      let tempExp = newExperience;
      let tempNextExp = nextLevelExp;
      
      while (tempExp >= tempNextExp) {
        newLevel += 1;
        tempNextExp = Math.floor(100 * Math.pow(newLevel, 2)); // Base XP formula
      }
      
      console.log('[PvP Rewards] XP Update:', {
        holobot: winnerHolobotName,
        currentExp: currentExperience,
        expGained: totalExp,
        newExp: newExperience,
        currentLevel,
        newLevel,
        leveledUp: newLevel > currentLevel,
        nextLevelExp: tempNextExp
      });
      
      // Use the same helper function as training and Arena V2!
      const { updateHolobotExperience } = await import('@/lib/firebase');
      let updatedHolobots = updateHolobotExperience(
        holobots,
        winnerHolobotName,
        newExperience,
        newLevel
      );
      
      // Then update PvP wins separately
      updatedHolobots = updatedHolobots.map((bot: any) => {
        if (bot.name === winnerHolobotName) {
          return {
            ...bot,
            pvpWins: (bot.pvpWins || 0) + 1,
          };
        }
        return bot;
      });
      
      console.log(`[PvP Rewards] ${winnerHolobotName} updated:`, {
        oldWins: holobots.find((b: any) => b.name === winnerHolobotName)?.pvpWins || 0,
        newWins: updatedHolobots.find((b: any) => b.name === winnerHolobotName)?.pvpWins,
        oldExp: holobots.find((b: any) => b.name === winnerHolobotName)?.experience || 0,
        newExp: updatedHolobots.find((b: any) => b.name === winnerHolobotName)?.experience
      });
      
      // Save to user's document in Firebase - ROOT level fields (not nested!)
      // ALWAYS use Firebase Auth UID for security
      try {
        await updateDoc(correctUserRef, {
          pvpWins: currentPvpWins + 1,
          holobots: updatedHolobots, // Update holobot-specific wins!
          holosTokens: newHolosTotal,
          arenaPassses: newArenaPassesTotal,
          gachaTickets: newGachaTicketsTotal,
          lastPvpReward: {
            exp: totalExp,
            gachaTickets: totalGachaTickets,
            arenaPasses: totalArenaPasses,
            holos: totalHolos,
            perfectDefenseBonus,
            comboBonus,
            speedBonus,
            timestamp: Date.now(),
          },
        });
        
        console.log('[PvP Rewards] ✅ Successfully saved to Firebase:', {
          usedUserId: correctUserId,
          firebaseAuthUid: firebaseAuthUid,
          providedUserId: userId,
          exp: totalExp,
          holos: totalHolos,
          gachaTickets: totalGachaTickets,
          arenaPasses: totalArenaPasses,
          newFirebaseValues: {
            holosTokens: newHolosTotal,
            gachaTickets: newGachaTicketsTotal,
            arenaPassses: newArenaPassesTotal,
            pvpWins: currentPvpWins + 1
          }
        });
        
        // Verify the write by reading it back
        const verifySnap = await getDoc(correctUserRef);
        if (verifySnap.exists()) {
          const verifiedData = verifySnap.data();
          console.log('[PvP Rewards] ✅ VERIFIED - Read back from Firebase:', {
            holosTokens: verifiedData.holosTokens,
            gachaTickets: verifiedData.gachaTickets,
            arenaPassses: verifiedData.arenaPassses,
            pvpWins: verifiedData.pvpWins
          });
        }
        
      } catch (writeError) {
        console.error('[PvP Rewards] ❌ FAILED to write to Firebase:', writeError);
        console.error('[PvP Rewards] Details:', {
          providedUserId: userId,
          firebaseAuthUid: firebaseAuthUid,
          usedUserId: correctUserId
        });
        console.error('[PvP Rewards] Values attempted:', {
          holosTokens: newHolosTotal,
          arenaPassses: newArenaPassesTotal
        });
        throw writeError; // Re-throw to be caught by outer catch
      }
      
      // Don't auto-reload - let user see victory screen and click "Return to Lobby"
      // The auth context will refresh user data on next navigation
      console.log('[PvP] ✅ Rewards saved! Victory screen will remain visible.');
      
    } catch (err) {
      console.error('[PvP Rewards] Failed to save:', err);
    }
  }, []);
  
  // Monitor for battle completion and save rewards
  useEffect(() => {
    if (room && room.status === 'completed' && room.winner && myRole && user) {
      const didWin = room.winner === myRole;
      
      if (didWin) {
        // Save rewards for winner
        saveWinnerRewards(room.winner, room, user.id);
      }
    }
  }, [room?.status, room?.winner, myRole, user, saveWinnerRewards]);
  
  // ============================================================================
  // Return Hook Result
  // ============================================================================
  
  return {
    room,
    loading,
    error,
    myRole,
    opponentRole,
    isMyTurn,
    createRoom,
    joinRoom,
    joinRoomById,
    leaveRoom,
    enterMatchmaking,
    cancelMatchmaking,
    matchmakingStatus,
    playAction,
    setReady,
    connectionStatus,
    sendHeartbeat,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateTurnResolution(room: BattleRoom): {
  p1Outcome: ActionOutcome;
  p2Outcome: ActionOutcome;
  p1DamageDealt: number;
  p2DamageDealt: number;
  p1DamageTaken: number;
  p2DamageTaken: number;
  p1StaminaChange: number;
  p2StaminaChange: number;
  p1SpecialMeterChange: number;
  p2SpecialMeterChange: number;
  animationSequence: AnimationStep[];
} {
  const p1Action = room.p1Action!;
  const p2Action = room.p2Action!;
  
  // Simple resolution logic (can be expanded)
  let p1DamageDealt = 0;
  let p2DamageDealt = 0;
  let p1StaminaChange = 2; // Regenerate stamina each turn
  let p2StaminaChange = 2;
  let p1SpecialMeterChange = 5;
  let p2SpecialMeterChange = 5;
  
  const animationSequence: AnimationStep[] = [];
  
  // Calculate damage based on action types
  if (p1Action.actionType === 'attack' && p2Action.actionType !== 'defense') {
    p1DamageDealt = p1Action.card?.baseDamage || room.players.p1.holobot.attack || 10;
    animationSequence.push({
      id: `${Date.now()}-p1-attack`,
      type: 'attack',
      actorRole: 'p1',
      targetRole: 'p2',
      animationId: p1Action.card?.animationId || 'basic-attack',
      duration: 800,
    });
  }
  
  if (p2Action.actionType === 'attack' && p1Action.actionType !== 'defense') {
    p2DamageDealt = p2Action.card?.baseDamage || room.players.p2.holobot.attack || 10;
    animationSequence.push({
      id: `${Date.now()}-p2-attack`,
      type: 'attack',
      actorRole: 'p2',
      targetRole: 'p1',
      animationId: p2Action.card?.animationId || 'basic-attack',
      duration: 800,
    });
  }
  
  // Defense reduces damage by 50%
  if (p1Action.actionType === 'defense') {
    p2DamageDealt = Math.floor(p2DamageDealt * 0.5);
    p1SpecialMeterChange += 10; // Bonus for successful defense
  }
  
  if (p2Action.actionType === 'defense') {
    p1DamageDealt = Math.floor(p1DamageDealt * 0.5);
    p2SpecialMeterChange += 10;
  }
  
  const p1Outcome: ActionOutcome = {
    result: p1DamageDealt > 0 ? 'hit' : p1Action.actionType === 'defense' ? 'blocked' : 'missed',
    damageDealt: p1DamageDealt,
    effectsApplied: [],
    wasCountered: false,
    triggeredCombo: false,
  };
  
  const p2Outcome: ActionOutcome = {
    result: p2DamageDealt > 0 ? 'hit' : p2Action.actionType === 'defense' ? 'blocked' : 'missed',
    damageDealt: p2DamageDealt,
    effectsApplied: [],
    wasCountered: false,
    triggeredCombo: false,
  };
  
  return {
    p1Outcome,
    p2Outcome,
    p1DamageDealt,
    p2DamageDealt,
    p1DamageTaken: p2DamageDealt,
    p2DamageTaken: p1DamageDealt,
    p1StaminaChange,
    p2StaminaChange,
    p1SpecialMeterChange,
    p2SpecialMeterChange,
    animationSequence,
  };
}

function calculateAnimationDuration(animations: AnimationStep[]): number {
  return animations.reduce((total, anim) => total + anim.duration, 0) || 1500;
}
