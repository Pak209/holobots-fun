import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/Card';
import { Battle } from '@/types/holobot';
import { colors } from '@/constants/colors';
import { Swords, Clock, Trophy, X } from 'lucide-react-native';

interface BattleCardProps {
  battle: Battle;
  onPress?: () => void;
}

export const BattleCard: React.FC<BattleCardProps> = ({ battle, onPress }) => {
  const isUpcoming = battle.status === 'upcoming';
  const isActive = battle.status === 'active';
  const isCompleted = battle.status === 'completed';
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getTimeRemaining = (dateString: string) => {
    const battleTime = new Date(dateString).getTime();
    const now = Date.now();
    const diff = battleTime - now;
    
    if (diff <= 0) return 'Starting now';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };
  
  const getStatusColor = () => {
    if (isActive) return colors.warning;
    if (isCompleted) {
      if (battle.result === 'win') return colors.success;
      if (battle.result === 'loss') return colors.danger;
      return colors.textSecondary;
    }
    return colors.primary;
  };
  
  const getStatusText = () => {
    if (isActive) return 'ACTIVE';
    if (isCompleted) return battle.result?.toUpperCase() || 'COMPLETED';
    return 'UPCOMING';
  };
  
  const getStatusIcon = () => {
    if (isActive) return <Swords size={18} color={colors.warning} />;
    if (isCompleted) {
      if (battle.result === 'win') return <Trophy size={18} color={colors.success} />;
      if (battle.result === 'loss') return <X size={18} color={colors.danger} />;
      return null;
    }
    return <Clock size={18} color={colors.primary} />;
  };
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={!onPress || isCompleted}
      activeOpacity={0.8}
    >
      <Card style={[
        styles.container,
        isActive && styles.activeBattle,
        isCompleted && styles.completedBattle
      ]}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
          
          <Text style={styles.timeText}>
            {isUpcoming ? getTimeRemaining(battle.startTime) : formatTime(battle.startTime)}
          </Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.opponentName}>{battle.opponent.name}</Text>
          <View style={styles.opponentInfo}>
            <Text style={styles.opponentRank}>Rank {battle.opponent.rank}</Text>
            <Text style={styles.opponentLevel}>Level {battle.opponent.level}</Text>
          </View>
        </View>
        
        {isActive && !battle.hackUsed && (
          <View style={styles.actionContainer}>
            <Text style={styles.hackAvailableText}>Hack Available!</Text>
          </View>
        )}
        
        {isActive && battle.hackUsed && (
          <View style={styles.actionContainer}>
            <Text style={styles.hackUsedText}>Hack Used</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  activeBattle: {
    borderWidth: 1,
    borderColor: colors.warning,
  },
  completedBattle: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  content: {
    alignItems: 'center',
    marginBottom: 12,
  },
  vsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  opponentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  opponentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opponentRank: {
    fontSize: 14,
    color: colors.accent,
    marginRight: 12,
  },
  opponentLevel: {
    fontSize: 14,
    color: colors.secondary,
  },
  actionContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  hackAvailableText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.warning,
  },
  hackUsedText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});