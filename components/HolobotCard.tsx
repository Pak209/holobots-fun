import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { HolobotStats } from '@/types/holobot';
import { Shield, Zap, Wind, Heart, ArrowUp } from 'lucide-react-native';
import { getHolobotImageUrl } from '@/utils/holobotUtils';

interface HolobotCardProps {
  stats: HolobotStats;
  isSelected?: boolean;
  variant?: 'blue' | 'red' | 'default';
  showBoosts?: boolean;
  boosts?: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
  };
}

export const HolobotCard: React.FC<HolobotCardProps> = ({ 
  stats, 
  isSelected = false,
  variant = 'default',
  showBoosts = false,
  boosts = {}
}) => {
  // Determine card style based on variant
  const getCardStyle = () => {
    switch (variant) {
      case 'blue':
        return styles.blueVariant;
      case 'red':
        return styles.redVariant;
      default:
        return isSelected ? styles.selected : {};
    }
  };

  // Get ability description
  const getAbilityDescription = () => {
    if (stats.abilityDescription) {
      return stats.abilityDescription;
    }
    
    if (stats.specialMove) {
      return stats.specialMove;
    }
    
    const lowerName = stats.name?.toLowerCase() || '';
    if (lowerName === 'ace') {
      return "uses its speed to evade attacks and gets in pos to land the cr.hit";
    } else if (lowerName === 'toxin') {
      return "Toxic Strike";
    }
    
    return "No ability description available.";
  };

  // Safely get the holobot name for image
  const holobotName = stats.name?.toLowerCase() || '';

  return (
    <View style={[styles.container, getCardStyle()]}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: getHolobotImageUrl(holobotName) }} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.{stats.level || 1}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{stats.name}</Text>
        
        <View style={styles.abilityContainer}>
          <Text style={styles.abilityLabel}>Ability: {stats.specialMove || "1st Strike"}</Text>
          <Text style={styles.abilityDescription}>{getAbilityDescription()}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Heart size={14} color={colors.danger} />
            <Text style={styles.statLabel}>HP</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{stats.maxHealth || 100}</Text>
              {showBoosts && boosts.health && boosts.health > 0 && (
                <Text style={styles.statBoost}>+{boosts.health}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.statItem}>
            <Zap size={14} color={colors.warning} />
            <Text style={styles.statLabel}>ATK</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{stats.attack}</Text>
              {showBoosts && boosts.attack && boosts.attack > 0 && (
                <Text style={styles.statBoost}>+{boosts.attack}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.statItem}>
            <Shield size={14} color={colors.primary} />
            <Text style={styles.statLabel}>DEF</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{stats.defense}</Text>
              {showBoosts && boosts.defense && boosts.defense > 0 && (
                <Text style={styles.statBoost}>+{boosts.defense}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.statItem}>
            <Wind size={14} color={colors.secondary} />
            <Text style={styles.statLabel}>SPD</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{stats.speed}</Text>
              {showBoosts && boosts.speed && boosts.speed > 0 && (
                <Text style={styles.statBoost}>+{boosts.speed}</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.cardGradientEnd,
  },
  blueVariant: {
    borderColor: colors.primary,
    backgroundColor: colors.cardDark,
    borderWidth: 2,
  },
  redVariant: {
    borderColor: colors.danger,
    backgroundColor: colors.cardDark,
    borderWidth: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  levelBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  abilityContainer: {
    marginBottom: 8,
    padding: 4,
    backgroundColor: colors.cardLight,
    borderRadius: 4,
  },
  abilityLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  abilityDescription: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  statBoost: {
    fontSize: 10,
    color: colors.success,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});