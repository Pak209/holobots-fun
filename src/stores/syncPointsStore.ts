import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  SyncPointsEntry, 
  SyncPointsStats, 
  AttributeUpgrade,
  SpecialAttackUnlock,
  AbilityChipUnlock,
  SyncBond,
  DEFAULT_SYNC_CONFIG,
  calculateAttributeUpgradeCost,
  calculateSyncBondLevel,
  calculateXHolosWeight,
} from '@/types/syncPoints';
import { useRewardStore } from './rewardStore';

interface SyncPointsStore {
  entries: SyncPointsEntry[];
  stats: SyncPointsStats;
  attributeUpgrades: AttributeUpgrade[];
  specialAttacks: SpecialAttackUnlock[];
  abilityChips: AbilityChipUnlock[];
  syncBonds: Record<string, SyncBond>; // holobotId -> SyncBond
  isLoading: boolean;
  
  // Earning Actions
  addStepsEntry: (steps: number) => void;
  addSyncTrainingEntry: (minutes: number, holobotId?: string) => void;
  addMissionBonus: (syncPoints: number) => void;
  
  // Spending Actions
  upgradeAttribute: (holobotId: string, attribute: 'hp' | 'attack' | 'speed' | 'defense' | 'special') => boolean;
  unlockSpecialAttack: (attackId: string) => boolean;
  unlockAbilityChip: (chipId: string, tierLevel: number) => boolean;
  
  // Reward Actions
  canClaimWeeklyReward: () => boolean;
  canClaimStreakReward: () => boolean;
  claimWeeklyReward: () => number; // Returns tickets earned
  claimStreakReward: () => number; // Returns tickets earned
  
  // Utility Actions
  calculateStats: () => void;
  resetAllData: () => void;
  getHolobotSyncBond: (holobotId: string) => SyncBond;
  getAvailableSyncPoints: () => number;
  getHolobotAttributeLevel: (holobotId: string, attribute: string) => number;
  canAffordUpgrade: (cost: number) => boolean;
}

const calculateSyncPoints = (
  steps: number = 0, 
  syncTrainingMinutes: number = 0, 
  streak: number = 0,
  activityType: 'steps' | 'sync_training' | 'mission_bonus' = 'steps'
): number => {
  let baseSyncPoints = 0;
  
  if (activityType === 'steps') {
    if (steps < DEFAULT_SYNC_CONFIG.minimumStepsForReward) return 0;
    baseSyncPoints = Math.floor(steps / DEFAULT_SYNC_CONFIG.stepsPerSyncPoint);
  } else if (activityType === 'sync_training') {
    baseSyncPoints = Math.floor(syncTrainingMinutes * DEFAULT_SYNC_CONFIG.syncTrainingPointsPerMinute);
    // Apply Sync Training bonus
    baseSyncPoints = Math.floor(baseSyncPoints * DEFAULT_SYNC_CONFIG.bonusMultipliers.syncTrainingBonus);
  }
  
  // Apply streak multiplier
  const streakIndex = Math.min(streak - 1, DEFAULT_SYNC_CONFIG.bonusMultipliers.streak.length - 1);
  const streakMultiplier = streak > 0 ? DEFAULT_SYNC_CONFIG.bonusMultipliers.streak[streakIndex] : 1;
  
  return Math.floor(baseSyncPoints * streakMultiplier);
};

const getStreakCount = (entries: SyncPointsEntry[]): number => {
  if (entries.length === 0) return 0;
  
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    if (entryDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

const createDefaultSyncBond = (): SyncBond => ({
  level: 0,
  progress: 0,
  totalSyncPoints: 0,
  syncTrainingHours: 0,
  abilityBoost: 0,
  partCompatibility: 0,
  specialUnlocks: [],
});

const getWeekOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.ceil((day + start.getDay() + 1) / 7);
};

export const useSyncPointsStore = create<SyncPointsStore>()(
  persist(
    (set, get) => ({
      entries: [],
      stats: {
        totalSteps: 0,
        totalSyncPoints: 0,
        totalSpent: 0,
        availableSyncPoints: 0,
        weeklySteps: 0,
        weeklySyncPoints: 0,
        weeklySyncTrainingMinutes: 0,
        dailyAverage: 0,
        streak: 0,
        xHolosWeight: 0,
        weeklyRewardClaimed: false,
        streakRewardClaimed: false,
        lastWeeklyRewardDate: '',
        lastStreakRewardDate: '',
      },
      attributeUpgrades: [],
      specialAttacks: [],
      abilityChips: [],
      syncBonds: {},
      isLoading: false,

      addStepsEntry: (steps: number) => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        // Check if entry already exists for today
        const existingEntryIndex = state.entries.findIndex(
          entry => entry.date === today && entry.activityType === 'steps'
        );
        
        const currentStreak = getStreakCount(state.entries);
        const newStreak = existingEntryIndex >= 0 ? currentStreak : currentStreak + 1;
        
        const syncPoints = calculateSyncPoints(steps, 0, newStreak, 'steps');
        
        const newEntry: SyncPointsEntry = {
          id: `${today}-steps-${Date.now()}`,
          date: today,
          steps,
          syncPoints,
          activityType: 'steps',
          timestamp: Date.now(),
        };

        let updatedEntries;
        let previousStepsToday = 0;
        
        if (existingEntryIndex >= 0) {
          previousStepsToday = state.entries[existingEntryIndex].steps;
          updatedEntries = [...state.entries];
          updatedEntries[existingEntryIndex] = newEntry;
        } else {
          updatedEntries = [...state.entries, newEntry];
        }

        set({ entries: updatedEntries });
        get().calculateStats();
        
        // Update daily mission progress for fitness sync
        try {
          const { setMissionProgress } = useRewardStore.getState();
          // Set mission progress to the total steps for today
          setMissionProgress('sync_fitness', steps);
        } catch (error) {
          console.error('Failed to update mission progress:', error);
        }
      },

      addSyncTrainingEntry: (minutes: number, holobotId?: string) => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        const currentStreak = getStreakCount(state.entries);
        const syncPoints = calculateSyncPoints(0, minutes, currentStreak, 'sync_training');
        
        const newEntry: SyncPointsEntry = {
          id: `${today}-training-${Date.now()}`,
          date: today,
          steps: 0,
          syncPoints,
          syncTrainingMinutes: minutes,
          activityType: 'sync_training',
          timestamp: Date.now(),
        };

        set({ entries: [...state.entries, newEntry] });
        
        // Update Sync Bond if holobotId provided
        if (holobotId) {
          const syncBond = state.syncBonds[holobotId] || createDefaultSyncBond();
          const updatedSyncBond = {
            ...syncBond,
            totalSyncPoints: syncBond.totalSyncPoints + syncPoints,
            syncTrainingHours: syncBond.syncTrainingHours + (minutes / 60),
          };
          
          const { level, progress } = calculateSyncBondLevel(updatedSyncBond.totalSyncPoints);
          updatedSyncBond.level = level;
          updatedSyncBond.progress = progress;
          updatedSyncBond.abilityBoost = level * 5; // 5% per level
          updatedSyncBond.partCompatibility = level * 3; // 3% per level
          
          set({
            syncBonds: {
              ...state.syncBonds,
              [holobotId]: updatedSyncBond,
            }
          });
        }
        
        get().calculateStats();
      },

      addMissionBonus: (syncPoints: number) => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        const newEntry: SyncPointsEntry = {
          id: `${today}-mission-${Date.now()}`,
          date: today,
          steps: 0,
          syncPoints,
          activityType: 'mission_bonus',
          timestamp: Date.now(),
        };

        set({ entries: [...state.entries, newEntry] });
        get().calculateStats();
      },

      upgradeAttribute: (holobotId: string, attribute: 'hp' | 'attack' | 'speed' | 'defense' | 'special') => {
        const state = get();
        const currentLevel = get().getHolobotAttributeLevel(holobotId, attribute);
        const upgradeCost = calculateAttributeUpgradeCost(currentLevel);
        
        if (!get().canAffordUpgrade(upgradeCost) || currentLevel >= DEFAULT_SYNC_CONFIG.maxAttributeLevel) {
          return false;
        }
        
        // Find existing upgrade or create new one
        const existingUpgradeIndex = state.attributeUpgrades.findIndex(
          upgrade => upgrade.holobotId === holobotId && upgrade.attribute === attribute
        );
        
        let updatedUpgrades;
        if (existingUpgradeIndex >= 0) {
          updatedUpgrades = [...state.attributeUpgrades];
          updatedUpgrades[existingUpgradeIndex] = {
            ...updatedUpgrades[existingUpgradeIndex],
            level: currentLevel + 1,
            syncPointsInvested: updatedUpgrades[existingUpgradeIndex].syncPointsInvested + upgradeCost,
          };
        } else {
          const newUpgrade: AttributeUpgrade = {
            holobotId,
            attribute,
            level: 1,
            syncPointsInvested: upgradeCost,
          };
          updatedUpgrades = [...state.attributeUpgrades, newUpgrade];
        }
        
        set({ attributeUpgrades: updatedUpgrades });
        get().calculateStats();
        return true;
      },

      unlockSpecialAttack: (attackId: string) => {
        const state = get();
        const attack = state.specialAttacks.find(a => a.id === attackId);
        
        if (!attack || attack.unlocked || !get().canAffordUpgrade(attack.syncPointCost)) {
          return false;
        }
        
        const updatedAttacks = state.specialAttacks.map(a => 
          a.id === attackId ? { ...a, unlocked: true } : a
        );
        
        set({ specialAttacks: updatedAttacks });
        get().calculateStats();
        return true;
      },

      unlockAbilityChip: (chipId: string, tierLevel: number) => {
        const state = get();
        const chip = state.abilityChips.find(c => c.chipId === chipId && c.tierLevel === tierLevel);
        
        if (!chip || chip.unlocked || !get().canAffordUpgrade(chip.syncPointCost)) {
          return false;
        }
        
        const updatedChips = state.abilityChips.map(c => 
          c.chipId === chipId && c.tierLevel === tierLevel ? { ...c, unlocked: true } : c
        );
        
        set({ abilityChips: updatedChips });
        get().calculateStats();
        return true;
      },

      calculateStats: () => {
        const state = get();
        const { entries, attributeUpgrades, specialAttacks, abilityChips } = state;
        
        if (entries.length === 0) {
          set({
            stats: {
              totalSteps: 0,
              totalSyncPoints: 0,
              totalSpent: 0,
              availableSyncPoints: 0,
              weeklySteps: 0,
              weeklySyncPoints: 0,
              weeklySyncTrainingMinutes: 0,
              dailyAverage: 0,
              streak: 0,
              xHolosWeight: 0,
              weeklyRewardClaimed: state.stats.weeklyRewardClaimed || false,
              streakRewardClaimed: state.stats.streakRewardClaimed || false,
              lastWeeklyRewardDate: state.stats.lastWeeklyRewardDate || '',
              lastStreakRewardDate: state.stats.lastStreakRewardDate || '',
            }
          });
          return;
        }

        const totalSteps = entries.reduce((sum, entry) => sum + entry.steps, 0);
        const totalSyncPoints = entries.reduce((sum, entry) => sum + entry.syncPoints, 0);
        
        // Calculate total spent
        const totalSpent = 
          attributeUpgrades.reduce((sum, upgrade) => sum + upgrade.syncPointsInvested, 0) +
          specialAttacks.filter(a => a.unlocked).reduce((sum, attack) => sum + attack.syncPointCost, 0) +
          abilityChips.filter(c => c.unlocked).reduce((sum, chip) => sum + chip.syncPointCost, 0);
        
        const availableSyncPoints = totalSyncPoints - totalSpent;
        
        // Calculate weekly stats (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyEntries = entries.filter(entry => new Date(entry.date) >= weekAgo);
        const weeklySteps = weeklyEntries.reduce((sum, entry) => sum + entry.steps, 0);
        const weeklySyncPoints = weeklyEntries.reduce((sum, entry) => sum + entry.syncPoints, 0);
        const weeklySyncTrainingMinutes = weeklyEntries.reduce((sum, entry) => sum + (entry.syncTrainingMinutes || 0), 0);
        
        const dailyAverage = entries.length > 0 ? Math.floor(totalSteps / entries.length) : 0;
        const streak = getStreakCount(entries);
        const xHolosWeight = calculateXHolosWeight(totalSyncPoints);

        // Check if weekly reward needs to be reset
        const currentWeek = getWeekOfYear(new Date());
        const lastWeeklyRewardWeek = state.stats.lastWeeklyRewardDate ? 
          getWeekOfYear(new Date(state.stats.lastWeeklyRewardDate)) : 0;
        const weeklyRewardClaimed = currentWeek === lastWeeklyRewardWeek ? state.stats.weeklyRewardClaimed : false;

        // Check if streak reward needs to be reset
        const today = new Date().toISOString().split('T')[0];
        const lastStreakRewardDate = state.stats.lastStreakRewardDate.split('T')[0];
        const streakRewardClaimed = today === lastStreakRewardDate ? state.stats.streakRewardClaimed : false;

        set({
          stats: {
            totalSteps,
            totalSyncPoints,
            totalSpent,
            availableSyncPoints,
            weeklySteps,
            weeklySyncPoints,
            weeklySyncTrainingMinutes,
            dailyAverage,
            streak,
            xHolosWeight,
            weeklyRewardClaimed,
            streakRewardClaimed,
            lastWeeklyRewardDate: state.stats.lastWeeklyRewardDate,
            lastStreakRewardDate: state.stats.lastStreakRewardDate,
          }
        });
      },

      resetAllData: () => {
        set({ 
          entries: [],
          attributeUpgrades: [],
          specialAttacks: [],
          abilityChips: [],
          syncBonds: {},
        });
        get().calculateStats();
      },

      getHolobotSyncBond: (holobotId: string) => {
        const state = get();
        return state.syncBonds[holobotId] || createDefaultSyncBond();
      },

      getAvailableSyncPoints: () => {
        return get().stats.availableSyncPoints;
      },

      getHolobotAttributeLevel: (holobotId: string, attribute: string) => {
        const state = get();
        const upgrade = state.attributeUpgrades.find(
          u => u.holobotId === holobotId && u.attribute === attribute
        );
        return upgrade?.level || 0;
      },

      canAffordUpgrade: (cost: number) => {
        return get().getAvailableSyncPoints() >= cost;
      },

      // Reward claiming functions
      canClaimWeeklyReward: () => {
        const state = get();
        return state.stats.weeklySteps >= DEFAULT_SYNC_CONFIG.weeklyStepGoal && !state.stats.weeklyRewardClaimed;
      },

      canClaimStreakReward: () => {
        const state = get();
        return state.stats.streak >= 7 && !state.stats.streakRewardClaimed;
      },

      claimWeeklyReward: () => {
        const state = get();
        if (!get().canClaimWeeklyReward()) return 0;
        
        const today = new Date().toISOString();
        set(prevState => ({
          stats: {
            ...prevState.stats,
            weeklyRewardClaimed: true,
            lastWeeklyRewardDate: today,
          }
        }));
        
        return 25; // Premium booster pack tickets
      },

      claimStreakReward: () => {
        const state = get();
        if (!get().canClaimStreakReward()) return 0;
        
        const today = new Date().toISOString();
        set(prevState => ({
          stats: {
            ...prevState.stats,
            streakRewardClaimed: true,
            lastStreakRewardDate: today,
          }
        }));
        
        return 25; // Premium booster pack tickets
      },
    }),
    {
      name: 'sync-points-storage',
    }
  )
); 