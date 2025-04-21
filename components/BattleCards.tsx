import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HolobotCard } from "@/components/HolobotCard";
import { ExperienceBar } from "@/components/ExperienceBar";
import { getExperienceProgress } from "@/utils/battleUtils";
import { HOLOBOT_STATS, HolobotStats } from "@/types/holobot";
import { colors } from '@/constants/colors';

interface BattleCardsProps {
  leftStats: HolobotStats;
  rightStats: HolobotStats;
  leftLevel: number;
  rightLevel: number;
  leftXp: number;
  rightXp: number;
  leftBoosts?: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
  };
  rightBoosts?: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
  };
}

export const BattleCards: React.FC<BattleCardsProps> = ({
  leftStats,
  rightStats,
  leftLevel,
  rightLevel,
  leftXp,
  rightXp,
  leftBoosts,
  rightBoosts
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.cardWrapper}>
          <HolobotCard 
            stats={{
              ...leftStats,
              level: leftLevel
            }} 
            variant="blue"
            showBoosts={!!leftBoosts}
            boosts={leftBoosts}
          />
          <ExperienceBar 
            progress={getExperienceProgress(leftXp, leftLevel).percentage / 100}
            level={leftLevel}
          />
        </View>
        
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        
        <View style={styles.cardWrapper}>
          <HolobotCard 
            stats={{
              ...rightStats,
              level: rightLevel
            }} 
            variant="red"
            showBoosts={!!rightBoosts}
            boosts={rightBoosts}
          />
          <ExperienceBar 
            progress={getExperienceProgress(rightXp, rightLevel).percentage / 100}
            level={rightLevel}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cardWrapper: {
    width: 150,
  },
  vsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.warning,
  },
  vsText: {
    color: colors.warning,
    fontWeight: 'bold',
    fontSize: 16,
  },
});