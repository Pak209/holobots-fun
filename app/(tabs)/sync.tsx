import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Platform, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FitnessStat } from '@/components/FitnessStat';
import { WorkoutRewards } from '@/components/WorkoutRewards';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { HolobotSelector } from '@/components/HolobotSelector';
import { colors } from '@/constants/colors';
import { useFitnessStore } from '@/store/fitness-store';
import { useHolobotStore } from '@/store/holobot-store';
import { Footprints, Zap, Clock, Award, AlertCircle, Info, Activity } from 'lucide-react-native';
import { SyncTraining } from '@/components/SyncTraining';
import { TrainingSummary } from '@/components/TrainingSummary';
import { Holobot } from '@/types/holobot';
import AppleHealthKit, { HealthInputOptions, HealthKitPermissions } from 'react-native-health';

const HEALTH_PERMISSIONS = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    ],
  },
} as HealthKitPermissions;

export default function SyncScreen() {
  const router = useRouter();
  const { 
    fitnessData, 
    hasHealthPermission,
    healthConnection,
    fetchStepCount, 
    syncStepsToPoints, 
    isLoading: fitnessLoading 
  } = useFitnessStore();
  
  const { 
    holobots,
    holobot,
    fetchHolobots,
    fetchHolobot,
    selectHolobot: selectHolobotFromStore,
    applyWorkoutRewards,
    isLoading: holobotLoading 
  } = useHolobotStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [showTrainingSummary, setShowTrainingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState('sync');
  const [selectedHolobotId, setSelectedHolobotId] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Request HealthKit permissions first
        if (Platform.OS === 'ios') {
          AppleHealthKit.initHealthKit(HEALTH_PERMISSIONS, (error: string) => {
            if (error) {
              console.log('[ERROR] Cannot grant permissions');
              Alert.alert(
                "Health Permissions Required",
                "This app needs access to your health data to track your fitness progress.",
                [
                  { 
                    text: "Open Settings",
                    onPress: () => Linking.openURL('app-settings:')
                  },
                  { text: "Cancel" }
                ]
              );
              return;
            }
            
            // Health data is available
            loadData();
          });
        }
        
        if (fitnessData?.lastSynced) {
          setLastSynced(new Date(fitnessData.lastSynced));
        }
      } catch (error) {
        console.error('Error initializing sync data:', error);
        Alert.alert(
          "Error",
          "Failed to load fitness data. Please try again.",
          [{ text: "Retry", onPress: () => initializeData() }]
        );
      }
    };
    
    initializeData();
  }, [fitnessData?.lastSynced]);
  
  useEffect(() => {
    const loadHolobots = async () => {
      try {
        await Promise.all([fetchHolobots(), fetchHolobot()]);
      } catch (error) {
        console.error('Error loading holobots:', error);
        Alert.alert(
          "Error",
          "Failed to load holobots. Please try again.",
          [{ text: "Retry", onPress: () => loadHolobots() }]
        );
      }
    };
    
    loadHolobots();
  }, []);
  
  const loadData = async () => {
    if (Platform.OS === 'ios') {
      try {
        const options: HealthInputOptions = {
          startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
          endDate: new Date().toISOString(),
        };

        AppleHealthKit.getStepCount(options, (error: string, results: { value: number }) => {
          if (error) {
            console.error('Error fetching step count:', error);
            Alert.alert(
              "Error",
              "Failed to fetch health data. Please check your permissions and try again."
            );
            return;
          }
          
          // Update the fitness store with the new data
          fetchStepCount();
        });
      } catch (error) {
        console.error('Error fetching health data:', error);
        Alert.alert(
          "Error",
          "Failed to fetch health data. Please check your permissions and try again."
        );
      }
    } else {
      await fetchStepCount();
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await fetchHolobots();
    await fetchHolobot();
    setRefreshing(false);
  };
  
  const handleSyncSteps = async () => {
    if (!holobot) {
      Alert.alert("Error", "Please select a Holobot first");
      return;
    }
    
    try {
      const syncPoints = await syncStepsToPoints();
      
      if (syncPoints) {
        // Apply rewards to selected holobot
        await applyWorkoutRewards(syncPoints);
        
        setLastSynced(new Date());
        
        Alert.alert(
          "Sync Complete", 
          `Successfully synced ${syncPoints} Sync Points to ${holobot.name}!`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Sync Failed", "There was an error syncing your steps. Please try again.");
    }
  };
  
  const getStepProgress = () => {
    return Math.min((fitnessData.steps / fitnessData.dailyGoal) * 100, 100);
  };
  
  const formatLastSynced = () => {
    if (!lastSynced) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSynced.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };
  
  const handleConnectToHealth = () => {
    router.push('/profile');
  };
  
  const showHealthInfo = () => {
    Alert.alert(
      "About Health Integration",
      "This app connects to Apple Health to retrieve your step count data. Please make sure you have granted the necessary permissions in your device settings.",
      [
        { 
          text: "Open Settings", 
          onPress: () => {
            Linking.openURL('app-settings:').catch(err => {
              console.error('Could not open settings:', err);
            });
          } 
        },
        { text: "OK" }
      ]
    );
  };
  
  // Calculate potential rewards
  const syncPoints = Math.floor(fitnessData.steps / 1000);
  const potentialRewards = {
    exp: syncPoints * 10,
    holos: Math.floor(syncPoints / 2),
    attributeBoosts: Math.floor(syncPoints / 50)
  };
  
  const handleHolobotSelect = async (selectedHolobot: Holobot): Promise<void> => {
    await selectHolobotFromStore(selectedHolobot.id);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.tabSelector}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'sync' && styles.activeTabButton]}
          onPress={() => setActiveTab('sync')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'sync' && styles.activeTabButtonText]}>
            Sync
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'training' && styles.activeTabButton]}
          onPress={() => setActiveTab('training')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'training' && styles.activeTabButtonText]}>
            Training
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'history' && styles.activeTabButtonText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing || fitnessLoading || holobotLoading} 
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {activeTab === 'sync' && (
          <>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Sync Activity</Text>
              <Button
                title="Info"
                icon={<Info size={18} color={colors.text} />}
                variant="outline"
                onPress={showHealthInfo}
                style={styles.infoButton}
              />
            </View>
            <Text style={styles.subtitle}>
              Convert your real-world activity into Sync Points for your Holobot
            </Text>
            
            {!hasHealthPermission && Platform.OS !== 'web' && (
              <Card style={styles.healthConnectCard}>
                <View style={styles.healthConnectHeader}>
                  <AlertCircle size={20} color={colors.warning} />
                  <Text style={styles.healthConnectTitle}>Health Not Connected</Text>
                </View>
                <Text style={styles.healthConnectText}>
                  Connect to Health services in your Profile to track your real steps and earn Sync Points.
                </Text>
                <Button
                  title="Connect to Health"
                  onPress={handleConnectToHealth}
                  variant="primary"
                  loading={fitnessLoading}
                  style={styles.healthConnectButton}
                />
              </Card>
            )}
            
            <View style={styles.holobotSelector}>
              <HolobotSelector
                holobots={holobots}
                selectedHolobot={holobot}
                onSelect={handleHolobotSelect}
              />
            </View>
            
            <View style={styles.statsGrid}>
              <FitnessStat
                icon="steps"
                label="STEPS TODAY"
                value={fitnessData.steps.toLocaleString()}
                subValue={`${getStepProgress().toFixed(0)}% of daily goal`}
                progress={getStepProgress()}
                style={styles.statItem}
              />
              <FitnessStat
                icon="time"
                label="LAST SYNCED"
                value={formatLastSynced()}
                style={styles.statItem}
              />
              <FitnessStat
                icon="power"
                label="SYNC POINTS"
                value={syncPoints.toString()}
                subValue="Available to sync"
                style={styles.statItem}
              />
              <FitnessStat
                icon="power"
                label="TOTAL POINTS"
                value={fitnessData.syncPointsEarned.toLocaleString()}
                subValue="All time"
                style={styles.statItem}
              />
            </View>
            
            <Card style={styles.syncCard}>
              <View style={styles.syncHeader}>
                <View>
                  <Text style={styles.syncTitle}>Ready to Sync</Text>
                  <Text style={styles.syncSubtitle}>Last synced: {formatLastSynced()}</Text>
                </View>
                <Button
                  title="Sync Now"
                  onPress={handleSyncSteps}
                  variant="secondary"
                  loading={fitnessLoading || holobotLoading}
                  disabled={!holobot}
                  icon={<Zap size={16} color={colors.text} />}
                />
              </View>
              
              <View style={styles.divider} />
              
              <Text style={styles.rewardsTitle}>You'll Receive</Text>
              <WorkoutRewards rewards={potentialRewards} style={styles.rewards} />
              
              {hasHealthPermission && (
                <View style={styles.healthConnectionInfo}>
                  <Text style={styles.healthConnectionText}>
                    Connected to Health: {healthConnection?.deviceName}
                  </Text>
                </View>
              )}
            </Card>
          </>
        )}

        {activeTab === 'training' && (
          <>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Training</Text>
            </View>
            <Text style={styles.subtitle}>
              Complete training sessions to earn extra rewards for your Holobot
            </Text>
            <SyncTraining style={styles.trainingSection} />
          </>
        )}

        {activeTab === 'history' && (
          <>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Activity History</Text>
            </View>
            <Text style={styles.subtitle}>
              View your past activities and earned rewards
            </Text>
            <Card style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyHeaderDate}>Date</Text>
                <Text style={styles.historyHeaderSteps}>Steps</Text>
                <Text style={styles.historyHeaderPoints}>Points</Text>
              </View>
              {fitnessData.weeklySteps.map((day, index) => (
                <View key={index} style={styles.historyRow}>
                  <Text style={styles.historyDate}>{new Date(day.date).toLocaleDateString()}</Text>
                  <Text style={styles.historySteps}>{day.count.toLocaleString()}</Text>
                  <Text style={styles.historyPoints}>{Math.floor(day.count / 1000)}</Text>
                </View>
              ))}
            </Card>
          </>
        )}
        
        {fitnessData.lastTrainingSession && showTrainingSummary && (
          <TrainingSummary
            visible={showTrainingSummary}
            onClose={() => setShowTrainingSummary(false)}
            stats={{
              steps: fitnessData.lastTrainingSession.steps,
              distance: fitnessData.lastTrainingSession.distance,
              avgSpeed: fitnessData.lastTrainingSession.avgSpeed,
              duration: (
                fitnessData.lastTrainingSession.endTime.getTime() -
                fitnessData.lastTrainingSession.startTime.getTime()
              ) / 1000,
              isValid: fitnessData.lastTrainingSession.isValid
            }}
            rewards={fitnessData.lastTrainingSession.rewards}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLighter,
    padding: 4,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  infoButton: {
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  healthConnectCard: {
    marginBottom: 24,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  healthConnectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthConnectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  healthConnectText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  healthConnectButton: {
    alignSelf: 'flex-start',
  },
  holobotSelector: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  trainingSection: {
    marginBottom: 16,
  },
  syncCard: {
    marginBottom: 24,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  syncTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  syncSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    margin: 16,
    marginBottom: 8,
  },
  rewards: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  healthConnectionInfo: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 184, 148, 0.1)',
    borderRadius: 8,
  },
  healthConnectionText: {
    fontSize: 12,
    color: colors.secondary,
    textAlign: 'center',
  },
  simulationNote: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  simulationText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statItem: {
    flex: 1,
  },
  historyCard: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  historyHeaderDate: {
    flex: 2,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  historyHeaderSteps: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  historyHeaderPoints: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
    textAlign: 'right',
  },
  historyRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDate: {
    flex: 2,
    fontSize: 14,
    color: colors.text,
  },
  historySteps: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  historyPoints: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});