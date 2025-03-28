
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";
import { QuestBattleBanner } from "./quests/QuestBattleBanner";
import { QuestResultsScreen } from "./quests/QuestResultsScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HOLOBOT_STATS } from "@/types/holobot";
import { Trophy, Sword, Shield, FlaskConical, Crown } from "lucide-react";

// Define exploration tiers
const EXPLORATION_TIERS = {
  easy: {
    name: "Basic",
    energyCost: 10,
    rewards: {
      holosTokens: 15,
      blueprintPieces: 1
    }
  },
  normal: {
    name: "Standard",
    energyCost: 20,
    rewards: {
      holosTokens: 30,
      blueprintPieces: 2
    }
  },
  hard: {
    name: "Advanced",
    energyCost: 30,
    rewards: {
      holosTokens: 50,
      blueprintPieces: 3
    }
  }
};

// Define boss tiers
const BOSS_TIERS = {
  easy: {
    name: "Rookie",
    energyCost: 15,
    rewards: {
      holosTokens: 25,
      blueprintPieces: 2
    }
  },
  normal: {
    name: "Veteran",
    energyCost: 30,
    rewards: {
      holosTokens: 50,
      blueprintPieces: 4
    }
  },
  hard: {
    name: "Elite",
    energyCost: 45,
    rewards: {
      holosTokens: 80,
      blueprintPieces: 6
    }
  }
};

export const QuestGrid = () => {
  const { user, updateUser } = useAuth();
  
  // Exploration state
  const [explorationHolobot, setExplorationHolobot] = useState<string | null>(null);
  const [selectedExplorationTier, setSelectedExplorationTier] = useState<"easy" | "normal" | "hard">("easy");
  const [isExplorationQuesting, setIsExplorationQuesting] = useState(false);
  
  // Boss battle state
  const [bossHolobot, setBossHolobot] = useState<string>("glitch");
  const [selectedBossTier, setSelectedBossTier] = useState<"easy" | "normal" | "hard">("easy");
  const [isBossQuesting, setIsBossQuesting] = useState(false);
  
  // Squad selection
  const [squadHolobots, setSquadHolobots] = useState<string[]>([]);
  
  // Battle and results state
  const [showBattleBanner, setShowBattleBanner] = useState(false);
  const [isBossBattle, setIsBossBattle] = useState(false);
  const [currentBattleHolobots, setCurrentBattleHolobots] = useState<string[]>([]);
  const [currentBossHolobot, setCurrentBossHolobot] = useState<string>("");
  const [battleSuccess, setBattleSuccess] = useState(false);
  const [showResultsScreen, setShowResultsScreen] = useState(false);
  const [squadExpResults, setSquadExpResults] = useState<Array<{
    name: string;
    xp: number;
    levelUp: boolean;
    newLevel: number;
  }>>([]);
  const [blueprintReward, setBlueprintReward] = useState<{
    holobotKey: string;
    amount: number;
  } | undefined>(undefined);
  const [holosReward, setHolosReward] = useState(0);
  
  // Holobot cooldown
  const [holobotsOnCooldown, setHolobotsOnCooldown] = useState<string[]>([]);
  
  const setHolobotOnCooldown = (holobotKey: string) => {
    setHolobotsOnCooldown(prev => [...prev, holobotKey]);
    
    // Remove from cooldown after 60 seconds
    setTimeout(() => {
      setHolobotsOnCooldown(prev => prev.filter(h => h !== holobotKey));
    }, 60000);
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
      toast({
        title: "Error",
        description: "An error occurred during the quest",
        variant: "destructive"
      });
    } finally {
      setIsExplorationQuesting(false);
    }
  };

  // Start boss quest
  const handleStartBossBattle = async () => {
    if (squadHolobots.length === 0) {
      toast({
        title: "Select Holobots",
        description: "Please select at least one Holobot for your squad",
        variant: "destructive"
      });
      return;
    }

    const tier = BOSS_TIERS[selectedBossTier];
    
    if (user?.dailyEnergy < tier.energyCost) {
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
    setCurrentBattleHolobots(squadHolobots);
    setCurrentBossHolobot(bossHolobot);
    setShowBattleBanner(true);
    
    try {
      // Wait for battle banner to complete
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Determine success (60% success rate for boss battles)
      const isSuccess = Math.random() < 0.6;
      
      if (isSuccess) {
        // Update user's tokens and energy
        if (user) {
          // Get current blueprints or initialize empty object
          const currentBlueprints = user.blueprints || {};
          
          // For boss battles, the blueprint is always of the boss type
          const updatedBlueprints = {
            ...currentBlueprints,
            [bossHolobot]: (currentBlueprints[bossHolobot] || 0) + tier.rewards.blueprintPieces
          };
          
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost,
            holosTokens: user.holosTokens + tier.rewards.holosTokens,
            blueprints: updatedBlueprints
          });
          
          // Calculate XP for squad members (10-20 XP per battle)
          const squadExpData = squadHolobots.map(holobotKey => {
            const holobotName = HOLOBOT_STATS[holobotKey]?.name || "";
            const userHolobot = user.holobots.find(h => h.name === holobotName);
            
            if (!userHolobot) return {
              name: holobotName,
              xp: 0,
              levelUp: false,
              newLevel: 1
            };
            
            const xpGained = Math.floor(Math.random() * 11) + 10; // 10-20 XP
            const currentExp = userHolobot.experience || 0;
            const currentLevel = userHolobot.level || 1;
            const nextLevelExp = userHolobot.nextLevelExp || 100;
            
            const totalExp = currentExp + xpGained;
            const levelUp = totalExp >= nextLevelExp;
            const newLevel = levelUp ? currentLevel + 1 : currentLevel;
            
            return {
              name: holobotName,
              xp: xpGained,
              levelUp,
              newLevel
            };
          });
          
          // Set up results screen data
          setBattleSuccess(true);
          setSquadExpResults(squadExpData);
          setBlueprintReward({
            holobotKey: bossHolobot,
            amount: tier.rewards.blueprintPieces
          });
          setHolosReward(tier.rewards.holosTokens);
          setShowResultsScreen(true);
        }
      } else {
        // Set squad holobots on cooldown
        squadHolobots.forEach(holobotKey => {
          setHolobotOnCooldown(holobotKey);
        });
        
        // Update user's energy
        if (user) {
          await updateUser({
            dailyEnergy: user.dailyEnergy - tier.energyCost
          });
        }
        
        // Set up results screen for failure
        setBattleSuccess(false);
        setSquadExpResults(squadHolobots.map(holobotKey => {
          const holobotName = HOLOBOT_STATS[holobotKey]?.name || "";
          const userHolobot = user?.holobots.find(h => h.name === holobotName);
          
          return {
            name: holobotName,
            xp: 0,
            levelUp: false,
            newLevel: userHolobot?.level || 1
          };
        }));
        setBlueprintReward(undefined);
        setHolosReward(0);
        setShowResultsScreen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during the quest",
        variant: "destructive"
      });
    } finally {
      setIsBossQuesting(false);
    }
  };

  const selectExplorationHolobot = (holobotKey: string) => {
    setExplorationHolobot(explorationHolobot === holobotKey ? null : holobotKey);
  };

  const toggleSquadHolobot = (holobotKey: string) => {
    setSquadHolobots(prev => {
      if (prev.includes(holobotKey)) {
        return prev.filter(key => key !== holobotKey);
      } else {
        return [...prev, holobotKey];
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Quest Types Tabs */}
      <Tabs defaultValue="exploration" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exploration" className="flex items-center gap-2">
            <Sword className="h-4 w-4" />
            Exploration
          </TabsTrigger>
          <TabsTrigger value="boss" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Boss Battles
          </TabsTrigger>
        </TabsList>
        
        {/* Exploration Tab Content */}
        <TabsContent value="exploration" className="mt-4 space-y-4">
          <Card className="glass-morphism bg-black/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sword className="h-5 w-5 text-holobots-accent" />
                Exploration Quest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">
                  Send one Holobot on an exploration quest to gather blueprints and Holos tokens.
                </p>
                
                {/* Tier Selection */}
                <div className="flex flex-wrap gap-2 my-3">
                  {Object.entries(EXPLORATION_TIERS).map(([key, tier]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant={selectedExplorationTier === key ? "default" : "outline"}
                      className={`flex-1 min-w-[80px] ${selectedExplorationTier === key ? 'bg-holobots-accent hover:bg-holobots-hover' : ''}`}
                      onClick={() => setSelectedExplorationTier(key as "easy" | "normal" | "hard")}
                      disabled={isExplorationQuesting}
                    >
                      <div className="text-center w-full">
                        <div>{tier.name}</div>
                        <div className="text-xs flex justify-center gap-1 items-center mt-1">
                          <FlaskConical className="h-3 w-3" />
                          {tier.energyCost}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                {/* Holobot Selection Grid */}
                <div className="grid grid-cols-4 gap-2 my-4">
                  {Object.entries(HOLOBOT_STATS).map(([key, holobot]) => {
                    const userHasHolobot = user?.holobots?.some(h => h.name === holobot.name);
                    const isOnCooldown = holobotsOnCooldown.includes(key);
                    
                    return (
                      <div 
                        key={key}
                        className={`relative p-1 rounded-lg border cursor-pointer transition-all ${
                          !userHasHolobot ? 'opacity-40 border-gray-700 cursor-not-allowed' :
                          isOnCooldown ? 'opacity-50 border-red-800 cursor-not-allowed' :
                          explorationHolobot === key ? 'border-holobots-accent bg-holobots-accent/20' : 
                          'border-gray-700 hover:border-holobots-accent/60'
                        }`}
                        onClick={() => {
                          if (userHasHolobot && !isOnCooldown && !isExplorationQuesting) {
                            selectExplorationHolobot(key);
                          }
                        }}
                      >
                        <div className="aspect-square rounded-md overflow-hidden bg-holobots-dark-background">
                          <img 
                            src={`/lovable-uploads/${key}.png`} 
                            alt={holobot.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-[10px] mt-1 text-center truncate">{holobot.name}</div>
                        
                        {isOnCooldown && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                            <div className="text-xs text-red-400">Cooldown</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Selected Exploration Info */}
                {explorationHolobot && (
                  <div className="mt-4 p-2 rounded-lg border border-holobots-accent/40 bg-black/30">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-holobots-dark-background">
                        <img 
                          src={`/lovable-uploads/${explorationHolobot}.png`} 
                          alt={HOLOBOT_STATS[explorationHolobot]?.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{HOLOBOT_STATS[explorationHolobot]?.name}</div>
                        <div className="text-xs text-holobots-accent">{EXPLORATION_TIERS[selectedExplorationTier].name} Exploration</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Start Exploration Button */}
                <div className="mt-4">
                  <Button 
                    className="w-full bg-holobots-accent hover:bg-holobots-hover"
                    onClick={handleStartExploration}
                    disabled={!explorationHolobot || isExplorationQuesting || !user}
                  >
                    {isExplorationQuesting ? 'Exploring...' : 'Start Exploration'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Boss Battle Tab Content */}
        <TabsContent value="boss" className="mt-4 space-y-4">
          <Card className="glass-morphism bg-black/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-holobots-accent" />
                Boss Battle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">
                  Assemble a squad of Holobots to battle a powerful boss and earn exclusive rewards.
                </p>
                
                {/* Tier Selection */}
                <div className="flex flex-wrap gap-2 my-3">
                  {Object.entries(BOSS_TIERS).map(([key, tier]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant={selectedBossTier === key ? "default" : "outline"}
                      className={`flex-1 min-w-[80px] ${selectedBossTier === key ? 'bg-holobots-accent hover:bg-holobots-hover' : ''}`}
                      onClick={() => setSelectedBossTier(key as "easy" | "normal" | "hard")}
                      disabled={isBossQuesting}
                    >
                      <div className="text-center w-full">
                        <div>{tier.name}</div>
                        <div className="text-xs flex justify-center gap-1 items-center mt-1">
                          <FlaskConical className="h-3 w-3" />
                          {tier.energyCost}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                {/* Boss Selection */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Select Boss:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {["glitch", "volt", "zeta"].map(bossKey => (
                      <div 
                        key={bossKey}
                        className={`p-1 rounded-lg border cursor-pointer transition-all ${
                          bossHolobot === bossKey ? 'border-holobots-accent bg-holobots-accent/20' : 
                          'border-gray-700 hover:border-holobots-accent/60'
                        }`}
                        onClick={() => !isBossQuesting && setBossHolobot(bossKey)}
                      >
                        <div className="aspect-square rounded-md overflow-hidden bg-holobots-dark-background">
                          <img 
                            src={`/lovable-uploads/${bossKey}.png`} 
                            alt={HOLOBOT_STATS[bossKey]?.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-xs mt-1 text-center">{HOLOBOT_STATS[bossKey]?.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Squad Selection */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Select Squad (1-3 Holobots):</div>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(HOLOBOT_STATS).map(([key, holobot]) => {
                      const userHasHolobot = user?.holobots?.some(h => h.name === holobot.name);
                      const isOnCooldown = holobotsOnCooldown.includes(key);
                      const isSelected = squadHolobots.includes(key);
                      
                      return (
                        <div 
                          key={key}
                          className={`relative p-1 rounded-lg border cursor-pointer transition-all ${
                            !userHasHolobot ? 'opacity-40 border-gray-700 cursor-not-allowed' :
                            isOnCooldown ? 'opacity-50 border-red-800 cursor-not-allowed' :
                            isSelected ? 'border-holobots-accent bg-holobots-accent/20' : 
                            'border-gray-700 hover:border-holobots-accent/60'
                          }`}
                          onClick={() => {
                            if (userHasHolobot && !isOnCooldown && !isBossQuesting) {
                              toggleSquadHolobot(key);
                            }
                          }}
                        >
                          <div className="aspect-square rounded-md overflow-hidden bg-holobots-dark-background">
                            <img 
                              src={`/lovable-uploads/${key}.png`} 
                              alt={holobot.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="text-[10px] mt-1 text-center truncate">{holobot.name}</div>
                          
                          {isOnCooldown && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                              <div className="text-xs text-red-400">Cooldown</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Selected Squad Info */}
                {squadHolobots.length > 0 && (
                  <div className="mt-4 p-2 rounded-lg border border-holobots-accent/40 bg-black/30">
                    <div className="text-xs font-medium mb-2">Selected Squad:</div>
                    <div className="flex gap-2">
                      {squadHolobots.map((holobotKey) => (
                        <div key={holobotKey} className="w-12 h-12 rounded-lg overflow-hidden bg-holobots-dark-background">
                          <img 
                            src={`/lovable-uploads/${holobotKey}.png`} 
                            alt={HOLOBOT_STATS[holobotKey]?.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Start Boss Battle Button */}
                <div className="mt-4">
                  <Button 
                    className="w-full bg-holobots-accent hover:bg-holobots-hover"
                    onClick={handleStartBossBattle}
                    disabled={squadHolobots.length === 0 || isBossQuesting || !user}
                  >
                    {isBossQuesting ? 'Battling...' : 'Start Boss Battle'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Battle Banner (shows during battles) */}
      {showBattleBanner && (
        <QuestBattleBanner
          isVisible={showBattleBanner}
          isBossQuest={isBossBattle}
          squadHolobotKeys={currentBattleHolobots}
          bossHolobotKey={currentBossHolobot}
          difficulty={isBossBattle ? selectedBossTier : selectedExplorationTier}
          onComplete={() => setShowBattleBanner(false)}
        />
      )}
      
      {/* Results Screen (shows after battle completion) */}
      {showResultsScreen && (
        <QuestResultsScreen
          isVisible={showResultsScreen}
          isSuccess={battleSuccess}
          squadHolobotKeys={currentBattleHolobots}
          squadHolobotExp={squadExpResults}
          blueprintRewards={blueprintReward}
          holosRewards={holosReward}
          onClose={() => setShowResultsScreen(false)}
        />
      )}
    </div>
  );
};
