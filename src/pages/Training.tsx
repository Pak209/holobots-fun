import { useState, useEffect } from 'react';
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS } from "@/types/holobot";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Battery, Swords, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { calculateBattleExperience, updateHolobotExperience } from "@/utils/battleUtils";

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

  // Apply attribute boosts from user's holobot
  const applyAttributeBoosts = (baseStats, userHolobot) => {
    if (!userHolobot || !userHolobot.boostedAttributes) return baseStats;
    
    return {
      ...baseStats,
      attack: baseStats.attack + (userHolobot.boostedAttributes.attack || 0),
      defense: baseStats.defense + (userHolobot.boostedAttributes.defense || 0),
      speed: baseStats.speed + (userHolobot.boostedAttributes.speed || 0),
      maxHealth: baseStats.maxHealth + (userHolobot.boostedAttributes.health || 0)
    };
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
  
  // Get base stats for the selected holobot
  const baseStats = selectedHolobot ? HOLOBOT_STATS[selectedHolobot] : null;
  
  // Apply attribute boosts if available
  const boostedStats = baseStats && userHolobot 
    ? applyAttributeBoosts(baseStats, userHolobot)
    : baseStats;

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
          
          {/* Energy Display */}
          <Card className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 border-cyan-500/20">
            <Battery className="w-4 h-4 text-green-500" />
            <span className="text-sm">
              Energy: {user?.dailyEnergy}/{user?.maxDailyEnergy}
            </span>
          </Card>
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
                    name: userHolobot?.name || HOLOBOT_STATS[selectedHolobot].name
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
                  stats={HOLOBOT_STATS[selectedOpponent]}
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
