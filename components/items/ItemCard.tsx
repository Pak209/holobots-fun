import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { Ticket, Zap, Trophy, Star, ArrowUp } from 'lucide-react-native';

interface ItemCardProps {
  name: string;
  description: string;
  quantity: number;
  type: 'arena-pass' | 'gacha-ticket' | 'energy-refill' | 'exp-booster' | 'rank-skip';
  onPress: () => void;
  disabled?: boolean;
}

const getItemIcon = (type: ItemCardProps['type']) => {
  switch (type) {
    case 'arena-pass':
      return <Trophy size={24} color={colors.primary} />;
    case 'gacha-ticket':
      return <Ticket size={24} color={colors.secondary} />;
    case 'energy-refill':
      return <Zap size={24} color={colors.warning} />;
    case 'exp-booster':
      return <Star size={24} color={colors.accent} />;
    case 'rank-skip':
      return <ArrowUp size={24} color={colors.success} />;
  }
};

export const ItemCard: React.FC<ItemCardProps> = ({
  name,
  description,
  quantity,
  type,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || quantity <= 0}
      activeOpacity={0.7}
    >
      <Card style={{
        ...styles.container,
        ...(disabled ? styles.disabled : {}),
        ...(quantity <= 0 ? styles.empty : {})
      }}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {getItemIcon(type)}
          </View>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityText}>{quantity}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={[
            styles.actionText,
            disabled && styles.disabledText,
            quantity <= 0 && styles.emptyText
          ]}>
            {quantity > 0 ? 'Use Item' : 'Not Available'}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  empty: {
    opacity: 0.7,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityContainer: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quantityText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    marginBottom: 12,
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
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  disabledText: {
    color: colors.textSecondary,
  },
  emptyText: {
    color: colors.danger,
  },
});