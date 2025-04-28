import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FitnessData as FitnessDataType, HealthConnection } from '@/types/fitness';
import { healthService } from '@/services/health-service';
import { Platform } from 'react-native';

interface TrainingSession {
  startTime: Date;
  endTime: Date;
  steps: number;
  distance: number;
  avgSpeed: number;
  isValid: boolean;
  rewards: {
    exp: number;
    holos: number;
    items?: string[];
  }
}

interface FitnessData {
  steps: number;
  syncPointsEarned: number;
  dailyGoal: number;
  lastSynced: string;
  weeklySteps: Array<{ date: string; count: number }>;
  lastTrainingSession?: TrainingSession;
}

interface FitnessState {
  fitnessData: FitnessData;
  healthConnection: HealthConnection | null;
  hasHealthPermission: boolean;
  isLoading: boolean;
  error: string | null;
  currentTrainingSession: {
    isActive: boolean;
    startTime: Date | null;
    steps: number;
    distance: number;
    speed: number;
  } | null;
}

interface FitnessStore extends FitnessState {
  requestHealthPermissions: () => Promise<boolean>;
  disconnectHealthKit: () => Promise<boolean>;
  checkHealthConnection: () => Promise<void>;
  fetchStepCount: () => Promise<void>;
  syncStepsToPoints: () => Promise<number>;
  resetDailyData: () => void;
  clearError: () => void;
  startTrainingSession: () => Promise<void>;
  endTrainingSession: () => Promise<TrainingSession>;
  updateTrainingStats: () => Promise<void>;
  syncTrainingSession: (session: TrainingSession) => Promise<void>;
  setHealthPermission: (value: boolean) => void;
  setHealthConnection: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
}

// Initial fitness data
const initialFitnessData: FitnessData = {
  steps: 0,
  syncPointsEarned: 0,
  dailyGoal: 10000,
  lastSynced: new Date().toISOString(),
  weeklySteps: []
};

export const useFitnessStore = create<FitnessStore>()(
  persist(
    (set, get) => ({
      fitnessData: initialFitnessData,
      healthConnection: null,
      hasHealthPermission: false,
      isLoading: false,
      error: null,
      currentTrainingSession: null,

      requestHealthPermissions: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Skip actual permission requests in web environment
          if (Platform.OS === 'web') {
            set({ hasHealthPermission: true, isLoading: false });
            return true;
          }
          
          const granted = await healthService.requestPermissions();
          
          if (granted) {
            // Get device info for the connection
            const deviceInfo = await healthService.getDeviceInfo();
            
            // Create a new health connection
            const healthConnection: HealthConnection = {
              deviceName: deviceInfo.name,
              deviceOS: deviceInfo.version,
              connectedAt: new Date().toISOString(),
              lastSynced: new Date().toISOString()
            };
            
            set({ 
              hasHealthPermission: true, 
              healthConnection,
              isLoading: false 
            });
            
            // Immediately fetch step count after connecting
            const { fetchStepCount } = get();
            await fetchStepCount();
          } else {
            set({ hasHealthPermission: false, isLoading: false });
          }
          
          return granted;
        } catch (error) {
          console.error('Error requesting health permissions:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to request health permissions', 
            isLoading: false 
          });
          return false;
        }
      },

      disconnectHealthKit: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Skip in web environment
          if (Platform.OS === 'web') {
            set({ 
              hasHealthPermission: false, 
              healthConnection: null,
              isLoading: false 
            });
            return true;
          }
          
          const disconnected = await healthService.disconnectHealthKit();
          
          if (disconnected) {
            set({ 
              hasHealthPermission: false, 
              healthConnection: null,
              fitnessData: {
                ...get().fitnessData,
                steps: 0,
                weeklySteps: []
              },
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
          
          return disconnected;
        } catch (error) {
          console.error('Error disconnecting health service:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to disconnect health service', 
            isLoading: false 
          });
          return false;
        }
      },

      checkHealthConnection: async () => {
        try {
          // Skip in web environment
          if (Platform.OS === 'web') {
            set({ hasHealthPermission: false, healthConnection: null });
            return;
          }
          
          const isConnected = await healthService.isHealthKitConnected();
          
          if (isConnected) {
            // If connected but we don't have connection info, create it
            if (!get().healthConnection) {
              const deviceInfo = await healthService.getDeviceInfo();
              
              const healthConnection: HealthConnection = {
                deviceName: deviceInfo.name,
                deviceOS: deviceInfo.version,
                connectedAt: new Date().toISOString(),
                lastSynced: new Date().toISOString()
              };
              
              set({ hasHealthPermission: true, healthConnection });
              
              // Fetch step count if we just discovered we're connected
              const { fetchStepCount } = get();
              await fetchStepCount();
            } else {
              set({ hasHealthPermission: true });
            }
          } else {
            set({ hasHealthPermission: false, healthConnection: null });
          }
        } catch (error) {
          console.error('Error checking health connection:', error);
        }
      },

      fetchStepCount: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Get step count (will use mock data if not connected)
          const steps = await healthService.getTodayStepCount();
          
          // Get weekly step data (will use mock data if not connected)
          const weeklySteps = await healthService.getWeeklyStepCounts();
          
          const { fitnessData, healthConnection } = get();
          
          // Update last synced time if we have a health connection
          let updatedHealthConnection = healthConnection;
          if (healthConnection) {
            updatedHealthConnection = {
              ...healthConnection,
              lastSynced: new Date().toISOString()
            };
          }
          
          set({ 
            fitnessData: { 
              ...fitnessData, 
              steps,
              weeklySteps,
              lastSynced: new Date().toISOString()
            },
            healthConnection: updatedHealthConnection,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching step count:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch step count', 
            isLoading: false 
          });
        }
      },

      syncStepsToPoints: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { fitnessData, healthConnection } = get();
          const syncPoints = Math.floor(fitnessData.steps / 1000);
          
          // Update last synced time if we have a health connection
          let updatedHealthConnection = healthConnection;
          if (healthConnection) {
            updatedHealthConnection = {
              ...healthConnection,
              lastSynced: new Date().toISOString()
            };
          }
          
          set({ 
            fitnessData: { 
              ...fitnessData, 
              syncPointsEarned: fitnessData.syncPointsEarned + syncPoints,
              lastSynced: new Date().toISOString()
            },
            healthConnection: updatedHealthConnection,
            isLoading: false 
          });
          
          return syncPoints;
        } catch (error) {
          console.error('Error syncing steps to points:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to sync steps to points', 
            isLoading: false 
          });
          return 0;
        }
      },

      resetDailyData: () => {
        set({ 
          fitnessData: { 
            ...initialFitnessData,
            lastSynced: new Date().toISOString()
          } 
        });
      },

      clearError: () => set({ error: null }),

      startTrainingSession: async () => {
        try {
          set({ isLoading: true, error: null });

          // Get initial step count and location
          const initialSteps = await healthService.getTodayStepCount();
          const location = await healthService.getCurrentLocation();

          set({
            currentTrainingSession: {
              isActive: true,
              startTime: new Date(),
              steps: initialSteps,
              distance: 0,
              speed: 0,
            },
            isLoading: false
          });
        } catch (error) {
          console.error('Error starting training session:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to start training session',
            isLoading: false
          });
        }
      },

      endTrainingSession: async () => {
        try {
          set({ isLoading: true, error: null });

          const { currentTrainingSession, fitnessData } = get();
          if (!currentTrainingSession?.isActive) {
            throw new Error('No active training session');
          }

          // Get final stats
          const finalSteps = await healthService.getTodayStepCount();
          const location = await healthService.getCurrentLocation();

          // Calculate session stats
          const sessionSteps = finalSteps - currentTrainingSession.steps;
          const sessionDistance = currentTrainingSession.distance;
          const duration = (new Date().getTime() - currentTrainingSession.startTime!.getTime()) / 1000;
          const avgSpeed = sessionDistance / (duration / 3600); // km/h

          // Validate session (speed between 3-10 km/h)
          const isValid = avgSpeed >= 3 && avgSpeed <= 10;

          // Calculate rewards
          const baseReward = Math.floor(sessionSteps / 100);
          const rewards = {
            exp: isValid ? baseReward * 10 : 0,
            holos: isValid ? Math.floor(baseReward / 2) : 0,
            items: isValid ? generateRandomItems(baseReward) : []
          };

          const session: TrainingSession = {
            startTime: currentTrainingSession.startTime!,
            endTime: new Date(),
            steps: sessionSteps,
            distance: sessionDistance,
            avgSpeed,
            isValid,
            rewards
          };

          // Update store
          set({
            fitnessData: {
              ...fitnessData,
              lastTrainingSession: session,
              lastSynced: new Date().toISOString()
            },
            currentTrainingSession: null,
            isLoading: false
          });

          return session;
        } catch (error) {
          console.error('Error ending training session:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to end training session',
            currentTrainingSession: null,
            isLoading: false
          });
          throw error;
        }
      },

      updateTrainingStats: async () => {
        try {
          const { currentTrainingSession } = get();
          if (!currentTrainingSession?.isActive) return;

          // Get current stats
          const currentSteps = await healthService.getTodayStepCount();
          const location = await healthService.getCurrentLocation();

          // Update session stats
          set(state => ({
            currentTrainingSession: {
              ...state.currentTrainingSession!,
              steps: currentSteps,
              distance: location.distance || 0,
              speed: location.speed || 0
            }
          }));
        } catch (error) {
          console.error('Error updating training stats:', error);
        }
      },

      syncTrainingSession: async (session: TrainingSession) => {
        set({ isLoading: true });
        try {
          // TODO: Implement sync with backend
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        } finally {
          set({ isLoading: false });
        }
      },

      setHealthPermission: (value: boolean) => set({ hasHealthPermission: value }),

      setHealthConnection: (value: boolean) => set({ healthConnection: value }),

      setIsLoading: (value: boolean) => set({ isLoading: value }),
    }),
    {
      name: 'holobots-fitness-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

// Helper function to generate random items based on performance
function generateRandomItems(baseReward: number): string[] {
  const items: string[] = [];
  const chance = Math.min(baseReward / 100, 0.5); // Max 50% chance

  if (Math.random() < chance) {
    items.push('Random Training Item'); // In production, this would be a real item
  }

  return items;
}