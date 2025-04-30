import { BattleScene } from "@/components/BattleScene";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { ArenaPrebattleMenu } from "@/components/arena/ArenaPrebattleMenu";
import { generateArenaOpponent, calculateArenaRewards } from "@/utils/battleUtils";
import { QuestResultsScreen } from "@/components/quests/QuestResultsScreen";
import { HOLOBOT_STATS } from "@/types/holobot";
import { updateHolobotExperience } from "@/integrations/supabase/client";
import { Trophy, Ticket, Gem, Award } from "lucide-react";

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
      if (user && (user.arena_passes ?? 0) > 0) {
        await updateUser({
          arena_passes: (user.arena_passes ?? 0) - 1
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

  const distributeRewards = async () => {
    try {
      if (!user) return;
      
      // Calculate rewards based on current round and victories
      const rewards = calculateArenaRewards(currentRound, victories);
      
      // Calculate experience for the holobot
      const experienceRewards = calculateExperienceRewards(victories);
      const selectedHolobotName = HOLOBOT_STATS[selectedHolobot].name;
      
      // Update user with rewards
      const updates: any = {
        holosTokens: user.holosTokens + rewards.holosTokens,
        gachaTickets: user.gachaTickets + rewards.gachaTickets
      };
      
      if (rewards.arenaPass > 0) {
        updates.arena_passes = (user.arena_passes || 0) + rewards.arenaPass;
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
      
      // Save all the updates to the user
      await updateUser(updates);
      
      // Save the results to show in the results screen
      setArenaResults({
        isSuccess: victories > 0,
        squadHolobotKeys: [selectedHolobot],
        squadHolobotExp: experienceRewards,
        blueprintReward: rewards.blueprintReward,
        holosRewards: rewards.holosTokens,
        gachaTickets: rewards.gachaTickets,
        arenaPass: rewards.arenaPass
      });
      
      // Show the results screen
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

      {/* Results screen */}
      {showResults && arenaResults && (
        <QuestResultsScreen
          isVisible={showResults}
          isSuccess={arenaResults.isSuccess}
          squadHolobotExp={arenaResults.squadHolobotExp}
          blueprintRewards={arenaResults.blueprintReward}
          holosRewards={arenaResults.holosRewards}
          onClose={handleResultsClose}
          gachaTickets={arenaResults.gachaTickets}
          arenaPass={arenaResults.arenaPass}
          squadHolobotKeys={arenaResults.squadHolobotKeys}
        />
      )}
    </div>
  );
};

export default Index;
