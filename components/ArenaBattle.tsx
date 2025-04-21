import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Alert } from 'react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { BattleCards } from '@/components/BattleCards';
import { BattleScene } from '@/components/BattleScene';
import { colors } from '@/constants/colors';
import { HolobotStats } from '@/types/holobot';
import { Shield, Zap, Wind, Swords, Heart, DollarSign, Sparkles, Cpu, Activity } from 'lucide-react-native';
import { 
  calculateDamage, 
  applyHackBoost, 
  applySpecialAttack, 
  getExperienceProgress,
  incrementComboChain,
  resetComboChain
} from '@/utils/battleUtils';
import { useAuthStore } from '@/store/auth-store';

interface ArenaBattleProps {
  playerHolobot: HolobotStats;
  opponentHolobot: HolobotStats;
  onBattleComplete: (result: 'win' | 'loss' | 'draw') => void;
  playerBoosts?: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
  };
}

export const ArenaBattle: React.FC<ArenaBattleProps> = ({
  playerHolobot,
  opponentHolobot,
  onBattleComplete,
  playerBoosts = {}
}) => {
  // Validate inputs before rendering
  if (!playerHolobot || !opponentHolobot) {
    console.error('ArenaBattle: Missing required holobots', { playerHolobot, opponentHolobot });
    
    // Return a fallback UI with error instead of crashing
    return (
      <Card style={{ padding: 16 }}>
        <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', marginBottom: 12 }}>
          Unable to start battle: Missing holobot data
        </Text>
        <Button 
          title="Return to Arena Menu" 
          onPress={() => onBattleComplete('loss')} 
          variant="primary"
        />
      </Card>
    );
  }
  
  try {
    // Use the BattleScene component for the actual battle
    return (
      <BattleScene
        playerHolobot={playerHolobot}
        opponentHolobot={opponentHolobot}
        onBattleComplete={onBattleComplete}
        playerBoosts={playerBoosts}
        isCpuBattle={true}
      />
    );
  } catch (error) {
    console.error('Error rendering battle scene:', error);
    
    // Return a fallback UI with error instead of crashing
    return (
      <Card style={{ padding: 16 }}>
        <Text style={{ color: colors.error, fontSize: 16, textAlign: 'center', marginBottom: 12 }}>
          An error occurred starting the battle.
        </Text>
        <Button 
          title="Back to Arena" 
          onPress={() => onBattleComplete('loss')} 
          variant="primary"
        />
      </Card>
    );
  }
};