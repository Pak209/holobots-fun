import { useState } from "react";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS, getRank } from "@/types/holobot";
import { Button } from "@/components/ui/button";
import { Coins, Plus, Crown, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UserHolobot } from "@/types/user";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { BLUEPRINT_TIERS } from "@/components/holobots/BlueprintSection";
import { HolobotPartsEquipment } from "@/components/holobots/HolobotPartsEquipment";
import { useHolobotPartsStore } from "@/stores/holobotPartsStore";

interface HolobotInfoCardProps {
  holobotKey: string;
  holobot: typeof HOLOBOT_STATS[keyof typeof HOLOBOT_STATS];
  userHolobot: UserHolobot | undefined;
  userTokens: number;
  isMinting: boolean;
  justMinted: boolean;
  onMint: (holobotName: string) => void;
}

export const HolobotInfoCard = ({
  holobotKey,
  holobot,
  userHolobot,
  userTokens,
  isMinting,
  justMinted,
  onMint
}: HolobotInfoCardProps) => {
  const isOwned = !!userHolobot;
  const level = userHolobot?.level || holobot.level;
  const currentXp = userHolobot?.experience || 0;
  const nextLevelXp = userHolobot?.nextLevelExp || 100;
  const holobotRank = userHolobot?.rank || "Common";
  const attributePoints = userHolobot?.attributePoints || 0;
  
  const [isRankSkipping, setIsRankSkipping] = useState(false);

  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const { getEquippedParts } = useHolobotPartsStore();
  
  const calculateProgress = (current: number, total: number) => {
    return Math.min(100, Math.floor((current / total) * 100));
  };
  
  const xpProgress = calculateProgress(currentXp, nextLevelXp);

  // Calculate parts bonuses
  const getPartsBonuses = () => {
    if (!isOwned) return { attack: 0, defense: 0, speed: 0, intelligence: 0 };
    
    const equippedParts = getEquippedParts(holobot.name);
    const bonuses = { attack: 0, defense: 0, speed: 0, intelligence: 0 };
    
    Object.values(equippedParts).forEach(part => {
      if (part) {
        bonuses.attack += part.baseStats.attack;
        bonuses.defense += part.baseStats.defense;
        bonuses.speed += part.baseStats.speed;
        bonuses.intelligence += part.baseStats.intelligence;
      }
    });
    
    return bonuses;
  };

  const partsBonuses = getPartsBonuses();

  // Get background color based on rank
  const getRankColor = (rank: string) => {
    switch(rank) {
      case "Legendary": return "bg-orange-600/20 border-orange-500 text-orange-400";
      case "Elite": return "bg-yellow-600/20 border-yellow-500 text-yellow-400";
      case "Rare": return "bg-purple-600/20 border-purple-500 text-purple-400";
      case "Champion": return "bg-green-600/20 border-green-500 text-green-400";
      case "Common":
      default: return "bg-blue-600/20 border-blue-500 text-blue-400";
    }
  };

  const handleBoostAttribute = async (attribute: 'attack' | 'defense' | 'speed' | 'health') => {
    if (!isOwned || !user) return;
    
    try {
      // Check if user has holobots array
      if (!user.holobots || !Array.isArray(user.holobots)) {
        throw new Error("User holobots data is not available");
      }
      
      // Check if user has attribute points to spend
      const targetHolobot = user.holobots.find(h => h.name.toLowerCase() === holobot.name.toLowerCase());
      if (!targetHolobot || !(targetHolobot.attributePoints && targetHolobot.attributePoints > 0)) {
        toast({
          title: "No Attribute Points",
          description: "You don't have any attribute points to spend.",
          variant: "destructive"
        });
        return;
      }
      
      // Find the holobot to update
      const updatedHolobots = user.holobots.map(h => {
        if (h.name.toLowerCase() === holobot.name.toLowerCase()) {
          // Initialize boostedAttributes if it doesn't exist
          const boostedAttributes = h.boostedAttributes || {};
          
          // Update the specific attribute
          if (attribute === 'health') {
            boostedAttributes.health = (boostedAttributes.health || 0) + 10;
          } else {
            boostedAttributes[attribute] = (boostedAttributes[attribute] || 0) + 1;
          }
          
          return {
            ...h,
            boostedAttributes,
            attributePoints: (h.attributePoints || 0) - 1
          };
        }
        return h;
      });
      
      // Update the user profile
      await updateUser({ holobots: updatedHolobots });
      
      toast({
        title: "Attribute Boosted",
        description: `Increased ${attribute} for ${holobot.name}`,
      });
    } catch (error) {
      console.error("Error boosting attribute:", error);
      toast({
        title: "Error",
        description: "Failed to boost attribute",
        variant: "destructive"
      });
    }
  };

  // Helper function to get attribute points for a tier (replicated or import if available elsewhere globally)
  const getAttributePointsForTier = (tierName: string): number => {
    switch(tierName) {
      case "Legendary": return 40;
      case "Elite": return 30;
      case "Rare": return 20;
      case "Champion": return 10;
      case "Common":
      default: return 10;
    }
  };

  // Define the order of tiers for rank progression
  const TIER_ORDER = ["Common", "Champion", "Rare", "Elite", "Legendary"];

  const handleUseRankSkip = async () => {
    if (!user || !userHolobot || (user.rank_skips || 0) <= 0 || holobotRank === "Legendary") {
      toast({
        title: "Cannot Use Rank Skip",
        description: "Conditions not met (no skips, Holobot max rank, or not owned).",
        variant: "destructive",
      });
      return;
    }

    setIsRankSkipping(true);

    try {
      const currentRankIndex = TIER_ORDER.indexOf(holobotRank);
      if (currentRankIndex === -1 || currentRankIndex >= TIER_ORDER.length - 1) {
        toast({ title: "Error", description: "Holobot is already at max rank or rank is invalid.", variant: "destructive" });
        setIsRankSkipping(false);
        return;
      }

      const nextRankName = TIER_ORDER[currentRankIndex + 1];
      const nextTierInfo = Object.values(BLUEPRINT_TIERS).find(tier => tier.name === nextRankName);

      if (!nextTierInfo) {
        toast({ title: "Error", description: "Could not determine next rank information.", variant: "destructive" });
        setIsRankSkipping(false);
        return;
      }

      const attributePointsToAdd = getAttributePointsForTier(nextRankName);

      const updatedHolobots = user.holobots.map(h => {
        if (h.name.toLowerCase() === userHolobot.name.toLowerCase()) {
          return {
            ...h,
            rank: nextRankName,
            level: nextTierInfo.startLevel,
            experience: 0,
            nextLevelExp: 100, // Assuming 100 as per BlueprintSection, adjust if needed
            attributePoints: (h.attributePoints || 0) + attributePointsToAdd,
          };
        }
        return h;
      });

      await updateUser({
        rank_skips: (user.rank_skips || 0) - 1,
        holobots: updatedHolobots,
      });

      toast({
        title: "Rank Skipped!",
        description: `${userHolobot.name} has advanced to ${nextRankName} rank (Level ${nextTierInfo.startLevel})!`,
      });

    } catch (error) {
      console.error("Error using Rank Skip:", error);
      toast({
        title: "Rank Skip Failed",
        description: "An error occurred while using the Rank Skip.",
        variant: "destructive",
      });
    } finally {
      setIsRankSkipping(false);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${isOwned ? 'bg-[#374151]/90' : 'bg-[#374151]/30'} p-3 sm:p-4 rounded-lg border border-[#374151] shadow-neon transition-all duration-300`}>
      <div className="flex sm:flex-row gap-3 sm:gap-4 w-full items-stretch">
        {/* Stats Panel - With reduced width on mobile */}
        <div className="flex-none flex flex-col justify-between w-[120px] sm:w-[180px] bg-black/30 p-2 rounded-lg border border-holobots-accent self-start min-h-[320px]">
          <div>
            <div className="flex justify-between items-start mb-1.5">
              <h2 className="text-lg font-bold text-[#33C3F0] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] border border-transparent">
                {holobot.name}
              </h2>
              {isOwned && !justMinted && (
                <div className="px-1 py-0.5 bg-green-500/20 border border-green-500 rounded text-[9px]">
                  OWNED
                </div>
              )}
              {justMinted && (
                <div className="px-1 py-0.5 bg-blue-500/20 border border-blue-500 rounded text-[9px] animate-pulse">
                  NEW
                </div>
              )}
            </div>
            
            {isOwned && (
              <div className="mb-1.5 space-y-0.5">
                <div className="flex justify-between items-center text-xs text-gray-300">
                  <span>LV {level}</span>
                  <span>{currentXp}/{nextLevelXp}</span>
                </div>
                <Progress value={xpProgress} className="h-1 bg-gray-700" />
                <div className="flex justify-between text-[9px]">
                  <span className="text-cyan-400 font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    Rank: {getRank(level)}
                  </span>
                  {userHolobot?.rank && (
                    <Badge className={`text-[8px] py-0 px-1 h-4 ${getRankColor(holobotRank)} font-bold border-2 shadow-lg`}>
                      <Crown className="h-2 w-2 mr-0.5" /> {holobotRank}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-0.5 font-mono text-xs text-gray-300">
              <p>HP: {holobot.maxHealth} 
                {userHolobot?.boostedAttributes?.health ? <span className="text-blue-400">+{userHolobot.boostedAttributes.health}</span> : ''}
              </p>
              <p>Attack: {holobot.attack} 
                {userHolobot?.boostedAttributes?.attack ? <span className="text-blue-400">+{userHolobot.boostedAttributes.attack}</span> : ''}
                {partsBonuses.attack > 0 ? <span className="text-purple-400"> +{partsBonuses.attack}</span> : ''}
              </p>
              <p>Defense: {holobot.defense} 
                {userHolobot?.boostedAttributes?.defense ? <span className="text-blue-400">+{userHolobot.boostedAttributes.defense}</span> : ''}
                {partsBonuses.defense > 0 ? <span className="text-purple-400"> +{partsBonuses.defense}</span> : ''}
              </p>
              <p>Speed: {holobot.speed} 
                {userHolobot?.boostedAttributes?.speed ? <span className="text-blue-400">+{userHolobot.boostedAttributes.speed}</span> : ''}
                {partsBonuses.speed > 0 ? <span className="text-purple-400"> +{partsBonuses.speed}</span> : ''}
              </p>
              <p className="text-sky-400 text-[10px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Special: {holobot.specialMove}
              </p>
            </div>
            
            {/* Rank Skip Button - Placed here below special move */}
            {isOwned && holobotRank !== "Legendary" && (user?.rank_skips || 0) > 0 && (
              <div className="mt-1.5">
                <Button
                  onClick={handleUseRankSkip}
                  disabled={isRankSkipping || (user?.rank_skips || 0) === 0}
                  size="sm"
                  className="w-full py-0.5 h-auto text-xs bg-red-600/80 hover:bg-red-700/80 border border-red-500 text-white flex items-center justify-center"
                >
                  <Coins size={12} className="mr-1" />
                  {isRankSkipping ? "Skipping..." : `Use Rank Skip (${user?.rank_skips || 0})`}
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-1.5 pt-1 border-t border-[#374151]">
            {!isOwned && !justMinted && (
              <Button 
                onClick={() => onMint(holobot.name)}
                disabled={isMinting || userTokens < 100}
                className="w-full py-0 h-6 text-xs bg-[#33C3F0] hover:bg-[#0FA0CE] text-black font-semibold"
              >
                {isMinting ? (
                  "Minting..."
                ) : (
                  <>
                    <Plus size={10} className="mr-0.5" />
                    Mint
                    <Coins size={10} className="ml-0.5 mr-0.5" />
                    <span>100</span>
                  </>
                )}
              </Button>
            )}
            
            {justMinted && (
              <div className="w-full p-1 bg-green-500/20 border border-green-500 rounded text-center">
                <span className="text-green-400 text-[9px] font-semibold">Minting Successful!</span>
              </div>
            )}
            
            {/* Attribute Boost Section - Only show for owned holobots with compact layout */}
            {isOwned && (
              <div>
                <h3 className="text-[9px] font-bold mb-0.5 text-[#33C3F0] flex items-center justify-between">
                  <span>Available Boosts</span>
                                      <Badge variant="outline" className="bg-blue-800/30 border-blue-500 text-blue-300 text-[8px] py-0 px-1 h-4 flex items-center">
                    <Zap className="h-2 w-2 mr-0.5" /> {attributePoints}
                  </Badge>
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  <button 
                    className={`px-1 py-0.5 text-[8px] ${attributePoints > 0 ? 'bg-[#1A1F2C] border border-[#33C3F0] text-[#33C3F0] hover:bg-[#374151]' : 'bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed'} rounded transition-colors`}
                    onClick={() => handleBoostAttribute('attack')}
                    disabled={attributePoints === 0}
                  >
                    +1 ATK
                  </button>
                  <button 
                    className={`px-1 py-0.5 text-[8px] ${attributePoints > 0 ? 'bg-[#1A1F2C] border border-[#33C3F0] text-[#33C3F0] hover:bg-[#374151]' : 'bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed'} rounded transition-colors`}
                    onClick={() => handleBoostAttribute('defense')}
                    disabled={attributePoints === 0}
                  >
                    +1 DEF
                  </button>
                  <button 
                    className={`px-1 py-0.5 text-[8px] ${attributePoints > 0 ? 'bg-[#1A1F2C] border border-[#33C3F0] text-[#33C3F0] hover:bg-[#374151]' : 'bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed'} rounded transition-colors`}
                    onClick={() => handleBoostAttribute('speed')}
                    disabled={attributePoints === 0}
                  >
                    +1 SPD
                  </button>
                  <button 
                    className={`px-1 py-0.5 text-[8px] ${attributePoints > 0 ? 'bg-[#1A1F2C] border border-[#33C3F0] text-[#33C3F0] hover:bg-[#374151]' : 'bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed'} rounded transition-colors`}
                    onClick={() => handleBoostAttribute('health')}
                    disabled={attributePoints === 0}
                  >
                    +10 HP
                  </button>
                </div>
              </div>
            )}

            {/* Parts Equipment Section - Only show for owned holobots */}
            {isOwned && (
              <HolobotPartsEquipment holobotName={holobot.name} />
            )}
          </div>
        </div>
        
        {/* TCG Card - With preserved width on mobile */}
        <div className="flex-1 flex justify-center items-center">
          <div className="transform scale-100 origin-center w-[150px] sm:w-auto">
            <HolobotCard 
              stats={{
                ...holobot,
                level: isOwned ? level : holobot.level,
                experience: isOwned ? currentXp : undefined,
                nextLevelExp: isOwned ? nextLevelXp : undefined,
                name: holobot.name.toUpperCase(),
                // Apply boosted attributes and parts bonuses if owned
                attack: holobot.attack + (userHolobot?.boostedAttributes?.attack || 0) + partsBonuses.attack,
                defense: holobot.defense + (userHolobot?.boostedAttributes?.defense || 0) + partsBonuses.defense,
                speed: holobot.speed + (userHolobot?.boostedAttributes?.speed || 0) + partsBonuses.speed,
                maxHealth: holobot.maxHealth + (userHolobot?.boostedAttributes?.health || 0),
              }} 
              variant={isOwned ? "blue" : "red"} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
