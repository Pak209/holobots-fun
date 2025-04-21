import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, ViewStyle, Text } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import { Trophy, Activity, AlertCircle, Timer } from 'lucide-react-native';
import { TrainingModal } from './TrainingModal';
import { useFitnessStore } from '@/store/fitness-store';
import { useHolobotStore } from '@/store/holobot-store';
import { RANK_DURATIONS, SPEED_LIMITS } from '@/constants/game';
import { colors } from '@/constants/colors';

interface SyncTrainingProps {
  style?: ViewStyle;
}

interface TrainingStats {
  duration: number;
  steps: number;
  distance: number;
  avgSpeed: number;
}

export function SyncTraining({ style }: SyncTrainingProps) {
  const { hasHealthPermission, isLoading: fitnessLoading } = useFitnessStore();
  const { holobot, isLoading: holobotLoading } = useHolobotStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lastStats, setLastStats] = useState<TrainingStats | null>(null);

  const getMaxDuration = () => {
    if (!holobot) return RANK_DURATIONS.common;
    return (
      RANK_DURATIONS[holobot.rank.toLowerCase() as keyof typeof RANK_DURATIONS] ||
      RANK_DURATIONS.common
    );
  };

  const handleStartTraining = () => {
    if (!hasHealthPermission) {
      Alert.alert('Health Not Connected', 'Please connect to Health services to start training.');
      return;
    }

    if (!holobot) {
      Alert.alert('No Holobot Selected', 'Please select a Holobot to start training.');
      return;
    }

    setIsModalVisible(true);
  };

  const handleTrainingComplete = (stats: TrainingStats) => {
    if (stats.steps < 10 || stats.duration < 15) {
      Alert.alert('Training Too Short', 'You need to train for longer to earn HOLOS.');
      return;
    }
    setLastStats(stats);
    setIsModalVisible(false);
    // TODO: Send stats to server, update Holobot, etc.
  };

  return (
    <>
      <Card style={[styles.container, style]}>
        <View style={styles.header}>
          <Activity size={24} color={colors.primary} />
          <Text style={styles.title}>Sync Training</Text>
        </View>

        {!hasHealthPermission ? (
          <View style={styles.warningContainer}>
            <AlertCircle size={20} color={colors.warning} />
            <Text style={styles.warningText}>Connect to Health services to start training</Text>
          </View>
        ) : !holobot ? (
          <View style={styles.warningContainer}>
            <AlertCircle size={20} color={colors.warning} />
            <Text style={styles.warningText}>Select a Holobot to start training</Text>
          </View>
        ) : (
          <>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Train with your Holobot to earn rewards! Keep your pace between {SPEED_LIMITS.min}-
                {SPEED_LIMITS.max} km/h.
              </Text>
              <View style={styles.durationInfo}>
                <Timer size={16} color={colors.textSecondary} />
                <Text style={styles.durationText}>Max duration: {getMaxDuration()} minutes</Text>
              </View>
            </View>

            <Button
              title="Start Training"
              onPress={handleStartTraining}
              variant="primary"
              loading={fitnessLoading || holobotLoading}
              icon={<Trophy size={16} color={colors.text} />}
              style={styles.actionButton}
            />
          </>
        )}
      </Card>

      <TrainingModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onComplete={handleTrainingComplete}
        selectedHolobot={holobot}
        maxDuration={getMaxDuration()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    color: colors.warning,
    flex: 1,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoText: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  actionButton: {
    width: '100%',
  },
});
