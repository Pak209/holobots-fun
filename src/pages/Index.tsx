
import { BattleScene } from "@/components/BattleScene";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Ticket, Gem, Award, Shield, Swords, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { ItemCard } from "@/components/items/ItemCard";
import { ArenaPrebattleMenu } from "@/components/arena/ArenaPrebattleMenu";
import { generateArenaOpponent, calculateArenaRewards } from "@/utils/battleUtils";
import { QuestResultsScreen } from "@/components/quests/QuestResultsScreen";
import { HOLOBOT_STATS } from "@/types/holobot";
import { updateHolobotExperience, calculateExperience } from "@/integrations/supabase/client";
import { ArenaModeTier } from "@/components/arena/ArenaModeTier";

// Define arena difficulty tiers
const ARENA_TIERS = {
  bronze: {
    name: "Bronze Arena",
    levelRange: [1, 5],
    description: "Entry-level arena for rookie Holobots",
    maxRounds: 2,
    rewards: {
      baseHolos: 50,
      expMultiplier: 1,
      blueprintChance: 0.3,
      itemTypes: ["arena-pass", "energy-refill"]
    }
  },
  silver: {
    name: "Silver Arena",
    levelRange: [5, 15],
    description: "Intermediate challenge with stronger opponents",
    maxRounds: 3,
    rewards: {
      baseHolos: 150,
      expMultiplier: 1.5,
      blueprintChance: 0.5,
      itemTypes: ["arena-pass", "energy-refill", "exp-booster"]
    }
  },
  gold: {
    name: "Gold Arena",
    levelRange: [15, 30],
    description: "Advanced competition with strategic battles",
    maxRounds: 4,
    rewards: {
      baseHolos: 300,
      expMultiplier: 2,
      blueprintChance: 0.7,
      itemTypes: ["arena-pass", "energy-refill", "exp-booster", "gacha-ticket"]
    }
  },
  platinum: {
    name: "Platinum Arena",
    levelRange: [30, 50],
    description: "Elite arena for legendary Holobots",
    maxRounds: 5,
    rewards: {
      baseHolos: 500,
      expMultiplier: 3,
      blueprintChance: 1, // Guaranteed blueprint
      itemTypes: ["arena-pass", "energy-refill", "exp-booster", "gacha-ticket", "rank-skip"]
    }
  }
};

const getAvailableArenaTiers = (holobotLevel: number) => {
  const availableTiers = [];
  
  for (const [key, tier] of Object.entries(ARENA_TIERS)) {
    if (holobotLevel >= tier.levelRange[0]) {
      availableTiers.push(key);
    }
  }
  
  return availableTiers;
};

const Index = () => {
  const [currentRound, setCurrentRound] = useState(1);
  const [victories, setVictories] = useState(0);
  const [hasEntryFee, setHasEntryFee] = useState(false);
  const [selectedHolobot, setSelectedHolobot] = useState("ace"); // Default holobot
  const [currentOpponent, setCurrentOpponent] = useState(generateArenaOpponent(1));
  const [showResults, setShowResults] = useState(false);
  const [arenaResults, setArenaResults] = useState<any>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [facedOpponents, setFacedOpponents] = useState<string[]>([]);
  
  const entryFee = 50;
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  
  const maxRounds = selectedTier ? ARENA_TIERS[selectedTier as keyof typeof ARENA_TIERS].maxRounds : 3;

  // Generate a new opponent when the round changes
  useEffect(() => {
    if (hasEntryFee && currentRound > 0) {
      const newOpponent = generateArenaOpponent(
        currentRound, 
        selectedTier ? ARENA_TIERS[selectedTier as keyof typeof ARENA_TIERS].levelRange : [1, 5]
      );
      setCurrentOpponent(newOpponent);
      // Add to faced opponents list for blueprint rewards later
      setFacedOpponents(prev => [...prev, newOpponent.name]);
    }
  }, [currentRound, hasEntryFee, selectedTier]);

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

  const handleTierSelect = (tier: string) => {
    console.log("Selected tier:", tier);
    setSelectedTier(tier);
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
    
    // Get tier experience multiplier
    const expMultiplier = selectedTier 
      ? ARENA_TIERS[selectedTier as keyof typeof ARENA_TIERS].rewards.expMultiplier 
      : 1;
    
    // Calculate XP gained based on victories, rounds and tier
    const xpGained = Math.floor(victoryCount * 100 * currentRound * expMultiplier);
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

  const selectItemRewards = () => {
    if (!selectedTier) return {};
    
    const tier = ARENA_TIERS[selectedTier as keyof typeof ARENA_TIERS];
    const itemTypes = tier.rewards.itemTypes;
    
    // Randomly select an item type based on arena performance
    const randomIndex = Math.floor(Math.random() * itemTypes.length);
    const itemType = itemTypes[randomIndex];
    
    // Quantity based on victories (1-3)
    const quantity = Math.min(victories, 3);
    
    const itemRewards = {
      arena_passes: 0,
      energy_refills: 0,
      exp_boosters: 0,
      gachaTickets: 0,
      rank_skips: 0
    };
    
    if (itemType === "arena-pass") itemRewards.arena_passes = quantity;
    if (itemType === "energy-refill") itemRewards.energy_refills = quantity;
    if (itemType === "exp-booster") itemRewards.exp_boosters = quantity;
    if (itemType === "gacha-ticket") itemRewards.gachaTickets = quantity;
    if (itemType === "rank-skip") itemRewards.rank_skips = Math.min(1, quantity); // Max 1 rank skip
    
    return itemRewards;
  };

  const collectBlueprintRewards = () => {
    // Get blueprint chance based on tier
    const blueprintChance = selectedTier 
      ? ARENA_TIERS[selectedTier as keyof typeof ARENA_TIERS].rewards.blueprintChance 
      : 0.3;
    
    // Create arrays for blueprint rewards
    const blueprintRewards = [];
    
    // Only consider unique opponents
    const uniqueOpponents = [...new Set(facedOpponents)];
    
    for (const opponentName of uniqueOpponents) {
      // Check chance for each opponent
      if (Math.random() <= blueprintChance) {
        blueprintRewards.push({
          holobotKey: opponentName.toLowerCase(),
          amount: 1
        });
      }
    }
    
    return blueprintRewards;
  };

  const distributeRewards = async () => {
    try {
      if (!user) return;
      
      // Calculate base rewards based on arena tier
      const baseHolos = selectedTier
        ? ARENA_TIERS[selectedTier as keyof typeof ARENA_TIERS].rewards.baseHolos
        : 50;
      
      // Calculate total rewards based on victories and current round
      const holosTokens = baseHolos * victories * (currentRound * 0.5);
      
      // Calculate experience for the holobot
      const experienceRewards = calculateExperienceRewards(victories);
      const selectedHolobotName = HOLOBOT_STATS[selectedHolobot].name;
      
      // Get blueprint rewards from opponents faced
      const blueprintRewards = collectBlueprintRewards();
      
      // Select item rewards based on tier and performance
      const itemRewards = selectItemRewards();
      
      // Update user with rewards
      const updates: any = {
        holosTokens: (user.holosTokens || 0) + holosTokens,
      };
      
      // Add item rewards
      if (itemRewards.arena_passes > 0) {
        updates.arena_passes = (user.arena_passes || 0) + itemRewards.arena_passes;
      }
      
      if (itemRewards.energy_refills > 0) {
        updates.energy_refills = (user.energy_refills || 0) + itemRewards.energy_refills;
      }
      
      if (itemRewards.exp_boosters > 0) {
        updates.exp_boosters = (user.exp_boosters || 0) + itemRewards.exp_boosters;
      }
      
      if (itemRewards.gachaTickets > 0) {
        updates.gachaTickets = (user.gachaTickets || 0) + itemRewards.gachaTickets;
      }
      
      if (itemRewards.rank_skips > 0) {
        updates.rank_skips = (user.rank_skips || 0) + itemRewards.rank_skips;
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
      
      // Update blueprints
      const updatedBlueprints = { ...(user.blueprints || {}) };
      for (const reward of blueprintRewards) {
        const currentAmount = updatedBlueprints[reward.holobotKey] || 0;
        updatedBlueprints[reward.holobotKey] = currentAmount + reward.amount;
      }
      updates.blueprints = updatedBlueprints;
      
      // Save all the updates to the user
      await updateUser(updates);
      
      // Save the results to show in the results screen
      setArenaResults({
        isSuccess: victories > 0,
        squadHolobotKeys: [selectedHolobot],
        squadHolobotExp: experienceRewards,
        blueprintRewards: blueprintRewards,
        holosRewards: holosTokens,
        gachaTickets: itemRewards.gachaTickets,
        arenaPass: itemRewards.arena_passes,
        expBoosters: itemRewards.exp_boosters,
        energyRefills: itemRewards.energy_refills,
        rankSkips: itemRewards.rank_skips
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
      } else {
        distributeRewards();
        resetArena();
      }
    } else {
      distributeRewards();
      resetArena();
    }
  };

  const resetArena = () => {
    setCurrentRound(1);
    setVictories(0);
    setHasEntryFee(false);
    setFacedOpponents([]);
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
          onTierSelect={handleTierSelect}
          entryFee={entryFee}
          availableTiers={user?.holobots.length > 0 
            ? getAvailableArenaTiers(Math.max(...user.holobots.map(h => h.level))) 
            : ['bronze']}
          arenaData={ARENA_TIERS}
          selectedTier={selectedTier}
        />
      </div>
    );
  }

  return (
    <div className="px-2 py-3">
      <div className="mb-4 bg-[#1A1F2C] rounded-lg p-3">
        <div className="text-center mb-2 text-lg font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent">
          {selectedTier ? ARENA_TIERS[selectedTier as keyof typeof ARENA_TIERS].name : "ARENA MODE"}
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
        hackEnabled={true}
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
          onClose={handleResultsClose}
        />
      )}
    </div>
  );
};

export default Index;
