import { BattleScene } from "@/components/BattleScene";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Ticket, Gem, Award, Sword, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { ItemCard } from "@/components/items/ItemCard";
import { ArenaPrebattleMenu } from "@/components/arena/ArenaPrebattleMenu";
import { generateArenaOpponent, calculateArenaRewards } from "@/utils/battleUtils";
import { QuestResultsScreen } from "@/components/quests/QuestResultsScreen";
import { HOLOBOT_STATS } from "@/types/holobot";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";
import { updateHolobotExperience, calculateExperience } from "@/lib/firebase";
import { BattleLeagueCard } from "../components/asyncBattle/BattleLeagueCard";
import { BattlePoolCard } from "../components/asyncBattle/BattlePoolCard";
import { BattleHistoryList } from "../components/asyncBattle/BattleHistoryList";
import { LEAGUE_CONFIGS, POOL_CONFIGS } from "@/types/asyncBattle";
import { useAsyncBattleStore } from "@/stores/asyncBattleStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRewardTracking } from "@/hooks/useRewardTracking";
import { calculatePlayerRank } from "@/types/playerRank";
import { 
  shouldRefreshDailyTickets, 
  calculateRefreshedTickets, 
  getTimeUntilNextRefresh,
  DAILY_FREE_TICKETS 
} from "@/utils/asyncBattleUtils";
import { BattleArenaView } from "@/components/arena/BattleArenaView";
import { useArenaBattleStore } from "@/stores/arena-battle-store";
import type { ArenaFighter, ArenaBattleConfig } from "@/types/arena";
import { RealtimeBattleRoom } from "@/components/arena/RealtimeBattleRoom";

// Define the type for specific item rewards from arena tiers
interface ArenaSpecificItemRewards {
  energy_refills: number;
  exp_boosters: number;
  rank_skips: number;
  // gacha_tickets and arena_passes are handled by calculateArenaRewards for now
}

// Arena V2 Wrapper Component
const ArenaV2Wrapper = () => {
  const { 
    currentBattle,
    isLoading,
    error,
    initializeBattle,
  } = useArenaBattleStore();
  const { user } = useAuth();
  const [showPrebattleMenu, setShowPrebattleMenu] = useState(true);
  const [selectedHolobotKey, setSelectedHolobotKey] = useState<string>('ace');

  const handleHolobotSelect = (holobotKey: string) => {
    setSelectedHolobotKey(holobotKey);
  };

  const { toast } = useToast();

  const handleEntryFeeMethod = async (
    method: 'tokens' | 'pass',
    selectedHolobot: string,
    opponentHolobots: string[],
    opponentLevel: number,
    specificItemRewards: any,
    tier: number = 1
  ) => {
    // Deduct entry fee before starting battle
    try {
      const { doc, updateDoc, increment } = await import('firebase/firestore');
      const { db } = await import('@/lib/firestore');
      
      if (!user?.id) {
        console.error('[Arena V2] No user ID found');
        toast({
          title: "Error",
          description: "User not found. Please log in again.",
          variant: "destructive"
        });
        return;
      }
      
      const userRef = doc(db, 'users', user.id);
      
      // Calculate entry fee based on tier
      const tierEntryFees: Record<number, number> = {
        0: 50,  // Tutorial
        1: 100, // Tier 1
        2: 125, // Tier 2
        3: 150, // Tier 3
      };
      const entryFee = tierEntryFees[tier] || 100;
      
      if (method === 'tokens') {
        // Deduct HOLOS tokens (not arena tokens!)
        await updateDoc(userRef, {
          holosTokens: increment(-entryFee)
        });
        console.log(`[Arena V2] Deducted ${entryFee} HOLOS tokens`);
        toast({
          title: "Entry Fee Paid",
          description: `${entryFee} HOLOS tokens deducted`,
        });
      } else if (method === 'pass') {
        // Deduct arena pass
        await updateDoc(userRef, {
          arena_passes: increment(-1)
        });
        console.log('[Arena V2] Used 1 arena pass');
        toast({
          title: "Arena Pass Used",
          description: "1 Arena Pass consumed",
        });
      }
    } catch (error) {
      console.error('[Arena V2] Failed to deduct entry fee:', error);
      toast({
        title: "Payment Failed",
        description: "Could not process entry fee. Please try again.",
        variant: "destructive"
      });
      return; // Don't start battle if payment failed
    }
    
    // Hide prebattle menu and start the battle
    setShowPrebattleMenu(false);
    setSelectedHolobotKey(selectedHolobot);
    
    // Initialize battle with selected holobot
    if (!currentBattle && !isLoading) {
      // Get user's actual holobot data
      const userHolobotKey = selectedHolobot;
      const userHolobotStats = HOLOBOT_STATS[userHolobotKey] || HOLOBOT_STATS['ace'];
      
      // Find the user's holobot to get level and boosts
      const userHolobot = user?.holobots?.find(h => 
        h.name.toLowerCase() === userHolobotKey.toLowerCase()
      );
      
      const holobotLevel = userHolobot?.level || 1;
      const boostedAttrs = userHolobot?.boostedAttributes || {};
      
      // Calculate level-based stat scaling (5% per level)
      const levelBonus = 1 + ((holobotLevel - 1) * 0.05);
      
      // Apply level bonus + boosted attributes
      const baseHP = userHolobotStats?.hp || 100;
      const baseAttack = userHolobotStats?.attack || 50;
      const baseDefense = userHolobotStats?.defense || 40;
      const baseSpeed = userHolobotStats?.speed || 60;
      const baseIntelligence = userHolobotStats?.intelligence || 55;
      
      const finalHP = Math.floor(baseHP * levelBonus) + (boostedAttrs.health || 0);
      const finalAttack = Math.floor(baseAttack * levelBonus) + (boostedAttrs.attack || 0);
      const finalDefense = Math.floor(baseDefense * levelBonus) + (boostedAttrs.defense || 0);
      const finalSpeed = Math.floor(baseSpeed * levelBonus) + (boostedAttrs.speed || 0);
      const finalIntelligence = Math.floor(baseIntelligence * levelBonus);

      // Create player fighter
      const player: ArenaFighter = {
        holobotId: 'player-holobot-1',
        userId: user?.id || 'user-1',
        name: String(userHolobotKey).toUpperCase(),
        avatar: getHolobotImagePath(userHolobotKey),
        archetype: 'balanced',
        level: holobotLevel,
        
        maxHP: finalHP,
        currentHP: finalHP,
        attack: finalAttack,
        defense: finalDefense,
        speed: finalSpeed,
        intelligence: finalIntelligence,
        
        // TCG Card Display Fields
        specialMove: userHolobotStats?.specialMove || 'UNKNOWN',
        abilityDescription: userHolobotStats?.abilityDescription || 'No ability description available.',
        
        stamina: 6,
        maxStamina: 7,
        specialMeter: 0,
        
        staminaState: 'fresh',
        isInDefenseMode: false,
        comboCounter: 0,
        lastActionTime: 0,
        
        statusEffects: [],
        
        staminaEfficiency: 1.0,
        defenseTimingWindow: 500,
        counterDamageBonus: 1.3,
        damageMultiplier: 1.0,
        speedBonus: 0,
        
        hand: [],
        
        totalDamageDealt: 0,
        perfectDefenses: 0,
        combosCompleted: 0,
      };

      // Use first opponent from the lineup (for now - could cycle through for rounds)
      const opponentKey = opponentHolobots[0] || Object.keys(HOLOBOT_STATS).filter(key => key !== userHolobotKey)[0];
      const opponentBaseStats = HOLOBOT_STATS[opponentKey] || {
        hp: 100,
        attack: 55,
        defense: 35,
        speed: 65,
        intelligence: 50,
      };
      
      // Opponent level based on the selected tier's opponentLevel
      const opponentLevelBonus = 1 + ((opponentLevel - 1) * 0.05);
      
      const opponentHP = Math.floor((opponentBaseStats.hp || 100) * opponentLevelBonus);
      const opponentAttack = Math.floor((opponentBaseStats.attack || 55) * opponentLevelBonus);
      const opponentDefense = Math.floor((opponentBaseStats.defense || 35) * opponentLevelBonus);
      const opponentSpeed = Math.floor((opponentBaseStats.speed || 65) * opponentLevelBonus);
      const opponentIntelligence = Math.floor((opponentBaseStats.intelligence || 50) * opponentLevelBonus);

      const opponent: ArenaFighter = {
        ...player,
        holobotId: 'opponent-holobot-1',
        userId: 'ai-opponent',
        name: String(opponentKey).toUpperCase(),
        avatar: getHolobotImagePath(opponentKey),
        archetype: 'striker',
        level: opponentLevel,
        maxHP: opponentHP,
        currentHP: opponentHP,
        attack: opponentAttack,
        defense: opponentDefense,
        speed: opponentSpeed,
        intelligence: opponentIntelligence,
        
        // TCG Card Display Fields
        specialMove: opponentBaseStats?.specialMove || 'UNKNOWN',
        abilityDescription: opponentBaseStats?.abilityDescription || 'No ability description available.',
      };

      const config: ArenaBattleConfig = {
        battleType: 'pve',
        playerHolobotId: player.holobotId,
        opponentHolobotId: opponent.holobotId,
        allowPlayerControl: true, // Manual control
        aiDifficulty: 'medium',
        maxTurns: 50,
        tier, // Pass tier for reward calculation
      } as any;

      initializeBattle(config, player, opponent, opponentHolobots);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing Arena V2...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Battle Error</p>
          <p className="text-white">{error}</p>
        </div>
      </div>
    );
  }

  // Show prebattle menu before battle
  if (showPrebattleMenu || !currentBattle) {
    return (
      <div className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-5">
        <ArenaPrebattleMenu 
          onHolobotSelect={handleHolobotSelect}
          onEntryFeeMethod={handleEntryFeeMethod}
          entryFee={50}
        />
      </div>
    );
  }

  // Main battle view
  return <BattleArenaView />;
};

const Index = () => {
  // Battle Mode State (Arena, Arena V2, or PvP)
  const [battleMode, setBattleMode] = useState<'arena' | 'arena-v2' | 'pvp'>('arena');
  
  // Arena-specific state
  const [currentRound, setCurrentRound] = useState(1);
  const [victories, setVictories] = useState(0);
  const [hasEntryFee, setHasEntryFee] = useState(false);
  const [selectedHolobot, setSelectedHolobot] = useState("ace"); // Default holobot
  const [arenaLineup, setArenaLineup] = useState<string[]>([]);
  const [arenaOpponentLevel, setArenaOpponentLevel] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [arenaResults, setArenaResults] = useState<any>(null);
  const [currentArenaTierItemRewards, setCurrentArenaTierItemRewards] = useState<ArenaSpecificItemRewards | null>(null);
  const maxRounds = 3;
  const entryFee = 50;
  
  // Async battle state  
  const [activeAsyncTab, setActiveAsyncTab] = useState("leagues");
  const [isRefreshingTickets, setIsRefreshingTickets] = useState(false);
  const {
    battleLeagues,
    battlePools,
    userBattles,
    userRankings,
    battleTickets,
    fitnessActivity,
    getActiveBattles,
    getCompletedBattles,
    canEnterLeague,
    canEnterPool,
    getTodaysSteps
  } = useAsyncBattleStore();
  
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const { trackArenaBattle, trackDailyLogin, trackLeagueTierCompletion } = useRewardTracking();

  // Auto-refresh daily tickets when component mounts and user data is available
  useEffect(() => {
    if (user && shouldRefreshDailyTickets(user)) {
      handleDailyTicketRefresh();
    }
  }, [user]);

  // Track daily login when component mounts
  useEffect(() => {
    if (user) {
      trackDailyLogin();
    }
  }, [user, trackDailyLogin]);

  const handleDailyTicketRefresh = async () => {
    if (!user || !updateUser) return;
    
    setIsRefreshingTickets(true);
    
    try {
      const refreshedTickets = calculateRefreshedTickets(user);
      
      await updateUser({
        async_battle_tickets: refreshedTickets,
        last_async_ticket_refresh: new Date().toISOString()
      });
      
      toast({
        title: "Daily Tickets Refreshed!",
        description: `You received ${DAILY_FREE_TICKETS} free tickets today!`,
      });
    } catch (error) {
      console.error("Error refreshing daily tickets:", error);
      toast({
        title: "Error",
        description: "Failed to refresh daily tickets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingTickets(false);
    }
  };

  // Get the current opponent based on round
  const getCurrentOpponent = () => {
    if (arenaLineup.length === 0) return HOLOBOT_STATS.ace;
    const opponentKey = arenaLineup[currentRound - 1];
    return {
      ...HOLOBOT_STATS[opponentKey],
      name: opponentKey,
      level: arenaOpponentLevel
    };
  };
  
  const currentOpponent = getCurrentOpponent();

  const payEntryFee = async (selectedBot: string, opponentLineup: string[], opponentLevel: number, specificItemRewards: ArenaSpecificItemRewards) => {
    try {
      if (user && user.holosTokens >= entryFee) {
        await updateUser({
          holosTokens: user.holosTokens - entryFee
        });
        setSelectedHolobot(selectedBot);
        setArenaLineup(opponentLineup);
        setArenaOpponentLevel(opponentLevel);
        setCurrentArenaTierItemRewards(specificItemRewards);
        setCurrentRound(1);
        setHasEntryFee(true);
        
        toast({
          title: "Entry Fee Paid",
          description: `${entryFee} Holos tokens deducted. Good luck in the arena!`,
        });
      } else {
        toast({
          title: "Insufficient Tokens",
          description: "You don't have enough Holos tokens for the entry fee.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error paying entry fee:", error);
      toast({
        title: "Error",
        description: "Failed to process entry fee. Please try again.",
        variant: "destructive"
      });
    }
  };

  const useArenaPass = async (selectedBot: string, opponentLineup: string[], opponentLevel: number, specificItemRewards: ArenaSpecificItemRewards) => {
    try {
      if (user && user.arena_passes > 0) {
        await updateUser({
          arena_passes: user.arena_passes - 1
        });
        setSelectedHolobot(selectedBot);
        setArenaLineup(opponentLineup);
        setArenaOpponentLevel(opponentLevel);
        setCurrentArenaTierItemRewards(specificItemRewards);
        setCurrentRound(1);
        setHasEntryFee(true);
        
        toast({
          title: "Arena Pass Used",
          description: "You've used 1 Arena Pass. Good luck in the arena!",
        });
      } else {
        toast({
          title: "No Arena Passes",
          description: "You don't have any Arena Passes. Try using HOLOS tokens instead.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error using arena pass:", error);
      toast({
        title: "Error",
        description: "Failed to use Arena Pass. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleHolobotSelect = (holobotKey: string) => {
    console.log("Selected holobot:", holobotKey);
    setSelectedHolobot(holobotKey);
  };

  const handleEntryFeeMethod = async (
    method: 'tokens' | 'pass',
    selectedBot: string,
    opponentLineup: string[],
    opponentLevel: number,
    specificItemRewards: ArenaSpecificItemRewards
  ) => {
    if (method === 'tokens') {
      await payEntryFee(selectedBot, opponentLineup, opponentLevel, specificItemRewards);
    } else {
      await useArenaPass(selectedBot, opponentLineup, opponentLevel, specificItemRewards);
    }
  };

  const calculateExperienceRewards = (victoryCount: number) => {
    // Find the selected holobot in user's collection
    if (!user?.holobots || !Array.isArray(user.holobots)) {
      return [];
    }
    
    const holobot = user.holobots.find(h => 
      h.name.toLowerCase() === HOLOBOT_STATS[selectedHolobot].name.toLowerCase()
    );
    
    if (!holobot) return [];
    
    const currentLevel = holobot.level || 1;
    const currentXp = holobot.experience || 0;
    
    // Calculate XP gained based on victories and rounds
    const xpGained = victoryCount * 100 * currentRound;
    const totalXp = currentXp + xpGained;
    
    // Check if level up occurred
    const requiredXpForNextLevel = Math.floor(100 * Math.pow(currentLevel, 2));
    const leveledUp = totalXp >= requiredXpForNextLevel;
    const newLevel = leveledUp ? currentLevel + 1 : currentLevel;
    
    return [{
      name: HOLOBOT_STATS[selectedHolobot].name,
      xp: xpGained,
      levelUp: leveledUp,
      newLevel: newLevel
    }];
  }

  const distributeRewards = async (overrideVictories?: number) => {
    try {
      if (!user) return;
      
      const currentVictories = overrideVictories !== undefined ? overrideVictories : victories;
      
      // Calculate base rewards (tokens, gacha, blueprint, arena pass)
      // Item rewards from tier are now handled directly from currentArenaTierItemRewards state
      const baseRewards = calculateArenaRewards(currentRound, currentVictories);
      
      // Calculate experience for the holobot
      const experienceRewards = calculateExperienceRewards(currentVictories);
      const selectedHolobotName = HOLOBOT_STATS[selectedHolobot].name;
      
      // Update user with rewards
      const updates: any = {
        holosTokens: (user.holosTokens || 0) + (baseRewards.holosTokens || 0),
        gachaTickets: (user.gachaTickets || 0) + (baseRewards.gachaTickets || 0),
        // arena_passes from calculateArenaRewards will also be handled
      };

      // Add specific items from the tier to updates
      if (currentArenaTierItemRewards) {
        updates.energy_refills = (user.energy_refills || 0) + (currentArenaTierItemRewards.energy_refills || 0);
        updates.exp_boosters = (user.exp_boosters || 0) + (currentArenaTierItemRewards.exp_boosters || 0);
        updates.rank_skips = (user.rank_skips || 0) + (currentArenaTierItemRewards.rank_skips || 0);
      }
      
      if (baseRewards.arenaPass > 0) {
        updates.arena_passes = (user.arena_passes || 0) + baseRewards.arenaPass;
      }
      
      // Update holobot experience
      if (experienceRewards.length > 0) {
        const updatedHolobots = updateHolobotExperience(
          user.holobots,
          selectedHolobotName,
          (user.holobots.find(h => h.name.toLowerCase() === selectedHolobotName.toLowerCase())?.experience || 0) + experienceRewards[0].xp,
          experienceRewards[0].newLevel
        );
        
        updates.holobots = updatedHolobots;
      }
      
      // Add blueprint update logic
      if (baseRewards.blueprintReward && baseRewards.blueprintReward.holobotKey && baseRewards.blueprintReward.amount > 0) {
        const { holobotKey, amount } = baseRewards.blueprintReward;
        const currentBlueprints = user.blueprints || {};
        const currentAmount = currentBlueprints[holobotKey] || 0;
        const newAmount = currentAmount + amount;

        updates.blueprints = {
          ...currentBlueprints,
          [holobotKey]: newAmount
        };
        
        console.log(`Updating blueprints for ${holobotKey}: ${currentAmount} -> ${newAmount}`);
      }
      
      // Save all the updates to the user and wait for completion
      await updateUser(updates);
      
      // Save the results to show in the results screen immediately
      const results = {
        isSuccess: currentVictories > 0,
        squadHolobotKeys: [selectedHolobot],
        squadHolobotExp: experienceRewards,
        blueprintRewards: baseRewards.blueprintReward,
        holosRewards: baseRewards.holosTokens,
        gachaTickets: baseRewards.gachaTickets,
        arenaPass: baseRewards.arenaPass,
        // Pass specific item counts for display
        itemRewards: {
          energy_refills: currentArenaTierItemRewards?.energy_refills || 0,
          exp_boosters: currentArenaTierItemRewards?.exp_boosters || 0,
          rank_skips: currentArenaTierItemRewards?.rank_skips || 0
        } 
      };
      
      console.log("💰 Setting arena results:", results);
      setArenaResults(results);
      
      // Show the results screen immediately after updating user
      console.log("🎭 Showing arena rewards screen");
      setShowResults(true);
      
    } catch (error) {
      console.error("Error distributing rewards:", error);
      toast({
        title: "Error",
        description: "Failed to distribute rewards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBattleEnd = (result: 'victory' | 'defeat') => {
    console.log("🎯 Arena battle ended with result:", result);
    console.log("Current round:", currentRound, "Current victories in state:", victories);
    
    // Track the battle result for the mission system
    trackArenaBattle(result === 'victory');
    
    if (result === 'victory') {
      const newVictories = victories + 1;
      setVictories(newVictories);
      
      if (currentRound < maxRounds) {
        // Move to next round with next opponent in lineup
        setCurrentRound(prev => prev + 1);
        // Show intermediate rewards after each round victory
        console.log("✨ Round victory - showing intermediate rewards with victories:", newVictories);
        distributeRewards(newVictories);
      } else {
        // Final round completed
        console.log("🏆 Arena completed - distributing final rewards with victories:", newVictories);
        distributeRewards(newVictories);
        setCurrentRound(1);
        setVictories(0);
        setHasEntryFee(false);
        setArenaLineup([]);
        setArenaOpponentLevel(1);
      }
    } else {
      // Battle lost
      console.log("💥 Arena lost - distributing rewards with current victories:", victories);
      distributeRewards(victories);
      setCurrentRound(1);
      setVictories(0);
      setHasEntryFee(false);
      setArenaLineup([]);
      setArenaOpponentLevel(1);
    }
  };

  const handleResultsClose = () => {
    setShowResults(false);
    setArenaResults(null);
  };

  // Arena content when entry fee not paid
  const renderArenaPreBattle = () => (
    <div className="px-4 py-5">
      <ArenaPrebattleMenu 
        onHolobotSelect={handleHolobotSelect}
        onEntryFeeMethod={handleEntryFeeMethod}
        entryFee={entryFee}
      />
    </div>
  );

  // Arena battle content
  const renderArenaBattle = () => {
    const currentOpponentKey = arenaLineup[currentRound - 1];

    return (
      <div className="px-2 py-3">
        <div className="mb-4 bg-[#1A1F2C] rounded-lg p-3">
          <div className="text-center mb-2 text-lg font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent">
            ARENA MODE
          </div>
          <div className="flex justify-between items-center mb-2">
            <div className="bg-black/30 px-3 py-1 rounded-lg">
              <span className="text-xs text-[#8E9196]">Round</span>
              <div className="text-md font-bold text-holobots-accent">{currentRound}/{maxRounds}</div>
            </div>
            <div className="bg-black/30 px-3 py-1 rounded-lg">
              <span className="text-xs text-[#8E9196]">Victories</span>
              <div className="text-md font-bold text-green-500">{victories}</div>
            </div>
            <div className="bg-black/30 px-3 py-1 rounded-lg">
              <span className="text-xs text-[#8E9196]">Opponent Level</span>
              <div className="text-md font-bold text-yellow-500">
                {arenaOpponentLevel}
              </div>
            </div>
          </div>
        </div>
        
        <BattleScene 
          leftHolobot={selectedHolobot}
          rightHolobot={currentOpponentKey}
          isCpuBattle={true}
          cpuLevel={arenaOpponentLevel}
          onBattleEnd={handleBattleEnd}
        />

        {/* Results screen */}
        {showResults && arenaResults && (
          <QuestResultsScreen
            isVisible={showResults}
            isSuccess={arenaResults.isSuccess}
            squadHolobotKeys={arenaResults.squadHolobotKeys}
            squadHolobotExp={arenaResults.squadHolobotExp}
            blueprintRewards={arenaResults.blueprintRewards}
            holosRewards={arenaResults.holosRewards}
            itemRewards={arenaResults.itemRewards}
            gachaTickets={arenaResults.gachaTickets}
            arenaPass={arenaResults.arenaPass}
            title={arenaResults.isSuccess ? "Arena Victory!" : "Arena Defeat"}
            onClose={handleResultsClose}
          />
        )}
      </div>
    );
  };

  // Async battle content  
  const renderAsyncBattles = () => {
    const ticketsRemaining = user?.async_battle_tickets || 0;
    const todaysSteps = getTodaysSteps();
    const activeBattles = getActiveBattles();
    const completedBattles = getCompletedBattles();
    const canRefreshToday = shouldRefreshDailyTickets(user!);
    const timeUntilRefresh = getTimeUntilNextRefresh();

    // Calculate user's player rank from their holobots
    const userPlayerRank = user?.holobots ? calculatePlayerRank({
      championCount: user.holobots.filter(h => h.rank === 'Champion').length,
      rareCount: user.holobots.filter(h => h.rank === 'Rare').length,
      eliteCount: user.holobots.filter(h => h.rank === 'Elite').length,
      legendaryCount: user.holobots.filter(h => h.rank === 'Legendary').length,
      prestigedCount: user.holobots.filter(h => h.prestiged).length
    }) : 'Rookie';
    
    return (
      <div className="min-h-screen bg-[#0A0B14] text-white pb-20">
        <div className="container mx-auto px-4 py-6">
          {/* Free Daily Tickets Section */}
          <div className="mb-6">
            <Card className="bg-black/60 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20">
              <CardContent className="p-6 text-center bg-gradient-to-b from-cyan-500/20 to-cyan-500/5">
                <div className="flex items-center justify-center mb-3">
                  <Ticket className="h-6 w-6 text-cyan-400 mr-2" />
                  <span className="text-sm font-bold text-cyan-400 tracking-wide">DAILY FREE TICKETS</span>
                </div>
                
                {canRefreshToday ? (
                  <>
                    <div className="text-4xl font-bold text-white mb-2">{DAILY_FREE_TICKETS}</div>
                    <div className="text-sm text-cyan-300 mb-4">Available Today</div>
                    <Button 
                      onClick={handleDailyTicketRefresh}
                      disabled={isRefreshingTickets}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white"
                      size="sm"
                    >
                      {isRefreshingTickets ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Ticket className="h-4 w-4 mr-2" />
                      )}
                      Claim Free Tickets
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-white mb-1">{ticketsRemaining}</div>
                    <div className="text-sm text-cyan-300 mb-2">Current Tickets</div>
                    <div className="text-xs text-cyan-400/70">Next refresh: {timeUntilRefresh}</div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-black/60 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20">
              <CardContent className="p-6 text-center bg-gradient-to-b from-cyan-500/20 to-cyan-500/5">
                <div className="flex items-center justify-center mb-3">
                  <Ticket className="h-6 w-6 text-cyan-400 mr-2" />
                  <span className="text-sm font-bold text-cyan-400 tracking-wide">TICKETS</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{ticketsRemaining}</div>
                <div className="text-sm text-cyan-300">Remaining</div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-2 border-green-500/50 shadow-lg shadow-green-500/20">
              <CardContent className="p-6 text-center bg-gradient-to-b from-green-500/20 to-green-500/5">
                <div className="flex items-center justify-center mb-3">
                  <Activity className="h-6 w-6 text-green-400 mr-2" />
                  <span className="text-sm font-bold text-green-400 tracking-wide">STEPS</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{todaysSteps.toLocaleString()}</div>
                <div className="text-sm text-green-300">Today</div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20">
              <CardContent className="p-6 text-center bg-gradient-to-b from-yellow-500/20 to-yellow-500/5">
                <div className="flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-yellow-400 mr-2" />
                  <span className="text-sm font-bold text-yellow-400 tracking-wide">ACTIVE</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{activeBattles.length}</div>
                <div className="text-sm text-yellow-300">Battles</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeAsyncTab} onValueChange={setActiveAsyncTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-cyan-500/20">
              <TabsTrigger 
                value="leagues" 
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                <Sword className="h-4 w-4 mr-2" />
                PvE Leagues
              </TabsTrigger>
              <TabsTrigger 
                value="pools"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                <Users className="h-4 w-4 mr-2" />
                PvP Pools
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Battle History
              </TabsTrigger>
            </TabsList>

            {/* PvE Leagues Tab */}
            <TabsContent value="leagues" className="space-y-6">
              <div className="grid gap-4">
                {Object.entries(LEAGUE_CONFIGS).map(([leagueType, config], index) => (
                  <BattleLeagueCard 
                    key={leagueType}
                    leagueType={leagueType as any}
                    config={config}
                    userPlayerRank={userPlayerRank}
                    ticketsRemaining={ticketsRemaining}
                    userHolobots={user?.holobots || []}
                    leagueId={index + 1}
                  />
                ))}
              </div>
            </TabsContent>

            {/* PvP Pools Tab */}
            <TabsContent value="pools" className="space-y-6">
              <div className="grid gap-4">
                {Object.entries(POOL_CONFIGS).map(([poolType, config]) => (
                  <BattlePoolCard 
                    key={poolType}
                    poolType={poolType as any}
                    config={config}
                    userPlayerRank={userPlayerRank}
                    ticketsRemaining={ticketsRemaining}
                    userHolobots={user?.holobots || []}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Battle History Tab */}
            <TabsContent value="history" className="space-y-6">
                              <BattleHistoryList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      {/* Battle Mode Toggle */}
      <div className="bg-black/40 border-b border-cyan-500/20 px-4 py-4">
        <div className="flex items-center justify-center">
          <div className="relative bg-black/60 rounded-lg p-1 border border-cyan-500/30">
            <div 
              className={cn(
                "absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-out",
                "bg-gradient-to-r shadow-lg",
                battleMode === 'arena' 
                  ? "left-1 w-1/3 from-cyan-500/40 to-cyan-600/40 border border-cyan-400/50" 
                  : battleMode === 'arena-v2'
                  ? "left-1/3 w-1/3 from-yellow-500/40 to-orange-600/40 border border-yellow-400/50"
                  : "left-2/3 right-1 from-purple-500/40 to-fuchsia-600/40 border border-purple-400/50"
              )}
            />
            <div className="relative flex">
              <button
                onClick={() => setBattleMode('arena')}
                className={cn(
                  "px-6 py-3 text-sm font-medium transition-all duration-200 rounded-md relative z-10",
                  "flex items-center justify-center gap-2",
                  battleMode === 'arena'
                    ? "text-cyan-100 font-bold"
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                <Sword className="h-4 w-4" />
                CLASSIC
              </button>
              <button
                onClick={() => setBattleMode('arena-v2')}
                className={cn(
                  "px-6 py-3 text-sm font-medium transition-all duration-200 rounded-md relative z-10",
                  "flex items-center justify-center gap-2",
                  battleMode === 'arena-v2'
                    ? "text-yellow-100 font-bold"
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                <Activity className="h-4 w-4" />
                ARENA V2
                <Badge className="ml-1 bg-yellow-500/20 text-yellow-300 text-xs">NEW</Badge>
              </button>
              <button
                onClick={() => setBattleMode('pvp')}
                className={cn(
                  "px-6 py-3 text-sm font-medium transition-all duration-200 rounded-md relative z-10",
                  "flex items-center justify-center gap-2",
                  battleMode === 'pvp'
                    ? "text-purple-100 font-bold"
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                <Users className="h-4 w-4" />
                PvP
                <Badge className="ml-1 bg-purple-500/20 text-purple-300 text-xs">LIVE</Badge>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on battle mode */}
      {battleMode === 'arena' ? (
        hasEntryFee ? renderArenaBattle() : renderArenaPreBattle()
      ) : battleMode === 'arena-v2' ? (
        <ArenaV2Wrapper />
      ) : (
        <RealtimeBattleRoom />
      )}
    </div>
  );
};

export default Index;
