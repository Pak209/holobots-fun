import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useLeagueStore } from '../../store/league-store';
import { BattleLogEntry, BattleResult } from '../../types/league';
import { colors } from '../../constants/colors';
import { ArrowLeft, Award, Swords, Shield, Zap, Heart, Activity } from 'lucide-react-native';
import { Button } from '../../components/Button';

export default function BattleResultScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { battleResults, claimRewards } = useLeagueStore();
  const [battle, setBattle] = useState<BattleResult | null>(null);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  
  useEffect(() => {
    if (id && battleResults.length > 0) {
      const foundBattle = battleResults.find(b => b.id === id);
      if (foundBattle) {
        setBattle(foundBattle);
      }
    }
  }, [id, battleResults]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleClaimRewards = async () => {
    if (battle) {
      await claimRewards(battle.id);
    }
  };
  
  const handleNextLog = () => {
    if (battle && currentLogIndex < battle.battleLog.length - 1) {
      setCurrentLogIndex(currentLogIndex + 1);
    }
  };
  
  const handlePrevLog = () => {
    if (currentLogIndex > 0) {
      setCurrentLogIndex(currentLogIndex - 1);
    }
  };
  
  if (!battle) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Battle Result',
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading battle result...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const currentLog = battle.battleLog[currentLogIndex];
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Battle Result',
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Battle Result</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.resultCard}>
          <View style={styles.battleType}>
            <Swords size={16} color={colors.primary} />
            <Text style={styles.battleTypeText}>
              {battle.isPvP ? 'PvP Battle' : 'League Battle'}
            </Text>
          </View>
          
          <View style={[
            styles.resultBanner,
            battle.winner === 'user' ? styles.winBanner : 
            battle.winner === 'opponent' ? styles.loseBanner : styles.drawBanner
          ]}>
            <Text style={styles.resultText}>
              {battle.winner === 'user' ? 'VICTORY!' : 
               battle.winner === 'opponent' ? 'DEFEAT' : 'DRAW'}
            </Text>
          </View>
          
          <View style={styles.battlersContainer}>
            <View style={styles.battlerCard}>
              <Image 
                source={{ uri: battle.userHolobot.image }} 
                style={styles.holobotImage} 
              />
              <Text style={styles.holobotName}>{battle.userHolobot.name}</Text>
              <Text style={styles.holobotLevel}>Lvl {battle.userHolobot.level}</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Heart size={14} color={colors.error} />
                  <Text style={styles.statText}>{battle.userHolobot.stats.health}</Text>
                </View>
                <View style={styles.statItem}>
                  <Swords size={14} color={colors.warning} />
                  <Text style={styles.statText}>{battle.userHolobot.stats.attack}</Text>
                </View>
                <View style={styles.statItem}>
                  <Shield size={14} color={colors.primary} />
                  <Text style={styles.statText}>{battle.userHolobot.stats.defense}</Text>
                </View>
                <View style={styles.statItem}>
                  <Zap size={14} color={colors.success} />
                  <Text style={styles.statText}>{battle.userHolobot.stats.speed}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            
            <View style={styles.battlerCard}>
              <Image 
                source={{ uri: battle.opponentHolobot.image }} 
                style={styles.holobotImage} 
              />
              <Text style={styles.holobotName}>{battle.opponentHolobot.name}</Text>
              <Text style={styles.holobotLevel}>Lvl {battle.opponentHolobot.level}</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Heart size={14} color={colors.error} />
                  <Text style={styles.statText}>{battle.opponentHolobot.stats.health}</Text>
                </View>
                <View style={styles.statItem}>
                  <Swords size={14} color={colors.warning} />
                  <Text style={styles.statText}>{battle.opponentHolobot.stats.attack}</Text>
                </View>
                <View style={styles.statItem}>
                  <Shield size={14} color={colors.primary} />
                  <Text style={styles.statText}>{battle.opponentHolobot.stats.defense}</Text>
                </View>
                <View style={styles.statItem}>
                  <Zap size={14} color={colors.success} />
                  <Text style={styles.statText}>{battle.opponentHolobot.stats.speed}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {battle.stepBuffs.totalSteps > 0 && (
            <View style={styles.buffsContainer}>
              <Text style={styles.buffsTitle}>Step Buffs Applied:</Text>
              <View style={styles.buffsList}>
                {battle.stepBuffs.healthBonus > 0 && (
                  <View style={styles.buffItem}>
                    <Heart size={14} color={colors.error} />
                    <Text style={styles.buffText}>+{Math.round(battle.stepBuffs.healthBonus * 100)}% HP</Text>
                  </View>
                )}
                {battle.stepBuffs.attackBonus > 0 && (
                  <View style={styles.buffItem}>
                    <Swords size={14} color={colors.warning} />
                    <Text style={styles.buffText}>+{Math.round(battle.stepBuffs.attackBonus * 100)}% ATK</Text>
                  </View>
                )}
                {battle.stepBuffs.meterChargeBonus > 0 && (
                  <View style={styles.buffItem}>
                    <Activity size={14} color={colors.success} />
                    <Text style={styles.buffText}>+{Math.round(battle.stepBuffs.meterChargeBonus * 100)}% Meter</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
        
        <Text style={styles.sectionTitle}>Battle Log</Text>
        
        <View style={styles.logContainer}>
          <View style={styles.logNavigation}>
            <TouchableOpacity 
              style={[styles.navButton, currentLogIndex === 0 && styles.navButtonDisabled]}
              onPress={handlePrevLog}
              disabled={currentLogIndex === 0}
            >
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
            <Text style={styles.logCounter}>
              Turn {currentLog.turn} ({currentLogIndex + 1}/{battle.battleLog.length})
            </Text>
            <TouchableOpacity 
              style={[styles.navButton, currentLogIndex === battle.battleLog.length - 1 && styles.navButtonDisabled]}
              onPress={handleNextLog}
              disabled={currentLogIndex === battle.battleLog.length - 1}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.logEntry}>
            <Text style={styles.logDescription}>{currentLog.description}</Text>
            
            {currentLog.specialAbility && (
              <View style={styles.specialAbilityContainer}>
                <Zap size={16} color={colors.warning} />
                <Text style={styles.specialAbilityText}>
                  Special Ability: {currentLog.specialAbility}
                </Text>
              </View>
            )}
            
            {currentLog.targetHp && (
              <View style={styles.hpContainer}>
                <View style={styles.hpItem}>
                  <Text style={styles.hpLabel}>Your HP:</Text>
                  <Text style={styles.hpValue}>{currentLog.targetHp.user}</Text>
                </View>
                <View style={styles.hpItem}>
                  <Text style={styles.hpLabel}>Opponent HP:</Text>
                  <Text style={styles.hpValue}>{currentLog.targetHp.opponent}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        
        {battle.rewards && (
          <View style={styles.rewardsContainer}>
            <View style={styles.rewardsHeader}>
              <Award size={20} color={colors.gold} />
              <Text style={styles.rewardsTitle}>Battle Rewards</Text>
            </View>
            
            <View style={styles.rewardsList}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardLabel}>Holos:</Text>
                <Text style={styles.rewardValue}>{battle.rewards.holos}</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardLabel}>Experience:</Text>
                <Text style={styles.rewardValue}>{battle.rewards.experience}</Text>
              </View>
              {battle.rewards.gachaTickets > 0 && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardLabel}>Gacha Tickets:</Text>
                  <Text style={styles.rewardValue}>{battle.rewards.gachaTickets}</Text>
                </View>
              )}
            </View>
            
            <Button
              title="Claim Rewards"
              onPress={handleClaimRewards}
              style={styles.claimButton}
            />
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  battleType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  battleTypeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  resultBanner: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  winBanner: {
    backgroundColor: colors.success,
  },
  loseBanner: {
    backgroundColor: colors.error,
  },
  drawBanner: {
    backgroundColor: colors.warning,
  },
  resultText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  battlersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  battlerCard: {
    flex: 2,
    alignItems: 'center',
    backgroundColor: colors.backgroundDarker,
    borderRadius: 8,
    padding: 12,
  },
  vsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  holobotImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  holobotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  holobotLevel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLighter,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
  buffsContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
  },
  buffsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  buffsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buffText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  logContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  logNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navButtonDisabled: {
    backgroundColor: colors.gray,
  },
  navButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  logCounter: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logEntry: {
    backgroundColor: colors.backgroundDarker,
    borderRadius: 8,
    padding: 12,
  },
  logDescription: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  specialAbilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  specialAbilityText: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: 8,
    fontWeight: '600',
  },
  hpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hpItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hpLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  hpValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  rewardsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  rewardsList: {
    marginBottom: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  claimButton: {
    marginTop: 8,
  },
});