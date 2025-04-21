import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { HolobotInfoCard } from '@/components/holobots/HolobotInfoCard';
import { RankProgressMeter } from '@/components/RankProgressMeter';
import { EnergyRefillSection } from '@/components/EnergyRefillSection';
import { LogOut, Wallet, Award, ChevronRight } from 'lucide-react-native';
import { ItemCard } from '@/components/items/ItemCard';
import { getPlayerRankColor } from '@/utils/playerRanks';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut, isLoading, refreshUser, updateUser } = useAuthStore();
  const [isRefilling, setIsRefilling] = useState(false);
  
  useEffect(() => {
    refreshUser();
  }, []);
  
  // Calculate Holobot counts for rank progression
  const getHolobotCounts = () => {
    if (!user?.holobots) return { rare: 0, champion: 0, elite: 0, legendary: 0, prestiged: 0 };
    
    return user.holobots.reduce((counts, holobot) => {
      if (holobot.rank) counts[holobot.rank.toLowerCase()]++;
      if (holobot.prestiged) counts.prestiged++;
      return counts;
    }, { rare: 0, champion: 0, elite: 0, legendary: 0, prestiged: 0 });
  };

  const handleEnergyRefill = async () => {
    if (isRefilling || !user) return;
    
    try {
      setIsRefilling(true);
      
      // Check if user has refills available
      if (user.energyRefills <= 0) {
        Alert.alert('No Refills', 'You have no energy refills available.');
        return;
      }
      
      // Check if energy is already full
      if (user.dailyEnergy >= user.maxDailyEnergy) {
        Alert.alert('Energy Full', 'Your energy is already at maximum.');
        return;
      }
      
      // Update user data
      await updateUser({
        dailyEnergy: user.maxDailyEnergy,
        energyRefills: user.energyRefills - 1,
        lastEnergyRefresh: new Date().toISOString()
      });
      
      Alert.alert('Success', 'Energy fully restored!');
      await refreshUser();
    } catch (error) {
      console.error('Energy refill error:', error);
      Alert.alert('Error', 'Failed to refill energy. Please try again.');
    } finally {
      setIsRefilling(false);
    }
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };
  
  const handleLinkWallet = () => {
    router.push('/link-wallet');
  };
  
  const handleUseItem = async (type: string, name: string) => {
    if (!user) return;
    
    try {
      if (type === 'energy-refill') {
        // Energy refill functionality
        if (user.energyRefills <= 0) {
          Alert.alert('No Refills', 'You have no energy refills available.');
          return;
        }
        
        if (user.dailyEnergy >= user.maxDailyEnergy) {
          Alert.alert('Energy Full', 'Your energy is already at maximum.');
          return;
        }
        
        await updateUser({
          dailyEnergy: user.maxDailyEnergy,
          energyRefills: user.energyRefills - 1,
          lastEnergyRefresh: new Date().toISOString()
        });
        
        Alert.alert('Success', 'Used Daily Energy Refill. Energy fully restored!');
      } else {
        // TODO: Implement other item usage logic with Supabase
        Alert.alert('Not Implemented', `${name} usage is not implemented yet.`);
      }
      
      await refreshUser();
    } catch (error) {
      console.error('Error using item:', error);
      Alert.alert('Error', 'Failed to use item. Please try again.');
    }
  };
  
  if (!user || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <Image
              source={{ uri: profile.avatarUrl || 'https://source.unsplash.com/random/200x200?avatar' }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.stats?.wins || 0}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.stats?.losses || 0}</Text>
                <Text style={styles.statLabel}>Losses</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.stats?.totalBattles || 0}</Text>
                <Text style={styles.statLabel}>Battles</Text>
              </View>
            </View>
          </Card>
        </View>
        
        <View style={styles.rankContainer}>
          <Text style={styles.sectionTitle}>Player Rank</Text>
          <Card style={{
            ...styles.rankCard,
            borderColor: getPlayerRankColor(profile.player_rank || 'Rookie')
          }}>
            <View style={styles.rankHeader}>
              <View>
                <Text style={{
                  ...styles.currentRankLabel,
                  color: getPlayerRankColor(profile.player_rank || 'Rookie')
                }}>
                  CURRENT RANK
                </Text>
                <Text style={{
                  ...styles.currentRankText,
                  color: getPlayerRankColor(profile.player_rank || 'Rookie')
                }}>
                  {profile.player_rank || 'Rookie'}
                </Text>
              </View>
              <View style={{
                ...styles.rankBadge,
                backgroundColor: getPlayerRankColor(profile.player_rank || 'Rookie')
              }}>
                <Award size={24} color="#FFFFFF" />
              </View>
            </View>
            
            <View style={styles.rankDivider} />
            
            <RankProgressMeter
              currentRank={profile.player_rank || 'Rookie'}
              counts={getHolobotCounts()}
            />
          </Card>
        </View>
        
        <View style={styles.levelContainer}>
          <Text style={styles.sectionTitle}>Level {profile.level}</Text>
          <View style={styles.levelProgress}>
            <ProgressBar 
              progress={profile.experience / 1000} 
              fillColor={colors.primary}
              height={8}
            />
          </View>
          <Text style={styles.experienceText}>
            {profile.experience} / 1000 XP
          </Text>
        </View>
        
        <View style={styles.walletContainer}>
          <Card style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Text style={styles.sectionTitle}>Wallet</Text>
              {user.walletAddress ? (
                <Text style={styles.walletConnected}>Connected</Text>
              ) : (
                <Button
                  title="Connect"
                  onPress={handleLinkWallet}
                  variant="outline"
                  size="small"
                />
              )}
            </View>
            
            <View style={styles.energyContainer}>
              <EnergyRefillSection
                currentEnergy={user.dailyEnergy}
                maxEnergy={user.maxDailyEnergy}
                availableRefills={user.energyRefills || 0}
                onRefill={handleEnergyRefill}
                isRefilling={isRefilling}
              />
            </View>

            <View style={styles.walletDetails}>
              <View style={styles.walletItem}>
                <Text style={styles.walletLabel}>HOLOS Tokens</Text>
                <Text style={styles.walletValue}>{user.holosTokens}</Text>
              </View>
              <View style={styles.walletItem}>
                <Text style={styles.walletLabel}>Gacha Tickets</Text>
                <Text style={styles.walletValue}>{user.gachaTickets}</Text>
              </View>
            </View>
          </Card>
        </View>
        
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Your Items</Text>
          <View style={styles.itemsGrid}>
            <ItemCard
              type="arena-pass"
              name="Arena Pass"
              description="Grants entry to one arena battle without costing HOLOS tokens"
              quantity={user.arenaPasses || 0}
              onPress={() => handleUseItem('arena-pass', 'Arena Pass')}
            />
            <ItemCard
              type="gacha-ticket"
              name="Gacha Ticket"
              description="Can be used for one pull in the Gacha system"
              quantity={user.gachaTickets || 0}
              onPress={() => handleUseItem('gacha-ticket', 'Gacha Ticket')}
            />
            <ItemCard
              type="energy-refill"
              name="Daily Energy Refill"
              description="Instantly restores your daily energy to full"
              quantity={user.energyRefills || 0}
              onPress={() => handleUseItem('energy-refill', 'Daily Energy Refill')}
            />
            <ItemCard
              type="exp-booster"
              name="EXP Battle Booster"
              description="Doubles experience gained from battles for 24 hours"
              quantity={user.expBoosters || 0}
              onPress={() => handleUseItem('exp-booster', 'EXP Battle Booster')}
            />
            <ItemCard
              type="rank-skip"
              name="Rank Skip"
              description="Skip to the next rank instantly"
              quantity={user.rankSkips || 0}
              onPress={() => handleUseItem('rank-skip', 'Rank Skip')}
            />
          </View>
        </View>
        
        <View style={styles.holobotsContainer}>
          <Text style={styles.sectionTitle}>My Holobots</Text>
          <View style={styles.holobotsList}>
            {user.holobots && user.holobots.length > 0 ? (
              user.holobots.map((holobot, index) => (
                <HolobotInfoCard
                  key={index}
                  holobot={holobot}
                  holobotKey={holobot.key || holobot.name.toLowerCase()}
                />
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No Holobots yet</Text>
                <Text style={styles.emptySubtext}>
                  Collect blueprints and mint your first Holobot
                </Text>
              </Card>
            )}
          </View>
        </View>
        
        <View style={styles.achievementsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.achievementsList}>
            {profile.achievements && profile.achievements.length > 0 ? (
              profile.achievements.map((achievement, index) => (
                <Card key={index} style={styles.achievementCard}>
                  <View style={styles.achievementIcon}>
                    <Award size={24} color={achievement.completed ? colors.primary : colors.textSecondary} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>{achievement.name}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                    {!achievement.completed && achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                      <ProgressBar 
                        progress={achievement.progress / achievement.maxProgress} 
                        fillColor={colors.primary}
                        height={4}
                      />
                    )}
                  </View>
                  {achievement.completed && (
                    <Text style={styles.achievementCompleted}>Completed</Text>
                  )}
                </Card>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No achievements yet</Text>
                <Text style={styles.emptySubtext}>
                  Complete tasks to earn achievements
                </Text>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    justifyContent: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsCard: {
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  levelContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  levelProgress: {
    marginBottom: 8,
  },
  experienceText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  walletContainer: {
    marginBottom: 24,
  },
  walletCard: {
    padding: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletConnected: {
    fontSize: 14,
    color: colors.success,
  },
  walletDetails: {
    gap: 12,
  },
  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  walletValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  holobotsContainer: {
    marginBottom: 24,
  },
  holobotsList: {
    gap: 12,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  achievementsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  achievementIcon: {
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  achievementCompleted: {
    fontSize: 12,
    color: colors.success,
    fontWeight: 'bold',
  },
  rankContainer: {
    marginBottom: 24,
  },
  rankCard: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
  },
  rankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentRankLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  currentRankText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  energyContainer: {
    marginTop: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  itemsContainer: {
    marginBottom: 24,
  },
  itemsGrid: {
    gap: 12,
  },
});