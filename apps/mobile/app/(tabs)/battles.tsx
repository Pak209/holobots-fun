import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { BattleCard } from '@/components/BattleCard';
import { ArenaPreBattleMenu } from '@/components/ArenaPreBattleMenu';
import { ArenaBattle } from '@/components/ArenaBattle';
import { LeagueSelector } from '@/components/LeagueSelector';
import { AsyncBattleCard } from '@/components/AsyncBattleCard';
import { BattleTicketDisplay } from '@/components/BattleTicketDisplay';
import { colors } from '@/constants/colors';
import { useHolobotStore } from '@/store/holobot-store';
import { useAuthStore } from '@/store/auth-store';
import { useLeagueStore } from '@/store/league-store';
import { useFitnessStore } from '@/store/fitness-store';
import { HOLOBOT_STATS } from '@/types/holobot';
import { League, LeagueOpponent } from '@/types/league';
import { 
  Swords, 
  Trophy, 
  Clock, 
  Filter, 
  Award, 
  Users, 
  Medal, 
  Crown, 
  ArrowLeft 
} from 'lucide-react-native';

type BattleSection = 'arena' | 'leagues' | 'leaderboard';
type BattleMode = 'pve' | 'pvp' | null;
type BattleFilter = 'all' | 'active' | 'upcoming' | 'completed';
type LeagueTier = 'junkyard' | 'city-scraps' | 'neon-core' | 'overlord';

export default function BattlesScreen() {
  const router = useRouter();
  const { holobots, activeHolobot, fetchHolobots, battles, fetchBattles, setActiveBattle, isLoading: battlesLoading } = useHolobotStore();
  const { user, updateUser } = useAuthStore();
  const { dailySteps } = useFitnessStore();
  
  const { 
    leagues,
    fetchLeagues,
    selectedLeague, 
    selectLeague, 
    battleResults, 
    fetchBattleResults, 
    fetchBattleTickets,
    battleTickets,
    startPvEBattle,
    startPvPBattle,
    claimRewards,
    currentBattle,
    leaderboard,
    fetchLeaderboard,
    isLoading: leagueLoading,
    setActiveHolobot
  } = useLeagueStore();
  
  const [activeSection, setActiveSection] = useState<BattleSection>('arena');
  const [filter, setFilter] = useState<BattleFilter>('all');
  const [showArena, setShowArena] = useState(false);
  const [arenaMode, setArenaMode] = useState<'prebattle' | 'battle'>('prebattle');
  const [selectedHolobotKey, setSelectedHolobotKey] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<'win' | 'loss' | 'draw' | null>(null);
  const [selectedHolobotBoosts, setSelectedHolobotBoosts] = useState<any>(null);
  
  // League states
  const [battleMode, setBattleMode] = useState<BattleMode>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<LeagueOpponent | null>(null);
  const [selectedTier, setSelectedTier] = useState<LeagueTier>('city-scraps');
  
  const isLoading = battlesLoading || leagueLoading;
  
  useEffect(() => {
    fetchBattles();
    fetchBattleResults();
    fetchBattleTickets();
    fetchLeaderboard(selectedTier);
    fetchLeagues();
    fetchHolobots();
  }, [selectedTier]);
  
  useEffect(() => {
    // Set the active holobot in the league store when it changes in the holobot store
    if (activeHolobot) {
      setActiveHolobot(activeHolobot);
    }
  }, [activeHolobot]);
  
  const handleRefresh = () => {
    fetchBattles();
    fetchBattleResults();
    fetchBattleTickets();
    fetchLeaderboard(selectedTier);
    fetchLeagues();
    fetchHolobots();
  };
  
  const handleBattlePress = (battleId: string) => {
    const battle = battles.find(b => b.id === battleId);
    if (battle && battle.status === 'active') {
      setActiveBattle(battle);
      router.push(`/battle/${battleId}`);
    }
  };
  
  const getFilteredBattles = () => {
    switch (filter) {
      case 'active':
        return battles.filter(battle => battle.status === 'active');
      case 'upcoming':
        return battles.filter(battle => battle.status === 'upcoming');
      case 'completed':
        return battles.filter(battle => battle.status === 'completed');
      default:
        return battles;
    }
  };
  
  const filteredBattles = getFilteredBattles();
  
  const activeBattlesCount = battles.filter(battle => battle.status === 'active').length;
  const upcomingBattlesCount = battles.filter(battle => battle.status === 'upcoming').length;
  const completedBattlesCount = battles.filter(battle => battle.status === 'completed').length;
  
  // Arena handlers
  const handleHolobotSelect = (holobotKey: string) => {
    setSelectedHolobotKey(holobotKey);
    
    // Find the selected holobot in user's holobots to get attribute boosts
    if (user?.holobots && Array.isArray(user.holobots)) {
      const selectedHolobot = user.holobots.find(h => 
        h.name.toLowerCase() === HOLOBOT_STATS[holobotKey]?.name.toLowerCase()
      );
      
      if (selectedHolobot && selectedHolobot.boostedAttributes) {
        setSelectedHolobotBoosts(selectedHolobot.boostedAttributes);
      } else {
        setSelectedHolobotBoosts(null);
      }
    }
  };
  
  const handleEntryFeeMethod = async (method: 'tokens' | 'pass') => {
    if (!user || !selectedHolobotKey) return;
    
    const entryFee = 50; // Arena entry fee
    
    if (method === 'tokens') {
      if ((user.holosTokens || 0) < entryFee) return;
      
      // Update user tokens
      await updateUser({
        holosTokens: (user.holosTokens || 0) - entryFee
      });
    } else if (method === 'pass') {
      if ((user.arena_passes || 0) <= 0) return;
      
      // Update user arena passes
      await updateUser({
        arena_passes: (user.arena_passes || 0) - 1
      });
    }
    
    // Start battle
    setArenaMode('battle');
  };
  
  const handleBattleComplete = async (result: 'win' | 'loss' | 'draw') => {
    try {
      setBattleResult(result);
      
      // Update user stats and rewards
      if (user) {
        const rewards = {
          tokens: result === 'win' ? 100 : result === 'draw' ? 25 : 10,
          exp: result === 'win' ? 50 : result === 'draw' ? 20 : 10
        };
        
        // Find the selected holobot to update its experience
        if (selectedHolobotKey && user.holobots && Array.isArray(user.holobots)) {
          const holobotName = HOLOBOT_STATS[selectedHolobotKey]?.name;
          
          if (!holobotName) {
            console.error('Invalid holobot key:', selectedHolobotKey);
            Alert.alert("Battle Error", "Could not find selected Holobot.");
            resetArena();
            return;
          }
          
          const updatedHolobots = user.holobots.map(holobot => {
            if (holobot.name === holobotName) {
              const currentExp = holobot.experience || 0;
              const newExp = currentExp + rewards.exp;
              const currentLevel = holobot.level || 1;
              const expForNextLevel = holobot.nextLevelExp || currentLevel * 100;
              
              // Check if holobot leveled up
              let newLevel = currentLevel;
              let remainingExp = newExp;
              
              if (newExp >= expForNextLevel) {
                newLevel = currentLevel + 1;
                remainingExp = newExp - expForNextLevel;
                
                // If leveled up, add attribute points (3 per level)
                const attributePoints = (holobot.attributePoints || 0) + 3;
                
                return {
                  ...holobot,
                  level: newLevel,
                  experience: remainingExp,
                  nextLevelExp: newLevel * 100,
                  attributePoints
                };
              }
              
              return {
                ...holobot,
                experience: newExp
              };
            }
            return holobot;
          });
          
          await updateUser({
            holobots: updatedHolobots,
            holosTokens: (user.holosTokens || 0) + rewards.tokens,
            stats: {
              wins: (user.stats?.wins || 0) + (result === 'win' ? 1 : 0),
              losses: (user.stats?.losses || 0) + (result === 'loss' ? 1 : 0)
            }
          });
        } else {
          await updateUser({
            holosTokens: (user.holosTokens || 0) + rewards.tokens,
            stats: {
              wins: (user.stats?.wins || 0) + (result === 'win' ? 1 : 0),
              losses: (user.stats?.losses || 0) + (result === 'loss' ? 1 : 0)
            }
          });
        }
      }
      
      // Reset arena after a delay
      resetArena();
    } catch (error) {
      console.error('Error completing battle:', error);
      Alert.alert(
        "Battle Completion Error", 
        "There was an error saving your battle results. Your progress may not be saved."
      );
      resetArena();
    }
  };
  
  // Helper function to reset the arena state
  const resetArena = () => {
    setTimeout(() => {
      setShowArena(false);
      setArenaMode('prebattle');
      setBattleResult(null);
      setSelectedHolobotKey(null);
      setSelectedHolobotBoosts(null);
    }, 3000);
  };
  
  // League handlers
  const handleSelectLeague = (league: League) => {
    selectLeague(league.id);
    setBattleMode('pve');
  };
  
  const handleSelectOpponent = async (opponent: LeagueOpponent) => {
    setSelectedOpponent(opponent);
    
    if (!activeHolobot) {
      Alert.alert("Error", "No active Holobot selected. Please select a Holobot first.");
      return;
    }
    
    try {
      await startPvEBattle(opponent.id, activeHolobot, dailySteps);
    } catch (error) {
      console.error('Battle error:', error);
      Alert.alert("Battle Error", error instanceof Error ? error.message : "An error occurred during battle");
    }
  };
  
  const handleStartPvPBattle = async () => {
    if (!activeHolobot) {
      Alert.alert("Error", "No active Holobot selected. Please select a Holobot first.");
      return;
    }
    
    // Check if user has available tickets
    const availableTickets = battleTickets.filter(ticket => !ticket.used && new Date(ticket.expiresAt) > new Date());
    if (availableTickets.length === 0) {
      Alert.alert("No Tickets", "You don't have any available battle tickets. Please purchase tickets or wait for daily refresh.");
      return;
    }
    
    try {
      const result = await startPvPBattle(activeHolobot, dailySteps);
      console.log("PvP Battle result:", result);
    } catch (error) {
      console.error('PvP Battle error:', error);
      Alert.alert("Battle Error", error instanceof Error ? error.message : "An error occurred during PvP battle");
    }
  };
  
  const handleBackToLeagues = () => {
    setBattleMode(null);
    setSelectedOpponent(null);
  };
  
  const handleBackToModes = () => {
    setBattleMode(null);
    setSelectedOpponent(null);
  };
  
  const handleClaimRewards = async (battleId: string) => {
    await claimRewards(battleId);
  };
  
  // Get random opponent
  const getRandomOpponent = () => {
    try {
      const keys = Object.keys(HOLOBOT_STATS).filter(key => HOLOBOT_STATS[key]); // Filter out falsy entries just in case

      if (keys.length === 0) {
        throw new Error('HOLOBOT_STATS has no valid entries');
      }

      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      return HOLOBOT_STATS[randomKey]; // Guaranteed to return a real Holobot
    } catch (error) {
      console.error('Error selecting random opponent:', error);

      // Fallback: Always return ACE or the first valid entry
      const aceBot = HOLOBOT_STATS['ace'] || HOLOBOT_STATS[Object.keys(HOLOBOT_STATS)[0]];
      return aceBot;
    }
  };
  
  // Render tier selector for leaderboard
  const renderTierSelector = () => {
    const tiers: { tier: LeagueTier; name: string; icon: React.ReactNode }[] = [
      { tier: 'junkyard', name: 'Junkyard', icon: <Users size={20} color={colors.white} /> },
      { tier: 'city-scraps', name: 'City Scraps', icon: <Medal size={20} color={colors.white} /> },
      { tier: 'neon-core', name: 'Neon Core', icon: <Trophy size={20} color={colors.white} /> },
      { tier: 'overlord', name: 'Overlord', icon: <Crown size={20} color={colors.white} /> },
    ];
    
    return (
      <View style={styles.tierSelector}>
        {tiers.map((item) => (
          <TouchableOpacity
            key={item.tier}
            style={[
              styles.tierButton,
              selectedTier === item.tier && styles.selectedTierButton
            ]}
            onPress={() => setSelectedTier(item.tier)}
          >
            {item.icon}
            <Text 
              style={[
                styles.tierButtonText,
                selectedTier === item.tier && styles.selectedTierButtonText
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Render leaderboard item
  const renderLeaderboardItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={styles.leaderboardItem}>
        <View style={styles.rankContainer}>
          {index < 3 ? (
            <View style={[
              styles.topRankBadge,
              index === 0 ? styles.firstRankBadge : 
              index === 1 ? styles.secondRankBadge : 
              styles.thirdRankBadge
            ]}>
              <Text style={styles.topRankText}>{index + 1}</Text>
            </View>
          ) : (
            <Text style={styles.rankText}>{index + 1}</Text>
          )}
        </View>
        
        <Image 
          source={{ uri: item.avatarUrl || 'https://source.unsplash.com/random/100x100?robot' }} 
          style={styles.playerAvatar} 
        />
        
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.username}</Text>
          <Text style={styles.holobotName}>{item.holobot.name}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>W</Text>
            <Text style={styles.statValue}>{item.wins}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>L</Text>
            <Text style={styles.statValue}>{item.losses}</Text>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Section Tabs */}
      <View style={styles.sectionTabs}>
        <TouchableOpacity 
          style={[styles.sectionTab, activeSection === 'arena' && styles.activeSectionTab]}
          onPress={() => setActiveSection('arena')}
        >
          <Swords size={16} color={activeSection === 'arena' ? colors.text : colors.textSecondary} />
          <Text style={[styles.sectionTabText, activeSection === 'arena' && styles.activeSectionTabText]}>
            Arena
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sectionTab, activeSection === 'leagues' && styles.activeSectionTab]}
          onPress={() => setActiveSection('leagues')}
        >
          <Trophy size={16} color={activeSection === 'leagues' ? colors.text : colors.textSecondary} />
          <Text style={[styles.sectionTabText, activeSection === 'leagues' && styles.activeSectionTabText]}>
            Leagues
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sectionTab, activeSection === 'leaderboard' && styles.activeSectionTab]}
          onPress={() => setActiveSection('leaderboard')}
        >
          <Medal size={16} color={activeSection === 'leaderboard' ? colors.text : colors.textSecondary} />
          <Text style={[styles.sectionTabText, activeSection === 'leaderboard' && styles.activeSectionTabText]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Arena Section */}
        {activeSection === 'arena' && (
          !showArena ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Battle Arena</Text>
                <TouchableOpacity 
                  style={styles.arenaButton}
                  onPress={() => {
                    try {
                      // Check if user has holobots before showing arena
                      if (!user || !user.holobots || !Array.isArray(user.holobots) || user.holobots.length === 0) {
                        Alert.alert(
                          "No Holobots Available", 
                          "You need at least one Holobot to enter the Arena. Visit the Gacha page to get some!"
                        );
                        return;
                      }
                      
                      // Proceed to show arena if everything is fine
                      setShowArena(true);
                    } catch (error) {
                      console.error('Arena error:', error);
                      Alert.alert(
                        "Arena Error", 
                        error instanceof Error ? error.message : "An error occurred when entering the Arena"
                      );
                    }
                  }}
                >
                  <Award size={16} color={colors.text} />
                  <Text style={styles.arenaButtonText}>Enter Arena</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.statsContainer}>
                <Card style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Swords size={20} color={colors.warning} />
                  </View>
                  <Text style={styles.statValue}>{activeBattlesCount}</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </Card>
                
                <Card style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Clock size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.statValue}>{upcomingBattlesCount}</Text>
                  <Text style={styles.statLabel}>Upcoming</Text>
                </Card>
                
                <Card style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Trophy size={20} color={colors.success} />
                  </View>
                  <Text style={styles.statValue}>{completedBattlesCount}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </Card>
              </View>
              
              <View style={styles.filterContainer}>
                <View style={styles.filterHeader}>
                  <Filter size={18} color={colors.text} />
                  <Text style={styles.filterTitle}>Filter Battles</Text>
                </View>
                
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[styles.filterOption, filter === 'all' && styles.filterOptionActive]}
                    onPress={() => setFilter('all')}
                  >
                    <Text style={[styles.filterOptionText, filter === 'all' && styles.filterOptionTextActive]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterOption, filter === 'active' && styles.filterOptionActive]}
                    onPress={() => setFilter('active')}
                  >
                    <Text style={[styles.filterOptionText, filter === 'active' && styles.filterOptionTextActive]}>
                      Active
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterOption, filter === 'upcoming' && styles.filterOptionActive]}
                    onPress={() => setFilter('upcoming')}
                  >
                    <Text style={[styles.filterOptionText, filter === 'upcoming' && styles.filterOptionTextActive]}>
                      Upcoming
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterOption, filter === 'completed' && styles.filterOptionActive]}
                    onPress={() => setFilter('completed')}
                  >
                    <Text style={[styles.filterOptionText, filter === 'completed' && styles.filterOptionTextActive]}>
                      Completed
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.battlesContainer}>
                {filteredBattles.length > 0 ? (
                  filteredBattles.map(battle => (
                    <BattleCard 
                      key={battle.id} 
                      battle={battle} 
                      onPress={() => battle.status === 'active' && handleBattlePress(battle.id)} 
                    />
                  ))
                ) : (
                  <Card style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No battles found</Text>
                  </Card>
                )}
              </View>
            </>
          ) : (
            <View style={styles.arenaContainer}>
              <View style={styles.arenaHeader}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => {
                    if (arenaMode === 'prebattle') {
                      setShowArena(false);
                    } else {
                      setArenaMode('prebattle');
                    }
                  }}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.arenaTitle}>Arena Battle</Text>
              </View>
              
              {arenaMode === 'prebattle' ? (
                <ArenaPreBattleMenu 
                  onHolobotSelect={handleHolobotSelect}
                  onEntryFeeMethod={handleEntryFeeMethod}
                  entryFee={50}
                />
              ) : (
                <ArenaBattle 
                  playerHolobot={selectedHolobotKey ? HOLOBOT_STATS[selectedHolobotKey] : HOLOBOT_STATS.ace}
                  opponentHolobot={getRandomOpponent()}
                  onBattleComplete={handleBattleComplete}
                  playerBoosts={selectedHolobotBoosts}
                />
              )}
              
              {battleResult && (
                <Card style={[
                  styles.resultCard,
                  battleResult === 'win' ? styles.winCard : 
                  battleResult === 'loss' ? styles.lossCard : styles.drawCard
                ]}>
                  <Text style={styles.resultTitle}>
                    {battleResult === 'win' ? 'Victory!' : 
                     battleResult === 'loss' ? 'Defeat!' : 'Draw!'}
                  </Text>
                  <Text style={styles.resultText}>
                    {battleResult === 'win' ? 'You earned 100 Holos tokens and 50 XP!' : 
                     battleResult === 'draw' ? 'You earned 25 Holos tokens and 20 XP!' :
                     'You earned 10 Holos tokens and 10 XP!'}
                  </Text>
                </Card>
              )}
            </View>
          )
        )}
        
        {/* Leagues Section */}
        {activeSection === 'leagues' && (
          !battleMode ? (
            <>
              <View style={styles.modeSelection}>
                <Text style={styles.sectionTitle}>Battle Mode</Text>
                <View style={styles.modeButtons}>
                  <TouchableOpacity 
                    style={styles.modeButton}
                    onPress={() => setBattleMode('pve')}
                  >
                    <Swords size={24} color={colors.primary} />
                    <Text style={styles.modeButtonText}>PvE Leagues</Text>
                    <Text style={styles.modeDescription}>Battle against AI opponents</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.modeButton}
                    onPress={() => setBattleMode('pvp')}
                  >
                    <Users size={24} color={colors.primary} />
                    <Text style={styles.modeButtonText}>Async PvP</Text>
                    <Text style={styles.modeDescription}>Battle against other players</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <BattleTicketDisplay />
              
              <Text style={styles.sectionTitle}>Recent Battles</Text>
              {battleResults.length > 0 ? (
                battleResults.slice(0, 3).map(battle => (
                  <AsyncBattleCard 
                    key={battle.id} 
                    battle={battle} 
                    onClaimRewards={handleClaimRewards}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Trophy size={48} color={colors.lightGray} />
                  <Text style={styles.emptyStateText}>No battles yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Start a battle to see your results here
                  </Text>
                </View>
              )}
            </>
          ) : battleMode === 'pve' && !selectedLeague ? (
            <>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackToModes}
              >
                <ArrowLeft size={20} color={colors.primary} />
                <Text style={styles.backButtonText}>Back to Battle Modes</Text>
              </TouchableOpacity>
              
              <LeagueSelector onSelectLeague={handleSelectLeague} />
            </>
          ) : battleMode === 'pve' && selectedLeague ? (
            <>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackToLeagues}
              >
                <ArrowLeft size={20} color={colors.primary} />
                <Text style={styles.backButtonText}>Back to Leagues</Text>
              </TouchableOpacity>
              
              <View style={styles.leagueHeader}>
                <Text style={styles.leagueName}>{selectedLeague.name}</Text>
                <Text style={styles.leagueDescription}>{selectedLeague.description}</Text>
              </View>
              
              <Text style={styles.sectionTitle}>Select Opponent</Text>
              {selectedLeague.opponents.map(opponent => (
                <TouchableOpacity
                  key={opponent.id}
                  style={styles.opponentCard}
                  onPress={() => handleSelectOpponent(opponent)}
                  disabled={isLoading}
                >
                  <View style={styles.opponentInfo}>
                    <Text style={styles.opponentName}>{opponent.name}</Text>
                    <View style={[
                      styles.difficultyBadge,
                      opponent.difficulty === 'easy' ? styles.easyBadge :
                      opponent.difficulty === 'medium' ? styles.mediumBadge :
                      opponent.difficulty === 'hard' ? styles.hardBadge :
                      styles.bossBadge
                    ]}>
                      <Text style={styles.difficultyText}>
                        {opponent.difficulty.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.opponentStats}>
                    <Text style={styles.statText}>
                      HP: {opponent.holobot.stats.health}
                    </Text>
                    <Text style={styles.statText}>
                      ATK: {opponent.holobot.stats.attack}
                    </Text>
                    <Text style={styles.statText}>
                      DEF: {opponent.holobot.stats.defense}
                    </Text>
                    <Text style={styles.statText}>
                      SPD: {opponent.holobot.stats.speed}
                    </Text>
                  </View>
                  
                  <Text style={styles.battleButtonText}>
                    {isLoading ? 'Battling...' : 'Start Battle'}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          ) : battleMode === 'pvp' && (
            <>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackToModes}
              >
                <ArrowLeft size={20} color={colors.primary} />
                <Text style={styles.backButtonText}>Back to Battle Modes</Text>
              </TouchableOpacity>
              
              <View style={styles.pvpHeader}>
                <Text style={styles.pvpTitle}>Asynchronous PvP</Text>
                <Text style={styles.pvpDescription}>
                  Battle against snapshots of other players' Holobots. Your opponent will be selected randomly based on your Holobot's level.
                </Text>
              </View>
              
              <BattleTicketDisplay />
              
              <TouchableOpacity
                style={styles.pvpBattleButton}
                onPress={handleStartPvPBattle}
                disabled={isLoading}
              >
                <Swords size={24} color={colors.white} />
                <Text style={styles.pvpBattleButtonText}>
                  {isLoading ? 'Finding Opponent...' : 'Start PvP Battle'}
                </Text>
              </TouchableOpacity>
              
              {currentBattle && (
                <AsyncBattleCard 
                  battle={currentBattle} 
                  onClaimRewards={handleClaimRewards}
                />
              )}
            </>
          )
        )}
        
        {/* Leaderboard Section */}
        {activeSection === 'leaderboard' && (
          <>
            <View style={styles.leaderboardHeader}>
              <Trophy size={24} color={colors.gold} />
              <Text style={styles.leaderboardTitle}>
                {selectedTier === 'junkyard' ? 'Junkyard' : 
                 selectedTier === 'city-scraps' ? 'City Scraps' : 
                 selectedTier === 'neon-core' ? 'Neon Core' : 'Overlord'} Leaderboard
              </Text>
            </View>
            
            {renderTierSelector()}
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading leaderboard...</Text>
              </View>
            ) : (
              <FlatList
                data={leaderboard[selectedTier] || []}
                renderItem={renderLeaderboardItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Trophy size={48} color={colors.lightGray} />
                    <Text style={styles.emptyText}>No players in this league yet</Text>
                  </View>
                }
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLighter,
    padding: 4,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    gap: 6,
  },
  activeSectionTab: {
    backgroundColor: colors.primary,
  },
  sectionTabText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeSectionTabText: {
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  arenaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  arenaButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  filterOptionTextActive: {
    color: colors.text,
    fontWeight: 'bold',
  },
  battlesContainer: {
    marginBottom: 16,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  arenaContainer: {
    flex: 1,
  },
  arenaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    marginLeft: 8,
  },
  arenaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  resultCard: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  winCard: {
    borderColor: colors.success,
    borderWidth: 1,
  },
  lossCard: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  drawCard: {
    borderColor: colors.warning,
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  // Leagues section styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  modeSelection: {
    marginBottom: 24,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  leagueHeader: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  leagueName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  leagueDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  opponentCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  opponentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  opponentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  easyBadge: {
    backgroundColor: colors.success,
  },
  mediumBadge: {
    backgroundColor: colors.warning,
  },
  hardBadge: {
    backgroundColor: colors.error,
  },
  bossBadge: {
    backgroundColor: colors.purple,
  },
  difficultyText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  opponentStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statText: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    color: colors.primary,
  },
  battleButtonText: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: 'bold',
  },
  pvpHeader: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  pvpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  pvpDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  pvpBattleButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pvpBattleButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 12,
  },
  // Leaderboard section styles
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  tierSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tierButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: colors.backgroundLighter,
  },
  selectedTierButton: {
    backgroundColor: colors.primary,
  },
  tierButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  selectedTierButtonText: {
    color: colors.white,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContent: {
    paddingTop: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  topRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstRankBadge: {
    backgroundColor: colors.gold,
  },
  secondRankBadge: {
    backgroundColor: colors.silver,
  },
  thirdRankBadge: {
    backgroundColor: colors.bronze,
  },
  topRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  holobotName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
});