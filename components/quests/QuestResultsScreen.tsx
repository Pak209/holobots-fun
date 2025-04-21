import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { colors } from '@/constants/colors';
import { HOLOBOT_STATS } from '@/types/holobot';
import { Button } from '@/components/Button';
import { 
  Trophy, 
  Award, 
  Gem, 
  Star, 
  ArrowUp, 
  X, 
  Check, 
  Frown 
} from 'lucide-react-native';

interface QuestResultsScreenProps {
  isVisible: boolean;
  isSuccess: boolean;
  squadHolobotKeys: string[];
  squadHolobotExp: Array<{
    name: string;
    xp: number;
    levelUp: boolean;
    newLevel: number;
  }>;
  blueprintRewards?: {
    holobotKey: string;
    amount: number;
  };
  holosRewards: number;
  onClose: () => void;
}

export function QuestResultsScreen({ 
  isVisible, 
  isSuccess, 
  squadHolobotKeys,
  squadHolobotExp,
  blueprintRewards,
  holosRewards,
  onClose 
}: QuestResultsScreenProps) {
  const [animation] = useState(new Animated.Value(0));
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      // Reset states
      setShowDetails(false);
      animation.setValue(0);
      
      // Start animation sequence
      Animated.sequence([
        // Fade in result
        Animated.timing(animation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // Hold
        Animated.delay(500),
      ]).start(() => {
        // Show details
        setShowDetails(true);
      });
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  // Get blueprint holobot name if available
  const blueprintHolobotName = blueprintRewards 
    ? HOLOBOT_STATS[blueprintRewards.holobotKey]?.name || 'Unknown' 
    : '';
  
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={[
            styles.resultHeader,
            isSuccess ? styles.successHeader : styles.failureHeader
          ]}>
            <Animated.View 
              style={[
                styles.resultIconContainer,
                { opacity: animation }
              ]}
            >
              {isSuccess ? (
                <Trophy size={40} color={colors.text} />
              ) : (
                <Frown size={40} color={colors.text} />
              )}
            </Animated.View>
            <Text style={styles.resultTitle}>
              {isSuccess ? 'QUEST COMPLETE!' : 'QUEST FAILED'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {showDetails && (
            <ScrollView style={styles.detailsContainer}>
              {/* Experience Gained */}
              {squadHolobotExp.some(item => item.xp > 0) && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Award size={18} color={colors.primary} />
                    <Text style={styles.sectionTitle}>Experience Gained</Text>
                  </View>
                  
                  <View style={styles.expList}>
                    {squadHolobotExp.map((item, index) => (
                      <View key={index} style={styles.expItem}>
                        <View style={styles.expHolobot}>
                          <View style={styles.holobotAvatar}>
                            <Text style={styles.holobotInitial}>
                              {item.name.charAt(0)}
                            </Text>
                          </View>
                          <Text style={styles.holobotName}>{item.name}</Text>
                        </View>
                        
                        <View style={styles.expDetails}>
                          {item.xp > 0 ? (
                            <>
                              <Text style={styles.expValue}>+{item.xp} XP</Text>
                              {item.levelUp && (
                                <View style={styles.levelUpTag}>
                                  <ArrowUp size={12} color={colors.text} />
                                  <Text style={styles.levelUpText}>
                                    Lv.{item.newLevel}
                                  </Text>
                                </View>
                              )}
                            </>
                          ) : (
                            <Text style={styles.noExpText}>No XP</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Rewards */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Gem size={18} color={colors.accent} />
                  <Text style={styles.sectionTitle}>Rewards</Text>
                </View>
                
                <View style={styles.rewardsList}>
                  {/* Blueprint Pieces */}
                  {blueprintRewards && (
                    <View style={styles.rewardItem}>
                      <View style={styles.rewardIcon}>
                        <Gem size={20} color={colors.accent} />
                      </View>
                      <View style={styles.rewardDetails}>
                        <Text style={styles.rewardTitle}>Blueprint Pieces</Text>
                        <Text style={styles.rewardValue}>
                          +{blueprintRewards.amount} {blueprintHolobotName} Pieces
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Holos Tokens */}
                  {holosRewards > 0 && (
                    <View style={styles.rewardItem}>
                      <View style={styles.rewardIcon}>
                        <Star size={20} color={colors.warning} />
                      </View>
                      <View style={styles.rewardDetails}>
                        <Text style={styles.rewardTitle}>Holos Tokens</Text>
                        <Text style={styles.rewardValue}>
                          +{holosRewards} Holos
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {/* No Rewards */}
                  {!blueprintRewards && holosRewards <= 0 && (
                    <View style={styles.noRewardsMessage}>
                      <Text style={styles.noRewardsText}>
                        No rewards earned from this quest
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              {/* Cooldown Notice for Failed Quests */}
              {!isSuccess && (
                <View style={styles.cooldownNotice}>
                  <View style={styles.cooldownIcon}>
                    <X size={16} color={colors.text} />
                  </View>
                  <Text style={styles.cooldownText}>
                    Your Holobots need time to recover from this defeat. They will be on cooldown for 30 minutes.
                  </Text>
                </View>
              )}
              
              <Button
                title="Close"
                onPress={onClose}
                variant={isSuccess ? "primary" : "outline"}
                style={styles.closeButtonLarge}
              />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resultHeader: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  successHeader: {
    backgroundColor: colors.success,
  },
  failureHeader: {
    backgroundColor: colors.danger,
  },
  resultIconContainer: {
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  expList: {
    marginBottom: 8,
  },
  expItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expHolobot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holobotAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  holobotInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  holobotName: {
    fontSize: 14,
    color: colors.text,
  },
  expDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 8,
  },
  levelUpTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  levelUpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 2,
  },
  noExpText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  rewardsList: {
    marginBottom: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardDetails: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  rewardValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  noRewardsMessage: {
    padding: 16,
    alignItems: 'center',
  },
  noRewardsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  cooldownNotice: {
    flexDirection: 'row',
    backgroundColor: colors.danger + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.danger + '30',
  },
  cooldownIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cooldownText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  closeButtonLarge: {
    marginTop: 8,
    marginBottom: 16,
  },
});