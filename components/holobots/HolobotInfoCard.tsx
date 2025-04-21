import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronDown, ChevronUp, Zap, Shield, Wind, Brain, Heart, Award, Crown, Plus, Coins } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { HolobotStats, getRank } from '@/types/holobot';
import { ProgressBar } from '@/components/ProgressBar';
import { getHolobotImageUrl } from '@/utils/holobotUtils';
import { BlueprintSection } from './BlueprintSection';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

interface HolobotInfoCardProps {
  holobotKey: string;
  holobot: HolobotStats;
  userHolobot?: any;
  userTokens?: number;
  isMinting?: boolean;
  justMinted?: boolean;
  isActive?: boolean;
  onSelect?: () => void;
  onMint?: (holobotName: string) => void;
}

export const HolobotInfoCard: React.FC<HolobotInfoCardProps> = ({
  holobotKey,
  holobot,
  userHolobot,
  userTokens = 0,
  isMinting = false,
  justMinted = false,
  isActive = false,
  onSelect,
  onMint
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (onSelect && !isExpanded) {
      onSelect();
    }
  };
  
  const mintCost = 100; // Updated to match Holobots.fun
  const canMint = userTokens >= mintCost;
  const isOwned = !!userHolobot;
  
  const level = userHolobot?.level || holobot.level;
  const currentXp = userHolobot?.experience || 0;
  const nextLevelXp = userHolobot?.nextLevelExp || 100;
  const holobotRank = userHolobot?.rank || "Common";
  const attributePoints = userHolobot?.attributePoints || 0;

  const handleMint = () => {
    if (onMint && !isOwned && canMint) {
      onMint(holobot.name);
    }
  };

  const handleBoostAttribute = async (attribute: 'attack' | 'defense' | 'speed' | 'health') => {
    if (!isOwned || !user) return;
    
    try {
      if (!user.holobots || !Array.isArray(user.holobots)) {
        throw new Error("User holobots data is not available");
      }
      
      const targetHolobot = user.holobots.find(h => h.name.toLowerCase() === holobot.name.toLowerCase());
      if (!targetHolobot || !(targetHolobot.attributePoints && targetHolobot.attributePoints > 0)) {
        toast({
          title: "No Attribute Points",
          description: "You don't have any attribute points to spend.",
          variant: "destructive"
        });
        return;
      }
      
      const updatedHolobots = user.holobots.map(h => {
        if (h.name.toLowerCase() === holobot.name.toLowerCase()) {
          const boostedAttributes = h.boostedAttributes || {};
          
          if (attribute === 'health') {
            boostedAttributes.health = (boostedAttributes.health || 0) + 10;
          } else {
            boostedAttributes[attribute] = (boostedAttributes[attribute] || 0) + 1;
          }
          
          return {
            ...h,
            boostedAttributes,
            attributePoints: (h.attributePoints || 0) - 1
          };
        }
        return h;
      });
      
      await updateUser({ holobots: updatedHolobots });
      
      toast({
        title: "Attribute Boosted",
        description: `Increased ${attribute} for ${holobot.name}`,
      });
    } catch (error) {
      console.error("Error boosting attribute:", error);
      toast({
        title: "Error",
        description: "Failed to boost attribute",
        variant: "destructive"
      });
    }
  };

  // Calculate attribute boosts if user owns this holobot
  const boostedAttributes = userHolobot?.boostedAttributes || {};
  
  return (
    <Card style={[styles.container, isActive && styles.activeContainer]}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: getHolobotImageUrl(holobotKey) }} 
              style={styles.image} 
              resizeMode="cover"
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{holobot.name}</Text>
            <Text style={styles.level}>Level {level}</Text>
            {holobotRank !== "Common" && (
              <View style={[styles.rankBadge, getRankStyle(holobotRank)]}>
                <Crown size={12} color={colors.text} />
                <Text style={styles.rankText}>{holobotRank}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.headerRight}>
          {isOwned && (
            <View style={styles.ownedBadge}>
              <Text style={styles.ownedText}>OWNED</Text>
            </View>
          )}
          {justMinted && (
            <View style={styles.mintedBadge}>
              <Text style={styles.mintedText}>NEW</Text>
            </View>
          )}
          {isExpanded ? (
            <ChevronUp size={24} color={colors.text} />
          ) : (
            <ChevronDown size={24} color={colors.text} />
          )}
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.content}>
          {isOwned && (
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>Experience</Text>
              <View style={styles.progressRow}>
                <ProgressBar 
                  progress={currentXp / nextLevelXp} 
                  fillColor={colors.primary}
                />
                <Text style={styles.progressText}>
                  {currentXp}/{nextLevelXp}
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Stats</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Heart size={18} color={colors.danger} />
                <Text style={styles.statLabel}>Health</Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>{holobot.maxHealth}</Text>
                  {isOwned && boostedAttributes.health > 0 && (
                    <Text style={styles.statBoost}>+{boostedAttributes.health}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.statItem}>
                <Zap size={18} color={colors.warning} />
                <Text style={styles.statLabel}>Attack</Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>{holobot.attack}</Text>
                  {isOwned && boostedAttributes.attack > 0 && (
                    <Text style={styles.statBoost}>+{boostedAttributes.attack}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.statItem}>
                <Shield size={18} color={colors.accent} />
                <Text style={styles.statLabel}>Defense</Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>{holobot.defense}</Text>
                  {isOwned && boostedAttributes.defense > 0 && (
                    <Text style={styles.statBoost}>+{boostedAttributes.defense}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.statItem}>
                <Wind size={18} color={colors.secondary} />
                <Text style={styles.statLabel}>Speed</Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>{holobot.speed}</Text>
                  {isOwned && boostedAttributes.speed > 0 && (
                    <Text style={styles.statBoost}>+{boostedAttributes.speed}</Text>
                  )}
                </View>
              </View>
            </View>

            {isOwned && attributePoints > 0 && (
              <View style={styles.boostSection}>
                <View style={styles.boostHeader}>
                  <Text style={styles.boostTitle}>Available Boosts</Text>
                  <View style={styles.pointsBadge}>
                    <Zap size={12} color={colors.primary} />
                    <Text style={styles.pointsText}>{attributePoints}</Text>
                  </View>
                </View>
                <View style={styles.boostGrid}>
                  <TouchableOpacity 
                    style={[styles.boostButton, attributePoints === 0 && styles.boostButtonDisabled]}
                    onPress={() => handleBoostAttribute('attack')}
                    disabled={attributePoints === 0}
                  >
                    <Text style={styles.boostButtonText}>+1 ATK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.boostButton, attributePoints === 0 && styles.boostButtonDisabled]}
                    onPress={() => handleBoostAttribute('defense')}
                    disabled={attributePoints === 0}
                  >
                    <Text style={styles.boostButtonText}>+1 DEF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.boostButton, attributePoints === 0 && styles.boostButtonDisabled]}
                    onPress={() => handleBoostAttribute('speed')}
                    disabled={attributePoints === 0}
                  >
                    <Text style={styles.boostButtonText}>+1 SPD</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.boostButton, attributePoints === 0 && styles.boostButtonDisabled]}
                    onPress={() => handleBoostAttribute('health')}
                    disabled={attributePoints === 0}
                  >
                    <Text style={styles.boostButtonText}>+10 HP</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          
          {holobot.abilityDescription && (
            <View style={styles.abilitySection}>
              <Text style={styles.sectionTitle}>Special Ability</Text>
              <Text style={styles.abilityName}>{holobot.specialMove}</Text>
              <Text style={styles.abilityDescription}>{holobot.abilityDescription}</Text>
            </View>
          )}
          
          <BlueprintSection
            holobotKey={holobotKey}
            holobotName={holobot.name}
          />
          
          {!isOwned && (
            <View style={styles.mintSection}>
              <Button
                title={`Mint for ${mintCost} HOLOS`}
                onPress={handleMint}
                disabled={!canMint || isMinting}
                variant={canMint ? "primary" : "outline"}
                size="medium"
                icon={<Award size={18} color={colors.text} />}
                loading={isMinting}
                fullWidth
              />
              {!canMint && (
                <Text style={styles.mintWarning}>
                  Not enough HOLOS tokens. You need {mintCost} tokens.
                </Text>
              )}
              {justMinted && (
                <Text style={styles.mintSuccess}>
                  Successfully minted! Refresh to see your new Holobot.
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </Card>
  );
};

const getRankStyle = (rank: string) => {
  switch(rank) {
    case "Legendary": return styles.legendaryRank;
    case "Elite": return styles.eliteRank;
    case "Rare": return styles.rareRank;
    case "Champion": return styles.championRank;
    default: return styles.commonRank;
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  activeContainer: {
    borderColor: colors.primary,
    borderWidth: 2,
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
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    marginLeft: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  level: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  legendaryRank: {
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    borderColor: '#f97316',
  },
  eliteRank: {
    backgroundColor: 'rgba(202, 138, 4, 0.2)',
    borderColor: '#eab308',
  },
  rareRank: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderColor: '#a855f7',
  },
  championRank: {
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    borderColor: '#22c55e',
  },
  commonRank: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderColor: '#3b82f6',
  },
  rankText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownedBadge: {
    backgroundColor: colors.success,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  ownedText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  mintedBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  mintedText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressRow: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  statsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statBoost: {
    fontSize: 14,
    color: colors.success,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  boostSection: {
    marginTop: 16,
  },
  boostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  boostTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pointsText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
  boostGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  boostButton: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    width: '48%',
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  boostButtonDisabled: {
    backgroundColor: 'rgba(75, 85, 99, 0.2)',
    borderColor: 'rgba(75, 85, 99, 0.4)',
  },
  boostButtonText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  abilitySection: {
    marginBottom: 16,
  },
  abilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 4,
  },
  abilityDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  mintSection: {
    marginTop: 8,
  },
  mintWarning: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 8,
  },
  mintSuccess: {
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
    marginTop: 8,
  },
});