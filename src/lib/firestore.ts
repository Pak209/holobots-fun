import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, UserHolobot } from '@/types/user';

export const COLLECTIONS = {
  USERS: 'users',
  BOTS: 'bots',
  BATTLES: 'battles',
  ASYNC_BATTLES: 'async_battles',
  BATTLE_POOL_ENTRIES: 'battle_pool_entries',
} as const;

const DEFAULT_USER_PROFILE = {
  dailyEnergy: 100,
  maxDailyEnergy: 100,
  holosTokens: 0,
  gachaTickets: 0,
  wins: 0,
  losses: 0,
  arenaPassses: 0,
  expBoosters: 0,
  energyRefills: 0,
  rankSkips: 0,
  asyncBattleTickets: 3,
  playerRank: 'Rookie',
  blueprints: {},
  parts: [],
  equippedParts: {},
  holobots: [],
  isDevAccount: false,
  rentalHolobots: [],
};

interface CreateUserProfileData {
  username: string;
  email?: string;
  walletAddress?: string;
}

interface FirestoreUserDocument {
  username: string;
  email?: string;
  walletAddress?: string;
  dailyEnergy: number;
  maxDailyEnergy: number;
  holosTokens: number;
  gachaTickets: number;
  wins: number;
  losses: number;
  arenaPassses: number;
  expBoosters: number;
  energyRefills: number;
  rankSkips: number;
  asyncBattleTickets: number;
  lastAsyncTicketRefresh?: Timestamp;
  playerRank: string;
  blueprints: Record<string, number>;
  parts: any[];
  equippedParts: Record<string, any>;
  holobots: UserHolobot[];
  createdAt: Timestamp;
  lastEnergyRefresh: Timestamp;
  isDevAccount: boolean;
  rentalHolobots?: UserHolobot[]; // seasonal rentals
  syncPoints?: number;
  prestigeCount?: number;
  lastDailyPull?: Timestamp;
  inventory?: Record<string, number>;
  packHistory?: any[];
  rewardSystem?: any;
}

export async function createUserProfile(
  userId: string, 
  data: CreateUserProfileData
): Promise<UserProfile> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  
  const now = Timestamp.now();
  const userData: FirestoreUserDocument = {
    ...DEFAULT_USER_PROFILE,
    username: data.username,
    ...(data.email && { email: data.email }),
    ...(data.walletAddress && { walletAddress: data.walletAddress }),
    createdAt: now,
    lastEnergyRefresh: now,
    lastAsyncTicketRefresh: now,
  };
  
  await setDoc(userRef, userData);
  
  return mapFirestoreToUserProfile(userId, userData);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  return mapFirestoreToUserProfile(userId, userSnap.data() as FirestoreUserDocument);
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const firestoreUpdates: Record<string, any> = {};
  
  if (updates.username !== undefined) firestoreUpdates.username = updates.username;
  if (updates.holosTokens !== undefined) firestoreUpdates.holosTokens = updates.holosTokens;
  if (updates.gachaTickets !== undefined) firestoreUpdates.gachaTickets = updates.gachaTickets;
  if (updates.dailyEnergy !== undefined) firestoreUpdates.dailyEnergy = updates.dailyEnergy;
  if (updates.maxDailyEnergy !== undefined) firestoreUpdates.maxDailyEnergy = updates.maxDailyEnergy;
  if (updates.lastEnergyRefresh !== undefined) {
    firestoreUpdates.lastEnergyRefresh = Timestamp.fromDate(new Date(updates.lastEnergyRefresh));
  }
  if (updates.stats?.wins !== undefined) firestoreUpdates.wins = updates.stats.wins;
  if (updates.stats?.losses !== undefined) firestoreUpdates.losses = updates.stats.losses;
  if (updates.arena_passes !== undefined) firestoreUpdates.arenaPassses = updates.arena_passes;
  if (updates.exp_boosters !== undefined) firestoreUpdates.expBoosters = updates.exp_boosters;
  if (updates.energy_refills !== undefined) firestoreUpdates.energyRefills = updates.energy_refills;
  if (updates.rank_skips !== undefined) firestoreUpdates.rankSkips = updates.rank_skips;
  if (updates.holobots !== undefined) firestoreUpdates.holobots = updates.holobots;
  if (updates.blueprints !== undefined) firestoreUpdates.blueprints = updates.blueprints;
  if (updates.parts !== undefined) firestoreUpdates.parts = updates.parts;
  if (updates.equippedParts !== undefined) firestoreUpdates.equippedParts = updates.equippedParts;
  if (updates.inventory !== undefined) firestoreUpdates.inventory = updates.inventory;
  if (updates.pack_history !== undefined) firestoreUpdates.packHistory = updates.pack_history;
  if (updates.rewardSystem !== undefined) firestoreUpdates.rewardSystem = updates.rewardSystem;
  if (updates.isDevAccount !== undefined) firestoreUpdates.isDevAccount = updates.isDevAccount;
  if (updates.rental_holobots !== undefined) firestoreUpdates.rentalHolobots = updates.rental_holobots;
  if (updates.onboardingPath !== undefined) firestoreUpdates.onboardingPath = updates.onboardingPath;
  
  await updateDoc(userRef, firestoreUpdates);
}

export async function searchPlayers(searchQuery: string, maxResults: number = 10): Promise<UserProfile[]> {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const q = query(
    usersRef,
    where('username', '>=', searchQuery),
    where('username', '<=', searchQuery + '\uf8ff'),
    limit(maxResults)
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => 
    mapFirestoreToUserProfile(doc.id, doc.data() as FirestoreUserDocument)
  );
}

export async function getUserByWalletAddress(walletAddress: string): Promise<UserProfile | null> {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const q = query(
    usersRef,
    where('walletAddress', '==', walletAddress.toLowerCase()),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return mapFirestoreToUserProfile(doc.id, doc.data() as FirestoreUserDocument);
}

function mapFirestoreToUserProfile(userId: string, data: FirestoreUserDocument): UserProfile {
  return {
    id: userId,
    username: data.username,
    holobots: data.holobots || [],
    dailyEnergy: data.dailyEnergy ?? 100,
    maxDailyEnergy: data.maxDailyEnergy ?? 100,
    holosTokens: data.holosTokens ?? 0,
    gachaTickets: data.gachaTickets ?? 0,
    stats: {
      wins: data.wins ?? 0,
      losses: data.losses ?? 0,
    },
    lastEnergyRefresh: data.lastEnergyRefresh?.toDate?.()?.toISOString() || new Date().toISOString(),
    level: 1, // Calculated from other stats
    arena_passes: data.arenaPassses ?? 0,
    exp_boosters: data.expBoosters ?? 0,
    energy_refills: data.energyRefills ?? 0,
    rank_skips: data.rankSkips ?? 0,
    async_battle_tickets: data.asyncBattleTickets ?? 3,
    last_async_ticket_refresh: data.lastAsyncTicketRefresh?.toDate?.()?.toISOString() || new Date().toISOString(),
    blueprints: data.blueprints ?? {},
    inventory: data.inventory ?? { common: 0, rare: 0, legendary: 0 },
    parts: data.parts ?? [],
    equippedParts: data.equippedParts ?? {},
    pack_history: data.packHistory ?? [],
    rewardSystem: data.rewardSystem ?? createInitialRewardSystem(),
    isDevAccount: data.isDevAccount ?? false,
    rental_holobots: data.rentalHolobots ?? [],
    onboardingPath: (data as any).onboardingPath,
  };
}

function createInitialRewardSystem() {
  return {
    dailyMissions: [],
    trainingStreak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      weeklyTicketsEarned: 0,
      lastWeeklyReward: ''
    },
    arenaStreak: {
      currentWinStreak: 0,
      longestWinStreak: 0,
      lastBattleDate: '',
      streakRewardsEarned: 0,
      lastStreakReward: 0
    },
    leagueProgression: {
      currentTier: 'junkyard',
      tiersCompleted: [],
      lastTierCompletedDate: '',
      tierRewardsEarned: 0
    },
    lastDailyMissionReset: new Date().toISOString()
  };
}

interface BattlePoolEntryData {
  poolId: number;
  userId: string;
  holobotName: string;
  holobotStats: any;
  fitnessBonus: Record<string, any>;
  isActive: boolean;
}

export async function createBattlePoolEntry(data: BattlePoolEntryData): Promise<string> {
  const entriesRef = collection(db, COLLECTIONS.BATTLE_POOL_ENTRIES);
  const entryRef = doc(entriesRef);
  
  await setDoc(entryRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  
  return entryRef.id;
}

interface AsyncBattleData {
  battleType: 'pve_league' | 'pvp_pool';
  leagueId?: number;
  poolId?: number;
  player1Id: string;
  player1Holobot: any;
  player2Id: string | null;
  player2Holobot: any;
  battleStatus: 'pending' | 'in_progress' | 'completed';
  rewards: any;
  scheduledAt: string;
}

export async function createAsyncBattle(data: AsyncBattleData): Promise<string> {
  const battlesRef = collection(db, COLLECTIONS.ASYNC_BATTLES);
  const battleRef = doc(battlesRef);
  
  const battleData: any = {
    battleType: data.battleType,
    player1Id: data.player1Id,
    player1Holobot: data.player1Holobot,
    player2Id: data.player2Id,
    player2Holobot: data.player2Holobot,
    battleStatus: data.battleStatus,
    rewards: data.rewards,
    scheduledAt: data.scheduledAt,
    createdAt: serverTimestamp(),
  };
  
  if (data.leagueId !== undefined) battleData.leagueId = data.leagueId;
  if (data.poolId !== undefined) battleData.poolId = data.poolId;
  
  await setDoc(battleRef, battleData);
  
  return battleRef.id;
}

export async function getLeagueBattleCounts(): Promise<Record<number, number>> {
  const battlesRef = collection(db, COLLECTIONS.ASYNC_BATTLES);
  const q = query(
    battlesRef,
    where('battleType', '==', 'pve_league'),
    where('battleStatus', '!=', 'completed')
  );
  
  const querySnapshot = await getDocs(q);
  const counts: Record<number, number> = {};
  
  querySnapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.leagueId) {
      counts[data.leagueId] = (counts[data.leagueId] || 0) + 1;
    }
  });
  
  return counts;
}

export async function updateUserEnergy(userId: string, newEnergy: number): Promise<void> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, { dailyEnergy: newEnergy });
}

export { db };
