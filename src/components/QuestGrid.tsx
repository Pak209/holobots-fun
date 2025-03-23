
import { useState, useEffect, useMemo } from "react";
import { 
  Clock, 
  Flame, 
  Star, 
  Trophy, 
  Zap, 
  Shield, 
  Sword, 
  Target,
  Ticket, 
  FastForward,
  Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { QuestBattleBanner } from "@/components/quests/QuestBattleBanner";
import { QuestResultsScreen } from "@/components/quests/QuestResultsScreen";
import { useAuth } from "@/contexts/auth";
import { calculateExperience } from "@/integrations/supabase/client";
import { HOLOBOT_STATS } from "@/types/holobot";
import { UserHolobot } from "@/types/user";

// Quest types constants with their respective attributes
const QUEST_TYPES = {
  combat: { 
    name: "Combat", 
    icon: <Sword className="h-5 w-5 text-red-400" />,
    description: "Test your battle skills against formidable enemies",
    energyCost: 10,
    recommended: ['attack', 'health']
  },
  exploration: { 
    name: "Exploration", 
    icon: <Target className="h-5 w-5 text-blue-400" />,
    description: "Explore uncharted territories in search of rare items",
    energyCost: 15,
    recommended: ['speed', 'defense']
  },
  defense: { 
    name: "Defense", 
    icon: <Shield className="h-5 w-5 text-green-400" />,
    description: "Hold your ground against waves of opponents",
    energyCost: 20,
    recommended: ['defense', 'health']
  },
  boss: { 
    name: "Boss", 
    icon: <Trophy className="h-5 w-5 text-yellow-400" />,
    description: "Challenge a powerful boss for rare rewards",
    energyCost: 30,
    recommended: ['attack', 'health', 'speed']
  }
};

// Boss tiers with respective rewards
const BOSS_TIERS = {
  "tier1": {
    name: "Shadow Sentinel",
    level: 10,
    rewards: {
      holos: 250,
      experience: 200,
      blueprintChance: 0.3,
      gachaTickets: 1,
      expBoosters: 1
    }
  },
  "tier2": {
    name: "Void Guardian",
    level: 25,
    rewards: {
      holos: 500,
      experience: 500,
      blueprintChance: 0.5, 
      gachaTickets: 2,
      expBoosters: 2
    }
  },
  "tier3": {
    name: "Nexus Overlord",
    level: 40,
    rewards: {
      holos: 1000,
      experience: 1000,
      blueprintChance: 0.7,
      gachaTickets: 3,
      expBoosters: 3
    }
  }
};

// Quest zones with their specific attributes and level requirements
const QUEST_ZONES = {
  nexus: {
    name: "Nexus Core",
    description: "The beating heart of the digital domain",
    levelRange: [1, 15],
    background: "bg-gradient-to-br from-cyan-900/50 to-blue-900/50",
    types: ["combat", "exploration"]
  },
  vortex: {
    name: "Data Vortex",
    description: "A stormy realm of fragmented code",
    levelRange: [10, 25],
    background: "bg-gradient-to-br from-purple-900/50 to-indigo-900/50",
    types: ["exploration", "defense"]
  },
  citadel: {
    name: "Silicon Citadel",
    description: "Fortified towers of pure computational might",
    levelRange: [20, 35],
    background: "bg-gradient-to-br from-amber-900/50 to-red-900/50",
    types: ["defense", "combat"]
  },
  void: {
    name: "Binary Void",
    description: "The empty space between networks, home to digital anomalies",
    levelRange: [30, 50],
    background: "bg-gradient-to-br from-slate-900/50 to-zinc-900/50",
    types: ["combat", "exploration", "defense", "boss"]
  }
};

interface QuestSquadHolobot {
  key: string;
  name: string;
  level: number;
  image: string;
  selected: boolean;
}

export const QuestGrid = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  // State hooks
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedQuestType, setSelectedQuestType] = useState<string | null>(null);
  const [squadHolobots, setSquadHolobots] = useState<QuestSquadHolobot[]>([]);
  const [isBattleInProgress, setIsBattleInProgress] = useState(false);
  const [battleTimer, setBattleTimer] = useState(0);
  const [bossTier, setBossTier] = useState<"tier1" | "tier2" | "tier3" | null>(null);
  const [showQuestResults, setShowQuestResults] = useState(false);
  const [questSuccess, setQuestSuccess] = useState(false);
  const [questRewards, setQuestRewards] = useState<{
    holosRewards: number;
    squadHolobotExp: Array<{name: string, xp: number, levelUp: boolean, newLevel: number}>;
    blueprintRewards?: {
      holobotKey: string;
      amount: number;
    };
    expBoosterRewards?: number;
  }>({
    holosRewards: 0,
    squadHolobotExp: [],
  });
  
  // Energy percentage calculation
  const energyPercentage = user ? (user.dailyEnergy / user.maxDailyEnergy) * 100 : 0;
  
  // Calculate if player has sufficient energy for quest
  const hasEnoughEnergy = useMemo(() => {
    if (!selectedQuestType || !user) return false;
    
    const questType = QUEST_TYPES[selectedQuestType as keyof typeof QUEST_TYPES];
    return user.dailyEnergy >= questType.energyCost;
  }, [selectedQuestType, user]);
  
  // Determine if squad is correctly set up based on quest type
  const isSquadReady = useMemo(() => {
    if (!selectedQuestType) return false;
    
    const selectedCount = squadHolobots.filter(h => h.selected).length;
    return selectedQuestType === "boss" 
      ? selectedCount === 3 
      : selectedCount > 0 && selectedCount <= 3;
  }, [selectedQuestType, squadHolobots]);
  
  // Get zones accessible to player based on holobot levels
  const accessibleZones = useMemo(() => {
    if (!user?.holobots || user.holobots.length === 0) return ["nexus"];
    
    const highestLevel = Math.max(...user.holobots.map(h => h.level));
    const zones: string[] = [];
    
    Object.entries(QUEST_ZONES).forEach(([key, zone]) => {
      if (highestLevel >= zone.levelRange[0]) {
        zones.push(key);
      }
    });
    
    return zones;
  }, [user]);
  
  // Boss unlocks based on highest holobot level
  const unlockedBossTiers = useMemo(() => {
    if (!user?.holobots || user.holobots.length === 0) return [];
    
    const highestLevel = Math.max(...user.holobots.map(h => h.level));
    return Object.entries(BOSS_TIERS)
      .filter(([_, boss]) => highestLevel >= boss.level)
      .map(([key]) => key);
  }, [user]);
  
  // Initialize squad with player's holobots
  useEffect(() => {
    if (user?.holobots) {
      const holobotKeys = Object.keys(HOLOBOT_STATS);
      const sortedHolobots = [...user.holobots].sort((a, b) => b.level - a.level);
      
      const mapped = sortedHolobots.map(holobot => {
        const key = holobot.name.toLowerCase();
        return {
          key,
          name: holobot.name,
          level: holobot.level,
          image: `/src/assets/holobots/${key}.png`, // Fixed: Don't access image from HOLOBOT_STATS
          selected: false
        };
      });
      
      setSquadHolobots(mapped);
    }
  }, [user]);
  
  // Clear selections when zone changes
  useEffect(() => {
    setSelectedQuestType(null);
    setBossTier(null);
  }, [selectedZone]);
  
  // Reset holobot selections
  const resetHolobotSelections = () => {
    setSquadHolobots(prev => 
      prev.map(h => ({...h, selected: false}))
    );
  };
  
  // Handle selecting quest zone
  const handleSelectZone = (zoneKey: string) => {
    setSelectedZone(zoneKey);
    resetHolobotSelections();
  };
  
  // Handle selecting quest type
  const handleSelectQuestType = (typeKey: string) => {
    setSelectedQuestType(typeKey);
    resetHolobotSelections();
    
    if (typeKey === "boss") {
      // Auto-select highest boss tier available
      if (unlockedBossTiers.length > 0) {
        setBossTier(unlockedBossTiers[unlockedBossTiers.length - 1] as "tier1" | "tier2" | "tier3");
      }
    } else {
      setBossTier(null);
    }
  };
  
  // Handle selecting boss tier
  const handleSelectBossTier = (tier: "tier1" | "tier2" | "tier3") => {
    setBossTier(tier);
  };
  
  // Toggle holobot selection for the squad
  const toggleHolobotSelection = (holobotKey: string) => {
    const selectedCount = squadHolobots.filter(h => h.selected).length;
    
    setSquadHolobots(prev => 
      prev.map(h => {
        if (h.key === holobotKey) {
          // If we're trying to select more than allowed, prevent selection
          if (!h.selected && selectedQuestType === "boss" && selectedCount >= 3) {
            return h;
          }
          if (!h.selected && selectedQuestType !== "boss" && selectedCount >= 3) {
            return h;
          }
          
          return {...h, selected: !h.selected};
        }
        return h;
      })
    );
  };
  
  // Start quest battle
  const startBattle = () => {
    if (!selectedQuestType || !user) return;
    
    const questType = QUEST_TYPES[selectedQuestType as keyof typeof QUEST_TYPES];
    
    // Check energy cost
    if (user.dailyEnergy < questType.energyCost) {
      toast({
        title: "Not enough energy",
        description: `You need ${questType.energyCost} energy to start this quest.`,
        variant: "destructive",
      });
      return;
    }
    
    // Reduce player energy
    updateUser({
      dailyEnergy: user.dailyEnergy - questType.energyCost
    });
    
    // Start battle animation
    setIsBattleInProgress(true);
    setBattleTimer(0);
    
    // Simulate battle progress
    const battleDuration = 3; // 3 seconds
    const interval = setInterval(() => {
      setBattleTimer(prev => {
        const newValue = prev + 1;
        
        if (newValue >= battleDuration) {
          clearInterval(interval);
          finishBattle();
        }
        
        return newValue;
      });
    }, 1000);
  };
  
  // Calculate battle success chance
  const calculateBattleSuccessChance = (): number => {
    if (!selectedQuestType || !user) return 0;
    
    const selectedHolobots = squadHolobots.filter(h => h.selected);
    if (selectedHolobots.length === 0) return 0;
    
    const questType = QUEST_TYPES[selectedQuestType as keyof typeof QUEST_TYPES];
    const recommendedAttributes = questType.recommended || [];
    
    // Calculate average squad level
    const avgLevel = selectedHolobots.reduce((sum, h) => sum + h.level, 0) / selectedHolobots.length;
    
    // Base success chance based on holobot levels
    let successChance = 0.5 + (avgLevel / 100);
    
    // Boss difficulty adjustment
    if (selectedQuestType === "boss" && bossTier) {
      const bossLevel = BOSS_TIERS[bossTier].level;
      const levelDifference = avgLevel - bossLevel;
      
      // Harder boss challenges
      if (levelDifference < 0) {
        // Severe penalty for being under-leveled against a boss
        successChance += (levelDifference * 0.03);
      } else {
        // Small advantage for being over-leveled
        successChance += (levelDifference * 0.01);
      }
    }
    
    // Cap success chance between 0.1 and 0.9
    return Math.max(0.1, Math.min(0.9, successChance));
  };
  
  // Finish battle and determine outcome
  const finishBattle = () => {
    setIsBattleInProgress(false);
    
    const successChance = calculateBattleSuccessChance();
    const isSuccess = Math.random() <= successChance;
    
    // Select rewards based on quest type and success
    const selectedHolobots = squadHolobots.filter(h => h.selected);
    const expRewards: Array<{name: string, xp: number, levelUp: boolean, newLevel: number}> = [];
    let holosReward = 0;
    let blueprintReward = undefined;
    let expBoosterReward = 0;
    
    if (isSuccess) {
      // Base rewards for any quest type
      const baseExpReward = selectedQuestType === "boss" 
        ? (bossTier ? BOSS_TIERS[bossTier].rewards.experience : 200)
        : 50 + (Math.random() * 50);
      
      holosReward = selectedQuestType === "boss"
        ? (bossTier ? BOSS_TIERS[bossTier].rewards.holos : 250)
        : 50 + Math.floor(Math.random() * 50);
      
      // EXP Battle Booster rewards for boss quests
      if (selectedQuestType === "boss" && bossTier) {
        expBoosterReward = BOSS_TIERS[bossTier].rewards.expBoosters;
      }
      
      // Calculate XP for each holobot in the squad
      selectedHolobots.forEach(holobot => {
        const userHolobot = user?.holobots.find(h => h.name.toLowerCase() === holobot.key.toLowerCase());
        if (userHolobot) {
          // Calculate XP with EXP boosters if active
          const baseXP = Math.floor(baseExpReward * (1 + (Math.random() * 0.2 - 0.1)));
          
          const oldLevel = userHolobot.level;
          const oldExp = userHolobot.experience;
          const newExp = oldExp + baseXP;
          let newLevel = oldLevel;
          let levelUp = false;
          
          // Check if leveled up
          const nextLevelExp = calculateExperience(oldLevel);
          if (newExp >= nextLevelExp) {
            newLevel = oldLevel + 1;
            levelUp = true;
          }
          
          expRewards.push({
            name: userHolobot.name,
            xp: baseXP,
            levelUp,
            newLevel
          });
        }
      });
      
      // Blueprint chance for boss battles
      if (selectedQuestType === "boss" && bossTier) {
        const bpChance = BOSS_TIERS[bossTier].rewards.blueprintChance;
        if (Math.random() <= bpChance) {
          // Select a random holobot type for blueprint
          const availableHolobots = Object.keys(HOLOBOT_STATS);
          const randomHolobot = availableHolobots[Math.floor(Math.random() * availableHolobots.length)];
          const bpAmount = Math.floor(Math.random() * 2) + 1; // 1-2 blueprints
          
          blueprintReward = {
            holobotKey: randomHolobot,
            amount: bpAmount
          };
        }
      }
    } else {
      // Failed quest gives minimal rewards
      holosReward = 10 + Math.floor(Math.random() * 20);
      
      // Still give some experience for trying
      selectedHolobots.forEach(holobot => {
        const userHolobot = user?.holobots.find(h => h.name.toLowerCase() === holobot.key.toLowerCase());
        if (userHolobot) {
          const xp = Math.floor(20 * (1 + (Math.random() * 0.2 - 0.1)));
          expRewards.push({
            name: userHolobot.name,
            xp,
            levelUp: false,
            newLevel: userHolobot.level
          });
        }
      });
    }
    
    // Update quest results for display
    setQuestSuccess(isSuccess);
    setQuestRewards({
      holosRewards: holosReward,
      squadHolobotExp: expRewards,
      blueprintRewards: blueprintReward,
      expBoosterRewards: expBoosterReward
    });
    
    // Apply rewards to user account
    if (user) {
      // Update holos
      const newHolos = (user.holosTokens || 0) + holosReward;
      
      // Update holobot levels and XP
      const updatedHolobots = [...user.holobots];
      expRewards.forEach(expInfo => {
        const index = updatedHolobots.findIndex(h => h.name === expInfo.name);
        if (index !== -1) {
          updatedHolobots[index] = {
            ...updatedHolobots[index],
            level: expInfo.newLevel,
            experience: updatedHolobots[index].experience + expInfo.xp,
            nextLevelExp: calculateExperience(expInfo.newLevel)
          };
        }
      });
      
      // Update blueprint counts if blueprints were earned
      let updatedBlueprints = {...(user.blueprints || {})};
      if (blueprintReward) {
        const currentAmount = updatedBlueprints[blueprintReward.holobotKey] || 0;
        updatedBlueprints[blueprintReward.holobotKey] = currentAmount + blueprintReward.amount;
      }
      
      // Update EXP boosters if earned
      let updatedExpBoosters = user.exp_boosters || 0;
      if (expBoosterReward > 0) {
        updatedExpBoosters += expBoosterReward;
        
        // Show toast for exp boosters
        toast({
          title: `Earned ${expBoosterReward} EXP Battle Boosters!`,
          description: "Use them in your items inventory to double battle experience!",
        });
      }
      
      // Save all updates to user profile
      updateUser({
        holosTokens: newHolos,
        holobots: updatedHolobots,
        blueprints: updatedBlueprints,
        exp_boosters: updatedExpBoosters
      });
    }
    
    // Show results screen
    setShowQuestResults(true);
  };
  
  // Close quest results screen
  const handleCloseResults = () => {
    setShowQuestResults(false);
    resetHolobotSelections();
  };
  
  // Calculate battle progress percentage
  const battleProgressPercentage = (battleTimer / 3) * 100;
  
  // Helper function to get all quest types for a zone
  const getQuestTypesForZone = (zoneKey: string) => {
    return QUEST_ZONES[zoneKey as keyof typeof QUEST_ZONES]?.types || [];
  };
  
  return (
    <div className="space-y-6">
      {/* Energy Bar */}
      <div className="bg-holobots-card/60 backdrop-blur-sm rounded-lg p-4 border border-holobots-accent/30">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Daily Energy</span>
          <span className="text-sm text-gray-300">
            {user?.dailyEnergy || 0}/{user?.maxDailyEnergy || 100}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Zap className="h-5 w-5 text-yellow-400" />
          <Progress value={energyPercentage} className="h-2 flex-grow" />
        </div>
      </div>
      
      {/* Available Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Blueprint Info Card - show on Quests page */}
        <Card className="glass-morphism border-holobots-accent/30 bg-black/20">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ticket className="h-4 w-4 text-purple-400" />
              Boss Quest Passes
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 text-xs">
            <p className="mb-2">Available Passes: <span className="text-purple-400 font-bold">{user?.boss_quest_passes || 0}</span></p>
            
            <p className="text-[10px] text-gray-400">
              Boss Quest Passes allow you to challenge bosses without spending energy.
            </p>
            <p className="mt-1 text-[10px] text-gray-400">
              Buy passes from the Marketplace!
            </p>
          </CardContent>
        </Card>
            
        {/* EXP Boosters Info Card */}
        <Card className="glass-morphism border-holobots-accent/30 bg-black/20">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FastForward className="h-4 w-4 text-blue-400" />
              EXP Battle Boosters
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 text-xs">
            <p className="mb-2">Available Boosters: <span className="text-blue-400 font-bold">{user?.exp_boosters || 0}</span></p>
            
            <p className="text-[10px] text-gray-400">
              EXP Battle Boosters double experience gained from battles for 24 hours.
            </p>
            <p className="mt-1 text-[10px] text-gray-400">
              Earn boosters from Boss Quests!
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Locked Zones Message */}
      {!selectedZone && accessibleZones.length < Object.keys(QUEST_ZONES).length && (
        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-200">
            <Flame className="inline h-4 w-4 mr-1" />
            Level up your Holobots to unlock more quest zones!
          </p>
        </div>
      )}
      
      {/* Quest Zone Selection */}
      {!selectedZone ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(QUEST_ZONES).map(([key, zone]) => {
            const isAccessible = accessibleZones.includes(key);
            
            return (
              <Card 
                key={key}
                className={`${zone.background} backdrop-blur-sm relative overflow-hidden border ${
                  isAccessible ? 'border-holobots-accent/30 cursor-pointer hover:shadow-neon transition-all' : 'border-gray-600/30 opacity-60'
                }`}
                onClick={() => isAccessible && handleSelectZone(key)}
              >
                {!isAccessible && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Lock className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-300 font-semibold">
                      Unlock at Level {zone.levelRange[0]}
                    </p>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle>{zone.name}</CardTitle>
                  <CardDescription className="text-white/80">
                    {zone.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="text-sm text-white/90">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>Level {zone.levelRange[0]}-{zone.levelRange[1]}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {zone.types.map(type => (
                        <Badge key={type} className="bg-holobots-accent/30">
                          {QUEST_TYPES[type as keyof typeof QUEST_TYPES].icon}
                          <span className="ml-1">
                            {QUEST_TYPES[type as keyof typeof QUEST_TYPES].name}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full bg-holobots-accent hover:bg-holobots-hover text-black"
                    disabled={!isAccessible}
                  >
                    {isAccessible ? 'Select Zone' : 'Locked'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : !selectedQuestType ? (
        /* Quest Type Selection - only show quest types for selected zone */
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {QUEST_ZONES[selectedZone as keyof typeof QUEST_ZONES].name}
            </h2>
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white"
              onClick={() => setSelectedZone(null)}
            >
              Back to Zones
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getQuestTypesForZone(selectedZone).map(questType => {
              const quest = QUEST_TYPES[questType as keyof typeof QUEST_TYPES];
              const isBossQuest = questType === "boss";
              
              const energyRequirement = (
                <div className="flex items-center gap-1 text-sm">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span>{quest.energyCost} Energy</span>
                </div>
              );
              
              return (
                <Card 
                  key={questType}
                  className="bg-holobots-card/60 backdrop-blur-sm border border-holobots-accent/30 hover:shadow-neon cursor-pointer transition-all"
                  onClick={() => handleSelectQuestType(questType)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        {quest.icon}
                        {quest.name} Quest
                      </CardTitle>
                      {isBossQuest && (
                        <Badge className="bg-yellow-600">
                          <Trophy className="h-3 w-3 mr-1" />
                          BOSS
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {quest.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Energy cost */}
                      {energyRequirement}
                      
                      {/* Recommended attributes */}
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-blue-400" />
                        <span>Recommended:</span>
                        <div className="flex gap-1 ml-1">
                          {quest.recommended.map(attr => (
                            <Badge key={attr} variant="outline" className="text-[10px] py-0 px-1 capitalize">
                              {attr}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Boss tier info if boss quest */}
                      {isBossQuest && (
                        <div className="mt-2 border-t border-gray-700/50 pt-2">
                          <p className="text-sm mb-2">Available Boss Challenges:</p>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(BOSS_TIERS).map(([tier, boss]) => {
                              const isUnlocked = unlockedBossTiers.includes(tier);
                              
                              return (
                                <Badge 
                                  key={tier}
                                  className={`flex items-center justify-center py-1 ${
                                    isUnlocked 
                                      ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/50' 
                                      : 'bg-gray-900/30 text-gray-500 border-gray-700/50'
                                  }`}
                                >
                                  {!isUnlocked && <Lock className="h-3 w-3 mr-1" />}
                                  <span>Lv.{boss.level}</span>
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full bg-holobots-accent hover:bg-holobots-hover text-black"
                    >
                      Select Quest
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* Squad Selection and Quest Start */
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">
                {QUEST_TYPES[selectedQuestType as keyof typeof QUEST_TYPES].name} Quest
              </h2>
              <p className="text-sm text-gray-400">
                Select up to {selectedQuestType === "boss" ? "exactly 3" : "3"} Holobots for your squad
              </p>
            </div>
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white"
              onClick={() => setSelectedQuestType(null)}
            >
              Back to Quests
            </Button>
          </div>
          
          {/* Boss tier selection if it's a boss quest */}
          {selectedQuestType === "boss" && (
            <div className="mb-6 bg-holobots-card/60 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
                Boss Challenge
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(BOSS_TIERS).map(([tier, boss]) => {
                  const isUnlocked = unlockedBossTiers.includes(tier);
                  const isSelected = bossTier === tier;
                  
                  return (
                    <Card 
                      key={tier}
                      className={`border ${
                        !isUnlocked 
                          ? 'bg-gray-900/30 border-gray-700/50 opacity-60' 
                          : isSelected
                            ? 'bg-yellow-900/30 border-yellow-500/50 shadow-neon-yellow'
                            : 'bg-holobots-card/60 border-holobots-accent/30 cursor-pointer hover:shadow-neon'
                      }`}
                      onClick={() => isUnlocked && handleSelectBossTier(tier as "tier1" | "tier2" | "tier3")}
                    >
                      <CardHeader className="p-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{boss.name}</CardTitle>
                          {!isUnlocked && <Lock className="h-4 w-4 text-gray-500" />}
                        </div>
                        <CardDescription>Level {boss.level}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="p-3 pt-0">
                        <div className="text-xs">
                          <div className="flex items-center gap-1 mt-1">
                            <Coins className="h-3 w-3 text-yellow-400" />
                            <span>{boss.rewards.holos} Holos</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-blue-400" />
                            <span>{boss.rewards.experience} EXP</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Ticket className="h-3 w-3 text-purple-400" />
                            <span>{boss.rewards.gachaTickets} Gacha Tickets</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Holobot Squad Selection */}
          <div className="bg-holobots-card/60 backdrop-blur-sm rounded-lg p-4 border border-holobots-accent/30 mb-6">
            <h3 className="text-lg font-semibold mb-3">Squad Selection</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {squadHolobots.map(holobot => (
                <div 
                  key={holobot.key}
                  className={`p-2 rounded-lg cursor-pointer transition-all ${
                    holobot.selected 
                      ? 'bg-holobots-accent/20 border border-holobots-accent shadow-neon' 
                      : 'bg-black/30 border border-gray-700 hover:border-holobots-accent/50'
                  }`}
                  onClick={() => toggleHolobotSelection(holobot.key)}
                >
                  <div className="relative">
                    <img 
                      src={`/src/assets/holobots/${holobot.key}.png`} 
                      alt={holobot.name}
                      className="w-full h-24 object-contain"
                    />
                    {holobot.selected && (
                      <div className="absolute top-0 right-0 bg-holobots-accent text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <div className="font-semibold text-sm truncate">{holobot.name}</div>
                    <div className="text-xs text-gray-300">Level {holobot.level}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Battle Button */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-300">
                Success Chance: <span className="font-bold text-holobots-accent">
                  {Math.round(calculateBattleSuccessChance() * 100)}%
                </span>
              </p>
            </div>
            
            <Button
              className="bg-holobots-accent hover:bg-holobots-hover text-black w-full max-w-xs"
              onClick={startBattle}
              disabled={!isSquadReady || !hasEnoughEnergy}
            >
              {!isSquadReady
                ? `Select ${selectedQuestType === "boss" ? "3" : "at least 1"} Holobots`
                : !hasEnoughEnergy
                  ? "Not enough energy"
                  : "Start Quest"
              }
            </Button>
          </div>
          
          {/* Battle Animation */}
          {isBattleInProgress && (
            <QuestBattleBanner
              squadHolobotKeys={squadHolobots.filter(h => h.selected).map(h => h.key)}
              bossHolobotKey={bossTier ? BOSS_TIERS[bossTier].name.toLowerCase().replace(/\s+/g, "") : ""}
              progress={battleProgressPercentage}
            />
          )}
          
          {/* Results Screen */}
          {showQuestResults && (
            <QuestResultsScreen
              success={questSuccess}
              rewards={questRewards}
              onClose={handleCloseResults}
            />
          )}
        </div>
      )}
    </div>
  );
};
