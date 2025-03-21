
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { HOLOBOT_STATS } from "@/types/holobot";
import { BlueprintCard } from "@/components/marketplace/BlueprintCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Info, ArrowUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the blueprint redemption tiers
export const BLUEPRINT_TIERS = {
  common: { required: 5, name: "Common", color: "blue", startLevel: 1 },
  champion: { required: 10, name: "Champion", color: "green", startLevel: 11 }, // Fixed: Level 11 for Champion
  rare: { required: 20, name: "Rare", color: "purple", startLevel: 21 }, // Updated to level 21
  elite: { required: 40, name: "Elite", color: "yellow", startLevel: 31 }, // Updated to level 31
  legendary: { required: 80, name: "Legendary", color: "orange", startLevel: 41 } // Updated to level 41
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
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("new");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  
  // Get blueprint count for this holobot
  const blueprintCount = user?.blueprints?.[holobotKey] || 0;
  
  // Determine current mint tier based on blueprint count
  const currentTier = calculateMintTier(blueprintCount);
  
  // Calculate progress to next tier
  const { progress, nextTierRequired } = getNextTierProgress(blueprintCount);
  
  // Check if user already owns this holobot
  const userHolobot = user?.holobots.find(h => h.name.toLowerCase() === holobotName.toLowerCase());
  const userOwnsHolobot = !!userHolobot;
  
  // Handle blueprint redemption for new holobot
  const handleRedeemBlueprints = async () => {
    if (!user || !currentTier || (userOwnsHolobot && selectedTab === "new")) return;
    
    try {
      setIsRedeeming(true);
      
      // Create a new holobot at the specified tier
      const newHolobot = {
        name: holobotName,
        level: currentTier.startLevel,
        experience: 0,
        nextLevelExp: 100,
        boostedAttributes: {}, // Add 10 attribute points for the user to distribute
        rank: currentTier.name
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
        description: `Successfully redeemed ${currentTier.required} blueprint pieces. You have 10 attribute points to distribute.`,
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
  
  // Handle blueprint upgrade for existing holobot
  const handleUpgradeHolobot = async () => {
    if (!user || !userHolobot || !selectedTier) return;
    
    const selectedTierInfo = Object.values(BLUEPRINT_TIERS).find(tier => tier.name === selectedTier);
    if (!selectedTierInfo) return;
    
    try {
      setIsUpgrading(true);
      
      // Check if user has enough blueprints
      if (blueprintCount < selectedTierInfo.required) {
        toast({
          title: "Not Enough Blueprints",
          description: `You need ${selectedTierInfo.required} blueprints to upgrade to ${selectedTier} rank.`,
          variant: "destructive"
        });
        return;
      }
      
      // Update the holobot with new level and rank
      const updatedHolobots = user.holobots.map(h => {
        if (h.name.toLowerCase() === holobotName.toLowerCase()) {
          return {
            ...h,
            level: selectedTierInfo.startLevel,
            rank: selectedTier,
            experience: 0,
            nextLevelExp: 100,
            // Add boostedAttributes if it doesn't exist
            boostedAttributes: h.boostedAttributes || {}
          };
        }
        return h;
      });
      
      // Calculate remaining blueprints after upgrade
      const updatedBlueprints = {
        ...(user.blueprints || {}),
        [holobotKey]: blueprintCount - selectedTierInfo.required
      };
      
      // Update user profile
      await updateUser({
        holobots: updatedHolobots,
        blueprints: updatedBlueprints
      });
      
      toast({
        title: `${holobotName} Upgraded!`,
        description: `Successfully upgraded to ${selectedTier} rank (Level ${selectedTierInfo.startLevel}). You have 10 attribute points to distribute.`,
      });
    } catch (error) {
      console.error("Error upgrading holobot:", error);
      toast({
        title: "Upgrade Failed",
        description: "There was an error upgrading your holobot.",
        variant: "destructive"
      });
    } finally {
      setIsUpgrading(false);
      setSelectedTier(null);
    }
  };
  
  // Calculate starting level based on tier
  const calculateHolobotStartLevel = (tierName: string) => {
    const tier = Object.values(BLUEPRINT_TIERS).find(t => t.name === tierName);
    return tier ? tier.startLevel : 1;
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
                Higher ranks start at higher levels: Champion (11), Rare (21), Elite (31), Legendary (41).
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
          
          {/* Tabs for New Holobot vs Upgrade */}
          {currentTier && (
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new">Mint New</TabsTrigger>
                <TabsTrigger value="upgrade" disabled={!userOwnsHolobot}>Upgrade Existing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="new">
                {userOwnsHolobot ? (
                  <Alert variant="default" className="py-2 bg-blue-500/10 border-blue-500/30">
                    <Info className="h-4 w-4" />
                    <AlertTitle className="text-sm">You already own this Holobot</AlertTitle>
                    <AlertDescription className="text-xs">
                      Switch to the Upgrade tab to boost your existing Holobot's rank.
                    </AlertDescription>
                  </Alert>
                ) : currentTier ? (
                  <div className="flex flex-col">
                    <p className="text-sm mb-2">
                      You can redeem <Badge variant="outline" className={getTierColor(currentTier.name) + " text-white"}>{currentTier.name}</Badge> rank {holobotName}!
                    </p>
                    <Button 
                      onClick={handleRedeemBlueprints}
                      disabled={isRedeeming || !currentTier}
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
              </TabsContent>
              
              <TabsContent value="upgrade">
                {userOwnsHolobot ? (
                  <div className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p>Current {holobotName}:</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getTierColor(userHolobot.rank || "Common") + " text-white"}>
                          {userHolobot.rank || "Common"}
                        </Badge>
                        <span>Level {userHolobot.level}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-holobots-accent">Select upgrade tier:</p>
                      <RadioGroup value={selectedTier || ""} onValueChange={setSelectedTier} className="space-y-1">
                        {Object.entries(BLUEPRINT_TIERS).map(([key, tier]) => {
                          const isCurrentOrLower = 
                            getTierNumber(userHolobot.rank || "Common") >= getTierNumber(tier.name);
                          const hasEnoughBlueprints = blueprintCount >= tier.required;
                          
                          return (
                            <div key={key} className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={tier.name} 
                                id={`tier-${key}`}
                                disabled={isCurrentOrLower || !hasEnoughBlueprints}
                              />
                              <Label 
                                htmlFor={`tier-${key}`}
                                className={`text-xs flex items-center gap-1 ${
                                  isCurrentOrLower ? "text-gray-500 line-through" : 
                                  !hasEnoughBlueprints ? "text-gray-500" : "text-white"
                                }`}
                              >
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${getTierColor(tier.name)}`}>
                                  {tier.name}
                                </span>
                                <span>Level {tier.startLevel}</span>
                                <span className="text-gray-400">({tier.required} pieces)</span>
                                {!hasEnoughBlueprints && (
                                  <span className="text-red-500 text-[10px]">
                                    Need {tier.required - blueprintCount} more
                                  </span>
                                )}
                                {isCurrentOrLower && (
                                  <span className="text-gray-500 text-[10px]">
                                    Already at this rank or higher
                                  </span>
                                )}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </div>
                    
                    <Button 
                      onClick={handleUpgradeHolobot}
                      disabled={isUpgrading || !selectedTier}
                      className="w-full py-1 h-8 text-sm bg-holobots-accent hover:bg-holobots-hover text-white"
                    >
                      {isUpgrading ? (
                        "Upgrading..."
                      ) : (
                        <span className="flex items-center gap-1">
                          <ArrowUp className="h-3 w-3" />
                          Upgrade Holobot
                        </span>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Alert variant="default" className="py-2 bg-blue-500/10 border-blue-500/30">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      You don't own this Holobot yet. Mint it first before upgrading.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
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
