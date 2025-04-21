import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface ExperienceBarProps {
  progress: number;
  level: number;
}

export const ExperienceBar: React.FC<ExperienceBarProps> = ({ progress, level }) => {
  return (
    <View style={styles.container}>
      <View style={styles.xpContainer}>
        <Text style={styles.xpLabel}>XP</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: 4,
    padding: 4,
  },
  xpLabel: {
    color: colors.warning,
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 8,
  },
  progressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.cardLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.warning,
  },
});