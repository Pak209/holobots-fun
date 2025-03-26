import { BattleScene } from "@/components/BattleScene";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Ticket, Gem, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { ItemCard } from "@/components/items/ItemCard";
import { ArenaPrebattleMenu } from "@/components/arena/ArenaPrebattleMenu";
import { generateArenaOpponent, calculateArenaRewards } from "@/utils/battleUtils";
import { QuestResultsScreen } from "@/components/quests/QuestResultsScreen";
import { HOLOBOT_STATS } from "@/types/holobot";
import { updateHolobotExperience, calculateExperience } from "@/integrations/supabase/client";

const Index = () => {
  const [currentRound, setCurrentRound] = useState(1);
  const [victories, setVictories] = useState(0);
  const [hasEntryFee, setHasEntryFee] = useState(false);
  const [selectedHolobot, setSelectedHolobot] = useState("ace"); // Default holobot
  const [currentOpponent, setCurrentOpponent] = useState(generateArenaOpponent(1));
  const [showResults, setShowResults] = useState(false);
  const [arenaResults, setArenaResults] = useState<any>(null);
  const maxRounds = 3;
  const entryFee = 50;
  const { toast } = useToast();
  const { user, updateUser } = useAuth();

  // Generate a new opponent when the round changes
  useEffect(() => {
    setCurrentOpponent(generateArenaOpponent(currentRound));
  }, [currentRound]);

  const payEntryFee = async () => {
    try {
      if (user && user.holosTokens >= entryFee) {
        await updateUser({
          holosTokens: user.holosTokens - entryFee
        });
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

  const useArenaPass = async () => {
    try {
      if (user && user.arena_passes > 0) {
        await updateUser({
          arena_passes: user.arena_passes - 1
        });
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

  const handleEntryFeeMethod = async (method: 'tokens' | 'pass') => {
    if (method === 'tokens') {
      await payEntryFee();
    } else {
      await useArenaPass();
    }
  };

  const calculateExperienceRewards = (victoryCount: number) => {
    if (!user?.holobots || !Array.isArray(user.holobots)) {
      return [];
    }
    
    const holobot = user.holobots.find(h => 
      h.name.toLowerCase() === HOLOBOT_STATS[selectedHolobot].name.toLowerCase()
    );
    
    if (!holobot) return [];
    
    const currentLevel = holobot.level || 1;
    const currentXp = holobot.experience || 0;
    
    const xpGained = victoryCount * 100 * currentRound;
    const totalXp = currentXp + xpGained;
    
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

  const distributeRewards = async () => {
    try {
      if (!user) return;
      
      const rewards = calculateArenaRewards(currentRound, victories);
      
      const experienceRewards = calculateExperienceRewards(victories);
      const selectedHolobotName = HOLOBOT_STATS[selectedHolobot].name;
      
      const updates: any = {
        holosTokens: user.holosTokens + rewards.holosTokens,
        gachaTickets: user.gachaTickets + rewards.gachaTickets
      };
      
      if (rewards.arenaPass > 0) {
        updates.arena_passes = (user.arena_passes || 0) + rewards.arenaPass;
      }
      
      if (experienceRewards.length > 0) {
        const updatedHolobots = updateHolobotExperience(
          user.holobots,
          selectedHolobotName,
          (user.holobots.find(h => h.name.toLowerCase() === selectedHolobotName.toLowerCase())?.experience || 0) + experienceRewards[0].xp,
          experienceRewards[0].newLevel
        );
        
        updates.holobots = updatedHolobots;
      }
      
      await updateUser(updates);
      
      setArenaResults({
        isSuccess: victories > 0,
        squadHolobotExp: experienceRewards,
        blueprintRewards: rewards.blueprintReward,
        holosRewards: rewards.holosTokens,
        gachaTickets: rewards.gachaTickets,
        arenaPass: rewards.arenaPass
      });
      
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
    if (result === 'victory') {
      setVictories(prev => prev + 1);
      if (currentRound < maxRounds) {
        setCurrentRound(prev => prev + 1);
        setCurrentOpponent(generateArenaOpponent(currentRound + 1));
      } else {
        distributeRewards();
        setCurrentRound(1);
        setVictories(0);
        setHasEntryFee(false);
        setCurrentOpponent(generateArenaOpponent(1));
      }
    } else {
      distributeRewards();
      setCurrentRound(1);
      setVictories(0);
      setHasEntryFee(false);
      setCurrentOpponent(generateArenaOpponent(1));
    }
  };

  const handleResultsClose = () => {
    setShowResults(false);
    setArenaResults(null);
  };

  if (!hasEntryFee) {
    return (
      <div className="px-4 py-5">
        <ArenaPrebattleMenu 
          onHolobotSelect={handleHolobotSelect}
          onEntryFeeMethod={handleEntryFeeMethod}
          entryFee={entryFee}
        />
      </div>
    );
  }

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
              {currentOpponent.level}
            </div>
          </div>
        </div>
      </div>
      
      <BattleScene 
        leftHolobot={selectedHolobot}
        rightHolobot={currentOpponent.name}
        isCpuBattle={true}
        cpuLevel={currentOpponent.level}
        onBattleEnd={handleBattleEnd}
      />

      {showResults && arenaResults && (
        <QuestResultsScreen
          isVisible={showResults}
          isSuccess={arenaResults.isSuccess}
          squadHolobotExp={arenaResults.squadHolobotExp}
          blueprintRewards={arenaResults.blueprintRewards}
          holosRewards={arenaResults.holosRewards}
          onClose={handleResultsClose}
        />
      )}
    </div>
  );
};

export default Index;
