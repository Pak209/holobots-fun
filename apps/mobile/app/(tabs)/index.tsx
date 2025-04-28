import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { HolobotStats } from '@/components/HolobotStats';
import { BattleCard } from '@/components/BattleCard';
import { HolobotSelector } from '@/components/HolobotSelector';
import { SyncProgress } from '@/components/SyncProgress';
import { FitnessStat } from '@/components/FitnessStat';
import { QuestGrid } from '@/components/QuestGrid';
import { colors } from '@/constants/colors';
import { useHolobotStore } from '@/store/holobot-store';
import { useFitnessStore } from '@/store/fitness-store';
import { useAuthStore } from '@/store/auth-store';
import { 
  Clock, 
  Swords, 
  Footprints, 
  Activity, 
  Award, 
  TrendingUp, 
  Calendar, 
  Info,
  FileText,
  Compass,
  Trophy,
  Star
} from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { 
    holobots, 
    holobot, 
    battles, 
    fetchHolobots, 
    fetchHolobot, 
    fetchBattles, 
    selectHolobot,
    setActiveBattle, 
    isLoading: holobotLoading 
  } = useHolobotStore();
  
  const { 
    fitnessData, 
    hasHealthPermission,
    healthConnection,
    fetchStepCount, 
    syncStepsToPoints,
    isLoading: fitnessLoading 
  } = useFitnessStore();
  
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const isLoading = holobotLoading || fitnessLoading;
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    fetchHolobots();
    fetchHolobot();
    fetchBattles();
    fetchStepCount();
  };
  
  const handleRefresh = () => {
    loadData();
  };
  
  const handleBattlePress = (battleId: string) => {
    const battle = battles.find(b => b.id === battleId);
    if (battle && battle.status === 'active') {
      setActiveBattle(battle);
      router.push(`/battle/${battleId}`);
    }
  };
  
  const handleHolobotSelect = (selectedHolobot) => {
    selectHolobot(selectedHolobot.id);
  };
  
  const getUpcomingBattle = () => {
    return battles.find(battle => battle.status === 'upcoming');
  };
  
  const getActiveBattle = () => {
    return battles.find(battle => battle.status === 'active');
  };
  
  const handleSyncSteps = async () => {
    try {
      const syncPoints = await syncStepsToPoints();
      await fetchHolobot();
      Alert.alert(
        "Sync Complete", 
        `Successfully synced ${syncPoints} Sync Points to your Holobot!`
      );
    } catch (error) {
      Alert.alert("Sync Failed", "There was an error syncing your steps. Please try again.");
    }
  };
  
  const handleGoToProfile = () => {
    router.push('/profile');
  };
  
  const showHealthInfo = () => {
    Alert.alert(
      "About Health Integration",
      "This app can connect to Apple Health (iOS) or Google Fit (Android) to retrieve your actual step count data.\n\nIn this demo version, we're using simulated data, but in a production app, your real step count would be used to earn Sync Points for your Holobot.",
      [{ text: "OK" }]
    );
  };
  
  // Mock activity history data
  const activityHistory = [
    { date: 'Today', steps: fitnessData?.steps || 0, syncPoints: Math.floor((fitnessData?.steps || 0) / 1000) },
    { date: 'Yesterday', steps: 8750, syncPoints: 8 },
    { date: '2 days ago', steps: 12340, syncPoints: 12 },
    { date: '3 days ago', steps: 9870, syncPoints: 9 },
    { date: '4 days ago', steps: 7650, syncPoints: 7 },
  ];
  
  // Calculate total blueprints collected
  const totalBlueprints = user?.blueprints 
    ? Object.values(user.blueprints).reduce((sum, count) => sum + count, 0)
    : 0;
  
  // Get the active and upcoming battles
  const activeBattle = getActiveBattle();
  const upcomingBattle = getUpcomingBattle();
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.tabSelector}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'dashboard' && styles.activeTabButton]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'dashboard' && styles.activeTabButtonText]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'activity' && styles.activeTabButton]}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'activity' && styles.activeTabButtonText]}>
            Activity
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'quests' && styles.activeTabButton]}
          onPress={() => setActiveTab('quests')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'quests' && styles.activeTabButtonText]}>
            Quests
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {activeTab === 'dashboard' ? (
          // Dashboard Tab Content
          <>
            <HolobotSelector
              holobots={holobots}
              selectedHolobot={holobot}
              onSelect={handleHolobotSelect}
            />
            
            {holobot && (
              <HolobotStats holobot={holobot} />
            )}
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Swords size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Battle Status</Text>
              </View>
              
              {activeBattle ? (
                <BattleCard 
                  battle={activeBattle} 
                  onPress={() => handleBattlePress(activeBattle.id)} 
                />
              ) : upcomingBattle ? (
                <BattleCard battle={upcomingBattle} />
              ) : (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No upcoming battles</Text>
                </Card>
              )}
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Footprints size={20} color={colors.secondary} />
                <Text style={styles.sectionTitle}>Activity Summary</Text>
              </View>
              
              <Card style={styles.activityCard}>
                <View style={styles.activityItem}>
                  <Text style={styles.activityLabel}>Today's Steps</Text>
                  <Text style={styles.activityValue}>{(fitnessData?.steps || 0).toLocaleString()}</Text>
                </View>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityLabel}>Sync Points Earned</Text>
                  <Text style={[styles.activityValue, { color: colors.primary }]}>
                    {fitnessData?.syncPointsEarned || 0}
                  </Text>
                </View>
                
                <View style={styles.activityItem}>
                  <Text style={styles.activityLabel}>Daily Goal</Text>
                  <Text style={styles.activityValue}>
                    {Math.round(((fitnessData?.steps || 0) / (fitnessData?.dailyGoal || 10000)) * 100)}%
                  </Text>
                </View>
              </Card>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={20} color={colors.accent} />
                <Text style={styles.sectionTitle}>Recent Activity</Text>
              </View>
              
              <Card style={styles.recentActivityCard}>
                <View style={styles.activityLogItem}>
                  <View style={[styles.activityLogDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.activityLogText}>
                    Won battle against Cyber-9
                  </Text>
                  <Text style={styles.activityLogTime}>2h ago</Text>
                </View>
                
                <View style={styles.activityLogItem}>
                  <View style={[styles.activityLogDot, { backgroundColor: colors.secondary }]} />
                  <Text style={styles.activityLogText}>
                    Synced 8,500 steps
                  </Text>
                  <Text style={styles.activityLogTime}>5h ago</Text>
                </View>
                
                <View style={styles.activityLogItem}>
                  <View style={[styles.activityLogDot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.activityLogText}>
                    Earned 10 Sync Points
                  </Text>
                  <Text style={styles.activityLogTime}>5h ago</Text>
                </View>
              </Card>
            </View>
          </>
        ) : activeTab === 'activity' ? (
          // Activity Tab Content
          <>
            {!hasHealthPermission && (
              <Card style={styles.connectCard}>
                <Text style={styles.connectTitle}>Connect to Health</Text>
                <Text style={styles.connectText}>
                  Connect to Health services in your Profile to track steps and earn Sync Points.
                </Text>
                <Button
                  title="Go to Profile"
                  onPress={handleGoToProfile}
                  variant="primary"
                  size="small"
                  style={styles.connectButton}
                />
              </Card>
            )}
            
            {fitnessData && (
              <SyncProgress 
                fitnessData={fitnessData}
                onSyncPress={handleSyncSteps}
                isLoading={fitnessLoading}
                isConnected={hasHealthPermission}
              />
            )}
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Sync Points Summary</Text>
                <TouchableOpacity onPress={showHealthInfo} style={styles.infoButton}>
                  <Info size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <Card style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {holobot?.syncPoints || 0}
                    </Text>
                    <Text style={styles.summaryLabel}>Total Sync Points</Text>
                  </View>
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {holobot ? (holobot.dailySyncQuota - holobot.dailySyncUsed) : 0}
                    </Text>
                    <Text style={styles.summaryLabel}>Daily Quota Left</Text>
                  </View>
                </View>
                
                <View style={styles.quotaContainer}>
                  <Text style={styles.quotaLabel}>Daily Sync Quota</Text>
                  <View style={styles.quotaBar}>
                    <View 
                      style={[
                        styles.quotaFill, 
                        { 
                          width: holobot 
                            ? `${(holobot.dailySyncUsed / holobot.dailySyncQuota) * 100}%` 
                            : '0%' 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.quotaText}>
                    {holobot ? `${holobot.dailySyncUsed} / ${holobot.dailySyncQuota}` : '0 / 0'}
                  </Text>
                </View>
              </Card>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Award size={20} color={colors.accent} />
                <Text style={styles.sectionTitle}>Achievements</Text>
              </View>
              
              <Card style={styles.achievementsCard}>
                <View style={styles.achievement}>
                  <View style={styles.achievementIcon}>
                    <Activity size={24} color={colors.warning} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>Step Master</Text>
                    <Text style={styles.achievementDesc}>Walk 10,000 steps in a day</Text>
                    <View style={styles.achievementProgress}>
                      <View 
                        style={[
                          styles.achievementProgressFill, 
                          { width: `${Math.min((fitnessData?.steps || 0) / 10000, 1) * 100}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.achievementProgressText}>
                      {fitnessData?.steps || 0} / 10,000 steps
                    </Text>
                  </View>
                </View>
                
                <View style={styles.achievement}>
                  <View style={[styles.achievementIcon, styles.achievementCompleted]}>
                    <Award size={24} color={colors.text} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>First Sync</Text>
                    <Text style={styles.achievementDesc}>Sync your first activity to your Holobot</Text>
                    <Text style={styles.achievementCompletedText}>Completed!</Text>
                  </View>
                </View>
              </Card>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color={colors.secondary} />
                <Text style={styles.sectionTitle}>Activity History</Text>
              </View>
              
              <Card style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyHeaderDate}>Date</Text>
                  <Text style={styles.historyHeaderSteps}>Steps</Text>
                  <Text style={styles.historyHeaderPoints}>Sync Points</Text>
                </View>
                
                {activityHistory.map((item, index) => (
                  <View key={index} style={styles.historyRow}>
                    <Text style={styles.historyDate}>{item.date}</Text>
                    <Text style={styles.historySteps}>{item.steps.toLocaleString()}</Text>
                    <Text style={styles.historyPoints}>{item.syncPoints}</Text>
                  </View>
                ))}
              </Card>
            </View>
          </>
        ) : (
          // Quests Tab Content
          <>
            <View style={styles.questHeader}>
              <Text style={styles.questTitle}>HOLOBOT QUESTS</Text>
              <Text style={styles.questSubtitle}>
                Send your Holobots on adventures to earn rewards and level up
              </Text>
              
              <Card style={styles.questInfoBanner}>
                <View style={styles.questInfoContent}>
                  <Trophy size={16} color={colors.warning} />
                  <Text style={styles.questInfoText}>
                    All Holobots in your boss battle squad now earn XP!
                  </Text>
                  <Star size={16} color={colors.warning} />
                </View>
              </Card>
              
              {/* Blueprint Info Card */}
              <Card style={styles.blueprintInfoCard}>
                <View style={styles.blueprintHeader}>
                  <FileText size={20} color={colors.primary} />
                  <Text style={styles.blueprintTitle}>Blueprint Collection</Text>
                </View>
                
                <View style={styles.blueprintContent}>
                  <Text style={styles.blueprintTotal}>
                    Total Blueprints: <Text style={styles.blueprintCount}>{totalBlueprints}</Text>
                  </Text>
                  
                  <View style={styles.tierContainer}>
                    {Object.entries(BLUEPRINT_TIERS).map(([key, tier]) => (
                      <View 
                        key={key} 
                        style={[styles.tierItem, { borderColor: tier.color + '50' }]}
                      >
                        <Text style={[styles.tierText, { color: tier.color }]}>
                          {tier.name} ({tier.required})
                        </Text>
                      </View>
                    ))}
                  </View>
                  
                  <Text style={styles.blueprintNote}>
                    Collect blueprints from Quests to mint new Holobots!
                  </Text>
                </View>
              </Card>
            </View>
            
            <QuestGrid />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Blueprint tiers for quest rewards
export const BLUEPRINT_TIERS = {
  common: { name: 'Common', required: 10, color: colors.text },
  uncommon: { name: 'Uncommon', required: 20, color: colors.secondary },
  rare: { name: 'Rare', required: 30, color: colors.primary },
  epic: { name: 'Epic', required: 50, color: colors.warning },
  legendary: { name: 'Legendary', required: 100, color: colors.accent }
};

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
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  activityCard: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  recentActivityCard: {
    padding: 16,
  },
  activityLogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityLogDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityLogText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  activityLogTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  // Activity tab styles
  connectCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  connectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  connectText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  connectButton: {
    alignSelf: 'flex-start',
  },
  summaryCard: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  quotaContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  quotaLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  quotaBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  quotaFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  quotaText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  achievementsCard: {
    padding: 16,
  },
  achievement: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementCompleted: {
    backgroundColor: colors.primary,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  achievementProgress: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  achievementCompletedText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
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
  // Quest tab styles
  questHeader: {
    marginBottom: 24,
  },
  questTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  questSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  questInfoBanner: {
    marginBottom: 16,
    backgroundColor: colors.backgroundLighter,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  questInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  questInfoText: {
    fontSize: 14,
    color: colors.primary,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  blueprintInfoCard: {
    marginBottom: 16,
    padding: 16,
  },
  blueprintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  blueprintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  blueprintContent: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  blueprintTotal: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  blueprintCount: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  tierContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tierItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  tierText: {
    fontSize: 10,
  },
  blueprintNote: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});