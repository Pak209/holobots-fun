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

// Define the type for specific item rewards from arena tiers
interface ArenaSpecificItemRewards {
  energy_refills: number;
  exp_boosters: number;
  rank_skips: number;
  // gacha_tickets and arena_passes are handled by calculateArenaRewards for now
}

const Index = () => {
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
  const { toast } = useToast();
  const { user, updateUser } = useAuth();

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

  const distributeRewards = async () => {
    try {
      if (!user) return;
      
      // Calculate base rewards (tokens, gacha, blueprint, arena pass)
      // Item rewards from tier are now handled directly from currentArenaTierItemRewards state
      const baseRewards = calculateArenaRewards(currentRound, victories);
      
      // Calculate experience for the holobot
      const experienceRewards = calculateExperienceRewards(victories);
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
      
      // >>> ADD BLUEPRINT UPDATE LOGIC HERE <<<
      if (baseRewards.blueprintReward && baseRewards.blueprintReward.holobotKey && baseRewards.blueprintReward.amount > 0) {
        const { holobotKey, amount } = baseRewards.blueprintReward;
        const currentBlueprints = user.blueprints || {}; // Get current blueprints or default to empty object
        const currentAmount = currentBlueprints[holobotKey] || 0; // Get current amount for this key or default to 0
        const newAmount = currentAmount + amount;

        // Add/update the blueprints field in the updates object
        updates.blueprints = {
          ...currentBlueprints, // Keep existing blueprints
          [holobotKey]: newAmount // Update the specific holobot's count
        };
        
        console.log(`Updating blueprints for ${holobotKey}: ${currentAmount} -> ${newAmount}`);
      }
      
      // Save all the updates to the user
      await updateUser(updates);
      
      // Verify user object after update
      console.log("User state immediately after updateUser call:", JSON.parse(JSON.stringify(user)));
      console.log("Blueprints in user state after updateUser:", JSON.parse(JSON.stringify(user?.blueprints)));
      console.log("Inventory in user state after updateUser:", JSON.parse(JSON.stringify(user?.inventory))); // Log old inventory field if needed for comparison
      console.log("Specific items in user state after updateUser:", {
          energy_refills: user?.energy_refills,
          exp_boosters: user?.exp_boosters,
          rank_skips: user?.rank_skips
      });
      console.log("Applied updates object:", JSON.parse(JSON.stringify(updates)));

      // Save the results to show in the results screen
      setArenaResults({
        isSuccess: victories > 0,
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
        // Move to next round with next opponent in lineup
        setCurrentRound(prev => prev + 1);
      } else {
        // Final round completed
        distributeRewards();
        setCurrentRound(1);
        setVictories(0);
        setHasEntryFee(false);
        setArenaLineup([]);
        setArenaOpponentLevel(1);
      }
    } else {
      // Battle lost
      distributeRewards();
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

  // Get current opponent from lineup
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
          onClose={handleResultsClose}
        />
      )}
    </div>
  );
};

export default Index;
