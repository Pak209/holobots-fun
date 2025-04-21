import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useHolobotStore } from '@/store/holobot-store';
import { useAuthStore } from '@/store/auth-store';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { 
  MapPin, 
  Swords, 
  Target, 
  Gem, 
  Ticket, 
  Clock, 
  Flame, 
  Trophy, 
  Star,
  Shield,
  Zap,
  AlertCircle
} from 'lucide-react-native';
import { QuestBattleBanner } from '@/components/quests/QuestBattleBanner';
import { QuestResultsScreen } from '@/components/quests/QuestResultsScreen';
import { HOLOBOT_STATS } from '@/types/holobot';
import { HolobotQuestSelector } from '@/components/quests/HolobotQuestSelector';
import { HolobotKey, Holobot } from '@/types/holobots';
import { User, BlueprintMap, UserProfile } from '@/types/user';
import {
  QuestTier,
  QuestTiers,
  HolobotCooldowns,
  QuestHolobot,
  SquadExpResult,
  BlueprintReward,
  EXPLORATION_TIERS,
  BOSS_TIERS,
  QUEST_ENERGY_COST
} from '@/types/quests';
import { QUEST_TIERS } from '@/constants/quests';

// Holobot cooldown in minutes
const COOLDOWN_MINUTES = 30;

interface QuestGridProps {
  user: UserProfile;
}

interface QuestGridState {
  explorationHolobot: HolobotKey | null;
  selectedExplorationTier: keyof typeof EXPLORATION_TIERS | null;
  isExplorationQuesting: boolean;
  bossHolobots: HolobotKey[];
  selectedBoss: HolobotKey;
  selectedBossTier: keyof typeof BOSS_TIERS | null;
  isBossQuesting: boolean;
  holobotCooldowns: HolobotCooldowns;
  showBattleBanner: boolean;
  isBossBattle: boolean;
  currentBattleHolobots: HolobotKey[];
  currentBossHolobot: HolobotKey;
  showResultsScreen: boolean;
  battleSuccess: boolean;
  squadExpResults: SquadExpResult[];
  blueprintReward: BlueprintReward | undefined;
  holosReward: number;
}

const QuestGrid: React.FC<QuestGridProps> = ({ user }) => {
  const { updateUser } = useAuthStore();
  const { holobots, fetchHolobots, isLoading: holobotsLoading } = useHolobotStore();
  
  const [explorationHolobot, setExplorationHolobot] = useState<HolobotKey | null>(null);
  const [selectedExplorationTier, setSelectedExplorationTier] = useState<keyof typeof EXPLORATION_TIERS | null>(null);
  const [isExplorationQuesting, setIsExplorationQuesting] = useState(false);
  
  const [bossHolobots, setBossHolobots] = useState<HolobotKey[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<HolobotKey>("");
  const [selectedBossTier, setSelectedBossTier] = useState<keyof typeof BOSS_TIERS | null>(null);
  const [isBossQuesting, setIsBossQuesting] = useState(false);
  
  const [holobotCooldowns, setHolobotCooldowns] = useState<HolobotCooldowns>({});
  
  const [showBattleBanner, setShowBattleBanner] = useState(false);
  const [isBossBattle, setIsBossBattle] = useState(false);
  const [currentBattleHolobots, setCurrentBattleHolobots] = useState<HolobotKey[]>([]);
  const [currentBossHolobot, setCurrentBossHolobot] = useState<HolobotKey>("");
  
  const [showResultsScreen, setShowResultsScreen] = useState(false);
  const [battleSuccess, setBattleSuccess] = useState(false);
  const [squadExpResults, setSquadExpResults] = useState<SquadExpResult[]>([]);
  const [blueprintReward, setBlueprintReward] = useState<BlueprintReward>();
  const [holosReward, setHolosReward] = useState(0);

  useEffect(() => {
    if (!holobots || holobots.length === 0) {
      fetchHolobots();
    }
  }, []);

  // Get the user's holobots that are not on cooldown
  const getAvailableHolobots = (): QuestHolobot[] => {
    if (!user?.holobots) return [];
    
    return Object.entries(user.holobots).map(([key, holobot]) => {
      const holobotKey = getHolobotKeyByName(holobot.name);
      const isOnCooldown = Boolean(holobotCooldowns[holobotKey] && new Date() <= new Date(holobotCooldowns[holobotKey]));
      return {
        ...holobot,
        key: holobotKey,
        isOnCooldown,
        cooldownTimeRemaining: getCooldownTimeRemaining(holobotKey)
      };
    });
  };

  // Get all user holobots with cooldown status
  const getAllUserHolobots = (): QuestHolobot[] => {
    if (!user?.holobots) return [];
    
    return Object.entries(user.holobots).map(([key, holobot]) => {
      const holobotKey = getHolobotKeyByName(holobot.name);
      const isOnCooldown = Boolean(holobotCooldowns[holobotKey] && new Date() <= new Date(holobotCooldowns[holobotKey]));
      return {
        ...holobot,
        key: holobotKey,
        isOnCooldown,
        cooldownTimeRemaining: getCooldownTimeRemaining(holobotKey)
      };
    });
  };

  // Get the holobot key from HOLOBOT_STATS based on name
  const getHolobotKeyByName = (name: string): HolobotKey => {
    const lowerName = name.toLowerCase();
    const key = Object.keys(HOLOBOT_STATS).find(
      k => HOLOBOT_STATS[k].name.toLowerCase() === lowerName
    );
    return key || Object.keys(HOLOBOT_STATS)[0]; // fallback to first holobot if not found
  };

  // Set a holobot on cooldown
  const setHolobotOnCooldown = (holobotKey: HolobotKey): void => {
    const cooldownEnd = new Date();
    cooldownEnd.setMinutes(cooldownEnd.getMinutes() + COOLDOWN_MINUTES);
    
    setHolobotCooldowns(prev => ({
      ...prev,
      [holobotKey]: cooldownEnd.toISOString()
    }));
  };

  // Get cooldown progress percentage for a holobot
  const getCooldownProgress = (holobotKey: HolobotKey): number => {
    if (!holobotCooldowns[holobotKey]) return 100;
    
    const now = new Date();
    const cooldownEnd = new Date(holobotCooldowns[holobotKey]);
    
    if (now > cooldownEnd) return 100;
    
    const cooldownStart = new Date(cooldownEnd);
    cooldownStart.setMinutes(cooldownStart.getMinutes() - COOLDOWN_MINUTES);
    
    const total = cooldownEnd.getTime() - cooldownStart.getTime();
    const elapsed = now.getTime() - cooldownStart.getTime();
    
    return Math.min(Math.floor((elapsed / total) * 100), 100);
  };

  // Get formatted time remaining for cooldown
  const getCooldownTimeRemaining = (holobotKey: HolobotKey): string => {
    if (!holobotCooldowns[holobotKey]) return "Ready";
    
    const now = new Date();
    const cooldownEnd = new Date(holobotCooldowns[holobotKey]);
    
    if (now > cooldownEnd) return "Ready";
    
    const diffMs = cooldownEnd.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / 60000);
    
    return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  };

  // Update the find operations to work with Record<string, Holobot>
  const findHolobotByName = (name: string): Holobot | undefined => {
    return Object.values(user?.holobots || {}).find(h => h.name === name);
  };

  // Update squad experience with proper type handling
  const updateSquadExperience = async (
    squad: HolobotKey[],
    experienceGained: number
  ): Promise<Record<string, Holobot>> => {
    const updatedHolobots: Record<string, Holobot> = {};
    
    squad.forEach((holobotKey) => {
      const holobot = holobots[holobotKey];
      if (holobot) {
        updatedHolobots[holobotKey] = {
          ...holobot,
          experience: holobot.experience + experienceGained,
        };
      }
    });
    
    return updatedHolobots;
  };

  // Helper function to calculate required XP for level
  const calculateExperience = (level: number): number => {
    return Math.floor(100 * Math.pow(level, 2));
  };
  
  // Helper function to determine if level up occurs
  const getNewLevel = (currentXp: number, currentLevel: number): number => {
    const requiredXp = calculateExperience(currentLevel);
    if (currentXp >= requiredXp && currentLevel < 50) {
      return currentLevel + 1;
    }
    return currentLevel;
  };

  const availableHolobots = Object.values(user?.holobots || {}).filter((holobot): holobot is Holobot => {
    return !holobot.isLocked && holobot.level >= BOSS_TIERS[selectedBossTier].level;
  });

  const allUserHolobots = getAllUserHolobots();

  // Handle holobot selection for exploration
  const handleExplorationHolobotSelect = (holobotKey: HolobotKey): void => {
    setExplorationHolobot(holobotKey);
  };

  // Start exploration quest
  const handleStartExploration = async () => {
    if (!explorationHolobot) {
      Alert.alert(
        "Select a Holobot",
        "Please select a Holobot for exploration"
      );
      return;
    }

    // Check if the selected holobot is on cooldown
    const holobotKey = explorationHolobot;
    const isOnCooldown = holobotCooldowns[holobotKey] && new Date() <= new Date(holobotCooldowns[holobotKey]);
    
    if (isOnCooldown) {
      Alert.alert(
        "Holobot on Cooldown",
        `This Holobot is still recovering. Available in ${getCooldownTimeRemaining(holobotKey)}.`
      );
      return;
    }

    const tier = EXPLORATION_TIERS[selectedExplorationTier];
    
    if (!user || user.dailyEnergy < tier.energyCost) {
      Alert.alert(
        "Not Enough Energy",
        `You need ${tier.energyCost} energy for this quest`
      );
      return;
    }

    setIsExplorationQuesting(true);
    
    // Set up battle banner
    setIsBossBattle(false);
    setCurrentBattleHolobots([explorationHolobot]);
    
    // For exploration, randomly select an opponent
    const randomOpponentKey = Object.keys(HOLOBOT_STATS)[Math.floor(Math.random() * Object.keys(HOLOBOT_STATS).length)];
    setCurrentBossHolobot(randomOpponentKey);
    setShowBattleBanner(true);
    
    try {
      // Wait for battle banner to complete
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Determine success (70% success rate)
      const isSuccess = Math.random() < 0.7;
      
      if (isSuccess) {
        // Update user's tokens and energy
        if (user) {
          // Add blueprints rewards - random selection of holobot for exploration
          const randomHolobotKey: HolobotKey = randomOpponentKey as HolobotKey;
          
          // Get current blueprints or initialize empty object
          const currentBlueprints: BlueprintMap = user.blueprints || {};
          
          // Update the blueprint count for the random holobot
          const updatedBlueprints: BlueprintMap = {
            ...currentBlueprints,
            [randomHolobotKey]: (currentBlueprints[randomHolobotKey] || 0) + tier.rewards.blueprintPieces
          };
          
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost,
            holosTokens: (user.holosTokens || 0) + tier.rewards.holosTokens,
            blueprints: updatedBlueprints
          });
          
          // Set up results screen data
          setBattleSuccess(true);
          setSquadExpResults([{
            name: HOLOBOT_STATS[explorationHolobot].name,
            xp: 0, // No XP for exploration currently
            levelUp: false,
            newLevel: user.holobots.find(h => h.name === HOLOBOT_STATS[explorationHolobot].name)?.level || 1
          }]);
          setBlueprintReward({
            holobotKey: randomHolobotKey,
            amount: tier.rewards.blueprintPieces
          });
          setHolosReward(tier.rewards.holosTokens);
          setShowResultsScreen(true);
        }
      } else {
        // Set holobot on cooldown
        setHolobotOnCooldown(explorationHolobot);
        
        // Update user's energy
        if (user) {
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost
          });
        }
        
        // Set up results screen for failure
        setBattleSuccess(false);
        setSquadExpResults([{
          name: HOLOBOT_STATS[explorationHolobot].name,
          xp: 0,
          levelUp: false,
          newLevel: user.holobots.find(h => h.name === HOLOBOT_STATS[explorationHolobot].name)?.level || 1
        }]);
        setBlueprintReward(undefined);
        setHolosReward(0);
        setShowResultsScreen(true);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred during the quest"
      );
    } finally {
      setIsExplorationQuesting(false);
    }
  };

  // Handle selecting a holobot for the boss squad
  const handleSelectBossHolobot = (holobotKey: HolobotKey): void => {
    if (bossHolobots.includes(holobotKey)) {
      // Remove if already selected
      setBossHolobots(prev => prev.filter(key => key !== holobotKey));
    } else if (bossHolobots.length < 3) {
      // Add if less than 3 selected
      setBossHolobots(prev => [...prev, holobotKey]);
    } else {
      Alert.alert(
        "Squad Full",
        "You can only select 3 Holobots for the Boss Quest"
      );
    }
  };

  // Start boss quest
  const handleStartBossQuest = async () => {
    if (bossHolobots.length < 3) {
      Alert.alert(
        "Incomplete Squad",
        "Please select 3 Holobots for the Boss Quest"
      );
      return;
    }

    if (!selectedBoss) {
      Alert.alert(
        "Select a Boss",
        "Please select a Boss to challenge"
      );
      return;
    }

    // Check if any selected holobot is on cooldown
    const anyOnCooldown = bossHolobots.some(holobotKey => {
      return holobotCooldowns[holobotKey] && new Date() <= new Date(holobotCooldowns[holobotKey]);
    });
    
    if (anyOnCooldown) {
      Alert.alert(
        "Squad Member on Cooldown",
        "One or more of your selected Holobots is still recovering. Please wait or select different Holobots."
      );
      return;
    }

    const tier = BOSS_TIERS[selectedBossTier];
    
    if (!user || user.dailyEnergy < tier.energyCost) {
      Alert.alert(
        "Not Enough Energy",
        `You need ${tier.energyCost} energy for this quest`
      );
      return;
    }

    setIsBossQuesting(true);
    
    // Set up battle banner
    setIsBossBattle(true);
    setCurrentBattleHolobots([...bossHolobots]);
    setCurrentBossHolobot(selectedBoss);
    setShowBattleBanner(true);
    
    try {
      // Wait for battle banner to complete
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Calculate squad power (simplified)
      const squadPower = bossHolobots.reduce((power, holobotKey) => {
        const holobot = user?.holobots.find(
          h => h.name.toLowerCase() === HOLOBOT_STATS[holobotKey].name.toLowerCase()
        );
        return power + (holobot?.level || 1) * 10;
      }, 0);
      
      // Calculate boss power
      const bossPower = tier.level * 15;
      
      // Determine success (based on squad power vs boss power with randomness)
      const powerRatio = squadPower / bossPower;
      const successChance = Math.min(0.9, powerRatio * 0.7); // Cap at 90% success
      const isSuccess = Math.random() < successChance;
      
      if (isSuccess) {
        // Ensure tier exists and has required properties
        if (!tier?.rewards) {
          console.error('Tier or rewards not found');
          return;
        }

        const {
          squadXp = 0,
          xpMultiplier = 1,
          blueprintPieces = 0,
          holosTokens = 0,
          gachaTickets = 0
        } = tier.rewards;

        // Update XP for all Holobots in the squad
        const updatedHolobots = await updateSquadExperience(bossHolobots, squadXp, xpMultiplier);
        
        // Get current blueprints or initialize empty object
        const currentBlueprints = user.blueprints || {};
        
        // Update the blueprint count for the boss holobot
        const updatedBlueprints = {
          ...currentBlueprints,
          [selectedBoss]: (currentBlueprints[selectedBoss] || 0) + blueprintPieces
        };
        
        // Update user's tokens, tickets, and energy
        if (user) {
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost,
            holosTokens: (user.holosTokens || 0) + holosTokens,
            gachaTickets: (user.gachaTickets || 0) + gachaTickets,
            holobots: updatedHolobots,
            blueprints: updatedBlueprints
          });
        }
        
        // Set up results screen data
        setBattleSuccess(true);
        setBlueprintReward({
          holobotKey: selectedBoss,
          amount: blueprintPieces
        });
        setHolosReward(holosTokens);
        setShowResultsScreen(true);
      } else {
        // Even on failure, Holobots gain some experience (half of success amount)
        const failureXp = Math.floor(tier.rewards.squadXp * 0.5);
        const updatedHolobots = await updateSquadExperience(bossHolobots, failureXp, 1);
        
        // Grant a reduced amount of blueprint pieces even on failure (25% of normal)
        const failureBlueprintPieces = Math.max(1, Math.floor(tier.rewards.blueprintPieces * 0.25));
        
        // Get current blueprints or initialize empty object
        const currentBlueprints = user.blueprints || {};
        
        // Update the blueprint count for the boss holobot
        const updatedBlueprints = {
          ...currentBlueprints,
          [selectedBoss]: (currentBlueprints[selectedBoss] || 0) + failureBlueprintPieces
        };
        
        // Set all squad holobots on cooldown
        bossHolobots.forEach(holobotKey => {
          setHolobotOnCooldown(holobotKey);
        });
        
        // Update user's energy and holobots
        if (user) {
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost,
            holobots: updatedHolobots,
            blueprints: updatedBlueprints
          });
        }
        
        // Set up results screen for failure
        setBattleSuccess(false);
        setBlueprintReward({
          holobotKey: selectedBoss,
          amount: failureBlueprintPieces
        });
        setHolosReward(0);
        setShowResultsScreen(true);
      }
    } catch (error) {
      console.error("Error during boss quest:", error);
      Alert.alert(
        "Error",
        "An error occurred during the boss quest"
      );
    } finally {
      setIsBossQuesting(false);
      setBossHolobots([]);
    }
  };

  if (holobotsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading quests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Trophy size={20} color={colors.accent} />
          <Text style={styles.infoTitle}>Quests Info</Text>
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoText}>
            Send your Holobots on quests to earn rewards:
          </Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={styles.infoDot} />
              <Text style={styles.infoItemText}>Exploration Quests: Earn Holos tokens and Blueprint Pieces</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoDot} />
              <Text style={styles.infoItemText}>Boss Quests: Team up 3 Holobots to earn big rewards</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoDot} />
              <Text style={styles.infoItemText}>Defeated Holobots need {COOLDOWN_MINUTES} minutes to recharge</Text>
            </View>
          </View>
          
          {/* Energy Display */}
          <View style={styles.energyContainer}>
            <View style={styles.energyHeader}>
              <Text style={styles.energyLabel}>Daily Energy</Text>
              <Text style={styles.energyValue}>{user?.dailyEnergy || 0}/{user?.maxDailyEnergy || 100}</Text>
            </View>
            <View style={styles.energyBar}>
              <View 
                style={[
                  styles.energyFill, 
                  { width: `${((user?.dailyEnergy || 0) / (user?.maxDailyEnergy || 100)) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </Card>

      <View style={styles.questsGrid}>
        {/* Exploration Quest */}
        <Card style={styles.questCard}>
          <View style={styles.questHeader}>
            <View style={styles.questTitleContainer}>
              <MapPin size={20} color={colors.secondary} />
              <Text style={styles.questTitle}>Exploration Quest</Text>
            </View>
            <Text style={styles.questSubtitle}>
              Send a Holobot to explore and collect resources
            </Text>
          </View>
          
          <View style={styles.questContent}>
            {/* Holobot Selection - Replaced with Dropdown */}
            <Text style={styles.sectionLabel}>Choose your Holobot:</Text>
            <HolobotQuestSelector
              holobots={allUserHolobots}
              selectedHolobotKey={explorationHolobot}
              onSelect={handleExplorationHolobotSelect}
              showCooldowns={true}
            />

            {/* Tier Selection */}
            <Text style={styles.sectionLabel}>Select difficulty:</Text>
            <View style={styles.tierSelector}>
              {Object.entries(EXPLORATION_TIERS).map(([key, tier]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.tierOption,
                    selectedExplorationTier === key && styles.tierOptionSelected
                  ]}
                  onPress={() => setSelectedExplorationTier(key as keyof typeof EXPLORATION_TIERS)}
                >
                  <Text style={[
                    styles.tierOptionName,
                    selectedExplorationTier === key && styles.tierOptionNameSelected
                  ]}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <View style={styles.tierOptionDetails}>
                    <Flame size={12} color={selectedExplorationTier === key ? colors.text : colors.secondary} />
                    <Text style={[
                      styles.tierOptionLevel,
                      selectedExplorationTier === key && styles.tierOptionLevelSelected
                    ]}>
                      Lv.{tier.level}
                    </Text>
                  </View>
                  <Text style={[
                    styles.tierOptionEnergy,
                    selectedExplorationTier === key && styles.tierOptionEnergySelected
                  ]}>
                    {tier.energyCost} Energy
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rewards Display */}
            <View style={styles.rewardsContainer}>
              <Text style={styles.rewardsTitle}>Rewards:</Text>
              <View style={styles.rewardsGrid}>
                <View style={styles.rewardItem}>
                  <Gem size={14} color={colors.accent} />
                  <Text style={styles.rewardText}>
                    {EXPLORATION_TIERS[selectedExplorationTier].rewards.blueprintPieces} Blueprint {EXPLORATION_TIERS[selectedExplorationTier].rewards.blueprintPieces > 1 ? 'Pieces' : 'Piece'}
                  </Text>
                </View>
                <View style={styles.rewardItem}>
                  <Star size={14} color={colors.warning} />
                  <Text style={styles.rewardText}>
                    {EXPLORATION_TIERS[selectedExplorationTier].rewards.holosTokens} Holos
                  </Text>
                </View>
              </View>
            </View>
            
            <Button 
              title={isExplorationQuesting ? "Exploring..." : "Start Exploration"}
              icon={<MapPin size={16} color={colors.text} />}
              variant="secondary"
              loading={isExplorationQuesting}
              disabled={
                isExplorationQuesting || 
                !explorationHolobot || 
                (user?.dailyEnergy || 0) < EXPLORATION_TIERS[selectedExplorationTier].energyCost ||
                (explorationHolobot && holobotCooldowns[explorationHolobot] && new Date() <= new Date(holobotCooldowns[explorationHolobot]))
              }
              onPress={handleStartExploration}
              style={styles.questButton}
            />
          </View>
        </Card>

        {/* Boss Quest */}
        <Card style={styles.questCard}>
          <View style={styles.questHeader}>
            <View style={styles.questTitleContainer}>
              <Target size={20} color={colors.danger} />
              <Text style={[styles.questTitle, { color: colors.danger }]}>Boss Quest</Text>
            </View>
            <Text style={styles.questSubtitle}>
              Challenge powerful bosses with a team of 3 Holobots
            </Text>
          </View>
          
          <View style={styles.questContent}>
            {/* Squad Selection */}
            <Text style={styles.sectionLabel}>Select 3 Holobots for your squad:</Text>
            <View style={styles.squadSelector}>
              {Array(3).fill(0).map((_, index) => {
                const selectedKey = bossHolobots[index];
                const isSelected = !!selectedKey;
                
                return (
                  <View 
                    key={index}
                    style={[
                      styles.squadSlot,
                      isSelected ? styles.squadSlotFilled : styles.squadSlotEmpty
                    ]}
                  >
                    {isSelected ? (
                      <View style={styles.squadHolobot}>
                        <Text style={styles.squadHolobotName}>
                          {HOLOBOT_STATS[selectedKey].name}
                        </Text>
                        <Text style={styles.squadHolobotLevel}>
                          Lv.{user?.holobots.find(h => 
                            h.name.toLowerCase() === HOLOBOT_STATS[selectedKey].name.toLowerCase()
                          )?.level || 1}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.squadSlotEmptyText}>Empty Slot</Text>
                    )}
                  </View>
                );
              })}
            </View>
            
            <ScrollView 
              style={styles.holobotSquadList}
              contentContainerStyle={styles.holobotSquadListContent}
            >
              <View style={styles.holobotSquadGrid}>
                {allUserHolobots.map((holobot, index) => {
                  const holobotKey = holobot.key;
                  const isSelected = bossHolobots.includes(holobotKey);
                  const isOnCooldown = holobot.isOnCooldown;
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.squadHolobotOption,
                        isSelected && styles.squadHolobotOptionSelected,
                        isOnCooldown && styles.squadHolobotOptionCooldown
                      ]}
                      onPress={() => handleSelectBossHolobot(holobotKey)}
                      disabled={isOnCooldown}
                    >
                      <Text style={[
                        styles.squadHolobotOptionName,
                        isOnCooldown && styles.squadHolobotOptionNameCooldown
                      ]}>
                        {holobot.name}
                      </Text>
                      <View style={styles.squadHolobotOptionDetails}>
                        <Text style={[
                          styles.squadHolobotOptionLevel,
                          isOnCooldown && styles.squadHolobotOptionLevelCooldown
                        ]}>
                          Lv.{holobot.level}
                        </Text>
                        {isOnCooldown && (
                          <View style={styles.cooldownBadge}>
                            <Clock size={10} color={colors.text} />
                            <Text style={styles.cooldownBadgeText}>
                              {holobot.cooldownTimeRemaining}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            
            {/* Boss Selection */}
            <Text style={styles.sectionLabel}>Select Boss:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.bossSelector}
              contentContainerStyle={styles.bossSelectorContent}
            >
              {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.bossOption,
                    selectedBoss === key && styles.bossOptionSelected
                  ]}
                  onPress={() => setSelectedBoss(key)}
                >
                  <Text style={[
                    styles.bossOptionName,
                    selectedBoss === key && styles.bossOptionNameSelected
                  ]}>
                    {stats.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Tier Selection */}
            <Text style={styles.sectionLabel}>Select difficulty:</Text>
            <View style={styles.tierSelector}>
              {Object.entries(BOSS_TIERS).map(([key, tier]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.tierOption,
                    styles.bossTierOption,
                    selectedBossTier === key && styles.bossTierOptionSelected
                  ]}
                  onPress={() => setSelectedBossTier(key as keyof typeof BOSS_TIERS)}
                >
                  <Text style={[
                    styles.tierOptionName,
                    selectedBossTier === key && styles.bossTierOptionNameSelected
                  ]}>
                    {key.replace('tier', 'T')}
                  </Text>
                  <View style={styles.tierOptionDetails}>
                    <Target size={12} color={selectedBossTier === key ? colors.text : colors.danger} />
                    <Text style={[
                      styles.tierOptionLevel,
                      selectedBossTier === key && styles.tierOptionLevelSelected
                    ]}>
                      Lv.{tier.level}
                    </Text>
                  </View>
                  <Text style={[
                    styles.tierOptionEnergy,
                    selectedBossTier === key && styles.tierOptionEnergySelected
                  ]}>
                    {tier.energyCost} Energy
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rewards Display */}
            <View style={[styles.rewardsContainer, styles.bossRewardsContainer]}>
              <Text style={styles.rewardsTitle}>Rewards:</Text>
              <View style={styles.rewardsGrid}>
                <View style={styles.rewardItem}>
                  <Gem size={14} color={colors.accent} />
                  <Text style={styles.rewardText}>
                    {BOSS_TIERS[selectedBossTier].rewards.blueprintPieces} Blueprint Pieces
                  </Text>
                </View>
                <View style={styles.rewardItem}>
                  <Star size={14} color={colors.warning} />
                  <Text style={styles.rewardText}>
                    {BOSS_TIERS[selectedBossTier].rewards.holosTokens} Holos
                  </Text>
                </View>
                <View style={styles.rewardItem}>
                  <Ticket size={14} color={colors.success} />
                  <Text style={styles.rewardText}>
                    {BOSS_TIERS[selectedBossTier].rewards.gachaTickets} Gacha Tickets
                  </Text>
                </View>
                <View style={styles.rewardItem}>
                  <Zap size={14} color={colors.primary} />
                  <Text style={styles.rewardText}>
                    x{BOSS_TIERS[selectedBossTier].rewards.xpMultiplier} XP Boost
                  </Text>
                </View>
              </View>
            </View>
            
            <Button 
              title={isBossQuesting ? "Fighting Boss..." : "Start Boss Quest"}
              icon={<Swords size={16} color={colors.text} />}
              variant="danger"
              loading={isBossQuesting}
              disabled={
                isBossQuesting || 
                bossHolobots.length < 3 || 
                !selectedBoss || 
                (user?.dailyEnergy || 0) < BOSS_TIERS[selectedBossTier].energyCost ||
                // Check if any selected holobot is on cooldown
                bossHolobots.some(key => holobotCooldowns[key] && new Date() <= new Date(holobotCooldowns[key]))
              }
              onPress={handleStartBossQuest}
              style={styles.questButton}
            />
          </View>
        </Card>
      </View>

      {/* Holobot Cooldowns Display */}
      {Object.keys(holobotCooldowns).length > 0 && (
        <Card style={styles.cooldownsCard}>
          <View style={styles.cooldownsHeader}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.cooldownsTitle}>Holobot Cooldowns</Text>
          </View>
          
          <View style={styles.cooldownsGrid}>
            {Object.entries(holobotCooldowns).map(([holobotKey, cooldownTime]) => {
              const progress = getCooldownProgress(holobotKey);
              const timeRemaining = getCooldownTimeRemaining(holobotKey);
              const isReady = timeRemaining === "Ready";
              
              return (
                <View 
                  key={holobotKey}
                  style={[
                    styles.cooldownItem,
                    isReady ? styles.cooldownItemReady : styles.cooldownItemActive
                  ]}
                >
                  <View style={styles.cooldownItemHeader}>
                    <Text style={styles.cooldownItemName}>
                      {HOLOBOT_STATS[holobotKey].name}
                    </Text>
                    <Text style={[
                      styles.cooldownItemTime,
                      isReady ? styles.cooldownItemTimeReady : styles.cooldownItemTimeActive
                    ]}>
                      {timeRemaining}
                    </Text>
                  </View>
                  
                  <View style={styles.cooldownProgressBar}>
                    <View 
                      style={[
                        styles.cooldownProgressFill,
                        { width: `${progress}%` }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      )}
      
      {/* Battle Banner */}
      <QuestBattleBanner 
        isVisible={showBattleBanner}
        isBossQuest={isBossBattle}
        squadHolobotKeys={currentBattleHolobots}
        bossHolobotKey={currentBossHolobot}
        onComplete={() => setShowBattleBanner(false)}
      />
      
      {/* Results Screen */}
      <QuestResultsScreen 
        isVisible={showResultsScreen}
        isSuccess={battleSuccess}
        squadHolobotKeys={currentBattleHolobots}
        squadHolobotExp={squadExpResults}
        blueprintRewards={blueprintReward}
        holosRewards={holosReward}
        onClose={() => setShowResultsScreen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  infoCard: ViewStyle;
  infoHeader: ViewStyle;
  infoTitle: TextStyle;
  infoContent: ViewStyle;
  infoText: TextStyle;
  infoList: ViewStyle;
  infoItem: ViewStyle;
  infoDot: ViewStyle;
  infoItemText: TextStyle;
  energyContainer: ViewStyle;
  energyHeader: ViewStyle;
  energyLabel: TextStyle;
  energyValue: TextStyle;
  energyBar: ViewStyle;
  energyFill: ViewStyle;
  questsGrid: ViewStyle;
  questCard: ViewStyle;
  questHeader: ViewStyle;
  questTitleContainer: ViewStyle;
  questTitle: TextStyle;
  questSubtitle: TextStyle;
  questContent: ViewStyle;
  sectionLabel: TextStyle;
  holobotSelector: ViewStyle;
  holobotSelectorContent: ViewStyle;
  holobotOption: ViewStyle;
  holobotOptionSelected: ViewStyle;
  holobotOptionName: TextStyle;
  holobotOptionNameSelected: TextStyle;
  holobotOptionLevel: TextStyle;
  noHolobotsMessage: ViewStyle;
  noHolobotsText: TextStyle;
  tierSelector: ViewStyle;
  tierOption: ViewStyle;
  tierOptionSelected: ViewStyle;
  squadHolobotOptionName: TextStyle;
  squadHolobotOptionNameCooldown: TextStyle;
  squadHolobotOptionDetails: ViewStyle;
  squadHolobotOptionLevel: TextStyle;
  squadHolobotOptionLevelCooldown: TextStyle;
  cooldownBadge: ViewStyle;
  cooldownBadgeText: TextStyle;
  bossSelector: ViewStyle;
  bossSelectorContent: ViewStyle;
  bossOption: ViewStyle;
  bossOptionSelected: ViewStyle;
  bossOptionName: TextStyle;
  bossOptionNameSelected: TextStyle;
  bossTierOption: ViewStyle;
  bossTierOptionSelected: ViewStyle;
  tierOptionName: TextStyle;
  tierOptionNameSelected: TextStyle;
  tierOptionDetails: ViewStyle;
  tierOptionLevel: TextStyle;
  tierOptionLevelSelected: TextStyle;
  tierOptionEnergy: TextStyle;
  tierOptionEnergySelected: TextStyle;
  rewardsContainer: ViewStyle;
  bossRewardsContainer: ViewStyle;
  rewardsTitle: TextStyle;
  rewardsGrid: ViewStyle;
  rewardItem: ViewStyle;
  rewardText: TextStyle;
  questButton: ViewStyle;
  cooldownsCard: ViewStyle;
  cooldownsHeader: ViewStyle;
  cooldownsTitle: TextStyle;
  cooldownsGrid: ViewStyle;
  cooldownItem: ViewStyle;
  cooldownItemReady: ViewStyle;
  cooldownItemActive: ViewStyle;
  cooldownItemHeader: ViewStyle;
  cooldownItemName: TextStyle;
  cooldownItemTime: TextStyle;
  cooldownItemTimeReady: TextStyle;
  cooldownItemTimeActive: TextStyle;
  cooldownProgressBar: ViewStyle;
  cooldownProgressFill: ViewStyle;
}>({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  infoContent: {
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  infoList: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  infoItemText: {
    fontSize: 14,
    color: colors.text,
  },
  energyContainer: {
    backgroundColor: colors.backgroundLighter,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  energyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  energyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  energyValue: {
    fontSize: 14,
    color: colors.text,
  },
  energyBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  questsGrid: {
    marginBottom: 16,
  },
  questCard: {
    marginBottom: 16,
  },
  questHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  questTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
    marginLeft: 8,
  },
  questSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  questContent: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  holobotSelector: {
    marginBottom: 16,
  },
  holobotSelectorContent: {
    paddingRight: 16,
  },
  holobotOption: {
    backgroundColor: colors.backgroundLighter,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  holobotOptionSelected: {
    backgroundColor: colors.secondary + '20',
    borderColor: colors.secondary,
  },
  holobotOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  holobotOptionNameSelected: {
    color: colors.secondary,
  },
  holobotOptionLevel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noHolobotsMessage: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noHolobotsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tierSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tierOption: {
    flex: 1,
    backgroundColor: colors.backgroundLighter,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierOptionSelected: {
    backgroundColor: colors.secondary + '20',
    borderColor: colors.secondary,
  },
  bossTierOption: {
    borderColor: colors.danger + '30',
  },
  bossTierOptionSelected: {
    backgroundColor: colors.danger + '20',
    borderColor: colors.danger,
  },
  tierOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  tierOptionNameSelected: {
    color: colors.secondary,
  },
  bossTierOptionNameSelected: {
    color: colors.danger,
  },
  tierOptionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tierOptionLevel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  tierOptionLevelSelected: {
    color: colors.text,
  },
  tierOptionEnergy: {
    fontSize: 10,
    color: colors.success,
  },
  tierOptionEnergySelected: {
    color: colors.success,
  },
  rewardsContainer: {
    backgroundColor: colors.backgroundLighter,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.secondary + '30',
  },
  bossRewardsContainer: {
    borderColor: colors.danger + '30',
  },
  rewardsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
  questButton: {
    width: '100%',
  },
  // Boss quest specific styles
  squadSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  squadSlot: {
    width: '32%',
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  squadSlotEmpty: {
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.backgroundLighter,
  },
  squadSlotFilled: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '10',
  },
  squadSlotEmptyText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  squadHolobot: {
    alignItems: 'center',
  },
  squadHolobotName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  squadHolobotLevel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  holobotSquadList: {
    maxHeight: 120,
    marginBottom: 16,
    backgroundColor: colors.backgroundLighter,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  holobotSquadListContent: {
    padding: 8,
  },
  holobotSquadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  squadHolobotOption: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  squadHolobotOptionSelected: {
    backgroundColor: colors.danger + '10',
    borderColor: colors.danger,
  },
  squadHolobotOptionCooldown: {
    backgroundColor: colors.backgroundLighter,
    borderColor: colors.border,
    opacity: 0.7,
  },
  squadHolobotOptionName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  squadHolobotOptionNameCooldown: {
    color: colors.textSecondary,
  },
  squadHolobotOptionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  squadHolobotOptionLevel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  squadHolobotOptionLevelCooldown: {
    color: colors.textSecondary,
  },
  cooldownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '30',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cooldownBadgeText: {
    fontSize: 8,
    color: colors.warning,
    marginLeft: 2,
  },
  bossSelector: {
    marginBottom: 16,
  },
  bossSelectorContent: {
    paddingRight: 16,
  },
  bossOption: {
    backgroundColor: colors.backgroundLighter,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
    alignItems: 'center',
  },
  bossOptionSelected: {
    backgroundColor: colors.danger + '20',
    borderColor: colors.danger,
  },
  bossOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  bossOptionNameSelected: {
    color: colors.danger,
  },
  // Cooldowns card
  cooldownsCard: {
    marginBottom: 16,
  },
  cooldownsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cooldownsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  cooldownsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  cooldownItem: {
    width: '48%',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  cooldownItemActive: {
    borderColor: colors.warning + '30',
    backgroundColor: colors.warning + '10',
  },
  cooldownItemReady: {
    borderColor: colors.success + '30',
    backgroundColor: colors.success + '10',
  },
  cooldownItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cooldownItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  cooldownItemTime: {
    fontSize: 12,
  },
  cooldownItemTimeActive: {
    color: colors.warning,
  },
  cooldownItemTimeReady: {
    color: colors.success,
  },
  cooldownProgressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  cooldownProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});

export default QuestGrid;