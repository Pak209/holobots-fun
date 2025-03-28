import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { HOLOBOT_STATS } from "@/types/holobot";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Swords, Target, Gem, Ticket, Clock, Flame, Trophy, Star } from "lucide-react";
import { Progress } from "./ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { QuestBattleBanner } from "@/components/quests/QuestBattleBanner";
import { QuestResultsScreen } from "@/components/quests/QuestResultsScreen";
import { updateHolobotExperience, updateBlueprintCount } from "@/utils/battleUtils";

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
      holosTokens: 1000,
      gachaTickets: 5,
      xpMultiplier: 1,
      squadXp: 50
    }
  },
  tier2: { 
    level: 25, 
    energyCost: 60, 
    rewards: { 
      blueprintPieces: 10,
      holosTokens: 2500,
      gachaTickets: 10,
      xpMultiplier: 2,
      squadXp: 100
    }
  },
  tier3: { 
    level: 50, 
    energyCost: 80, 
    rewards: { 
      blueprintPieces: 15,
      holosTokens: 5000,
      gachaTickets: 15,
      xpMultiplier: 3,
      squadXp: 200
    }
  }
};

const COOLDOWN_MINUTES = 30;

export const QuestGrid = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [explorationHolobot, setExplorationHolobot] = useState<string>("");
  const [selectedExplorationTier, setSelectedExplorationTier] = useState<keyof typeof EXPLORATION_TIERS>("normal");
  const [isExplorationQuesting, setIsExplorationQuesting] = useState(false);
  
  const [bossHolobots, setBossHolobots] = useState<string[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<string>("");
  const [selectedBossTier, setSelectedBossTier] = useState<keyof typeof BOSS_TIERS>("tier1");
  const [isBossQuesting, setIsBossQuesting] = useState(false);
  
  const [holobotCooldowns, setHolobotCooldowns] = useState<Record<string, Date>>({});
  
  const [showBattleBanner, setShowBattleBanner] = useState(false);
  const [isBossBattle, setIsBossBattle] = useState(false);
  const [currentBattleHolobots, setCurrentBattleHolobots] = useState<string[]>([]);
  const [currentBossHolobot, setCurrentBossHolobot] = useState<string>("");
  
  const [showResultsScreen, setShowResultsScreen] = useState(false);
  const [battleSuccess, setBattleSuccess] = useState(false);
  const [squadExpResults, setSquadExpResults] = useState<Array<{name: string, xp: number, levelUp: boolean, newLevel: number}>>([]);
  const [blueprintRewards, setBlueprintRewards] = useState<{holobotKey: string, amount: number} | undefined>();
  const [holosReward, setHolosReward] = useState(0);
  const [gachaTicketsReward, setGachaTicketsReward] = useState(0);

  const getAvailableHolobots = () => {
    if (!user?.holobots) return [];
    
    return user.holobots.filter(holobot => {
      const holobotKey = getHolobotKeyByName(holobot.name);
      return !holobotCooldowns[holobotKey] || new Date() > holobotCooldowns[holobotKey];
    });
  };

  const getHolobotKeyByName = (name: string): string => {
    const lowerName = name.toLowerCase();
    const key = Object.keys(HOLOBOT_STATS).find(
      k => HOLOBOT_STATS[k].name.toLowerCase() === lowerName
    );
    return key || Object.keys(HOLOBOT_STATS)[0];
  };

  const setHolobotOnCooldown = (holobotKey: string) => {
    const cooldownEnd = new Date();
    cooldownEnd.setMinutes(cooldownEnd.getMinutes() + COOLDOWN_MINUTES);
    
    setHolobotCooldowns(prev => ({
      ...prev,
      [holobotKey]: cooldownEnd
    }));
  };

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

  const getCooldownTimeRemaining = (holobotKey: string): string => {
    if (!holobotCooldowns[holobotKey]) return "Ready";
    
    const now = new Date();
    const cooldownEnd = holobotCooldowns[holobotKey];
    
    if (now > cooldownEnd) return "Ready";
    
    const diffMs = cooldownEnd.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / 60000);
    
    return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  };

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
    
    setIsBossBattle(false);
    setCurrentBattleHolobots([explorationHolobot]);
    
    const randomOpponentKey = Object.keys(HOLOBOT_STATS)[Math.floor(Math.random() * Object.keys(HOLOBOT_STATS).length)];
    setCurrentBossHolobot(randomOpponentKey);
    setShowBattleBanner(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const isSuccess = Math.random() < 0.7;
      
      if (isSuccess) {
        if (user) {
          const randomHolobotKey = randomOpponentKey;
          
          const updatedBlueprints = updateBlueprintCount(
            user.blueprints || {},
            randomHolobotKey,
            tier.rewards.blueprintPieces
          );
          
          console.log("[handleStartExploration] Updating blueprints for exploration:", updatedBlueprints);
          
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost,
            holosTokens: user.holosTokens + tier.rewards.holosTokens,
            blueprints: updatedBlueprints
          });
          
          setBattleSuccess(true);
          setSquadExpResults([{
            name: HOLOBOT_STATS[explorationHolobot].name,
            xp: 0,
            levelUp: false,
            newLevel: user.holobots.find(h => h.name === HOLOBOT_STATS[explorationHolobot].name)?.level || 1
          }]);
          setBlueprintRewards({
            holobotKey: randomHolobotKey,
            amount: tier.rewards.blueprintPieces
          });
          setHolosReward(tier.rewards.holosTokens);
          setGachaTicketsReward(0);
          setShowResultsScreen(true);
        }
      } else {
        setHolobotOnCooldown(explorationHolobot);
        
        if (user) {
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost
          });
        }
        
        setBattleSuccess(false);
        setSquadExpResults([{
          name: HOLOBOT_STATS[explorationHolobot].name,
          xp: 0,
          levelUp: false,
          newLevel: user.holobots.find(h => h.name === HOLOBOT_STATS[explorationHolobot].name)?.level || 1
        }]);
        setBlueprintRewards(undefined);
        setHolosReward(0);
        setGachaTicketsReward(0);
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

  const handleSelectBossHolobot = (holobotKey: string) => {
    if (bossHolobots.includes(holobotKey)) {
      setBossHolobots(prev => prev.filter(key => key !== holobotKey));
    } else if (bossHolobots.length < 3) {
      setBossHolobots(prev => [...prev, holobotKey]);
    } else {
      toast({
        title: "Squad Full",
        description: "You can only select 3 Holobots for the Boss Quest",
        variant: "destructive"
      });
    }
  };

  const handleStartBossQuest = async () => {
    if (bossHolobots.length < 3) {
      toast({
        title: "Incomplete Squad",
        description: "Please select 3 Holobots for the Boss Quest",
        variant: "destructive"
      });
      return;
    }

    if (!selectedBoss) {
      toast({
        title: "Select a Boss",
        description: "Please select a Boss to challenge",
        variant: "destructive"
      });
      return;
    }

    const tier = BOSS_TIERS[selectedBossTier];
    
    if (!user || user.dailyEnergy < tier.energyCost) {
      toast({
        title: "Not Enough Energy",
        description: `You need ${tier.energyCost} energy for this quest`,
        variant: "destructive"
      });
      return;
    }

    setIsBossQuesting(true);
    
    setIsBossBattle(true);
    setCurrentBattleHolobots([...bossHolobots]);
    setCurrentBossHolobot(selectedBoss);
    setShowBattleBanner(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const squadPower = bossHolobots.reduce((power, holobotKey) => {
        const holobot = user?.holobots.find(
          h => h.name.toLowerCase() === HOLOBOT_STATS[holobotKey].name.toLowerCase()
        );
        return power + (holobot?.level || 1) * 10;
      }, 0);
      
      const bossPower = tier.level * 15;
      
      const powerRatio = squadPower / bossPower;
      const successChance = Math.min(0.9, powerRatio * 0.7);
      const isSuccess = Math.random() < successChance;
      
      if (isSuccess) {
        const updatedHolobots = await updateSquadExperience(bossHolobots, tier.rewards.squadXp, tier.rewards.xpMultiplier);
        
        const currentBlueprints = user.blueprints || {};
        
        const updatedBlueprints = updateBlueprintCount(
          currentBlueprints,
          selectedBoss,
          tier.rewards.blueprintPieces
        );
        
        console.log("[handleStartBossQuest] Success! Updating blueprints:", updatedBlueprints);
        console.log("[handleStartBossQuest] Selected boss blueprint key:", selectedBoss);
        console.log("[handleStartBossQuest] Blueprint pieces to add:", tier.rewards.blueprintPieces);
        
        if (user) {
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost,
            holosTokens: user.holosTokens + tier.rewards.holosTokens,
            gachaTickets: user.gachaTickets + tier.rewards.gachaTickets,
            holobots: updatedHolobots,
            blueprints: updatedBlueprints
          });
        }
        
        setBattleSuccess(true);
        setBlueprintRewards({
          holobotKey: selectedBoss,
          amount: tier.rewards.blueprintPieces
        });
        setHolosReward(tier.rewards.holosTokens);
        setGachaTicketsReward(tier.rewards.gachaTickets);
        setShowResultsScreen(true);
      } else {
        const failureXp = Math.floor(tier.rewards.squadXp * 0.5);
        const updatedHolobots = await updateSquadExperience(bossHolobots, failureXp, 1);
        
        const failureBlueprintPieces = Math.max(1, Math.floor(tier.rewards.blueprintPieces * 0.25));
        
        const updatedBlueprints = updateBlueprintCount(
          user.blueprints || {},
          selectedBoss,
          failureBlueprintPieces
        );
        
        console.log("[handleStartBossQuest] Failure, but still updating blueprints:", updatedBlueprints);
        console.log("[handleStartBossQuest] Selected boss blueprint key:", selectedBoss);
        console.log("[handleStartBossQuest] Blueprint pieces to add (reduced):", failureBlueprintPieces);
        
        bossHolobots.forEach(holobotKey => {
          setHolobotOnCooldown(holobotKey);
        });
        
        if (user) {
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost,
            holobots: updatedHolobots,
            blueprints: updatedBlueprints
          });
        }
        
        setBattleSuccess(false);
        setBlueprintRewards({
          holobotKey: selectedBoss,
          amount: failureBlueprintPieces
        });
        setHolosReward(0);
        setGachaTicketsReward(0);
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

  const updateSquadExperience = async (squadHolobotKeys, baseXp, multiplier = 1) => {
    if (!user?.holobots || !Array.isArray(user.holobots)) {
      return [];
    }
    
    const updatedHolobots = [...user.holobots];
    
    const xpMessages = [];
    
    for (const holobotKey of squadHolobotKeys) {
      const holobotName = HOLOBOT_STATS[holobotKey].name;
      
      const holobotIndex = updatedHolobots.findIndex(
        h => h.name.toLowerCase() === holobotName.toLowerCase()
      );
      
      if (holobotIndex === -1) continue;
      
      const holobot = updatedHolobots[holobotIndex];
      
      const levelDiff = holobot.level - BOSS_TIERS[selectedBossTier].level;
      let xpModifier = 1;
      
      if (levelDiff < 0) {
        xpModifier = Math.min(2, 1 + (Math.abs(levelDiff) * 0.05));
      } else if (levelDiff > 10) {
        xpModifier = Math.max(0.2, 1 - (levelDiff * 0.05));
      }
      
      const xpGained = Math.floor(baseXp * xpModifier * multiplier);
      
      const newTotalXp = (holobot.experience || 0) + xpGained;
      const newLevel = getNewLevel(newTotalXp, holobot.level);
      
      const didLevelUp = newLevel > holobot.level;
      
      updatedHolobots[holobotIndex] = {
        ...holobot,
        experience: newTotalXp,
        level: newLevel,
        nextLevelExp: calculateExperience(newLevel)
      };
      
      xpMessages.push({
        name: holobotName,
        xp: xpGained,
        levelUp: didLevelUp,
        newLevel: newLevel
      });
    }
    
    setSquadExpResults(xpMessages);
    
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

  const calculateExperience = (level) => {
    return Math.floor(100 * Math.pow(level, 2));
  };

  const getNewLevel = (currentXp, currentLevel) => {
    const requiredXp = calculateExperience(currentLevel);
    if (currentXp >= requiredXp && currentLevel < 50) {
      return currentLevel + 1;
    }
    return currentLevel;
  };

  const availableHolobots = getAvailableHolobots();

  return (
    <div className="space-y-8">
      <Card className="glass-morphism border-holobots-accent">
        <CardHeader>
          <CardTitle className="text-2xl text-holobots-accent">Quests Info</CardTitle>
          <CardDescription className="text-lg text-foreground/90">
            Send your Holobots on quests to earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-foreground/80">
            <li>Exploration Quests: Earn Holos tokens and Blueprint Pieces</li>
            <li>Boss Quests: Team up 3 Holobots to earn big rewards</li>
            <li>Defeated Holobots need {COOLDOWN_MINUTES} minutes to recharge</li>
          </ul>
          
          <div className="mt-4 p-3 bg-black/30 rounded-lg border border-holobots-accent/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-holobots-accent font-medium">Daily Energy</span>
              <span className="text-white">{user?.dailyEnergy || 0}/{user?.maxDailyEnergy || 100}</span>
            </div>
            <Progress 
              value={(user?.dailyEnergy || 0) / (user?.maxDailyEnergy || 100) * 100} 
              className="h-2 bg-gray-700"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-morphism border-holobots-accent">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-holobots-accent" />
              <CardTitle className="text-xl text-holobots-accent">Exploration Quest</CardTitle>
            </div>
            <CardDescription>
              Send a Holobot to explore and collect resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={explorationHolobot} onValueChange={setExplorationHolobot}>
              <SelectTrigger className="border-holobots-accent/50 text-foreground">
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

            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(EXPLORATION_TIERS) as [keyof typeof EXPLORATION_TIERS, typeof EXPLORATION_TIERS[keyof typeof EXPLORATION_TIERS]][]).map(([key, tier]) => (
                <Button
                  key={key}
                  variant={selectedExplorationTier === key ? "default" : "outline"}
                  className={`
                    h-auto py-2 px-3
                    ${selectedExplorationTier === key ? 'bg-holobots-accent text-white' : 'bg-black/40 text-holobots-accent'}
                    border-holobots-accent/20 hover:border-holobots-accent
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

            <div className="bg-black/30 p-2 rounded-md border border-holobots-accent/30">
              <h4 className="text-sm font-medium text-holobots-accent mb-2">Rewards:</h4>
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
              className="w-full bg-holobots-accent hover:bg-holobots-hover text-white"
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

        <Card className="glass-morphism border-holobots-accent">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-red-500" />
              <CardTitle className="text-xl text-holobots-accent">Boss Quest</CardTitle>
            </div>
            <CardDescription>
              Challenge powerful bosses with a team of 3 Holobots
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-holobots-accent mb-2">Select 3 Holobots for your squad:</div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {Array(3).fill(0).map((_, index) => {
                  const selectedKey = bossHolobots[index];
                  const isSelected = !!selectedKey;
                  
                  return (
                    <div 
                      key={index}
                      className={`
                        h-16 border rounded-md flex items-center justify-center
                        ${isSelected ? 'border-holobots-accent bg-holobots-accent/10' : 'border-dashed border-gray-600 bg-black/20'}
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
                          ${isSelected ? 'bg-holobots-accent/30 border-holobots-accent' : 'bg-black/30 border-gray-700'}
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
            
            <div>
              <div className="text-sm text-holobots-accent mb-2">Select Boss:</div>
              <Select value={selectedBoss} onValueChange={setSelectedBoss}>
                <SelectTrigger className="border-holobots-accent/50 text-foreground">
                  <SelectValue placeholder="Choose boss" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                    <SelectItem key={key} value={key}>
                      {stats.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(BOSS_TIERS) as [keyof typeof BOSS_TIERS, typeof BOSS_TIERS[keyof typeof BOSS_TIERS]][]).map(([key, tier]) => (
                <Button
                  key={key}
                  variant={selectedBossTier === key ? "default" : "outline"}
                  className={`
                    h-auto py-2 px-3
                    ${selectedBossTier === key ? 'bg-red-600 text-white' : 'bg-black/40 text-red-400'}
                    border-red-900/20 hover:border-red-500
                  `}
                  onClick={() => setSelectedBossTier(key)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="capitalize font-medium">{key.replace('tier', 'Tier ')}</span>
                    <div className="flex items-center text-xs">
                      <Flame className="h-3 w-3 mr-1" />
                      <span>Lv.{tier.level}</span>
                    </div>
                    <span className="text-xs text-green-400">{tier.energyCost} Energy</span>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="bg-black/30 p-2 rounded-md border border-red-900/30">
              <h4 className="text-sm font-medium text-red-400 mb-2">Rewards:</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <Gem className="h-3 w-3 text-purple-400" />
                  <span>{BOSS_TIERS[selectedBossTier].rewards.blueprintPieces} Blueprint {BOSS_TIERS[selectedBossTier].rewards.blueprintPieces > 1 ? 'Pieces' : 'Piece'}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-yellow-400">+</span>
                  <span>{BOSS_TIERS[selectedBossTier].rewards.holosTokens} Holos</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Ticket className="h-3 w-3 text-green-400" />
                  <span>{BOSS_TIERS[selectedBossTier].rewards.gachaTickets} Tickets</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 text-yellow-400" />
                  <span>XP for Squad</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isBossQuesting || bossHolobots.length < 3 || !selectedBoss || (user?.dailyEnergy || 0) < BOSS_TIERS[selectedBossTier].energyCost}
              onClick={handleStartBossQuest}
            >
              {isBossQuesting ? (
                <>
                  <Swords className="animate-pulse mr-2 h-4 w-4" />
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

      {Object.keys(holobotCooldowns).length > 0 && (
        <Card className="glass-morphism border-holobots-accent">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-holobots-accent" />
              <CardTitle className="text-xl text-holobots-accent">Holobot Cooldowns</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(holobotCooldowns).map(([holobotKey, cooldownTime]) => {
                if (new Date() > cooldownTime) return null;
                
                return (
                  <div key={holobotKey} className="bg-black/30 p-2 rounded-md border border-holobots-accent/20">
                    <div className="text-xs font-medium mb-1">{HOLOBOT_STATS[holobotKey]?.name || holobotKey}</div>
                    <Progress value={getCooldownProgress(holobotKey)} className="h-2 mb-1" />
                    <div className="text-xs text-right">{getCooldownTimeRemaining(holobotKey)}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {showBattleBanner && (
        <QuestBattleBanner 
          isBossBattle={isBossBattle}
          playerHolobots={user?.holobots.filter(h => 
            currentBattleHolobots.some(key => 
              HOLOBOT_STATS[key]?.name.toLowerCase() === h.name.toLowerCase()
            )
          )}
          bossHolobot={HOLOBOT_STATS[currentBossHolobot]?.name || currentBossHolobot}
          onComplete={() => setShowBattleBanner(false)}
        />
      )}
      
      {showResultsScreen && (
        <QuestResultsScreen 
          isVisible={showResultsScreen}
          isSuccess={battleSuccess}
          squadHolobotKeys={user?.holobots.filter(h => 
            currentBattleHolobots.some(key => 
              HOLOBOT_STATS[key]?.name.toLowerCase() === h.name.toLowerCase()
            )
          ) || []}
          squadHolobotExp={squadExpResults}
          blueprintRewards={blueprintRewards}
          holosRewards={holosReward}
          gachaTickets={gachaTicketsReward}
          onClose={() => setShowResultsScreen(false)}
        />
      )}
    </div>
  );
};
