import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BattleResult } from '../types/league';
import { colors } from '../constants/colors';
import { Trophy, Clock, Swords, Award } from 'lucide-react-native';

interface AsyncBattleCardProps {
  battle: BattleResult;
  onClaimRewards?: (battleId: string) => void;
}

export const AsyncBattleCard: React.FC<AsyncBattleCardProps> = ({ 
  battle,
  onClaimRewards
}) => {
  const router = useRouter();
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleViewDetails = () => {
    router.push(`/battle-result/${battle.id}`);
  };
  
  const handleClaimRewards = () => {
    if (onClaimRewards) {
      onClaimRewards(battle.id);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.battleType}>
          <Swords size={16} color={colors.primary} />
          <Text style={styles.battleTypeText}>
            {battle.isPvP ? 'PvP Battle' : 'League Battle'}
          </Text>
        </View>
        <Text style={styles.date}>{formatDate(battle.createdAt)}</Text>
      </View>
      
      <View style={styles.battleInfo}>
        <View style={styles.playerSide}>
          <Image 
            source={{ uri: battle.userHolobot.image }} 
            style={styles.holobotImage} 
          />
          <Text style={styles.holobotName}>{battle.userHolobot.name}</Text>
          <Text style={styles.holobotLevel}>Lvl {battle.userHolobot.level}</Text>
        </View>
        
        <View style={styles.resultContainer}>
          <View style={[
            styles.resultBadge,
            battle.winner === 'user' ? styles.winBadge : 
            battle.winner === 'opponent' ? styles.loseBadge : styles.drawBadge
          ]}>
            <Text style={styles.resultText}>
              {battle.winner === 'user' ? 'WIN' : 
               battle.winner === 'opponent' ? 'LOSS' : 'DRAW'}
            </Text>
          </View>
        </View>
        
        <View style={styles.opponentSide}>
          <Image 
            source={{ uri: battle.opponentHolobot.image }} 
            style={styles.holobotImage} 
          />
          <Text style={styles.holobotName}>{battle.opponentHolobot.name}</Text>
          <Text style={styles.holobotLevel}>Lvl {battle.opponentHolobot.level}</Text>
        </View>
      </View>
      
      {battle.stepBuffs && battle.stepBuffs.totalSteps > 0 && (
        <View style={styles.buffsContainer}>
          <Text style={styles.buffsTitle}>Step Buffs Applied:</Text>
          <View style={styles.buffsList}>
            {battle.stepBuffs.healthBonus > 0 && (
              <Text style={styles.buffText}>+{Math.round(battle.stepBuffs.healthBonus * 100)}% HP</Text>
            )}
            {battle.stepBuffs.attackBonus > 0 && (
              <Text style={styles.buffText}>+{Math.round(battle.stepBuffs.attackBonus * 100)}% ATK</Text>
            )}
            {battle.stepBuffs.meterChargeBonus > 0 && (
              <Text style={styles.buffText}>+{Math.round(battle.stepBuffs.meterChargeBonus * 100)}% Meter</Text>
            )}
          </View>
        </View>
      )}
      
      <View style={styles.footer}>
        {battle.rewards && (
          <TouchableOpacity 
            style={styles.claimButton}
            onPress={handleClaimRewards}
          >
            <Award size={16} color={colors.white} />
            <Text style={styles.claimButtonText}>Claim Rewards</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={handleViewDetails}
        >
          <Text style={styles.detailsButtonText}>View Battle Details</Text>
        </TouchableOpacity>
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
  battleType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  battleTypeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  battleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerSide: {
    flex: 2,
    alignItems: 'center',
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
  },
  opponentSide: {
    flex: 2,
    alignItems: 'center',
  },
  holobotImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  holobotName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  holobotLevel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  winBadge: {
    backgroundColor: colors.success,
  },
  loseBadge: {
    backgroundColor: colors.error,
  },
  drawBadge: {
    backgroundColor: colors.warning,
  },
  resultText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  buffsContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  buffsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  buffsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buffText: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  claimButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  claimButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 6,
  },
  detailsButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  detailsButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
});