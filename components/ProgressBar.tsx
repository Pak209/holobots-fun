import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  animated?: boolean;
  showPercentage?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = colors.progressBackground,
  fillColor = colors.primary,
  animated = true,
  showPercentage = false,
  label,
}) => {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.progressContainer, { height, backgroundColor }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${clampedProgress * 100}%`,
              backgroundColor: fillColor,
            },
            animated && styles.animated,
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>{Math.round(clampedProgress * 100)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  progressContainer: {
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  animated: {
    transition: 'width 0.3s ease',
  },
  percentage: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});