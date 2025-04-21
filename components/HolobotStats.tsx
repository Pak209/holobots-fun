import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ProgressBar } from '@/components/ProgressBar';
import { Card } from '@/components/Card';
import { Holobot } from '@/types/holobot';
import { colors } from '@/constants/colors';
import { Shield, Zap, Brain, Wind, Heart, ArrowUp, Plus } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { getHolobotImageUrl } from '@/utils/holobotUtils';

interface HolobotStatsProps {
  holobot: Holobot;
  onAttributeBoost?: (attribute: 'attack' | 'defense' | 'speed' | 'health') => void;
}

export const HolobotStats: React.FC<HolobotStatsProps> = ({ 
  holobot,
  onAttributeBoost
}) => {
  const { user } = useAuthStore();
  
  // Find the user's holobot to get attribute points
  const userHolobot = user?.holobots?.find(h => h.name === holobot.name);
  const attributePoints = userHolobot?.attributePoints || 0;
  const boostedAttributes = userHolobot?.boostedAttributes || {};
  
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: getHolobotImageUrl(holobot.name.toLowerCase()) }} 
          style={styles.image} 
          resizeMode="cover"
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{holobot.name}</Text>
          <View style={styles.rankContainer}>
            <Text style={[styles.rankText, { color: colors.accent }]}>Rank {holobot.rank}</Text>
            <Text style={[styles.levelText, { color: colors.secondary }]}>Level {holobot.level}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Energy</Text>
          <ProgressBar 
            progress={holobot.energy / holobot.maxEnergy} 
            fillColor={colors.secondary}
          />
          <Text style={styles.statValue}>{holobot.energy}/{holobot.maxEnergy}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Hack Meter</Text>
          <ProgressBar 
            progress={holobot.hackMeter / holobot.maxHackMeter} 
            fillColor={colors.accent}
          />
          <Text style={styles.statValue}>{holobot.hackMeter}/{holobot.maxHackMeter}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Sync Points</Text>
          <Text style={styles.syncPoints}>{holobot.syncPoints}</Text>
        </View>
        
        {attributePoints > 0 && (
          <View style={styles.attributePointsContainer}>
            <ArrowUp size={16} color={colors.success} />
            <Text style={styles.attributePointsText}>
              {attributePoints} attribute points available
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.attributesContainer}>
        <Text style={styles.attributesTitle}>Attributes</Text>
        <View style={styles.attributesGrid}>
          <View style={styles.attributeItem}>
            <Zap size={20} color={colors.warning} />
            <Text style={styles.attributeLabel}>Strength</Text>
            <View style={styles.attributeValueContainer}>
              <Text style={styles.attributeValue}>{holobot.attributes.strength}</Text>
              {boostedAttributes.attack && boostedAttributes.attack > 0 && (
                <Text style={styles.attributeBoost}>+{boostedAttributes.attack}</Text>
              )}
              {attributePoints > 0 && onAttributeBoost && (
                <TouchableOpacity 
                  style={styles.boostButton}
                  onPress={() => onAttributeBoost('attack')}
                >
                  <Plus size={14} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.attributeItem}>
            <Wind size={20} color={colors.secondary} />
            <Text style={styles.attributeLabel}>Agility</Text>
            <View style={styles.attributeValueContainer}>
              <Text style={styles.attributeValue}>{holobot.attributes.agility}</Text>
              {boostedAttributes.speed && boostedAttributes.speed > 0 && (
                <Text style={styles.attributeBoost}>+{boostedAttributes.speed}</Text>
              )}
              {attributePoints > 0 && onAttributeBoost && (
                <TouchableOpacity 
                  style={styles.boostButton}
                  onPress={() => onAttributeBoost('speed')}
                >
                  <Plus size={14} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.attributeItem}>
            <Brain size={20} color={colors.primary} />
            <Text style={styles.attributeLabel}>Intelligence</Text>
            <View style={styles.attributeValueContainer}>
              <Text style={styles.attributeValue}>{holobot.attributes.intelligence}</Text>
              {attributePoints > 0 && onAttributeBoost && (
                <TouchableOpacity 
                  style={styles.boostButton}
                  onPress={() => onAttributeBoost('intelligence')}
                >
                  <Plus size={14} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.attributeItem}>
            <Shield size={20} color={colors.accent} />
            <Text style={styles.attributeLabel}>Durability</Text>
            <View style={styles.attributeValueContainer}>
              <Text style={styles.attributeValue}>{holobot.attributes.durability}</Text>
              {boostedAttributes.defense && boostedAttributes.defense > 0 && (
                <Text style={styles.attributeBoost}>+{boostedAttributes.defense}</Text>
              )}
              {attributePoints > 0 && onAttributeBoost && (
                <TouchableOpacity 
                  style={styles.boostButton}
                  onPress={() => onAttributeBoost('defense')}
                >
                  <Plus size={14} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.attributeItem}>
            <Heart size={20} color={colors.danger} />
            <Text style={styles.attributeLabel}>Health</Text>
            <View style={styles.attributeValueContainer}>
              <Text style={styles.attributeValue}>{holobot.stats.maxHealth || 100}</Text>
              {boostedAttributes.health && boostedAttributes.health > 0 && (
                <Text style={styles.attributeBoost}>+{boostedAttributes.health}</Text>
              )}
              {attributePoints > 0 && onAttributeBoost && (
                <TouchableOpacity 
                  style={styles.boostButton}
                  onPress={() => onAttributeBoost('health')}
                >
                  <Plus size={14} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
      
      {holobot.lastBattle && (
        <View style={styles.battleInfo}>
          <Text style={styles.battleInfoTitle}>Last Battle</Text>
          <View style={styles.battleResult}>
            <Text style={styles.opponentText}>vs {holobot.lastBattle.opponent}</Text>
            <Text 
              style={[
                styles.resultText, 
                holobot.lastBattle.result === 'win' ? styles.winText : styles.lossText
              ]}
            >
              {holobot.lastBattle.result.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.streakText}>
            {holobot.streak.count} {holobot.streak.type} streak
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statRow: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  syncPoints: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  attributePointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  attributePointsText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  attributesContainer: {
    marginBottom: 16,
  },
  attributesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  attributeItem: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  attributeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  attributeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attributeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  attributeBoost: {
    fontSize: 14,
    color: colors.success,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  boostButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  battleInfo: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  battleInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  battleResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  opponentText: {
    fontSize: 14,
    color: colors.text,
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  winText: {
    color: colors.success,
  },
  lossText: {
    color: colors.danger,
  },
  streakText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});