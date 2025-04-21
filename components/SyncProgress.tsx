import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { ProgressBar } from '@/components/ProgressBar';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { FitnessData } from '@/types/fitness';
import { Button } from '@/components/Button';
import { Footprints, AlertCircle, Info } from 'lucide-react-native';

interface SyncProgressProps {
  fitnessData: FitnessData;
  onSyncPress: () => void;
  isLoading: boolean;
  isConnected?: boolean;
}

export const SyncProgress: React.FC<SyncProgressProps> = ({
  fitnessData,
  onSyncPress,
  isLoading,
  isConnected = true,
}) => {
  const progress = Math.min(fitnessData.steps / fitnessData.dailyGoal, 1);
  const syncPoints = Math.floor(fitnessData.steps / 1000);
  
  const formatLastSynced = () => {
    const date = new Date(fitnessData.lastSynced);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const showStepCountInfo = () => {
    Alert.alert(
      "About Step Counting",
      "This app can connect to Apple Health (iOS) or Google Fit (Android) to retrieve your actual step count data.\n\nIn this demo version, we're using simulated data, but in a production app, your real step count would be used to earn Sync Points for your Holobot.",
      [
        { 
          text: "Health Settings", 
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:').catch(err => {
                console.error('Could not open settings:', err);
              });
            }
          } 
        },
        { text: "OK" }
      ]
    );
  };
  
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Footprints size={24} color={colors.secondary} />
        <Text style={styles.title}>Daily Activity</Text>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={showStepCountInfo}
        >
          <Info size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsCount}>{fitnessData.steps.toLocaleString()}</Text>
        <Text style={styles.stepsLabel}>steps today</Text>
        {!isConnected && (
          <View style={styles.notConnectedTag}>
            <AlertCircle size={12} color={colors.warning} />
            <Text style={styles.notConnectedTagText}>Not connected to Health</Text>
          </View>
        )}
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Daily Goal</Text>
          <Text style={styles.progressValue}>
            {fitnessData.steps.toLocaleString()} / {fitnessData.dailyGoal.toLocaleString()}
          </Text>
        </View>
        <ProgressBar 
          progress={progress} 
          fillColor={colors.secondary}
          height={10}
        />
      </View>
      
      <View style={styles.syncPointsContainer}>
        <Text style={styles.syncPointsLabel}>Potential Sync Points</Text>
        <Text style={styles.syncPointsValue}>{syncPoints}</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.lastSynced}>
          Last synced: {formatLastSynced()}
        </Text>
        <Button 
          title="Sync Steps" 
          onPress={onSyncPress}
          loading={isLoading}
          variant="secondary"
          icon={<Footprints size={16} color={colors.text} />}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    paddingBottom: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  stepsContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  stepsCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  stepsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  notConnectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  notConnectedTagText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  syncPointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  syncPointsLabel: {
    fontSize: 14,
    color: colors.text,
  },
  syncPointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
  },
  lastSynced: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});