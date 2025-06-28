import { useState, useEffect } from 'react';
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS } from "@/types/holobot";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Swords, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { calculateBattleExperience, updateHolobotExperience } from "@/utils/battleUtils";
import { useHolobotPartsStore } from "@/stores/holobotPartsStore";
import { useRewardTracking } from "@/hooks/useRewardTracking";

// CPU difficulty levels
const DIFFICULTY_LEVELS = {
  easy: { level: 5, xpMultiplier: 1, energyCost: 5 },
  medium: { level: 15, xpMultiplier: 2, energyCost: 10 },
  hard: { level: 25, xpMultiplier: 3, energyCost: 15 },
  expert: { level: 35, xpMultiplier: 4, energyCost: 20 }
};

const Training = () => {
  const [selectedHolobot, setSelectedHolobot] = useState<string>('');
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<keyof typeof DIFFICULTY_LEVELS>('easy');
  const [isBattling, setIsBattling] = useState(false);
  const [battleResult, setBattleResult] = useState<{
    won: boolean;
    xpGained: number;
    message: string;
  } | null>(null);

  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const { getEquippedParts } = useHolobotPartsStore();
  const { trackTrainingSession } = useRewardTracking();

  // Reset battle result when selections change
  useEffect(() => {
    setBattleResult(null);
  }, [selectedHolobot, selectedOpponent, selectedDifficulty]);

  // Find the selected holobot from user's holobots array
  const getSelectedHolobotObject = () => {
    if (!user?.holobots || !selectedHolobot) return null;
    return user.holobots.find(h => h.name.toLowerCase() === HOLOBOT_STATS[selectedHolobot].name.toLowerCase());
  };

  // Get the holobot key from HOLOBOT_STATS based on name
  const getHolobotKeyByName = (name: string): string => {
    const lowerName = name.toLowerCase();
    const key = Object.keys(HOLOBOT_STATS).find(
      k => HOLOBOT_STATS[k].name.toLowerCase() === lowerName
    );
    return key || Object.keys(HOLOBOT_STATS)[0]; // fallback to first holobot if not found
  };

  // Apply attribute boosts and parts bonuses from user's holobot
  const applyAllBoosts = (baseStats, userHolobot) => {
    if (!baseStats) return baseStats;
    
    let boostedStats = { ...baseStats };
    
    // Apply attribute boosts from leveling up
    if (userHolobot?.boostedAttributes) {
      boostedStats.attack += userHolobot.boostedAttributes.attack || 0;
      boostedStats.defense += userHolobot.boostedAttributes.defense || 0;
      boostedStats.speed += userHolobot.boostedAttributes.speed || 0;
      boostedStats.maxHealth += userHolobot.boostedAttributes.health || 0;
    }
    
    // Apply parts bonuses
    const equippedParts = getEquippedParts(baseStats.name);
    if (equippedParts) {
      Object.values(equippedParts).forEach((part: any) => {
        if (part?.baseStats) {
          boostedStats.attack += part.baseStats.attack || 0;
          boostedStats.defense += part.baseStats.defense || 0;
          boostedStats.speed += part.baseStats.speed || 0;
          boostedStats.intelligence = (boostedStats.intelligence || 0) + (part.baseStats.intelligence || 0);
        }
      });
    }
    
    return boostedStats;
  };

  const handleStartTraining = async () => {
    if (!selectedHolobot || !selectedOpponent) {
      toast({
        title: "Error",
        description: "Please select both holobots",
        variant: "destructive"
      });
      return;
    }

    const difficulty = DIFFICULTY_LEVELS[selectedDifficulty];
    
    try {
      // Check if user has enough energy
      if ((user?.dailyEnergy || 0) < difficulty.energyCost) {
        throw new Error('Not enough energy for training');
      }
      
      // Use energy - properly update the user's dailyEnergy
      if (user) {
        await updateUser({ 
          dailyEnergy: Math.max(0, user.dailyEnergy - difficulty.energyCost)
        });
      }

      setIsBattling(true);

      // Simulate battle (we'll implement actual battle logic later)
      const battleDuration = Math.random() * 2000 + 1000; // 1-3 seconds
      await new Promise(resolve => setTimeout(resolve, battleDuration));

      // Get the player's selected holobot
      const playerHolobot = getSelectedHolobotObject();
      
      if (!playerHolobot) {
        throw new Error('Selected holobot not found');
      }

      const won = Math.random() > 0.4; // 60% win rate in training
      const baseXp = calculateBattleExperience(
        playerHolobot.level || 1,
        DIFFICULTY_LEVELS[selectedDifficulty].level
      );
      const xpGained = Math.floor(baseXp * difficulty.xpMultiplier);

      // Update XP for the holobot if won
      if (won && user) {
        const currentExperience = playerHolobot.experience || 0;
        const newExperience = currentExperience + xpGained;
        const nextLevelExp = playerHolobot.nextLevelExp || 100;
        
        // Check if holobot leveled up
        let newLevel = playerHolobot.level || 1;
        if (newExperience >= nextLevelExp) {
          newLevel += 1;
        }
        
        // Use the shared helper function to update holobots
        const updatedHolobots = updateHolobotExperience(
          user.holobots,
          playerHolobot.name,
          newExperience,
          newLevel
        );
        
        console.log("Updating holobots after training:", updatedHolobots);
        
        await updateUser({ holobots: updatedHolobots });
      }

      // Set battle result
      setBattleResult({
        won,
        xpGained: won ? xpGained : 0,
        message: won 
          ? `Victory! Gained ${xpGained} XP!` 
          : 'Defeat. No XP gained.'
      });

      // Show toast
      toast({
        title: won ? "Victory!" : "Defeat",
        description: won 
          ? `Your holobot gained ${xpGained} XP!`
          : "Keep training to get stronger!",
        variant: won ? "default" : "destructive"
      });

      // Track training session completion
      trackTrainingSession();

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start training",
        variant: "destructive"
      });
    } finally {
      setIsBattling(false);
    }
  };

  // Get the user's holobot with boosted attributes
  const userHolobot = getSelectedHolobotObject();
  
  // Get opponent holobot from user's collection if they own it
  const getOpponentHolobotObject = () => {
    if (!user?.holobots || !selectedOpponent) return null;
    return user.holobots.find(h => h.name.toLowerCase() === HOLOBOT_STATS[selectedOpponent].name.toLowerCase());
  };
  
  const opponentUserHolobot = getOpponentHolobotObject();
  
  // Get base stats for the selected holobot
  const baseStats = selectedHolobot ? HOLOBOT_STATS[selectedHolobot] : null;
  const opponentBaseStats = selectedOpponent ? HOLOBOT_STATS[selectedOpponent] : null;
  
  // Apply all boosts (attributes + parts) if available
  const boostedStats = baseStats && userHolobot 
    ? applyAllBoosts(baseStats, userHolobot)
    : baseStats;
    
  // Scale opponent stats based on difficulty
  const scaleOpponentStats = (baseStats, difficultyLevel: number) => {
    if (!baseStats) return baseStats;
    
    const scaleFactor = difficultyLevel / 10; // Scale factor based on difficulty level
    
    return {
      ...baseStats,
      level: difficultyLevel,
      maxHealth: Math.floor(baseStats.maxHealth * (1 + scaleFactor * 0.3)),
      attack: Math.floor(baseStats.attack * (1 + scaleFactor * 0.25)),
      defense: Math.floor(baseStats.defense * (1 + scaleFactor * 0.25)),
      speed: Math.floor(baseStats.speed * (1 + scaleFactor * 0.2))
    };
  };

  // Apply boosts to opponent if user owns that holobot, then scale with difficulty
  let opponentBoostedStats = opponentBaseStats && opponentUserHolobot
    ? applyAllBoosts(opponentBaseStats, opponentUserHolobot)
    : opponentBaseStats;
    
  // Scale opponent stats based on selected difficulty
  const difficultyLevel = DIFFICULTY_LEVELS[selectedDifficulty].level;
  opponentBoostedStats = scaleOpponentStats(opponentBoostedStats, difficultyLevel);

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <div className="max-w-7xl mx-auto pt-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-cyan-400 mb-4 animate-pulse font-orbitron italic">
            TRAINING GROUNDS
          </h1>
          <p className="text-gray-400 text-sm mb-4">
            Train your Holobots and gain experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Player Holobot Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-red-400 mb-4 font-orbitron italic">
              Select Your Holobot
            </h2>
            
            <Select
              value={selectedHolobot}
              onValueChange={setSelectedHolobot}
            >
              <SelectTrigger className="w-full bg-[#1A1F2C] text-white border-holobots-border">
                <SelectValue placeholder="Choose your holobot" />
              </SelectTrigger>
              <SelectContent className="bg-holobots-card border-holobots-border">
                {Object.keys(HOLOBOT_STATS).map((key) => {
                  const holobot = HOLOBOT_STATS[key];
                  const userOwnsHolobot = user?.holobots?.some(
                    h => h.name.toLowerCase() === holobot.name.toLowerCase()
                  );
                  
                  // Only show holobots the user owns
                  if (!userOwnsHolobot) return null;
                  
                  return (
                    <SelectItem key={key} value={key}>
                      {holobot.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {selectedHolobot && (
              <div className="mt-4">
                <HolobotCard
                  stats={{
                    ...boostedStats,
                    name: userHolobot?.name || HOLOBOT_STATS[selectedHolobot].name,
                    level: userHolobot?.level || 1
                  }}
                  variant="blue"
                />
              </div>
            )}
          </div>
          
          {/* Opponent Holobot Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-red-400 mb-4 font-orbitron italic">
              Select Opponent
            </h2>
            
            <Select
              value={selectedOpponent}
              onValueChange={setSelectedOpponent}
            >
              <SelectTrigger className="w-full bg-[#1A1F2C] text-white border-holobots-border">
                <SelectValue placeholder="Choose opponent" />
              </SelectTrigger>
              <SelectContent className="bg-holobots-card border-holobots-border">
                {Object.keys(HOLOBOT_STATS).map((key) => (
                  <SelectItem key={key} value={key}>
                    {HOLOBOT_STATS[key].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedOpponent && (
              <div className="mt-4">
                <HolobotCard
                  stats={{
                    ...(opponentBoostedStats || HOLOBOT_STATS[selectedOpponent]),
                    name: opponentUserHolobot?.name || HOLOBOT_STATS[selectedOpponent].name,
                    level: opponentBoostedStats?.level || difficultyLevel
                  }}
                  variant="red"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Difficulty Selection */}
        <Card className="p-6 mb-8 bg-[#1A1F2C] border border-holobots-border">
          <h3 className="text-lg font-bold text-cyan-400 mb-4 font-orbitron italic">Select Difficulty</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(DIFFICULTY_LEVELS).map(([key, { level, xpMultiplier, energyCost }]) => (
              <Button
                key={key}
                variant={selectedDifficulty === key ? "default" : "outline"}
                className={`p-4 h-auto flex flex-col items-center gap-2 ${
                  selectedDifficulty === key 
                    ? 'bg-cyan-400/20 border-cyan-400 text-white' 
                    : 'bg-black/20 border-holobots-border text-gray-300'
                }`}
                onClick={() => setSelectedDifficulty(key as keyof typeof DIFFICULTY_LEVELS)}
              >
                <span className="font-bold capitalize">{key}</span>
                <div className="text-xs flex flex-col">
                  <span>Level {level}</span>
                  <span className="text-cyan-400">x{xpMultiplier} XP</span>
                  <span className="text-green-400">{energyCost} Energy</span>
                </div>
              </Button>
            ))}
          </div>
        </Card>
        
        {/* Battle Controls */}
        <div className="flex justify-center mb-8">
          <Button
            size="lg"
            variant="default"
            disabled={!selectedHolobot || !selectedOpponent || isBattling}
            onClick={handleStartTraining}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg h-auto"
          >
            {isBattling ? (
              <>Processing...</>
            ) : (
              <>
                <Swords className="mr-2 h-6 w-6" /> 
                Start Training
              </>
            )}
          </Button>
        </div>
        
        {/* Battle Result */}
        {battleResult && (
          <Card className={`p-6 mb-8 text-center ${
            battleResult.won 
              ? 'bg-green-400/10 border-green-400' 
              : 'bg-red-400/10 border-red-400'
          }`}>
            <h3 className={`text-2xl font-bold mb-2 ${
              battleResult.won ? 'text-green-400' : 'text-red-400'
            }`}>
              {battleResult.won ? (
                <><Trophy className="inline-block mr-2 h-6 w-6" /> Victory!</>
              ) : (
                <><AlertCircle className="inline-block mr-2 h-6 w-6" /> Defeat</>
              )}
            </h3>
            
            <p className="text-lg mb-2">
              {battleResult.message}
            </p>
            
            {battleResult.won && (
              <p className="text-cyan-400 text-sm">
                Keep training to level up your Holobot!
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Training;
