import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  gradient = false,
  elevation = 'medium',
  padding = 'medium',
}) => {
  const getElevationStyle = () => {
    switch (elevation) {
      case 'none':
        return {};
      case 'low':
        return styles.elevationLow;
      case 'medium':
        return styles.elevationMedium;
      case 'high':
        return styles.elevationHigh;
    }
  };
  
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return {};
      case 'small':
        return styles.paddingSmall;
      case 'medium':
        return styles.paddingMedium;
      case 'large':
        return styles.paddingLarge;
    }
  };
  
  if (gradient) {
    return (
      <LinearGradient
        colors={[colors.cardGradientStart, colors.cardGradientEnd]}
        style={[styles.card, getElevationStyle(), getPaddingStyle(), style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }
  
  return (
    <View style={[styles.card, getElevationStyle(), getPaddingStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  // Elevation styles
  elevationLow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  elevationMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  elevationHigh: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // Padding styles
  paddingSmall: {
    padding: 12,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 24,
  },
});