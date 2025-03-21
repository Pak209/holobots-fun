
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { HOLOBOT_STATS } from "@/types/holobot";
import { BlueprintCard } from "@/components/marketplace/BlueprintCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the blueprint redemption tiers
export const BLUEPRINT_TIERS = {
  common: { required: 5, name: "Common", color: "blue" },
  champion: { required: 10, name: "Champion", color: "green" },
  rare: { required: 20, name: "Rare", color: "purple" },
  elite: { required: 40, name: "Elite", color: "yellow" },
  legendary: { required: 80, name: "Legendary", color: "orange" }
};

// Helper to determine background color based on tier
const getTierColor = (tierName: string) => {
  switch(tierName) {
    case "Common": return "bg-blue-600";
    case "Champion": return "bg-green-600";
    case "Rare": return "bg-purple-600";
    case "Elite": return "bg-yellow-600";
    case "Legendary": return "bg-orange-600";
    default: return "bg-gray-600";
  }
};

// Helper to calculate the tier a holobot would mint at based on blueprint count
const calculateMintTier = (blueprintCount: number) => {
  // From highest to lowest to get the best possible tier
  if (blueprintCount >= BLUEPRINT_TIERS.legendary.required) return BLUEPRINT_TIERS.legendary;
  if (blueprintCount >= BLUEPRINT_TIERS.elite.required) return BLUEPRINT_TIERS.elite;
  if (blueprintCount >= BLUEPRINT_TIERS.rare.required) return BLUEPRINT_TIERS.rare;
  if (blueprintCount >= BLUEPRINT_TIERS.champion.required) return BLUEPRINT_TIERS.champion;
  if (blueprintCount >= BLUEPRINT_TIERS.common.required) return BLUEPRINT_TIERS.common;
  return null; // Not enough blueprints for any tier
};

// Function to calculate progress to next tier
const getNextTierProgress = (blueprintCount: number) => {
  const currentTier = calculateMintTier(blueprintCount);
  let nextTierRequired = BLUEPRINT_TIERS.common.required;
  let progress = 0;
  
  if (!currentTier) {
    // Progress toward common tier
    progress = (blueprintCount / BLUEPRINT_TIERS.common.required) * 100;
  } else if (currentTier.name === "Common") {
    progress = ((blueprintCount - BLUEPRINT_TIERS.common.required) / 
                (BLUEPRINT_TIERS.champion.required - BLUEPRINT_TIERS.common.required)) * 100;
    nextTierRequired = BLUEPRINT_TIERS.champion.required;
  } else if (currentTier.name === "Champion") {
    progress = ((blueprintCount - BLUEPRINT_TIERS.champion.required) / 
                (BLUEPRINT_TIERS.rare.required - BLUEPRINT_TIERS.champion.required)) * 100;
    nextTierRequired = BLUEPRINT_TIERS.rare.required;
  } else if (currentTier.name === "Rare") {
    progress = ((blueprintCount - BLUEPRINT_TIERS.rare.required) / 
                (BLUEPRINT_TIERS.elite.required - BLUEPRINT_TIERS.rare.required)) * 100;
    nextTierRequired = BLUEPRINT_TIERS.elite.required;
  } else if (currentTier.name === "Elite") {
    progress = ((blueprintCount - BLUEPRINT_TIERS.elite.required) / 
                (BLUEPRINT_TIERS.legendary.required - BLUEPRINT_TIERS.elite.required)) * 100;
    nextTierRequired = BLUEPRINT_TIERS.legendary.required;
  } else {
    // Already at legendary tier
    progress = 100;
    nextTierRequired = BLUEPRINT_TIERS.legendary.required;
  }
  
  return { progress: Math.min(100, Math.max(0, progress)), nextTierRequired };
};

interface BlueprintSectionProps {
  holobotKey: string;
  holobotName: string;
}

export const BlueprintSection = ({ holobotKey, holobotName }: BlueprintSectionProps) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  // Get blueprint count for this holobot
  const blueprintCount = user?.blueprints?.[holobotKey] || 0;
  
  // Determine current mint tier based on blueprint count
  const currentTier = calculateMintTier(blueprintCount);
  
  // Calculate progress to next tier
  const { progress, nextTierRequired } = getNextTierProgress(blueprintCount);
  
  // Check if user already owns this holobot
  const userOwnsHolobot = user?.holobots.some(h => h.name.toLowerCase() === holobotName.toLowerCase());
  
  // Handle blueprint redemption
  const handleRedeemBlueprints = async () => {
    if (!user || !currentTier || userOwnsHolobot) return;
    
    try {
      setIsRedeeming(true);
      
      // Create a new holobot at the specified tier
      const newHolobot = {
        name: holobotName,
        level: calculateHolobotStartLevel(currentTier.name),
        experience: 0,
        nextLevelExp: 100,
        boostedAttributes: {}
      };
      
      // Update user's holobots array and reduce blueprint count
      const updatedHolobots = [...(user.holobots || []), newHolobot];
      
      // Calculate remaining blueprints after redemption
      const updatedBlueprints = {
        ...(user.blueprints || {}),
        [holobotKey]: blueprintCount - currentTier.required
      };
      
      // Update user profile
      await updateUser({
        holobots: updatedHolobots,
        blueprints: updatedBlueprints
      });
      
      toast({
        title: `${currentTier.name} ${holobotName} Obtained!`,
        description: `Successfully redeemed ${currentTier.required} blueprint pieces.`,
      });
    } catch (error) {
      console.error("Error redeeming blueprint:", error);
      toast({
        title: "Redemption Failed",
        description: "There was an error redeeming your blueprint pieces.",
        variant: "destructive"
      });
    } finally {
      setIsRedeeming(false);
    }
  };
  
  // Calculate starting level based on tier
  const calculateHolobotStartLevel = (tierName: string) => {
    switch(tierName) {
      case "Common": return 1;
      case "Champion": return 5;
      case "Rare": return 10;
      case "Elite": return 20;
      case "Legendary": return 30;
      default: return 1;
    }
  };
  
  return (
    <div className="mt-4 p-4 bg-holobots-card/50 rounded-lg border border-holobots-accent/30">
      <h2 className="text-lg font-bold text-holobots-accent mb-2 flex items-center gap-2">
        Blueprint Collection
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-holobots-accent/80" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                Collect blueprint pieces from quests and redeem them to mint Holobots of various ranks.
                Higher ranks start at higher levels!
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h2>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-none">
          <BlueprintCard 
            holobotName={holobotName} 
            tier={currentTier ? getTierNumber(currentTier.name) : 1}
            quantity={blueprintCount}
          />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-holobots-accent">Blueprint Pieces:</span>
              <span className="text-sm font-bold">{blueprintCount}</span>
            </div>
            
            {/* Show tier progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress to {currentTier ? "Next Tier" : "Common Tier"}</span>
                <span>{blueprintCount} / {nextTierRequired}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {/* Redemption tiers */}
            <div className="mt-3 grid grid-cols-5 gap-1 text-center">
              {Object.entries(BLUEPRINT_TIERS).map(([key, tier]) => (
                <div 
                  key={key}
                  className={`p-1 rounded text-[10px] font-semibold ${
                    blueprintCount >= tier.required 
                      ? getTierColor(tier.name) + " text-white" 
                      : "bg-gray-700/50 text-gray-400"
                  }`}
                >
                  {tier.name} ({tier.required})
                </div>
              ))}
            </div>
          </div>
          
          {userOwnsHolobot ? (
            <Alert variant="default" className="py-2 bg-blue-500/10 border-blue-500/30">
              <Info className="h-4 w-4" />
              <AlertTitle className="text-sm">You already own this Holobot</AlertTitle>
              <AlertDescription className="text-xs">
                Continue collecting blueprints to gain higher tier versions in the future.
              </AlertDescription>
            </Alert>
          ) : currentTier ? (
            <div className="flex flex-col">
              <p className="text-sm mb-2">
                You can redeem <Badge variant="outline" className={getTierColor(currentTier.name) + " text-white"}>{currentTier.name}</Badge> rank {holobotName}!
              </p>
              <Button 
                onClick={handleRedeemBlueprints}
                disabled={isRedeeming || !currentTier || userOwnsHolobot}
                className="w-full py-1 h-8 text-sm bg-holobots-accent hover:bg-holobots-hover text-white"
              >
                {isRedeeming ? "Redeeming..." : `Redeem for ${currentTier.required} Blueprints`}
              </Button>
            </div>
          ) : (
            <Alert variant="default" className="py-2 bg-amber-500/10 border-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-xs">
                Collect at least {BLUEPRINT_TIERS.common.required} blueprint pieces to redeem a Common rank Holobot.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get tier number from name
const getTierNumber = (tierName: string): number => {
  switch(tierName) {
    case "Legendary": return 5;
    case "Elite": return 4;
    case "Rare": return 3;
    case "Champion": return 2;
    case "Common":
    default: return 1;
  }
};
