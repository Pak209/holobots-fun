import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, Award, Zap } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface WorkoutRewardsProps {
  rewards: {
    exp: number;
    holos: number;
    attributeBoosts: number;
  };
  style?: any;
}

export function WorkoutRewards({ rewards, style }: WorkoutRewardsProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>WORKOUT REWARDS</Text>
      
      <View style={styles.rewardsGrid}>
        <View style={styles.rewardItem}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(124, 58, 237, 0.2)' }]}>
            <Sparkles size={20} color="#a78bfa" />
          </View>
          <Text style={styles.rewardLabel}>EXP</Text>
          <Text style={styles.rewardValue}>{rewards.exp.toLocaleString()}</Text>
        </View>
        
        <View style={styles.rewardItem}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Award size={20} color="#fbbf24" />
          </View>
          <Text style={styles.rewardLabel}>HOLOS</Text>
          <Text style={styles.rewardValue}>{rewards.holos.toLocaleString()}</Text>
        </View>
        
        <View style={styles.rewardItem}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Zap size={20} color="#34d399" />
          </View>
          <Text style={styles.rewardLabel}>BOOSTS</Text>
          <Text style={styles.rewardValue}>{rewards.attributeBoosts}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 184, 148, 0.2)',
  },
  title: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 12,
  },
  rewardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rewardItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  rewardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
});