```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BattleTimer } from './BattleTimer';
import { HackOption } from './HackOption';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';
import { colors } from '@/constants/colors';
import { useBattleStore } from '@/store/battle-store';
import { Swords, Shield, Zap } from 'lucide-react-native';

interface BattleViewProps {
  battleId: string;
  onComplete: () => void;
}

export const BattleView: React.FC<BattleViewProps> = ({ battleId, onComplete }) => {
  const { 
    currentBattle,
    battleLog,
    isLoading,
    initializeBattle,
    performAction,
    useHack,
    endBattle
  } = useBattleStore();
  
  const [selectedHack, setSelectedHack] = useState<string | null>(null);
  
  useEffect(() => {
    initializeBattle(battleId);
    
    return () => {
      // Cleanup battle subscription
    };
  }, [battleId]);
  
  const handleAttack = async () => {
    await performAction({ type: 'attack' });
  };
  
  const handleSpecial = async () => {
    await performAction({ type: 'special' });
  };
  
  const handleHack = async () => {
    if (!selectedHack) return;
    await useHack(selectedHack);
  };
  
  if (!currentBattle) return null;
  
  const { playerHolobot, opponentHolobot } = currentBattle;
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.battleLog}>
        {battleLog.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
      
      <View style={styles.statsContainer}>
        <View style={styles.holobotStats}>
          <Text style={styles.holobotName}>{playerHolobot.name}</Text>
          <ProgressBar 
            progress={playerHolobot.health / playerHolobot.maxHealth}
            label="HP"
            showPercentage
          />
          <ProgressBar 
            progress={currentBattle.specialGaugeCharge / 100}
            label="Special"
            showPercentage
          />
        </View>
        
        <View style={styles.vsContainer}>
          <Swords size={24} color={colors.warning} />
        </View>
        
        <View style={styles.holobotStats}>
          <Text style={styles.holobotName}>{opponentHolobot.name}</Text>
          <ProgressBar 
            progress={opponentHolobot.health / opponentHolobot.maxHealth}
            label="HP"
            showPercentage
          />
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <Button
          title="Attack"
          onPress={handleAttack}
          variant="primary"
          icon={<Zap size={18} color={colors.text} />}
          disabled={!currentBattle.isPlayerTurn || isLoading}
        />
        
        <Button
          title="Special"
          onPress={handleSpecial}
          variant="secondary"
          icon={<Shield size={18} color={colors.text} />}
          disabled={!currentBattle.isPlayerTurn || currentBattle.specialGaugeCharge < 50 || isLoading}
        />
      </View>
      
      {!currentBattle.hackUsed && (
        <View style={styles.hacksContainer}>
          <Text style={styles.hacksTitle}>Available Hacks</Text>
          {currentBattle.availableHacks.map(hack => (
            <HackOption
              key={hack}
              option={{
                id: hack,
                name: hack,
                description: getHackDescription(hack),
                icon: getHackIcon(hack),
                cooldown: 0,
                effect: hack
              }}
              onSelect={() => setSelectedHack(hack)}
              disabled={isLoading}
            />
          ))}
          <Button
            title="Deploy Hack"
            onPress={handleHack}
            variant="warning"
            fullWidth
            disabled={!selectedHack || isLoading}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  battleLog: {
    flex: 1,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
  },
  logText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  holobotStats: {
    flex: 1,
  },
  holobotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  hacksContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  hacksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
});

function getHackDescription(hack: string): string {
  switch (hack) {
    case 'boost':
      return 'Boost attack power for 3 turns';
    case 'heal':
      return 'Restore 40% of max health';
    case 'special_attack':
      return 'Prepare a devastating attack';
    case 'raise_defense':
      return 'Increase defense for 2 turns';
    case 'raise_speed':
      return 'Increase speed for 2 turns';
    default:
      return '';
  }
}

function getHackIcon(hack: string): string {
  switch (hack) {
    case 'boost':
      return 'zap';
    case 'heal':
      return 'heart';
    case 'special_attack':
      return 'swords';
    case 'raise_defense':
      return 'shield';
    case 'raise_speed':
      return 'wind';
    default:
      return 'code';
  }
}
```