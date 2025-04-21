import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { BattleCards } from '@/components/BattleCards';
import { colors } from '@/constants/colors';
import { HolobotStats } from '@/types/holobot';
import { Shield, Zap, Wind, Swords, Heart, DollarSign, Sparkles, Cpu, Activity, Play, Pause } from 'lucide-react-native';
import { 
  calculateDamage, 
  applyHackBoost, 
  applySpecialAttack, 
  getExperienceProgress,
  incrementComboChain,
  resetComboChain
} from '@/utils/battleUtils';
import { useAuthStore } from '@/store/auth-store';

interface BattleSceneProps {
  playerHolobot: HolobotStats;
  opponentHolobot: HolobotStats;
  onBattleComplete: (result: 'win' | 'loss' | 'draw') => void;
  playerBoosts?: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
  };
  isCpuBattle?: boolean;
}

export const BattleScene: React.FC<BattleSceneProps> = ({
  playerHolobot,
  opponentHolobot,
  onBattleComplete,
  playerBoosts = {},
  isCpuBattle = true
}) => {
  const { user } = useAuthStore();
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [playerHealth, setPlayerHealth] = useState(playerHolobot.maxHealth || 100);
  const [opponentHealth, setOpponentHealth] = useState(opponentHolobot.maxHealth || 100);
  const [specialGauge, setSpecialGauge] = useState(0);
  const [hackGauge, setHackGauge] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleEnded, setBattleEnded] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [roundCount, setRoundCount] = useState(1);
  const [victories, setVictories] = useState(0);
  const [hackBoost, setHackBoost] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [isDefenseMode, setIsDefenseMode] = useState(false);
  const [defenseModeRounds, setDefenseModeRounds] = useState(0);
  const [isAutoBattle, setIsAutoBattle] = useState(false);
  const [pendingXpGained, setPendingXpGained] = useState(0);
  const [playerIsAttacking, setPlayerIsAttacking] = useState(false);
  const [opponentIsAttacking, setOpponentIsAttacking] = useState(false);
  const [playerIsDamaged, setPlayerIsDamaged] = useState(false);
  const [opponentIsDamaged, setOpponentIsDamaged] = useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  
  // Animation values
  const playerAttackAnim = useRef(new Animated.Value(0)).current;
  const opponentAttackAnim = useRef(new Animated.Value(0)).current;
  const playerDamageAnim = useRef(new Animated.Value(0)).current;
  const opponentDamageAnim = useRef(new Animated.Value(0)).current;
  
  const battleLogRef = useRef<ScrollView>(null);
  const autoBattleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize battle
  useEffect(() => {
    // Apply attribute boosts to player holobot
    const boostedPlayerHolobot = {
      ...playerHolobot,
      attack: playerHolobot.attack + (playerBoosts.attack || 0),
      defense: playerHolobot.defense + (playerBoosts.defense || 0),
      speed: playerHolobot.speed + (playerBoosts.speed || 0),
      maxHealth: (playerHolobot.maxHealth || 100) + (playerBoosts.health || 0)
    };
    
    // Set initial health with boosted maxHealth
    setPlayerHealth(boostedPlayerHolobot.maxHealth);
    
    addToBattleLog(`Battle ready! ${boostedPlayerHolobot.name} vs ${opponentHolobot.name}`);
    
    // Show attribute boosts in battle log if any
    if (Object.values(playerBoosts).some(boost => boost && boost > 0)) {
      addToBattleLog(`${boostedPlayerHolobot.name} has attribute boosts: ${
        [
          playerBoosts.attack ? `ATK +${playerBoosts.attack}` : '',
          playerBoosts.defense ? `DEF +${playerBoosts.defense}` : '',
          playerBoosts.speed ? `SPD +${playerBoosts.speed}` : '',
          playerBoosts.health ? `HP +${playerBoosts.health}` : ''
        ].filter(Boolean).join(', ')
      }`);
    }
    
    // Determine who goes first based on speed (including boosts)
    const playerGoesFirst = (boostedPlayerHolobot.speed || 0) >= (opponentHolobot.speed || 0);
    setIsPlayerTurn(playerGoesFirst);
    
    if (playerGoesFirst) {
      addToBattleLog(`${boostedPlayerHolobot.name} will go first due to higher speed!`);
    } else {
      addToBattleLog(`${opponentHolobot.name} will go first due to higher speed!`);
    }
    
    return () => {
      if (autoBattleTimerRef.current) {
        clearInterval(autoBattleTimerRef.current);
      }
    };
  }, []);

  // Check for battle end conditions
  useEffect(() => {
    if (battleEnded) return;
    
    if (playerHealth <= 0 && opponentHealth <= 0) {
      endBattle('draw');
    } else if (playerHealth <= 0) {
      endBattle('loss');
    } else if (opponentHealth <= 0) {
      endBattle('win');
    }
  }, [playerHealth, opponentHealth]);

  // Handle opponent's turn
  useEffect(() => {
    if (!isPlayerTurn && !battleEnded && battleStarted) {
      const timer = setTimeout(() => {
        handleOpponentTurn();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, battleEnded, battleStarted]);

  // Auto battle logic
  useEffect(() => {
    if (isAutoBattle && !battleEnded && battleStarted) {
      autoBattleTimerRef.current = setInterval(() => {
        if (isPlayerTurn) {
          handleAutoBattleTurn();
        } else {
          handleOpponentTurn();
        }
      }, 1000);
      
      return () => {
        if (autoBattleTimerRef.current) {
          clearInterval(autoBattleTimerRef.current);
          autoBattleTimerRef.current = null;
        }
      };
    }
  }, [isAutoBattle, isPlayerTurn, battleEnded, battleStarted]);

  // Scroll to bottom of battle log when new messages are added
  useEffect(() => {
    if (battleLogRef.current) {
      setTimeout(() => {
        battleLogRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [battleLog]);

  const addToBattleLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  };

  const endBattle = (result: 'win' | 'loss' | 'draw') => {
    setBattleEnded(true);
    setBattleStarted(false);
    
    if (autoBattleTimerRef.current) {
      clearInterval(autoBattleTimerRef.current);
      autoBattleTimerRef.current = null;
    }
    
    let resultMessage = '';
    switch (result) {
      case 'win':
        resultMessage = `${playerHolobot.name} wins the battle!`;
        setVictories(prev => prev + 1);
        break;
      case 'loss':
        resultMessage = `${opponentHolobot.name} wins the battle!`;
        break;
      case 'draw':
        resultMessage = "The battle ends in a draw!";
        break;
    }
    
    addToBattleLog(resultMessage);
    
    // Calculate XP gained
    const xpGained = result === 'win' ? 50 : result === 'draw' ? 20 : 10;
    setPendingXpGained(prev => prev + xpGained);
    addToBattleLog(`${playerHolobot.name} gained ${xpGained + pendingXpGained} XP!`);
    
    // Notify parent component about battle result
    setTimeout(() => {
      onBattleComplete(result);
    }, 2000);
  };

  const animateAttack = (isPlayer: boolean) => {
    const attackAnim = isPlayer ? playerAttackAnim : opponentAttackAnim;
    const damageAnim = isPlayer ? opponentDamageAnim : playerDamageAnim;
    
    if (isPlayer) {
      setPlayerIsAttacking(true);
    } else {
      setOpponentIsAttacking(true);
    }
    
    Animated.sequence([
      Animated.timing(attackAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(damageAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(attackAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(damageAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (isPlayer) {
        setPlayerIsAttacking(false);
        setOpponentIsDamaged(false);
      } else {
        setOpponentIsAttacking(false);
        setPlayerIsDamaged(false);
      }
    });
    
    if (isPlayer) {
      setOpponentIsDamaged(true);
    } else {
      setPlayerIsDamaged(true);
    }
  };

  const handlePlayerAttack = (isSpecial: boolean = false) => {
    if (!isPlayerTurn || battleEnded || !battleStarted) return;
    
    setTurnCount(prev => prev + 1);
    animateAttack(true);
    
    // Apply attribute boosts to player holobot
    const boostedPlayerHolobot = {
      ...playerHolobot,
      attack: playerHolobot.attack + (playerBoosts.attack || 0),
      defense: playerHolobot.defense + (playerBoosts.defense || 0),
      speed: playerHolobot.speed + (playerBoosts.speed || 0)
    };
    
    // Calculate damage with hack boost if applicable
    const attackBoost = hackBoost > 0 ? hackBoost / 100 : 0;
    const { damage, isCritical } = calculateDamage(
      { 
        ...boostedPlayerHolobot, 
        attack: boostedPlayerHolobot.attack * (1 + attackBoost) 
      }, 
      opponentHolobot, 
      isSpecial
    );
    
    // Apply damage to opponent
    const finalDamage = Math.round(damage * comboMultiplier);
    setOpponentHealth(prev => Math.max(0, prev - finalDamage));
    
    // Update battle log
    if (isSpecial) {
      addToBattleLog(`${playerHolobot.name} uses ${playerHolobot.specialMove || 'Special Attack'}!`);
      setSpecialGauge(0); // Reset special gauge after use
    }
    
    if (isCritical) {
      addToBattleLog(`CRITICAL HIT! ${playerHolobot.name} deals ${finalDamage} damage to ${opponentHolobot.name}!`);
    } else if (comboMultiplier > 1) {
      addToBattleLog(`COMBO x${comboMultiplier.toFixed(1)}! ${playerHolobot.name} deals ${finalDamage} damage to ${opponentHolobot.name}!`);
    } else {
      addToBattleLog(`${playerHolobot.name} deals ${finalDamage} damage to ${opponentHolobot.name}!`);
    }
    
    // Increase special gauge if not using special
    if (!isSpecial) {
      setSpecialGauge(prev => Math.min(100, prev + 25));
    }
    
    // Increase hack gauge
    setHackGauge(prev => Math.min(100, prev + 10));
    
    // Random chance to increase combo multiplier
    if (Math.random() < 0.3) {
      const newMultiplier = Math.min(2.0, comboMultiplier + 0.1);
      if (newMultiplier > comboMultiplier) {
        setComboMultiplier(newMultiplier);
        addToBattleLog(`Combo multiplier increased to x${newMultiplier.toFixed(1)}!`);
      }
    }
    
    // Calculate XP gained from damage
    const damageXp = Math.floor(finalDamage * 0.5);
    setPendingXpGained(prev => prev + damageXp);
    
    // Switch turns
    setIsPlayerTurn(false);
  };

  const handleOpponentTurn = () => {
    if (battleEnded || !battleStarted) return;
    
    setTurnCount(prev => prev + 1);
    animateAttack(false);
    
    // Apply attribute boosts to player holobot for defense calculation
    const boostedPlayerHolobot = {
      ...playerHolobot,
      defense: playerHolobot.defense + (playerBoosts.defense || 0)
    };
    
    // Decide if opponent uses special attack (if available and 30% chance)
    const useSpecial = Math.random() < 0.3 && turnCount > 2;
    
    // Calculate damage
    const { damage, isCritical } = calculateDamage(
      opponentHolobot, 
      boostedPlayerHolobot, 
      useSpecial
    );
    
    // Apply damage to player
    setPlayerHealth(prev => Math.max(0, prev - damage));
    
    // Update battle log
    if (useSpecial) {
      addToBattleLog(`${opponentHolobot.name} uses ${opponentHolobot.specialMove || 'Special Attack'}!`);
    }
    
    if (isCritical) {
      addToBattleLog(`CRITICAL HIT! ${opponentHolobot.name} deals ${damage} damage to ${playerHolobot.name}!`);
    } else {
      addToBattleLog(`${opponentHolobot.name} deals ${damage} damage to ${playerHolobot.name}!`);
    }
    
    // Increase hack gauge for player (even on opponent's turn)
    setHackGauge(prev => Math.min(100, prev + 5));
    
    // Reset combo multiplier
    if (comboMultiplier > 1) {
      setComboMultiplier(1);
      addToBattleLog("Combo chain broken!");
    }
    
    // Check if we should advance to next round
    if (turnCount % 6 === 0) {
      setRoundCount(prev => prev + 1);
      addToBattleLog(`Round ${roundCount} complete! Starting round ${roundCount + 1}...`);
    }
    
    // Switch turns
    setIsPlayerTurn(true);
  };

  const handleAutoBattleTurn = () => {
    if (!isPlayerTurn || battleEnded || !battleStarted) return;
    
    // AI decision making for player's turn
    const useSpecial = specialGauge >= 100 && Math.random() < 0.8;
    const useHack = hackGauge >= 100 && hackBoost <= 0 && Math.random() < 0.7;
    const switchToDefense = playerHealth < opponentHealth * 0.5 && !isDefenseMode && Math.random() < 0.6;
    const switchToAttack = playerHealth > opponentHealth * 0.7 && isDefenseMode && Math.random() < 0.8;
    
    if (useHack) {
      handleHack();
      return;
    }
    
    if (switchToDefense) {
      handleDefenseMode(true);
      return;
    }
    
    if (switchToAttack) {
      handleDefenseMode(false);
      return;
    }
    
    if (useSpecial) {
      handleSpecialAttack();
      return;
    }
    
    // Default action: regular attack
    handlePlayerAttack(false);
  };

  const handleHack = () => {
    if (!isPlayerTurn || battleEnded || hackGauge < 100 || !battleStarted) return;
    
    // Apply hack boost
    setHackBoost(10); // 10% boost
    setHackGauge(0);
    
    addToBattleLog(`HACK ACTIVATED! Attack power boosted by 10%!`);
    
    // Don't switch turns for hack action
    if (isAutoBattle) {
      setTimeout(() => {
        handlePlayerAttack(false);
      }, 500);
    }
  };

  const handleSpecialAttack = () => {
    if (!isPlayerTurn || battleEnded || specialGauge < 100 || !battleStarted) return;
    
    handlePlayerAttack(true);
  };

  const handleDefenseMode = (activate: boolean) => {
    if (!isPlayerTurn || battleEnded || !battleStarted) return;
    
    setIsDefenseMode(activate);
    
    if (activate) {
      setDefenseModeRounds(0);
      addToBattleLog(`${playerHolobot.name} switched to Defense Mode!`);
    } else {
      addToBattleLog(`${playerHolobot.name} switched to Attack Mode!`);
    }
    
    // Don't switch turns for mode switch action
    if (isAutoBattle) {
      setTimeout(() => {
        handlePlayerAttack(false);
      }, 500);
    }
  };

  const handleHype = () => {
    if (!isPlayerTurn || battleEnded || !battleStarted) return;
    
    // Increase special gauge
    setSpecialGauge(prev => Math.min(100, prev + 15));
    addToBattleLog(`${playerHolobot.name} gets hyped up! Special gauge increased!`);
  };

  const handlePayHolos = () => {
    if (battleEnded) return;
    
    // Heal player
    const healAmount = Math.round((playerHolobot.maxHealth || 100) * 0.2);
    setPlayerHealth(prev => Math.min((playerHolobot.maxHealth || 100) + (playerBoosts.health || 0), prev + healAmount));
    
    // Fill hack meter completely
    setHackGauge(100);
    
    addToBattleLog(`Paid 100 HOLOS! ${playerHolobot.name} recovers ${healAmount} HP and hack meter is filled!`);
  };

  const toggleBattle = () => {
    if (battleStarted) {
      // If battle is already started, toggle auto-battle
      setIsAutoBattle(prev => !prev);
      addToBattleLog(isAutoBattle ? "Auto-battle disabled." : "Auto-battle enabled!");
    } else {
      // Start the battle
      setBattleStarted(true);
      setIsAutoBattle(true); // Auto-enable auto-battle when starting
      addToBattleLog("Battle started! Auto-battle enabled!");
      
      // If opponent goes first, trigger their turn
      if (!isPlayerTurn) {
        setTimeout(() => {
          handleOpponentTurn();
        }, 1500);
      }
    }
  };

  const handleEndBattle = () => {
    if (battleEnded) return;
    
    // Forfeit the battle
    endBattle('loss');
  };

  return (
    <View style={styles.container}>
      <View style={styles.arenaHeader}>
        <View style={styles.arenaHeaderItem}>
          <Text style={styles.arenaHeaderLabel}>Round</Text>
          <Text style={styles.arenaHeaderValue}>{roundCount}/3</Text>
        </View>
        
        <Text style={styles.arenaTitle}>ARENA MODE</Text>
        
        <View style={styles.arenaHeaderItem}>
          <Text style={styles.arenaHeaderLabel}>Victories</Text>
          <Text style={styles.arenaHeaderValue}>{victories}</Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.endBattleButton]} 
          onPress={handleEndBattle}
          disabled={battleEnded}
        >
          <Text style={styles.actionButtonText}>End Battle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.hypeButton]} 
          onPress={handleHype}
          disabled={!isPlayerTurn || battleEnded || !battleStarted}
        >
          <Sparkles size={14} color={colors.text} />
          <Text style={styles.actionButtonText}>Hype</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.hackButton, hackGauge < 100 && styles.disabledButton]} 
          onPress={handleHack}
          disabled={!isPlayerTurn || battleEnded || hackGauge < 100 || !battleStarted}
        >
          <Cpu size={14} color={colors.text} />
          <Text style={styles.actionButtonText}>Hack ({hackBoost > 0 ? `${hackBoost}%` : '10%'} Boost)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.payHolosButton]} 
          onPress={handlePayHolos}
          disabled={battleEnded}
        >
          <DollarSign size={14} color={colors.text} />
          <Text style={styles.actionButtonText}>Pay 100 HOLOS</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.modeButtons}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            !isDefenseMode && styles.modeButtonActive,
            !battleStarted && styles.disabledButton
          ]}
          onPress={() => handleDefenseMode(false)}
          disabled={!isPlayerTurn || battleEnded || !isDefenseMode || !battleStarted}
        >
          <Swords size={16} color={colors.text} />
          <Text style={styles.modeButtonText}>Attack Mode</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton,
            isDefenseMode && styles.modeButtonActive,
            !battleStarted && styles.disabledButton
          ]}
          onPress={() => handleDefenseMode(true)}
          disabled={!isPlayerTurn || battleEnded || isDefenseMode || !battleStarted}
        >
          <Shield size={16} color={colors.text} />
          <Text style={styles.modeButtonText}>Defense Mode</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton,
            battleStarted && styles.autoBattleActive
          ]}
          onPress={toggleBattle}
          disabled={battleEnded}
        >
          {battleStarted ? (
            isAutoBattle ? (
              <Pause size={16} color={colors.text} />
            ) : (
              <Play size={16} color={colors.text} />
            )
          ) : (
            <Play size={16} color={colors.text} />
          )}
          <Text style={styles.modeButtonText}>
            {!battleStarted ? 'Start Battle' : (isAutoBattle ? 'Pause Battle' : 'Resume Battle')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.attackButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.attackButton, 
            (!isPlayerTurn || !battleStarted) && styles.disabledButton,
            specialGauge >= 100 && styles.specialAttackButton
          ]} 
          onPress={() => handlePlayerAttack(specialGauge >= 100)}
          disabled={!isPlayerTurn || battleEnded || !battleStarted || isAutoBattle}
        >
          <Text style={styles.attackButtonText}>
            {specialGauge >= 100 ? 'SPECIAL ATTACK' : 'ATTACK'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <BattleCards
        leftStats={playerHolobot}
        rightStats={opponentHolobot}
        leftLevel={playerHolobot.level || 1}
        rightLevel={opponentHolobot.level || 1}
        leftXp={playerHolobot.experience || 0}
        rightXp={opponentHolobot.experience || 0}
        leftBoosts={playerBoosts}
      />
      
      <View style={styles.statusBarsContainer}>
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        
        <View style={styles.statusBars}>
          {/* Player Health Bar */}
          <View style={styles.statusBarRow}>
            <Heart size={16} color={colors.danger} />
            <ProgressBar 
              progress={playerHealth / ((playerHolobot.maxHealth || 100) + (playerBoosts.health || 0))}
              height={12}
              fillColor={colors.danger}
              style={styles.statusBar}
            />
            <Text style={styles.statusValue}>
              {Math.round(playerHealth)}/{(playerHolobot.maxHealth || 100) + (playerBoosts.health || 0)}
              {playerBoosts.health ? <Text style={styles.boostText}> (+{playerBoosts.health})</Text> : null}
            </Text>
          </View>
          
          {/* Player Special Bar */}
          <View style={styles.statusBarRow}>
            <Zap size={16} color={colors.warning} />
            <ProgressBar 
              progress={specialGauge / 100}
              height={12}
              fillColor={colors.warning}
              style={styles.statusBar}
            />
            <Text style={styles.statusValue}>{specialGauge}/100</Text>
          </View>
          
          {/* Player Hack Bar */}
          <View style={styles.statusBarRow}>
            <Cpu size={16} color={colors.success} />
            <ProgressBar 
              progress={hackGauge / 100}
              height={12}
              fillColor={colors.success}
              style={styles.statusBar}
            />
            <Text style={styles.statusValue}>{hackGauge}/100</Text>
          </View>
        </View>
        
        <View style={styles.statusBars}>
          {/* Opponent Health Bar */}
          <View style={styles.statusBarRow}>
            <Heart size={16} color={colors.danger} />
            <ProgressBar 
              progress={opponentHealth / (opponentHolobot.maxHealth || 100)}
              height={12}
              fillColor={colors.danger}
              style={styles.statusBar}
            />
            <Text style={styles.statusValue}>{Math.round(opponentHealth)}/{opponentHolobot.maxHealth || 100}</Text>
          </View>
          
          {/* Opponent Special Bar (hidden) */}
          <View style={[styles.statusBarRow, { opacity: 0.5 }]}>
            <Zap size={16} color={colors.warning} />
            <ProgressBar 
              progress={0}
              height={12}
              fillColor={colors.warning}
              style={styles.statusBar}
            />
            <Text style={styles.statusValue}>?/100</Text>
          </View>
          
          {/* Opponent Hack Bar (hidden) */}
          <View style={[styles.statusBarRow, { opacity: 0.5 }]}>
            <Cpu size={16} color={colors.success} />
            <ProgressBar 
              progress={0}
              height={12}
              fillColor={colors.success}
              style={styles.statusBar}
            />
            <Text style={styles.statusValue}>?/100</Text>
          </View>
        </View>
      </View>
      
      <Card style={styles.battleLogContainer}>
        <ScrollView 
          ref={battleLogRef}
          style={styles.battleLog}
          showsVerticalScrollIndicator={true}
        >
          {battleLog.map((log, index) => (
            <Text key={index} style={styles.logEntry}>{log}</Text>
          ))}
        </ScrollView>
      </Card>
      
      {!isPlayerTurn && !battleEnded && battleStarted && !isAutoBattle && (
        <View style={styles.turnIndicator}>
          <Text style={styles.turnText}>{opponentHolobot.name}'s turn...</Text>
        </View>
      )}
      
      {isAutoBattle && !battleEnded && battleStarted && (
        <View style={styles.turnIndicator}>
          <Text style={styles.turnText}>Auto-battle in progress...</Text>
        </View>
      )}
      
      {!battleStarted && !battleEnded && (
        <View style={styles.battleStartContainer}>
          <Text style={styles.battleStartText}>Press "Start Battle" to begin!</Text>
        </View>
      )}
      
      {battleEnded && (
        <View style={styles.battleEndContainer}>
          <Text style={styles.battleEndText}>Battle Complete!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arenaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  arenaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  arenaHeaderItem: {
    alignItems: 'center',
  },
  arenaHeaderLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  arenaHeaderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  endBattleButton: {
    backgroundColor: colors.cardLight,
  },
  hypeButton: {
    backgroundColor: colors.warning,
  },
  hackButton: {
    backgroundColor: colors.danger,
  },
  payHolosButton: {
    backgroundColor: colors.success,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: colors.cardLight,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  autoBattleActive: {
    backgroundColor: colors.accent,
  },
  modeButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  attackButtonContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  attackButton: {
    backgroundColor: colors.danger,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  specialAttackButton: {
    backgroundColor: colors.warning,
  },
  attackButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBarsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  vsContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    color: colors.warning,
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusBars: {
    flex: 1,
    gap: 8,
    paddingHorizontal: 8,
  },
  statusBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBar: {
    flex: 1,
  },
  statusValue: {
    fontSize: 10,
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
  boostText: {
    color: colors.success,
    fontWeight: 'bold',
  },
  battleLogContainer: {
    flex: 1,
    marginBottom: 16,
  },
  battleLog: {
    flex: 1,
    padding: 8,
  },
  logEntry: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  turnIndicator: {
    backgroundColor: colors.card,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  turnText: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
  },
  battleEndContainer: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  battleEndText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  battleStartContainer: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  battleStartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});