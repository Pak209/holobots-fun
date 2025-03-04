import { useState, useEffect } from 'react';
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS } from "@/types/holobot";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Battery, Swords, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { calculateBattleExperience } from "@/utils/battleUtils";

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
    return user.holobots.find(h => h.name.toLowerCase() === selectedHolobot.toLowerCase());
  };

  // Get the holobot key from HOLOBOT_STATS based on name
  const getHolobotKeyByName = (name: string): string => {
    const lowerName = name.toLowerCase();
    const key = Object.keys(HOLOBOT_STATS).find(
      k => HOLOBOT_STATS[k].name.toLowerCase() === lowerName
    );
    return key || Object.keys(HOLOBOT_STATS)[0]; // fallback to first holobot if not found
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
        playerHolobot.level,
        DIFFICULTY_LEVELS[selectedDifficulty].level
      );
      const xpGained = Math.floor(baseXp * difficulty.xpMultiplier);

      // Update XP for the holobot if won
      if (won && user) {
        const updatedHolobots = user.holobots.map(h => {
          if (h.name.toLowerCase() === playerHolobot.name.toLowerCase()) {
            const newExperience = (h.experience || 0) + xpGained;
            return {
              ...h,
              experience: newExperience
            };
          }
          return h;
        });
        
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto pt-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-cyan-400 mb-4 animate-pulse">
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
            <h2 className="text-xl font-bold text-cyan-400 mb-4">
              Select Your Holobot
            </h2>
            <Select value={selectedHolobot} onValueChange={setSelectedHolobot}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your holobot" />
              </SelectTrigger>
              <SelectContent>
                {user?.holobots.map((holobot, index) => {
                  const holobotKey = getHolobotKeyByName(holobot.name);
                  return (
                    <SelectItem key={index} value={holobotKey}>
                      {holobot.name} (Lv.{holobot.level})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {selectedHolobot && (
              <div className="mt-4 flex justify-center">
                {getSelectedHolobotObject() && (
                  <HolobotCard 
                    stats={{
                      ...HOLOBOT_STATS[selectedHolobot],
                      name: getSelectedHolobotObject()?.name || '',
                      level: getSelectedHolobotObject()?.level || 1,
                    }}
                    variant="blue"
                  />
                )}
              </div>
            )}
          </div>

          {/* Opponent Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-red-400 mb-4">
              Select Training Opponent
            </h2>
            <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose opponent" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                  <SelectItem key={key} value={key}>
                    {stats.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedOpponent && (
              <div className="mt-4 flex justify-center">
                <HolobotCard 
                  stats={{
                    ...HOLOBOT_STATS[selectedOpponent],
                    level: DIFFICULTY_LEVELS[selectedDifficulty].level
                  }}
                  variant="red"
                />
              </div>
            )}
          </div>
        </div>

        {/* Difficulty Selection */}
        <Card className="mb-8 p-6 bg-black/40 border-cyan-500/20">
          <h3 className="text-lg font-bold text-cyan-400 mb-4">
            Select Difficulty
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(Object.entries(DIFFICULTY_LEVELS) as [keyof typeof DIFFICULTY_LEVELS, typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS]][]).map(([key, config]) => (
              <Button
                key={key}
                variant={selectedDifficulty === key ? "default" : "outline"}
                className={`
                  h-auto py-4 px-6
                  ${selectedDifficulty === key ? 'bg-cyan-500' : 'bg-black/40'}
                  border-cyan-500/20 hover:border-cyan-400
                `}
                onClick={() => setSelectedDifficulty(key)}
              >
                <div className="text-center space-y-2">
                  <div className="font-bold text-sm capitalize">
                    {key}
                  </div>
                  <div className="text-xs space-y-1">
                    <div>Level {config.level}</div>
                    <div>x{config.xpMultiplier} XP</div>
                    <div className="text-green-400">{config.energyCost} Energy</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Battle Controls */}
        <div className="text-center space-y-4">
          <Button
            size="lg"
            disabled={isBattling || !selectedHolobot || !selectedOpponent}
            onClick={handleStartTraining}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm px-8 py-6"
          >
            {isBattling ? (
              <>
                <Swords className="w-4 h-4 mr-2 animate-spin" />
                Training...
              </>
            ) : (
              <>
                <Swords className="w-4 h-4 mr-2" />
                Start Training
              </>
            )}
          </Button>

          {battleResult && (
            <Card className={`
              p-4 animate-pulse
              ${battleResult.won ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}
            `}>
              <div className="flex items-center justify-center gap-2">
                {battleResult.won ? (
                  <Trophy className="w-5 h-5 text-yellow-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-bold text-sm">
                  {battleResult.message}
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Training;
