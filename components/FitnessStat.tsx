import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Footprints, Timer, BarChart, Zap } from 'lucide-react-native';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/colors';

type FitnessStatIcon = 'steps' | 'time' | 'calories' | 'power';

interface FitnessStatProps {
  icon: FitnessStatIcon;
  label: string;
  value: string;
  subValue?: string;
  progress?: number;
  style?: any;
}

export function FitnessStat({ 
  icon, 
  label, 
  value, 
  subValue, 
  progress = 0, 
  style 
}: FitnessStatProps) {
  const getIcon = () => {
    switch (icon) {
      case 'steps':
        return <Footprints size={20} color={colors.secondary} />;
      case 'time':
        return <Timer size={20} color={colors.secondary} />;
      case 'calories':
        return <BarChart size={20} color={colors.secondary} />;
      case 'power':
        return <Zap size={20} color={colors.secondary} />;
      default:
        return null;
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        {getIcon()}
        <Text style={styles.label}>{label}</Text>
      </View>
      
      <Text style={styles.value}>{value}</Text>
      
      {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      
      {progress !== undefined && (
        <ProgressBar 
          progress={progress / 100} 
          height={4}
          fillColor={colors.secondary}
          backgroundColor={colors.border}
        />
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: colors.secondary,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});