import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { colors } from '@/constants/colors';
import { Zap, MapPin, Pause, Play } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project-url.supabase.co',
  'public-anon-key'
);

interface TrainingModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (stats: {
    duration: number;
    steps: number;
    distance: number;
    avgSpeed: number;
  }) => void;
  selectedHolobot?: any;
  maxDuration: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const TrainingModal: React.FC<TrainingModalProps> = ({
  visible,
  onClose,
  onComplete,
  selectedHolobot,
  maxDuration,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [steps, setSteps] = useState(0);
  const [speed, setSpeed] = useState('0.0');
  const [estimatedHolos, setEstimatedHolos] = useState(0);
  const [syncPoints, setSyncPoints] = useState(0);
  const [currentSpeedRange, setCurrentSpeedRange] = useState('2.5–5.0 mph');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (visible && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          setSyncPoints(Math.floor(newDuration / 60)); // Sync Point = 1/min
          return newDuration;
        });

        setSteps((prev) => prev + Math.floor(Math.random() * 3) + 1);

        const randomKmh = Math.random() * 3 + 3;
        const mph = randomKmh * 0.621371;
        setSpeed(mph.toFixed(1));

        const ranges = ['2.5–5.0 mph', '3.0–6.0 mph', '4.0–7.5 mph', '3.5–6.5 mph'];
        setCurrentSpeedRange(ranges[Math.floor(Math.random() * ranges.length)]);

        if (duration + 1 >= maxDuration * 60) {
          handleComplete();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, isPaused, steps]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const submitTrainingRewards = async (holobotId: string, rewards: any) => {
    if (!holobotId) return;
    try {
      const { data, error } = await supabase.from('training_rewards').insert([
        {
          holobot_id: holobotId,
          exp: rewards.exp,
          items: rewards.items,
          holos: rewards.holos ?? 0,
          sync_points: rewards.sync_points ?? 0,
        },
      ]);
      if (error) {
        console.error('Supabase insert error:', error.message);
      } else {
        console.log('Rewards logged:', data);
      }
    } catch (err) {
      console.error('Reward sync error:', err);
    }
  };

  const handleComplete = async () => {
    const avgSpeed = parseFloat(speed);
    const distance = avgSpeed * (duration / 3600);
    const holobotRank = selectedHolobot?.rank?.toLowerCase() ?? 'common';
    const isElite = holobotRank === 'elite';
    const isLegendary = holobotRank === 'legendary';

    if (steps < 50 || duration < 15) {
      Alert.alert('Training Too Short', 'Train longer and take more steps to earn rewards.');
      onClose();
      return;
    }

    const baseEXP = Math.floor(duration / 6); // 10 EXP per min
    const rewards: any = {
      exp: baseEXP,
      items: [],
      sync_points: syncPoints,
    };

    // HOLOS scaling by speed range
    let holosPerMin = 0;
    if (avgSpeed >= 1 && avgSpeed < 2) {
      holosPerMin = isElite ? 2 : isLegendary ? 4 : 0;
    } else if (avgSpeed >= 3 && avgSpeed <= 5) {
      holosPerMin = isElite ? 5 : isLegendary ? 10 : 0;
    }

    if (['common', 'champion', 'rare'].includes(holobotRank)) {
      rewards.items.push('energy-refill', 'gacha-ticket', 'arena-pass');
      if (holobotRank === 'rare') rewards.items.push('league-pass');
    } else {
      rewards.items.push('rank-skip', 'exp-booster');
      rewards.holos = Math.floor(duration / 60) * holosPerMin;
    }

    await submitTrainingRewards(selectedHolobot?.id, rewards);

    onComplete({
      duration,
      steps,
      distance,
      avgSpeed,
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Running</Text>

        <View style={styles.energyContainer}>
          <Zap size={24} color={colors.primary} />
          <Text style={styles.energyText}>Energy</Text>
          <Text style={styles.speedRange}>{currentSpeedRange}</Text>
          <View style={styles.energyBar}>
            <Animated.View
              style={[
                styles.energyProgress,
                { width: `${Math.min((steps / 5000) * 100, 100)}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.timerText}>{formatTime(duration)}</Text>
          <View style={styles.mphBubble}>
            <Text style={styles.speedText}>{speed} mph</Text>
          </View>
          <View style={styles.holosContainer}>
            <Text style={styles.holosValue}>{estimatedHolos.toFixed(2)}</Text>
            <Text style={styles.holosLabel}>HOLOS</Text>
            <Text style={styles.syncLabel}>+{syncPoints} Sync</Text>
          </View>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsValue}>{steps.toLocaleString()}</Text>
          <Text style={styles.stepsLabel}>Steps</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <MapPin size={24} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.mainButton]}
            onPress={handleTogglePause}
          >
            {isPaused ? (
              <Play size={32} color={colors.text} />
            ) : (
              <Pause size={32} color={colors.text} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleComplete}>
            <Zap size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  energyContainer: {
    marginBottom: 30,
  },
  energyText: {
    color: colors.primary,
    fontSize: 24,
    marginBottom: 8,
  },
  speedRange: {
    color: colors.text,
    fontSize: 18,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  energyBar: {
    height: 8,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  energyProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 12,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  mphBubble: {
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
  },
  speedText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  holosContainer: {
    alignItems: 'center',
  },
  holosValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  holosLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  syncLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stepsContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stepsValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.text,
  },
  stepsLabel: {
    fontSize: 24,
    color: colors.primary,
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
  },
});
