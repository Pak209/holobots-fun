
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { HOLOBOT_STATS } from "@/types/holobot";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Swords, Target, Gem, Ticket, Clock, Flame, Trophy, Star } from "lucide-react";
import { Progress } from "./ui/progress";
import { supabase, getDailyBossRotation } from "@/integrations/supabase/client";
import { QuestBattleBanner } from "@/components/quests/QuestBattleBanner";
import { QuestResultsScreen } from "@/components/quests/QuestResultsScreen";

// Quest difficulty tiers
const EXPLORATION_TIERS = {
  normal: { 
    level: 5, 
    energyCost: 10, 
    rewards: { 
      blueprintPieces: 1,
      holosTokens: 50
    }
  },
  challenge: { 
    level: 15, 
    energyCost: 20, 
    rewards: { 
      blueprintPieces: 2,
      holosTokens: 100
    }
  },
  extreme: { 
    level: 30, 
    energyCost: 30, 
    rewards: { 
      blueprintPieces: 3,
      holosTokens: 200
    }
  }
};

const BOSS_TIERS = {
  tier1: { 
    level: 10, 
    energyCost: 40, 
    rewards: { 
      blueprintPieces: 5,
      gachaTickets: 5,
      xpMultiplier: 1,
      squadXp: 50 // Base XP for each squad member
    }
  },
  tier2: { 
    level: 25, 
    energyCost: 60, 
    rewards: { 
      blueprintPieces: 10,
      gachaTickets: 10,
      xpMultiplier: 2,
      squadXp: 100 // Base XP for each squad member
    }
  },
  tier3: { 
    level: 50, 
    energyCost: 80, 
    rewards: { 
      blueprintPieces: 15,
      gachaTickets: 15,
      xpMultiplier: 3,
      squadXp: 200 // Base XP for each squad member
    }
  }
};

// Holobot cooldown in minutes
const COOLDOWN_MINUTES = 30;

export const QuestGrid = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [explorationHolobot, setExplorationHolobot] = useState<string>("");
  const [selectedExplorationTier, setSelectedExplorationTier] = useState<keyof typeof EXPLORATION_TIERS>("normal");
  const [isExplorationQuesting, setIsExplorationQuesting] = useState(false);
  
  const [bossHolobots, setBossHolobots] = useState<string[]>([]);
  const [selectedBossTier, setSelectedBossTier] = useState<keyof typeof BOSS_TIERS>("tier1");
  const [isBossQuesting, setIsBossQuesting] = useState(false);
  
  // Daily boss rotation
  const [dailyBosses, setDailyBosses] = useState<Record<string, string>>({
    tier1: "",
    tier2: "",
    tier3: ""
  });
  
  // Cooldown state for holobots
  const [holobotCooldowns, setHolobotCooldowns] = useState<Record<string, Date>>({});
  
  // Battle UI states
  const [showBattleBanner, setShowBattleBanner] = useState(false);
  const [isBossBattle, setIsBossBattle] = useState(false);
  const [currentBattleHolobots, setCurrentBattleHolobots] = useState<string[]>([]);
  const [currentBossHolobot, setCurrentBossHolobot] = useState<string>("");
  
  // Results screen states
  const [showResultsScreen, setShowResultsScreen] = useState(false);
  const [battleSuccess, setBattleSuccess] = useState(false);
  const [squadExpResults, setSquadExpResults] = useState<Array<{name: string, xp: number, levelUp: boolean, newLevel: number}>>([]);
  const [blueprintReward, setBlueprintReward] = useState<{holobotKey: string, amount: number} | undefined>();
  const [holosReward, setHolosReward] = useState(0);
  const [gachaReward, setGachaReward] = useState(0);

  // Load daily boss rotation on component mount
  useEffect(() => {
    const rotation = getDailyBossRotation();
    setDailyBosses(rotation);
  }, []);

  // Get the user's holobots that are not on cooldown
  const getAvailableHolobots = () => {
    if (!user?.holobots) return [];
    
    return user.holobots.filter(holobot => {
      const holobotKey = getHolobotKeyByName(holobot.name);
      return !holobotCooldowns[holobotKey] || new Date() > holobotCooldowns[holobotKey];
    });
  };

  // Get the holobot key from HOLOBOT_STATS based on name
  const getHolobotKeyByName = (name: string): string => {
    const lowerName = name.toLowerCase();
    const key = Object.keys(HOLOBOT_STATS).find(
      k => HOLOBOT_STATS[k].name.toLowerCase() === lowerName
    );
    return key || Object.keys(HOLOBOT_STATS)[0]; // fallback to first holobot if not found
  };

  // Set a holobot on cooldown
  const setHolobotOnCooldown = (holobotKey: string) => {
    const cooldownEnd = new Date();
    cooldownEnd.setMinutes(cooldownEnd.getMinutes() + COOLDOWN_MINUTES);
    
    setHolobotCooldowns(prev => ({
      ...prev,
      [holobotKey]: cooldownEnd
    }));
  };

  // Get cooldown progress percentage for a holobot
  const getCooldownProgress = (holobotKey: string): number => {
    if (!holobotCooldowns[holobotKey]) return 100;
    
    const now = new Date();
    const cooldownEnd = holobotCooldowns[holobotKey];
    
    if (now > cooldownEnd) return 100;
    
    const cooldownStart = new Date(cooldownEnd);
    cooldownStart.setMinutes(cooldownStart.getMinutes() - COOLDOWN_MINUTES);
    
    const total = cooldownEnd.getTime() - cooldownStart.getTime();
    const elapsed = now.getTime() - cooldownStart.getTime();
    
    return Math.min(Math.floor((elapsed / total) * 100), 100);
  };

  // Get formatted time remaining for cooldown
  const getCooldownTimeRemaining = (holobotKey: string): string => {
    if (!holobotCooldowns[holobotKey]) return "Ready";
    
    const now = new Date();
    const cooldownEnd = holobotCooldowns[holobotKey];
    
    if (now > cooldownEnd) return "Ready";
    
    const diffMs = cooldownEnd.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / 60000);
    
    return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  };

  // Start exploration quest
  const handleStartExploration = async () => {
    if (!explorationHolobot) {
      toast({
        title: "Select a Holobot",
        description: "Please select a Holobot for exploration",
        variant: "destructive"
      });
      return;
    }

    const tier = EXPLORATION_TIERS[selectedExplorationTier];
    
    if (user?.dailyEnergy < tier.energyCost) {
      toast({
        title: "Not Enough Energy",
        description: `You need ${tier.energyCost} energy for this quest`,
        variant: "destructive"
      });
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
          const randomHolobotKey = randomOpponentKey;
          
          // Get current blueprints or initialize empty object
          const currentBlueprints = user.blueprints || {};
          
          // Update the blueprint count for the random holobot
          const updatedBlueprints = {
            ...currentBlueprints,
            [randomHolobotKey]: (currentBlueprints[randomHolobotKey] || 0) + tier.rewards.blueprintPieces
          };
          
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost,
            holosTokens: user.holosTokens + tier.rewards.holosTokens,
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
          setGachaReward(0);
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
        setGachaReward(0);
        setShowResultsScreen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during the quest",
        variant: "destructive"
      });
    } finally {
      setIsExplorationQuesting(false);
    }
  };

  // Handle selecting a holobot for the boss squad
  const handleSelectBossHolobot = (holobotKey: string) => {
    if (bossHolobots.includes(holobotKey)) {
      // Remove if already selected
      setBossHolobots(prev => prev.filter(key => key !== holobotKey));
    } else if (bossHolobots.length < 3) {
      // Add if less than 3 selected
      setBossHolobots(prev => [...prev, holobotKey]);
    } else {
      toast({
        title: "Squad Full",
        description: "You can only select 3 Holobots for the Boss Quest",
        variant: "destructive"
      });
    }
  };

  // Start boss quest
  const handleStartBossQuest = async () => {
    if (bossHolobots.length < 3) {
      toast({
        title: "Incomplete Squad",
        description: "Please select 3 Holobots for the Boss Quest",
        variant: "destructive"
      });
      return;
    }

    const tier = BOSS_TIERS[selectedBossTier];
    const currentBossKey = dailyBosses[selectedBossTier];
    
    if (!currentBossKey) {
      toast({
        title: "Error",
        description: "Failed to get daily boss. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user || user.dailyEnergy < tier.energyCost) {
      toast({
        title: "Not Enough Energy",
        description: `You need ${tier.energyCost} energy for this quest`,
        variant: "destructive"
      });
      return;
    }

    setIsBossQuesting(true);
    
    // Set up battle banner
    setIsBossBattle(true);
    setCurrentBattleHolobots([...bossHolobots]);
    setCurrentBossHolobot(currentBossKey);
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
        // Update XP for all Holobots in the squad
        const updatedHolobots = await updateSquadExperience(bossHolobots, tier.rewards.squadXp, tier.rewards.xpMultiplier);
        
        // Get current blueprints or initialize empty object
        const currentBlueprints = user.blueprints || {};
        
        // Update the blueprint count for the boss holobot
        const updatedBlueprints = {
          ...currentBlueprints,
          [currentBossKey]: (currentBlueprints[currentBossKey] || 0) + tier.rewards.blueprintPieces
        };
        
        // Update user's gachaTickets and energy
        if (user) {
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost,
            gachaTickets: user.gachaTickets + tier.rewards.gachaTickets,
            holobots: updatedHolobots, // Update with new XP values
            blueprints: updatedBlueprints
          });
        }
        
        // Set up results screen data
        setBattleSuccess(true);
        setBlueprintReward({
          holobotKey: currentBossKey,
          amount: tier.rewards.blueprintPieces
        });
        setHolosReward(0); // No Holos rewards for boss quests
        setGachaReward(tier.rewards.gachaTickets);
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
          [currentBossKey]: (currentBlueprints[currentBossKey] || 0) + failureBlueprintPieces
        };
        
        // Set all squad holobots on cooldown
        bossHolobots.forEach(holobotKey => {
          setHolobotOnCooldown(holobotKey);
        });
        
        // Update user's energy and holobots
        if (user) {
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost,
            holobots: updatedHolobots, // Update with new XP values
            blueprints: updatedBlueprints
          });
        }
        
        // Set up results screen for failure
        setBattleSuccess(false);
        setBlueprintReward({
          holobotKey: currentBossKey,
          amount: failureBlueprintPieces
        });
        setHolosReward(0);
        setGachaReward(0);
        setShowResultsScreen(true);
      }
    } catch (error) {
      console.error("Error during boss quest:", error);
      toast({
        title: "Error",
        description: "An error occurred during the boss quest",
        variant: "destructive"
      });
    } finally {
      setIsBossQuesting(false);
      setBossHolobots([]);
    }
  };

  // Update experience for all Holobots in the squad - update to track XP messages
  const updateSquadExperience = async (squadHolobotKeys, baseXp, multiplier = 1) => {
    if (!user?.holobots || !Array.isArray(user.holobots)) {
      return [];
    }
    
    // Create a copy of holobots to update
    const updatedHolobots = [...user.holobots];
    
    // Track XP gained messages for results screen
    const xpMessages = [];
    
    // Update each Holobot in the squad
    for (const holobotKey of squadHolobotKeys) {
      const holobotName = HOLOBOT_STATS[holobotKey].name;
      
      // Find the Holobot in the user's collection
      const holobotIndex = updatedHolobots.findIndex(
        h => h.name.toLowerCase() === holobotName.toLowerCase()
      );
      
      if (holobotIndex === -1) continue;
      
      const holobot = updatedHolobots[holobotIndex];
      
      // Calculate XP gain based on level difference to boss
      const levelDiff = holobot.level - BOSS_TIERS[selectedBossTier].level;
      let xpModifier = 1;
      
      // Lower level Holobots get more XP
      if (levelDiff < 0) {
        // Up to 2x XP for Holobots with much lower level than the boss
        xpModifier = Math.min(2, 1 + (Math.abs(levelDiff) * 0.05));
      } else if (levelDiff > 10) {
        // Reduced XP for much higher level Holobots
        xpModifier = Math.max(0.2, 1 - (levelDiff * 0.05));
      }
      
      // Calculate final XP with all modifiers
      const xpGained = Math.floor(baseXp * xpModifier * multiplier);
      
      // Update the Holobot's experience
      const newTotalXp = (holobot.experience || 0) + xpGained;
      const newLevel = getNewLevel(newTotalXp, holobot.level);
      
      // Track level up for messaging
      const didLevelUp = newLevel > holobot.level;
      
      // Update the Holobot
      updatedHolobots[holobotIndex] = {
        ...holobot,
        experience: newTotalXp,
        level: newLevel,
        nextLevelExp: calculateExperience(newLevel)
      };
      
      // Add to XP messages
      xpMessages.push({
        name: holobotName,
        xp: xpGained,
        levelUp: didLevelUp,
        newLevel: newLevel
      });
    }
    
    // Set results for results screen
    setSquadExpResults(xpMessages);
    
    // Show toasts for level ups
    xpMessages.forEach(msg => {
      if (msg.levelUp) {
        toast({
          title: `${msg.name} Leveled Up!`,
          description: `Gained ${msg.xp} XP and reached level ${msg.newLevel}!`,
          variant: "default"
        });
      }
    });
    
    return updatedHolobots;
  };

  // Helper function to calculate required XP for level
  const calculateExperience = (level) => {
    return Math.floor(100 * Math.pow(level, 2));
  };
  
  // Helper function to determine if level up occurs
  const getNewLevel = (currentXp, currentLevel) => {
    const requiredXp = calculateExperience(currentLevel);
    if (currentXp >= requiredXp && currentLevel < 50) {
      return currentLevel + 1;
    }
    return currentLevel;
  };

  // Get daily boss display name
  const getDailyBossName = (tier: keyof typeof BOSS_TIERS) => {
    const bossKey = dailyBosses[tier];
    return bossKey ? HOLOBOT_STATS[bossKey]?.name || "Unknown Boss" : "Loading...";
  };

  const availableHolobots = getAvailableHolobots();

  return (
    <div className="space-y-8">
      <Card className="glass-morphism border-app-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl text-app-primary">Quests Info</CardTitle>
          <CardDescription className="text-lg text-foreground/90">
            Send your Holobots on quests to earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-foreground/80">
            <li>Exploration Quests: Earn Holos tokens and Blueprint Pieces</li>
            <li>Boss Quests: Team up 3 Holobots to earn Blueprint Pieces and Gacha Tickets</li>
            <li>Defeated Holobots need {COOLDOWN_MINUTES} minutes to recharge</li>
            <li>Today's Boss Rotation: <span className="text-app-primary">{getDailyBossName('tier1')}, {getDailyBossName('tier2')}, {getDailyBossName('tier3')}</span></li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exploration Quest */}
        <Card className="glass-morphism border-app-primary/30">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-app-primary" />
              <CardTitle className="text-xl text-app-primary">Exploration Quest</CardTitle>
            </div>
            <CardDescription>
              Send a Holobot to explore and collect resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={explorationHolobot} onValueChange={setExplorationHolobot}>
              <SelectTrigger className="border-app-primary/50 text-foreground">
                <SelectValue placeholder="Choose your Holobot" />
              </SelectTrigger>
              <SelectContent>
                {availableHolobots.map((holobot, index) => {
                  const holobotKey = getHolobotKeyByName(holobot.name);
                  return (
                    <SelectItem key={index} value={holobotKey}>
                      {holobot.name} (Lv.{holobot.level})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Tier Selection */}
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(EXPLORATION_TIERS) as [keyof typeof EXPLORATION_TIERS, typeof EXPLORATION_TIERS[keyof typeof EXPLORATION_TIERS]][]).map(([key, tier]) => (
                <Button
                  key={key}
                  variant={selectedExplorationTier === key ? "default" : "outline"}
                  className={`
                    h-auto py-2 px-3
                    ${selectedExplorationTier === key ? 'bg-app-primary text-black' : 'bg-black/40 text-app-primary'}
                    border-app-primary/20 hover:border-app-primary
                  `}
                  onClick={() => setSelectedExplorationTier(key)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="capitalize font-medium">{key}</span>
                    <div className="flex items-center text-xs">
                      <Flame className="h-3 w-3 mr-1" />
                      <span>Lv.{tier.level}</span>
                    </div>
                    <span className="text-xs text-green-400">{tier.energyCost} Energy</span>
                  </div>
                </Button>
              ))}
            </div>

            {/* Rewards Display */}
            <div className="bg-app-backgroundLight p-2 rounded-md border border-app-primary/30">
              <h4 className="text-sm font-medium text-app-primary mb-2">Rewards:</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <Gem className="h-3 w-3 text-purple-400" />
                  <span>{EXPLORATION_TIERS[selectedExplorationTier].rewards.blueprintPieces} Blueprint {EXPLORATION_TIERS[selectedExplorationTier].rewards.blueprintPieces > 1 ? 'Pieces' : 'Piece'}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-yellow-400">+</span>
                  <span>{EXPLORATION_TIERS[selectedExplorationTier].rewards.holosTokens} Holos</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-app-primary hover:bg-app-primary/80 text-black"
              disabled={isExplorationQuesting || !explorationHolobot || (user?.dailyEnergy || 0) < EXPLORATION_TIERS[selectedExplorationTier].energyCost}
              onClick={handleStartExploration}
            >
              {isExplorationQuesting ? (
                <>
                  <MapPin className="animate-pulse mr-2 h-4 w-4" />
                  Exploring...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Start Exploration
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Boss Quest */}
        <Card className="glass-morphism border-app-primary/30">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-red-500" />
              <CardTitle className="text-xl text-app-primary">Boss Quest</CardTitle>
            </div>
            <CardDescription>
              Challenge powerful bosses with a team of 3 Holobots
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Squad Selection */}
            <div>
              <div className="text-sm text-app-primary mb-2">Select 3 Holobots for your squad:</div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {Array(3).fill(0).map((_, index) => {
                  const selectedKey = bossHolobots[index];
                  const isSelected = !!selectedKey;
                  
                  return (
                    <div 
                      key={index}
                      className={`
                        h-16 border rounded-md flex items-center justify-center
                        ${isSelected ? 'border-app-primary bg-app-primary/10' : 'border-dashed border-gray-600 bg-black/20'}
                      `}
                    >
                      {isSelected ? (
                        <div className="text-center">
                          <div className="text-xs font-medium">{HOLOBOT_STATS[selectedKey].name}</div>
                          <div className="text-xs opacity-70">
                            {user?.holobots.find(h => h.name.toLowerCase() === HOLOBOT_STATS[selectedKey].name.toLowerCase())?.level || 1}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Empty Slot</span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-black/20 rounded-md p-2 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {availableHolobots.map((holobot, index) => {
                    const holobotKey = getHolobotKeyByName(holobot.name);
                    const isSelected = bossHolobots.includes(holobotKey);
                    
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className={`
                          h-auto py-1 justify-start text-left
                          ${isSelected ? 'bg-app-primary/30 border-app-primary' : 'bg-black/30 border-gray-700'}
                        `}
                        onClick={() => handleSelectBossHolobot(holobotKey)}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{holobot.name}</span>
                          <span className="text-xs opacity-70">Lv.{holobot.level}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Daily Boss Info */}
            <div className="bg-app-backgroundLight p-2 rounded-md border border-app-primary/30">
              <h4 className="text-sm font-medium text-app-primary mb-2">Today's Boss Rotation:</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-1 border border-app-primary/20 rounded">
                  <div>Tier 1</div>
                  <div className="font-medium">{getDailyBossName('tier1')}</div>
                </div>
                <div className="p-1 border border-app-primary/20 rounded">
                  <div>Tier 2</div>
                  <div className="font-medium">{getDailyBossName('tier2')}</div>
                </div>
                <div className="p-1 border border-app-primary/20 rounded">
                  <div>Tier 3</div>
                  <div className="font-medium">{getDailyBossName('tier3')}</div>
                </div>
              </div>
              <div className="text-xs text-app-textSecondary mt-2 text-center">
                Boss rotation changes daily
              </div>
            </div>
            
            {/* Tier Selection */}
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(BOSS_TIERS) as [keyof typeof BOSS_TIERS, typeof BOSS_TIERS[keyof typeof BOSS_TIERS]][]).map(([key, tier]) => (
                <Button
                  key={key}
                  variant={selectedBossTier === key ? "default" : "outline"}
                  className={`
                    h-auto py-2 px-3
                    ${selectedBossTier === key ? 'bg-red-600 text-white' : 'bg-black/40 text-red-400'}
                    border-red-800/30 hover:border-red-500
                  `}
                  onClick={() => setSelectedBossTier(key)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="capitalize font-medium">{key.replace('tier', 'T')}</span>
                    <div className="flex items-center text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      <span>Lv.{tier.level}</span>
                    </div>
                    <span className="text-xs text-green-400">{tier.energyCost} Energy</span>
                  </div>
                </Button>
              ))}
            </div>

            {/* Rewards Display */}
            <div className="bg-black/30 p-2 rounded-md border border-red-500/30">
              <h4 className="text-sm font-medium text-app-primary mb-2">Rewards:</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <Gem className="h-3 w-3 text-purple-400" />
                  <span>{BOSS_TIERS[selectedBossTier].rewards.blueprintPieces} Blueprint Pieces</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Ticket className="h-3 w-3 text-green-400" />
                  <span>{BOSS_TIERS[selectedBossTier].rewards.gachaTickets} Gacha Tickets</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Swords className="h-3 w-3 text-blue-400" />
                  <span>x{BOSS_TIERS[selectedBossTier].rewards.xpMultiplier} XP Boost</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 text-yellow-400" />
                  <span>{BOSS_TIERS[selectedBossTier].rewards.squadXp} Base XP</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={
                isBossQuesting || 
                bossHolobots.length < 3 || 
                !dailyBosses[selectedBossTier] || 
                (user?.dailyEnergy || 0) < BOSS_TIERS[selectedBossTier].energyCost
              }
              onClick={handleStartBossQuest}
            >
              {isBossQuesting ? (
                <>
                  <Swords className="animate-spin mr-2 h-4 w-4" />
                  Fighting Boss...
                </>
              ) : (
                <>
                  <Swords className="mr-2 h-4 w-4" />
                  Start Boss Quest
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Holobot Cooldowns Display */}
      {Object.keys(holobotCooldowns).length > 0 && (
        <Card className="glass-morphism border-app-primary/50">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-app-primary" />
              <CardTitle className="text-lg text-app-primary">Holobot Cooldowns</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(holobotCooldowns).map(([holobotKey, cooldownTime]) => {
                const progress = getCooldownProgress(holobotKey);
                const timeRemaining = getCooldownTimeRemaining(holobotKey);
                const isReady = timeRemaining === "Ready";
                
                return (
                  <div 
                    key={holobotKey}
                    className={`
                      p-2 rounded-md border
                      ${isReady ? 'border-green-500/30 bg-green-900/10' : 'border-orange-500/30 bg-orange-900/10'}
                    `}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{HOLOBOT_STATS[holobotKey].name}</span>
                      <span className={`text-xs ${isReady ? 'text-green-400' : 'text-orange-400'}`}>
                        {timeRemaining}
                      </span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>
                );
              })}
            </div>
          </CardContent>
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
        gachaTickets={gachaReward}
        onClose={() => setShowResultsScreen(false)}
      />
    </div>
  );
};
