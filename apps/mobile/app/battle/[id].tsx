import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BattleTimer } from '@/components/BattleTimer';
import { HackOption } from '@/components/HackOption';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useHolobotStore } from '@/store/holobot-store';
import { Swords, X } from 'lucide-react-native';

export default function BattleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { activeBattle, hackOptions, useHack, isLoading } = useHolobotStore();
  
  const [selectedHack, setSelectedHack] = useState<string | null>(null);
  const [isHalfwayPassed, setIsHalfwayPassed] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  
  useEffect(() => {
    if (!activeBattle) {
      router.back();
    }
  }, [activeBattle, router]);
  
  const handleHalfway = () => {
    setIsHalfwayPassed(true);
  };
  
  const handleBattleComplete = () => {
    setBattleEnded(true);
    Alert.alert(
      "Battle Completed",
      "The battle has ended. Check the results in your battle history.",
      [
        { text: "OK", onPress: () => router.back() }
      ]
    );
  };
  
  const handleSelectHack = (hackId: string) => {
    setSelectedHack(hackId);
  };
  
  const handleDeployHack = async () => {
    if (!selectedHack || !activeBattle) return;
    
    try {
      await useHack(activeBattle.id, selectedHack);
      Alert.alert(
        "Hack Deployed",
        "Your hack has been successfully deployed to the battle!",
        [
          { text: "OK", onPress: () => router.back() }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to deploy hack. Please try again.");
    }
  };
  
  if (!activeBattle) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Swords size={28} color={colors.warning} />
          <Text style={styles.title}>Active Battle</Text>
        </View>
        
        <View style={styles.battleInfo}>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.opponentName}>{activeBattle.opponent.name}</Text>
          <View style={styles.opponentDetails}>
            <Text style={styles.opponentRank}>Rank {activeBattle.opponent.rank}</Text>
            <Text style={styles.opponentLevel}>Level {activeBattle.opponent.level}</Text>
          </View>
        </View>
        
        <BattleTimer 
          startTime={activeBattle.startTime}
          duration={activeBattle.duration}
          onHalfway={handleHalfway}
          onComplete={handleBattleComplete}
        />
        
        {!activeBattle.hackUsed && !battleEnded && (
          <>
            <Text style={styles.sectionTitle}>Available Hacks</Text>
            <Text style={styles.sectionDescription}>
              {isHalfwayPassed 
                ? "Select a hack to deploy immediately!" 
                : "Waiting for optimal moment to deploy hack..."}
            </Text>
            
            {hackOptions.map(option => (
              <HackOption 
                key={option.id}
                option={option}
                onSelect={handleSelectHack}
                disabled={!isHalfwayPassed || selectedHack !== null && selectedHack !== option.id}
              />
            ))}
            
            <Button 
              title="Deploy Hack" 
              onPress={handleDeployHack}
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              disabled={!selectedHack || !isHalfwayPassed}
              style={styles.deployButton}
            />
          </>
        )}
        
        {activeBattle.hackUsed && (
          <View style={styles.hackUsedContainer}>
            <X size={24} color={colors.textSecondary} />
            <Text style={styles.hackUsedText}>Hack already deployed for this battle</Text>
          </View>
        )}
        
        <Button 
          title="Close" 
          onPress={() => router.back()}
          variant="outline"
          size="medium"
          fullWidth
          style={styles.closeButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  battleInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  vsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  opponentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  opponentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opponentRank: {
    fontSize: 16,
    color: colors.accent,
    marginRight: 16,
  },
  opponentLevel: {
    fontSize: 16,
    color: colors.secondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  deployButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  hackUsedContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  hackUsedText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  closeButton: {
    marginBottom: 16,
  },
});