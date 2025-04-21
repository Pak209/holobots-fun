import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert, TextInput, Linking } from 'react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useFitnessStore } from '@/store/fitness-store';
import { Activity, Smartphone, Check, X, Edit2, Info, Settings } from 'lucide-react-native';
import { healthService } from '@/services/health-service';

interface HealthKitConnectProps {
  style?: any;
}

export function HealthKitConnect({ style }: HealthKitConnectProps) {
  const { 
    hasHealthPermission, 
    healthConnection,
    requestHealthPermissions,
    disconnectHealthKit,
    checkHealthConnection,
    fetchStepCount,
    isLoading 
  } = useFitnessStore();
  
  const [isWeb, setIsWeb] = useState(false);
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [manualSteps, setManualSteps] = useState('');
  
  useEffect(() => {
    setIsWeb(Platform.OS === 'web');
    
    // Check health connection status on mount
    checkHealthConnection();
  }, []);
  
  const handleConnect = async () => {
    try {
      const granted = await requestHealthPermissions();
      
      if (granted) {
        Alert.alert(
          "Success",
          "Successfully connected to Health services. Your steps will now be tracked for Sync Points!",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Connection Failed",
          "Failed to connect to Health services. Please try again or check your device settings.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error connecting to health services:", error);
      Alert.alert(
        "Connection Error",
        "An unexpected error occurred while connecting to Health services. Please try again.",
        [{ text: "OK" }]
      );
    }
  };
  
  const handleDisconnect = async () => {
    Alert.alert(
      "Disconnect Health",
      "Are you sure you want to disconnect from Health services? Your steps will no longer be tracked for Sync Points.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Disconnect",
          onPress: async () => {
            try {
              const disconnected = await disconnectHealthKit();
              
              if (disconnected) {
                Alert.alert(
                  "Disconnected",
                  "Successfully disconnected from Health services.",
                  [{ text: "OK" }]
                );
              } else {
                Alert.alert(
                  "Disconnection Failed",
                  "Failed to disconnect from Health services. Please try again.",
                  [{ text: "OK" }]
                );
              }
            } catch (error) {
              console.error("Error disconnecting from health services:", error);
              Alert.alert(
                "Disconnection Error",
                "An unexpected error occurred while disconnecting from Health services. Please try again.",
                [{ text: "OK" }]
              );
            }
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleSetManualSteps = async () => {
    try {
      const steps = parseInt(manualSteps, 10);
      if (isNaN(steps) || steps < 0) {
        Alert.alert("Invalid Input", "Please enter a valid number of steps.");
        return;
      }
      
      await healthService.setManualStepCount(steps);
      await fetchStepCount();
      setIsEditingSteps(false);
      
      Alert.alert(
        "Steps Updated",
        `Your step count has been updated to ${steps}.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error setting manual step count:", error);
      Alert.alert(
        "Update Failed",
        "Failed to update step count. Please try again.",
        [{ text: "OK" }]
      );
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const showHealthKitInfo = () => {
    Alert.alert(
      "About Health Integration",
      "This app can connect to Apple Health (iOS) or Google Fit (Android) to retrieve your actual step count data.\n\nIn this demo version, we're using simulated data, but in a production app, your real step count would be used to earn Sync Points for your Holobot.",
      [{ text: "OK" }]
    );
  };
  
  const openHealthSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:').catch(err => {
        console.error('Could not open settings:', err);
        Alert.alert(
          "Could Not Open Settings",
          "Please open your device settings manually and navigate to Privacy > Health to grant permissions."
        );
      });
    } else if (Platform.OS === 'android') {
      // For Android, we would typically open Google Fit settings
      // This is a placeholder - in a real app, you'd use the appropriate intent
      Alert.alert(
        "Health Settings",
        "Please open Google Fit and ensure you've granted permissions to this app."
      );
    }
  };
  
  if (isWeb) {
    return (
      <Card style={[styles.container, style]}>
        <View style={styles.header}>
          <Activity size={24} color={colors.primary} />
          <Text style={styles.title}>Health Tracking</Text>
        </View>
        
        <View style={styles.webMessage}>
          <Smartphone size={40} color={colors.textSecondary} />
          <Text style={styles.webMessageText}>
            Health tracking is only available on mobile devices. Please use the Holobots app on your iOS or Android device to connect to Health services.
          </Text>
        </View>
      </Card>
    );
  }
  
  return (
    <Card style={[styles.container, style]}>
      <View style={styles.header}>
        <Activity size={24} color={colors.primary} />
        <Text style={styles.title}>Health Tracking</Text>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={showHealthKitInfo}
        >
          <Info size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {hasHealthPermission && healthConnection ? (
        <View style={styles.connectedContainer}>
          <View style={styles.connectionStatus}>
            <View style={styles.statusIconContainer}>
              <Check size={20} color={colors.text} />
            </View>
            <Text style={styles.connectedText}>Connected to Health</Text>
          </View>
          
          <View style={styles.connectionDetails}>
            <Text style={styles.detailLabel}>Device:</Text>
            <Text style={styles.detailValue}>{healthConnection.deviceName}</Text>
          </View>
          
          <View style={styles.connectionDetails}>
            <Text style={styles.detailLabel}>Connected:</Text>
            <Text style={styles.detailValue}>
              {formatDate(healthConnection.connectedAt)}
            </Text>
          </View>
          
          <View style={styles.connectionDetails}>
            <Text style={styles.detailLabel}>Last Synced:</Text>
            <Text style={styles.detailValue}>
              {formatDate(healthConnection.lastSynced)}
            </Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={openHealthSettings}
            >
              <Settings size={16} color={colors.primary} />
              <Text style={styles.actionButtonText}>Health Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setIsEditingSteps(true)}
            >
              <Edit2 size={16} color={colors.primary} />
              <Text style={styles.actionButtonText}>Set Manual Steps</Text>
            </TouchableOpacity>
          </View>
          
          {isEditingSteps && (
            <View style={styles.manualStepsContainer}>
              <Text style={styles.manualStepsTitle}>Set Step Count</Text>
              <TextInput
                style={styles.manualStepsInput}
                value={manualSteps}
                onChangeText={setManualSteps}
                placeholder="Enter step count"
                keyboardType="number-pad"
                autoFocus
              />
              <Text style={styles.manualStepsNote}>
                Enter the step count from your Apple Watch or fitness tracker
              </Text>
              <View style={styles.manualStepsButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setIsEditingSteps(false)}
                  variant="outline"
                  size="small"
                  style={styles.manualStepsButton}
                />
                <Button
                  title="Save"
                  onPress={handleSetManualSteps}
                  variant="primary"
                  size="small"
                  style={styles.manualStepsButton}
                />
              </View>
            </View>
          )}
          
          <View style={styles.demoNote}>
            <Text style={styles.demoNoteText}>
              Note: In a production app, this would use your actual step count from Apple Health or Google Fit.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.disconnectButton}
            onPress={handleDisconnect}
            disabled={isLoading}
          >
            <X size={16} color={colors.danger} />
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.notConnectedContainer}>
          <Text style={styles.notConnectedText}>
            Connect to Health services to track your steps and earn Sync Points for your Holobot.
          </Text>
          
          <View style={styles.healthInfoContainer}>
            <View style={styles.healthInfoItem}>
              <View style={styles.healthInfoDot} />
              <Text style={styles.healthInfoText}>Track your daily activity</Text>
            </View>
            <View style={styles.healthInfoItem}>
              <View style={styles.healthInfoDot} />
              <Text style={styles.healthInfoText}>Convert steps to Sync Points</Text>
            </View>
            <View style={styles.healthInfoItem}>
              <View style={styles.healthInfoDot} />
              <Text style={styles.healthInfoText}>Power up your Holobot with real-world activity</Text>
            </View>
          </View>
          
          <Button
            title="Connect to Health"
            onPress={handleConnect}
            variant="primary"
            loading={isLoading}
            icon={<Activity size={16} color={colors.text} />}
            style={styles.connectButton}
          />
          
          <Text style={styles.simulationNote}>
            Note: This is a simulation. In a production app, this would connect to Apple Health or Google Fit.
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  webMessage: {
    padding: 16,
    alignItems: 'center',
  },
  webMessageText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  connectedContainer: {
    padding: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  connectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  connectionDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  manualStepsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 16,
  },
  manualStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  manualStepsInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.card,
    fontSize: 16,
  },
  manualStepsNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  manualStepsButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  manualStepsButton: {
    minWidth: 80,
  },
  demoNote: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  demoNoteText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  disconnectText: {
    fontSize: 14,
    color: colors.danger,
    marginLeft: 4,
  },
  notConnectedContainer: {
    padding: 16,
  },
  notConnectedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  healthInfoContainer: {
    marginBottom: 24,
  },
  healthInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthInfoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  healthInfoText: {
    fontSize: 14,
    color: colors.text,
  },
  connectButton: {
    marginBottom: 16,
  },
  simulationNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});