import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { Trophy, X, Star, Coins, Gift } from 'lucide-react-native';

interface TrainingRewards {
  exp: number;
  holos: number;
  items?: string[];
}

interface TrainingStats {
  steps: number;
  distance: number;
  avgSpeed: number;
  duration: number;
  isValid: boolean;
}

interface TrainingSummaryProps {
  visible: boolean;
  onClose: () => void;
  stats: TrainingStats;
  rewards: TrainingRewards;
}

export function TrainingSummary({ visible, onClose, stats, rewards }: TrainingSummaryProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Card style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Trophy size={32} color={colors.primary} />
            <Text style={styles.title}>Training Complete!</Text>
          </View>

          {!stats.isValid && (
            <View style={styles.invalidWarning}>
              <Text style={styles.invalidText}>
                Training session invalid - speed was outside allowed range
              </Text>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{formatDuration(stats.duration)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Steps</Text>
              <Text style={styles.statValue}>{stats.steps.toLocaleString()}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{stats.distance.toFixed(2)} km</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Avg. Speed</Text>
              <Text style={[
                styles.statValue,
                !stats.isValid && styles.invalidSpeed
              ]}>
                {stats.avgSpeed.toFixed(1)} km/h
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.rewardsTitle}>Rewards Earned</Text>

          <View style={styles.rewardsContainer}>
            <View style={styles.rewardItem}>
              <Star size={24} color={colors.primary} />
              <Text style={styles.rewardValue}>+{rewards.exp}</Text>
              <Text style={styles.rewardLabel}>EXP</Text>
            </View>

            <View style={styles.rewardItem}>
              <Coins size={24} color={colors.secondary} />
              <Text style={styles.rewardValue}>+{rewards.holos}</Text>
              <Text style={styles.rewardLabel}>Holos</Text>
            </View>

            {rewards.items && rewards.items.length > 0 && (
              <View style={styles.rewardItem}>
                <Gift size={24} color={colors.accent} />
                <Text style={styles.rewardValue}>{rewards.items.length}</Text>
                <Text style={styles.rewardLabel}>Items</Text>
              </View>
            )}
          </View>

          <Button
            title="Claim Rewards"
            onPress={onClose}
            variant="primary"
            style={styles.claimButton}
          />
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  invalidWarning: {
    backgroundColor: colors.dangerBg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  invalidText: {
    color: colors.danger,
    textAlign: 'center',
  },
  statsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  invalidSpeed: {
    color: colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  rewardItem: {
    alignItems: 'center',
    gap: 4,
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  rewardLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  claimButton: {
    width: '100%',
  },
}); 