import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { HolobotCard } from '@/components/HolobotCard';
import { ExperienceBar } from '@/components/ExperienceBar';
import { colors } from '@/constants/colors';
import { HOLOBOT_STATS } from '@/types/holobot';
import { getExperienceProgress } from '@/utils/battleUtils';
import { useAuthStore } from '@/store/auth-store';
import { Gem, Award, ArrowUp } from 'lucide-react-native';

interface ArenaPreBattleMenuProps {
  onHolobotSelect: (holobotKey: string) => void;
  onEntryFeeMethod: (method: 'tokens' | 'pass') => void;
  entryFee: number;
}

export const ArenaPreBattleMenu: React.FC<ArenaPreBattleMenuProps> = ({
  onHolobotSelect,
  onEntryFeeMethod,
  entryFee
}) => {
  const { user } = useAuthStore();
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [userHolobots, setUserHolobots] = useState<any[]>([]);

  useEffect(() => {
    if (user?.holobots && Array.isArray(user.holobots)) {
      setUserHolobots(user.holobots);
      
      // Auto-select the first holobot if available
      if (user.holobots.length > 0 && !selectedHolobot) {
        const firstHolobot = user.holobots[0];
        const holobotKey = getHolobotKeyByName(firstHolobot.name);
        setSelectedHolobot(holobotKey);
        onHolobotSelect(holobotKey); // Automatically notify parent of selection
      }
    }
  }, [user, selectedHolobot, onHolobotSelect]);

  // Get the holobot key from HOLOBOT_STATS based on name
  const getHolobotKeyByName = (name: string): string => {
    const lowerName = name.toLowerCase();
    const key = Object.keys(HOLOBOT_STATS).find(
      k => HOLOBOT_STATS[k].name.toLowerCase() === lowerName
    );
    return key || Object.keys(HOLOBOT_STATS)[0]; // fallback to first holobot if not found
  };

  // Apply attribute boosts to base stats
  const applyAttributeBoosts = (baseStats: any, userHolobot: any) => {
    if (!userHolobot || !userHolobot.boostedAttributes) return baseStats;
    
    return {
      ...baseStats,
      attack: baseStats.attack + (userHolobot.boostedAttributes.attack || 0),
      defense: baseStats.defense + (userHolobot.boostedAttributes.defense || 0),
      speed: baseStats.speed + (userHolobot.boostedAttributes.speed || 0),
      maxHealth: baseStats.maxHealth + (userHolobot.boostedAttributes.health || 0)
    };
  };

  const handleHolobotSelect = (holobotKey: string) => {
    try {
      setSelectedHolobot(holobotKey);
      onHolobotSelect(holobotKey); // Notify parent component about the selection
    } catch (error) {
      console.error('Error selecting holobot:', error);
      Alert.alert(
        "Selection Error",
        "There was an error selecting your Holobot. Please try again."
      );
    }
  };

  const handlePayWithTokens = () => {
    try {
      if (!selectedHolobot) {
        Alert.alert("Selection Required", "Please select a Holobot first");
        return;
      }
      
      if (!user || (user.holosTokens || 0) < entryFee) {
        Alert.alert("Insufficient Tokens", `You need ${entryFee} Holos tokens to enter the Arena.`);
        return;
      }
      
      onEntryFeeMethod('tokens');
    } catch (error) {
      console.error('Error paying with tokens:', error);
      Alert.alert(
        "Payment Error",
        "There was an error processing your payment. Please try again."
      );
    }
  };

  const handleUseArenaPass = () => {
    try {
      if (!selectedHolobot) {
        Alert.alert("Selection Required", "Please select a Holobot first");
        return;
      }
      
      if (!user || !(user.arena_passes && user.arena_passes > 0)) {
        Alert.alert("No Arena Passes", "You don't have any Arena Passes available.");
        return;
      }
      
      onEntryFeeMethod('pass');
    } catch (error) {
      console.error('Error using arena pass:', error);
      Alert.alert(
        "Arena Pass Error",
        "There was an error using your Arena Pass. Please try again."
      );
    }
  };

  // Calculate total attribute points spent
  const getTotalAttributePoints = (holobot: any) => {
    if (!holobot || !holobot.boostedAttributes) return 0;
    
    return (
      (holobot.boostedAttributes.attack || 0) +
      (holobot.boostedAttributes.defense || 0) +
      (holobot.boostedAttributes.speed || 0) +
      (holobot.boostedAttributes.health || 0)
    );
  };

  // Calculate available attribute points
  const getAvailableAttributePoints = (holobot: any) => {
    if (!holobot) return 0;
    
    // Formula: 3 points per level after level 1
    const totalPoints = (holobot.level - 1) * 3;
    const usedPoints = getTotalAttributePoints(holobot);
    
    return totalPoints - usedPoints;
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Champion</Text>
      </View>
      
      <View style={styles.content}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {userHolobots.length > 0 ? (
            userHolobots.map((holobot, index) => {
              const holobotKey = getHolobotKeyByName(holobot.name);
              const isSelected = selectedHolobot === holobotKey;
              const baseStats = HOLOBOT_STATS[holobotKey] || HOLOBOT_STATS.ace;
              
              // Apply attribute boosts
              const boostedStats = applyAttributeBoosts(baseStats, holobot);
              const availablePoints = getAvailableAttributePoints(holobot);
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.holobotItem,
                    isSelected && styles.selectedHolobot
                  ]}
                  onPress={() => handleHolobotSelect(holobotKey)}
                >
                  <View style={styles.holobotCard}>
                    <HolobotCard 
                      stats={{
                        ...boostedStats,
                        level: holobot.level || 1,
                        name: holobot.name
                      }} 
                      variant={isSelected ? "blue" : "blue"} 
                      showBoosts={true}
                      boosts={holobot.boostedAttributes}
                    />
                    {isSelected && (
                      <View>
                        <ExperienceBar 
                          progress={getExperienceProgress(holobot.experience || 0, holobot.level || 1).percentage / 100}
                          level={holobot.level || 1}
                        />
                        
                        {availablePoints > 0 && (
                          <View style={styles.attributePointsContainer}>
                            <ArrowUp size={14} color={colors.success} />
                            <Text style={styles.attributePointsText}>
                              {availablePoints} attribute points available
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                You don't have any Holobots yet. Visit the Gacha page to get some!
              </Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.entryOptions}>
          <View style={styles.entryOption}>
            <Text style={styles.entryLabel}>Entry fee: {entryFee} Holos tokens</Text>
            <Text style={styles.balanceText}>Your balance: {user?.holosTokens || 0} Holos</Text>
            <Button 
              title="Pay Entry Fee"
              onPress={handlePayWithTokens}
              disabled={!user || (user.holosTokens || 0) < entryFee || !selectedHolobot}
              icon={<Gem size={16} color={colors.text} />}
              variant="primary"
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.entryOption}>
            <Text style={styles.entryLabel}>Your Arena Passes: {user?.arena_passes || 0}</Text>
            <Button
              title="Use Arena Pass"
              onPress={handleUseArenaPass}
              disabled={!user || !(user.arena_passes && user.arena_passes > 0) || !selectedHolobot}
              icon={<Award size={16} color={colors.text} />}
              variant="warning"
            />
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 12,
  },
  holobotItem: {
    borderRadius: 8,
    padding: 4,
    opacity: 0.7,
  },
  selectedHolobot: {
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: 1,
  },
  holobotCard: {
    width: 120,
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  entryOptions: {
    marginTop: 16,
    flexDirection: 'row',
  },
  entryOption: {
    flex: 1,
    padding: 8,
  },
  entryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  balanceText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  attributePointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    backgroundColor: colors.cardLight,
    borderRadius: 4,
    padding: 4,
  },
  attributePointsText: {
    fontSize: 10,
    color: colors.success,
    marginLeft: 4,
    fontWeight: 'bold',
  },
});