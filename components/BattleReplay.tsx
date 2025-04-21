import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BattleLogEntry, BattleResult } from '../types/league';
import { colors } from '../constants/colors';
import { Play, Pause, SkipForward, SkipBack, Zap, Shield, Heart } from 'lucide-react-native';

interface BattleReplayProps {
  battle: BattleResult;
}

export const BattleReplay: React.FC<BattleReplayProps> = ({ battle }) => {
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 3x
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  // Group log entries by turn
  const logByTurn = battle.battleLog.reduce((acc, entry) => {
    if (!acc[entry.turn]) {
      acc[entry.turn] = [];
    }
    acc[entry.turn].push(entry);
    return acc;
  }, {} as Record<number, BattleLogEntry[]>);
  
  const maxTurn = Math.max(...Object.keys(logByTurn).map(Number));
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentTurn < maxTurn) {
      interval = setInterval(() => {
        setCurrentTurn(prev => {
          if (prev < maxTurn) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 2000 / speed);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, currentTurn, maxTurn, speed]);
  
  useEffect(() => {
    if (autoScrollEnabled && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [currentTurn, autoScrollEnabled]);
  
  const handlePlay = () => {
    if (currentTurn >= maxTurn) {
      setCurrentTurn(0);
    }
    setIsPlaying(true);
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const handleNext = () => {
    if (currentTurn < maxTurn) {
      setCurrentTurn(currentTurn + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentTurn > 0) {
      setCurrentTurn(currentTurn - 1);
    }
  };
  
  const handleSpeedChange = () => {
    setSpeed(prev => (prev % 3) + 1);
  };
  
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'attack':
        return <Zap size={16} color={colors.warning} />;
      case 'special':
        return <Zap size={16} color={colors.primary} />;
      case 'buff':
        return <Shield size={16} color={colors.success} />;
      case 'debuff':
        return <Shield size={16} color={colors.error} />;
      case 'heal':
        return <Heart size={16} color={colors.success} />;
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Battle Replay</Text>
        <TouchableOpacity 
          style={styles.speedButton}
          onPress={handleSpeedChange}
        >
          <Text style={styles.speedText}>{speed}x</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.battleState}>
        <View style={styles.holobotState}>
          <Text style={styles.holobotName}>{battle.userHolobot.name}</Text>
          <View style={styles.healthBar}>
            <View 
              style={[
                styles.healthFill, 
                { 
                  width: `${Math.max(
                    0, 
                    currentTurn > 0 && logByTurn[currentTurn] 
                      ? (logByTurn[currentTurn][0].targetHp?.user || 0) / battle.userHolobot.stats.health * 100 
                      : 100
                  )}%` 
                }
              ]} 
            />
          </View>
          <Text style={styles.healthText}>
            {currentTurn > 0 && logByTurn[currentTurn] 
              ? logByTurn[currentTurn][0].targetHp?.user || battle.userHolobot.stats.health 
              : battle.userHolobot.stats.health} / {battle.userHolobot.stats.health}
          </Text>
        </View>
        
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        
        <View style={styles.holobotState}>
          <Text style={styles.holobotName}>{battle.opponentHolobot.name}</Text>
          <View style={styles.healthBar}>
            <View 
              style={[
                styles.healthFill, 
                styles.opponentHealth,
                { 
                  width: `${Math.max(
                    0, 
                    currentTurn > 0 && logByTurn[currentTurn] 
                      ? (logByTurn[currentTurn][0].targetHp?.opponent || 0) / battle.opponentHolobot.stats.health * 100 
                      : 100
                  )}%` 
                }
              ]} 
            />
          </View>
          <Text style={styles.healthText}>
            {currentTurn > 0 && logByTurn[currentTurn] 
              ? logByTurn[currentTurn][0].targetHp?.opponent || battle.opponentHolobot.stats.health 
              : battle.opponentHolobot.stats.health} / {battle.opponentHolobot.stats.health}
          </Text>
        </View>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.logContainer}
        onScrollBeginDrag={() => setAutoScrollEnabled(false)}
      >
        {Array.from({ length: currentTurn + 1 }).map((_, turn) => (
          logByTurn[turn]?.map((entry, index) => (
            <View 
              key={`${turn}-${index}`} 
              style={[
                styles.logEntry,
                entry.actor === 'user' ? styles.userEntry : styles.opponentEntry
              ]}
            >
              <View style={styles.logHeader}>
                <Text style={styles.turnText}>Turn {entry.turn}</Text>
                <View style={styles.actionContainer}>
                  {getActionIcon(entry.action)}
                  <Text style={styles.actionText}>{entry.action.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.logText}>{entry.description}</Text>
            </View>
          ))
        ))}
      </ScrollView>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handlePrev}>
          <SkipBack size={24} color={colors.text} />
        </TouchableOpacity>
        
        {isPlaying ? (
          <TouchableOpacity style={styles.playButton} onPress={handlePause}>
            <Pause size={24} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
            <Play size={24} color={colors.white} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
          <SkipForward size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Turn {currentTurn} of {maxTurn}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentTurn / maxTurn) * 100}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  speedButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  speedText: {
    color: colors.white,
    fontWeight: '600',
  },
  battleState: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  holobotState: {
    flex: 2,
  },
  vsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  holobotName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  healthBar: {
    height: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  healthFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  opponentHealth: {
    backgroundColor: colors.error,
  },
  healthText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  logContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  logEntry: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  userEntry: {
    backgroundColor: colors.primaryLight,
    marginRight: 24,
  },
  opponentEntry: {
    backgroundColor: colors.errorLight,
    marginLeft: 24,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  turnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  logText: {
    fontSize: 14,
    color: colors.text,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});