import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { FileText, ChevronDown, ChevronUp, Info, AlertTriangle, ArrowUp } from 'lucide-react-native';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';

// Types
interface User {
  blueprints?: Record<string, number>;
  holobots: Array<{
    name: string;
    level: number;
    experience: number;
    nextLevelExp: number;
    boostedAttributes: Record<string, any>;
    rank?: string;
    attributePoints?: number;
  }>;
}

interface AuthContext {
  user: User | null;
  updateUser: (data: Partial<User>) => Promise<void>;
}

// Mock auth context - replace with actual implementation
const useAuth = (): AuthContext => {
  return {
    user: null,
    updateUser: async () => {}
  };
};

// Blueprint tiers definition
export const BLUEPRINT_TIERS = {
  common: { required: 5, name: "Common", color: colors.textSecondary, startLevel: 1 },
  champion: { required: 10, name: "Champion", color: colors.success, startLevel: 11 },
  rare: { required: 20, name: "Rare", color: colors.primary, startLevel: 21 },
  elite: { required: 40, name: "Elite", color: colors.purple, startLevel: 31 },
  legendary: { required: 80, name: "Legendary", color: colors.warning, startLevel: 41 }
};

const getTierColor = (tierName: string) => {
  switch(tierName) {
    case "Common": return colors.textSecondary;
    case "Champion": return colors.success;
    case "Rare": return colors.primary;
    case "Elite": return colors.purple;
    case "Legendary": return colors.warning;
    default: return colors.textSecondary;
  }
};

const calculateMintTier = (blueprintCount: number) => {
  if (blueprintCount >= BLUEPRINT_TIERS.legendary.required) return BLUEPRINT_TIERS.legendary;
  if (blueprintCount >= BLUEPRINT_TIERS.elite.required) return BLUEPRINT_TIERS.elite;
  if (blueprintCount >= BLUEPRINT_TIERS.rare.required) return BLUEPRINT_TIERS.rare;
  if (blueprintCount >= BLUEPRINT_TIERS.champion.required) return BLUEPRINT_TIERS.champion;
  if (blueprintCount >= BLUEPRINT_TIERS.common.required) return BLUEPRINT_TIERS.common;
  return null;
};

const getNextTierProgress = (blueprintCount: number) => {
  const currentTier = calculateMintTier(blueprintCount);
  let nextTierRequired = BLUEPRINT_TIERS.common.required;
  let progress = 0;
  
  if (!currentTier) {
    progress = (blueprintCount / BLUEPRINT_TIERS.common.required) * 100;
  } else if (currentTier.name === "Common") {
    progress = ((blueprintCount - BLUEPRINT_TIERS.common.required) / 
                (BLUEPRINT_TIERS.champion.required - BLUEPRINT_TIERS.common.required)) * 100;
    nextTierRequired = BLUEPRINT_TIERS.champion.required;
  } else if (currentTier.name === "Champion") {
    progress = ((blueprintCount - BLUEPRINT_TIERS.champion.required) / 
                (BLUEPRINT_TIERS.rare.required - BLUEPRINT_TIERS.champion.required)) * 100;
    nextTierRequired = BLUEPRINT_TIERS.rare.required;
  } else if (currentTier.name === "Rare") {
    progress = ((blueprintCount - BLUEPRINT_TIERS.rare.required) / 
                (BLUEPRINT_TIERS.elite.required - BLUEPRINT_TIERS.rare.required)) * 100;
    nextTierRequired = BLUEPRINT_TIERS.elite.required;
  } else if (currentTier.name === "Elite") {
    progress = ((blueprintCount - BLUEPRINT_TIERS.elite.required) / 
                (BLUEPRINT_TIERS.legendary.required - BLUEPRINT_TIERS.elite.required)) * 100;
    nextTierRequired = BLUEPRINT_TIERS.legendary.required;
  } else {
    progress = 100;
    nextTierRequired = BLUEPRINT_TIERS.legendary.required;
  }
  
  return { progress: Math.min(100, Math.max(0, progress)), nextTierRequired };
};

const getAttributePointsForTier = (tierName: string): number => {
  switch(tierName) {
    case "Legendary": return 40;
    case "Elite": return 30;
    case "Rare": return 20;
    case "Champion": return 10;
    case "Common":
    default: return 10;
  }
};

interface BlueprintSectionProps {
  holobotKey: string;
  holobotName: string;
}

export const BlueprintSection: React.FC<BlueprintSectionProps> = ({
  holobotKey,
  holobotName
}) => {
  const { user, updateUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'new' | 'upgrade'>('new');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  
  const blueprintCount = user?.blueprints?.[holobotKey] || 0;
  const currentTier = calculateMintTier(blueprintCount);
  const { progress, nextTierRequired } = getNextTierProgress(blueprintCount);
  
  const userHolobot = user?.holobots?.find(h => h.name.toLowerCase() === holobotName.toLowerCase());
  const userOwnsHolobot = !!userHolobot;
  
  const handleRedeemBlueprints = async () => {
    if (!user || !currentTier || (userOwnsHolobot && selectedTab === 'new')) return;
    
    try {
      setIsRedeeming(true);
      
      const attributePoints = getAttributePointsForTier(currentTier.name);
      
      const newHolobot = {
        name: holobotName,
        level: currentTier.startLevel,
        experience: 0,
        nextLevelExp: 100,
        boostedAttributes: {},
        rank: currentTier.name,
        attributePoints
      };
      
      const updatedHolobots = [...(user.holobots || []), newHolobot];
      
      const updatedBlueprints = {
        ...(user.blueprints || {}),
        [holobotKey]: blueprintCount - currentTier.required
      };
      
      await updateUser({
        holobots: updatedHolobots,
        blueprints: updatedBlueprints
      });
      
    } catch (error) {
      console.error("Error redeeming blueprint:", error);
    } finally {
      setIsRedeeming(false);
    }
  };
  
  const handleUpgradeHolobot = async () => {
    if (!user || !userHolobot || !selectedTier) return;
    
    const selectedTierInfo = Object.values(BLUEPRINT_TIERS).find(tier => tier.name === selectedTier);
    if (!selectedTierInfo) return;
    
    try {
      setIsUpgrading(true);
      
      if (blueprintCount < selectedTierInfo.required) {
        return;
      }
      
      const attributePoints = getAttributePointsForTier(selectedTier);
      
      const updatedHolobots = user.holobots.map(h => {
        if (h.name.toLowerCase() === holobotName.toLowerCase()) {
          return {
            ...h,
            level: selectedTierInfo.startLevel,
            rank: selectedTier,
            experience: 0,
            nextLevelExp: 100,
            boostedAttributes: h.boostedAttributes || {},
            attributePoints: (h.attributePoints || 0) + attributePoints
          };
        }
        return h;
      });
      
      const updatedBlueprints = {
        ...(user.blueprints || {}),
        [holobotKey]: blueprintCount - selectedTierInfo.required
      };
      
      await updateUser({
        holobots: updatedHolobots,
        blueprints: updatedBlueprints
      });
      
    } catch (error) {
      console.error("Error upgrading holobot:", error);
    } finally {
      setIsUpgrading(false);
      setSelectedTier(null);
    }
  };

  return (
    <Card style={styles.container}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <FileText size={20} color={colors.primary} />
          <Text style={styles.title}>Blueprint Collection</Text>
        </View>
        {isExpanded ? (
          <ChevronUp size={20} color={colors.text} />
        ) : (
          <ChevronDown size={20} color={colors.text} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Blueprint Pieces:</Text>
              <Text style={styles.progressValue}>{blueprintCount}</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  Progress to {currentTier ? "Next Tier" : "Common Tier"}
                </Text>
                <Text style={styles.progressText}>
                  {blueprintCount} / {nextTierRequired}
                </Text>
              </View>
              <ProgressBar progress={progress} />
            </View>

            <View style={styles.tierGrid}>
              {Object.entries(BLUEPRINT_TIERS).map(([key, tier]) => (
                <View 
                  key={key}
                  style={[
                    styles.tierBadge,
                    {
                      backgroundColor: blueprintCount >= tier.required 
                        ? getTierColor(tier.name)
                        : colors.backgroundLighter
                    }
                  ]}
                >
                  <Text style={[
                    styles.tierText,
                    { color: blueprintCount >= tier.required ? colors.white : colors.textSecondary }
                  ]}>
                    {tier.name} ({tier.required})
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionSection}>
            <View style={styles.tabButtons}>
              <TouchableOpacity 
                style={[
                  styles.tabButton,
                  selectedTab === 'new' && styles.activeTab
                ]}
                onPress={() => setSelectedTab('new')}
              >
                <Text style={styles.tabButtonText}>Mint New</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.tabButton,
                  selectedTab === 'upgrade' && styles.activeTab
                ]}
                onPress={() => setSelectedTab('upgrade')}
                disabled={!userOwnsHolobot}
              >
                <Text style={[
                  styles.tabButtonText,
                  !userOwnsHolobot && styles.disabledText
                ]}>
                  Upgrade Existing
                </Text>
              </TouchableOpacity>
            </View>

            {selectedTab === 'new' ? (
              <View style={styles.tabContent}>
                {userOwnsHolobot ? (
                  <View style={styles.alert}>
                    <Info size={16} color={colors.primary} />
                    <Text style={styles.alertText}>
                      You already own this Holobot. Switch to the Upgrade tab to boost your existing Holobot's rank.
                    </Text>
                  </View>
                ) : currentTier ? (
                  <View>
                    <Text style={styles.actionText}>
                      You can redeem {currentTier.name} rank {holobotName}!
                    </Text>
                    <Button
                      title={isRedeeming ? "Redeeming..." : `Redeem for ${currentTier.required} Blueprints`}
                      onPress={handleRedeemBlueprints}
                      disabled={isRedeeming}
                      style={styles.actionButton}
                    />
                  </View>
                ) : (
                  <View style={styles.alert}>
                    <AlertTriangle size={16} color={colors.warning} />
                    <Text style={styles.alertText}>
                      Collect at least {BLUEPRINT_TIERS.common.required} blueprint pieces to redeem a Common rank Holobot.
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.tabContent}>
                {userOwnsHolobot ? (
                  <View>
                    <Text style={styles.sectionTitle}>Current {holobotName}:</Text>
                    <View style={styles.currentHolobot}>
                      <View style={[
                        styles.rankBadge,
                        { backgroundColor: getTierColor(userHolobot.rank || "Common") }
                      ]}>
                        <Text style={styles.rankText}>
                          {userHolobot.rank || "Common"}
                        </Text>
                      </View>
                      <Text style={styles.levelText}>Level {userHolobot.level}</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Select upgrade tier:</Text>
                    <View style={styles.tierSelection}>
                      {Object.entries(BLUEPRINT_TIERS).map(([key, tier]) => {
                        const isCurrentOrLower = 
                          getTierNumber(userHolobot.rank || "Common") >= getTierNumber(tier.name);
                        const hasEnoughBlueprints = blueprintCount >= tier.required;
                        
                        return (
                          <TouchableOpacity
                            key={key}
                            style={[
                              styles.tierOption,
                              selectedTier === tier.name && styles.selectedTier,
                              (isCurrentOrLower || !hasEnoughBlueprints) && styles.disabledTier
                            ]}
                            onPress={() => setSelectedTier(tier.name)}
                            disabled={isCurrentOrLower || !hasEnoughBlueprints}
                          >
                            <Text style={[
                              styles.tierOptionText,
                              (isCurrentOrLower || !hasEnoughBlueprints) && styles.disabledText
                            ]}>
                              {tier.name} (Level {tier.startLevel})
                            </Text>
                            <Text style={styles.tierRequirement}>
                              {tier.required} pieces
                            </Text>
                            {!hasEnoughBlueprints && (
                              <Text style={styles.tierNeedMore}>
                                Need {tier.required - blueprintCount} more
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Button
                      title={isUpgrading ? "Upgrading..." : "Upgrade Holobot"}
                      onPress={handleUpgradeHolobot}
                      disabled={isUpgrading || !selectedTier}
                      style={styles.actionButton}
                      icon={<ArrowUp size={16} color={colors.white} />}
                    />
                  </View>
                ) : (
                  <View style={styles.alert}>
                    <Info size={16} color={colors.primary} />
                    <Text style={styles.alertText}>
                      You don't own this Holobot yet. Mint it first before upgrading.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      )}
    </Card>
  );
};

const getTierNumber = (tierName: string): number => {
  switch(tierName) {
    case "Legendary": return 5;
    case "Elite": return 4;
    case "Rare": return 3;
    case "Champion": return 2;
    case "Common":
    default: return 1;
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  content: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.text,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tierBadge: {
    flex: 1,
    minWidth: '18%',
    padding: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  tierText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionSection: {
    marginTop: 16,
  },
  tabButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  tabContent: {
    marginTop: 8,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.backgroundLighter,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  actionText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  actionButton: {
    marginTop: 8,
  },
  currentHolobot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  rankText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
  },
  levelText: {
    fontSize: 12,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  tierSelection: {
    marginBottom: 16,
  },
  tierOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: colors.backgroundLighter,
  },
  selectedTier: {
    backgroundColor: colors.primary + '30',
  },
  disabledTier: {
    opacity: 0.5,
  },
  tierOptionText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
  },
  tierRequirement: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8,
  },
  tierNeedMore: {
    fontSize: 10,
    color: colors.danger,
  },
});