import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HackOption as HackOptionType } from '@/types/holobot';
import { colors } from '@/constants/colors';
import { Heart, Zap, Shield } from 'lucide-react-native';

interface HackOptionProps {
  option: HackOptionType;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export const HackOption: React.FC<HackOptionProps> = ({ 
  option, 
  onSelect, 
  disabled = false 
}) => {
  const getIcon = () => {
    switch (option.icon) {
      case 'heart':
        return <Heart size={24} color={colors.danger} />;
      case 'zap':
        return <Zap size={24} color={colors.warning} />;
      case 'shield':
        return <Shield size={24} color={colors.primary} />;
      default:
        return null;
    }
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={() => !disabled && onSelect(option.id)}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{option.name}</Text>
        <Text style={styles.description}>{option.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});