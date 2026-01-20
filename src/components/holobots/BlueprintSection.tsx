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
import { Clock, Star, Calendar, DollarSign, Wallet } from "lucide-react";
import { useWeb3RentalConversion } from "@/hooks/useWeb3RentalConversion";
import { PaymentMethodModal } from "@/components/rental/PaymentMethodModal";

export const BLUEPRINT_TIERS = {
  common: { required: 5, name: "Common", color: "blue", startLevel: 1 },
  champion: { required: 10, name: "Champion", color: "green", startLevel: 11 },
  rare: { required: 20, name: "Rare", color: "purple", startLevel: 21 },
  elite: { required: 40, name: "Elite", color: "yellow", startLevel: 31 },
  legendary: { required: 80, name: "Legendary", color: "orange", startLevel: 41 }
};

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

const calculateMintTier = (blueprintCount: number) => {
  if (blueprintCount >= BLUEPRINT_TIERS.legendary.required) return BLUEPRINT_TIERS.legendary;
  if (blueprintCount >= BLUEPRINT_TIERS.elite.required) return BLUEPRINT_TIERS.elite;
  if (blueprintCount >= BLUEPRINT_TIERS.rare.required) return BLUEPRINT_TIERS.rare;
  if (blueprintCount >= BLUEPRINT_TIERS.champion.required) return BLUEPRINT_TIERS.champion;
  if (blueprintCount >= BLUEPRINT_TIERS.common.required) return BLUEPRINT_TIERS.common;
  return null;
};

const getNextTierProgress = (blueprintCount: number) => {
  const currentTier = calculateMintTier(blueprintCount);
  let nextTierRequired = BLUEPRINT_TIERS.common.required;
  let progress = 0;
  
  if (!currentTier) {
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
    progress = 100;
    nextTierRequired = BLUEPRINT_TIERS.legendary.required;
  }
  
  return { progress: Math.min(100, Math.max(0, progress)), nextTierRequired };
};

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
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  
  // Web3 conversion hook
  const { 
    convertRentalToNFT, 
    isConverting: isWeb3Converting, 
  } = useWeb3RentalConversion();
  
  const blueprintCount = user?.blueprints?.[holobotKey] || 0;
  const currentTier = calculateMintTier(blueprintCount);
  const { progress, nextTierRequired } = getNextTierProgress(blueprintCount);
  
  const userHolobot = user?.holobots.find(h => h.name.toLowerCase() === holobotName.toLowerCase());
  const userOwnsHolobot = !!userHolobot;
  
  const handleRedeemBlueprints = async () => {
    if (!user || !currentTier || (userOwnsHolobot && selectedTab === "new")) return;
    
    try {
      setIsRedeeming(true);
      
      const attributePoints = getAttributePointsForTier(currentTier.name);
      
      const newHolobot = {
        name: holobotName,
        level: currentTier.startLevel,
        experience: 0,
        nextLevelExp: 100,
        boostedAttributes: {},
        rank: currentTier.name,
        attributePoints
      };
      
      const updatedHolobots = [...(user.holobots || []), newHolobot];
      
      const updatedBlueprints = {
        ...(user.blueprints || {}),
        [holobotKey]: blueprintCount - currentTier.required
      };
      
      await updateUser({
        holobots: updatedHolobots,
        blueprints: updatedBlueprints
      });
      
      toast({
        title: `${currentTier.name} ${holobotName} Obtained!`,
        description: `Successfully redeemed ${currentTier.required} blueprint pieces. You have ${attributePoints} attribute points to distribute.`,
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
  
  const handleUpgradeHolobot = async () => {
    if (!user || !userHolobot || !selectedTier) return;
    
    const selectedTierInfo = Object.values(BLUEPRINT_TIERS).find(tier => tier.name === selectedTier);
    if (!selectedTierInfo) return;
    
    try {
      setIsUpgrading(true);
      
      if (blueprintCount < selectedTierInfo.required) {
        toast({
          title: "Not Enough Blueprints",
          description: `You need ${selectedTierInfo.required} blueprints to upgrade to ${selectedTier} rank.`,
          variant: "destructive"
        });
        return;
      }
      
      const attributePoints = getAttributePointsForTier(selectedTier);
      
      const updatedHolobots = user.holobots.map(h => {
        if (h.name.toLowerCase() === holobotName.toLowerCase()) {
          return {
            ...h,
            level: selectedTierInfo.startLevel,
            rank: selectedTier,
            experience: 0,
            nextLevelExp: 100,
            boostedAttributes: h.boostedAttributes || {},
            attributePoints: (h.attributePoints || 0) + attributePoints
          };
        }
        return h;
      });
      
      const updatedBlueprints = {
        ...(user.blueprints || {}),
        [holobotKey]: blueprintCount - selectedTierInfo.required
      };
      
      await updateUser({
        holobots: updatedHolobots,
        blueprints: updatedBlueprints
      });
      
      toast({
        title: `${holobotName} Upgraded!`,
        description: `Successfully upgraded to ${selectedTier} rank (Level ${selectedTierInfo.startLevel}). You have ${attributePoints} attribute points to distribute.`,
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
  
  const calculateHolobotStartLevel = (tierName: string) => {
    const tier = Object.values(BLUEPRINT_TIERS).find(t => t.name === tierName);
    return tier ? tier.startLevel : 1;
  };
  
  return (
    <div className="mt-4 p-4 bg-[#374151]/50 rounded-lg border border-[#33C3F0]/30">
      <h2 className="text-lg font-bold text-[#33C3F0] mb-2 flex items-center gap-2">
        Blueprint Collection
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-[#33C3F0]/80" />
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
                <span className="text-sm text-[#33C3F0]">Blueprint Pieces:</span>
                <span className="text-sm font-bold text-gray-200">{blueprintCount}</span>
              </div>
            
                          <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Progress to {currentTier ? "Next Tier" : "Common Tier"}</span>
                  <span>{blueprintCount} / {nextTierRequired}</span>
                </div>
                <Progress value={progress} className="h-2 bg-gray-700" />
              </div>
            
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
          
          {currentTier && (
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-[#374151] text-gray-300">
              <TabsTrigger value="new" className="data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-[#33C3F0]">Mint New</TabsTrigger>
              <TabsTrigger value="upgrade" disabled={!userOwnsHolobot} className="data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-[#33C3F0]">Upgrade Existing</TabsTrigger>
              <TabsTrigger value="seasonal" className="data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-[#33C3F0]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Create Rental
                </span>
              </TabsTrigger>
              <TabsTrigger value="rentals" className="data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-[#33C3F0]">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  My Rentals
                </span>
              </TabsTrigger>
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

              {/* NEW: Seasonal Rental Creation Option */}
              <TabsContent value="seasonal" className="space-y-3">
                <Alert className="bg-orange-50/10 border-orange-400/30">
                  <Calendar className="h-4 w-4" />
                  <AlertTitle className="text-orange-400">Season 1 Active</AlertTitle>
                  <AlertDescription className="text-orange-300 text-xs">
                    Create <strong>90-day seasonal rentals</strong> instead of permanent Holobots. 
                    Convert to permanent NFTs before they expire!
                  </AlertDescription>
                </Alert>

                {!currentTier ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Insufficient Blueprint Pieces</AlertTitle>
                    <AlertDescription>
                      You need at least 5 blueprint pieces to create a seasonal rental.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-holobots-accent">Select rental tier:</p>
                      <RadioGroup value={selectedTier || ""} onValueChange={setSelectedTier} className="space-y-1">
                        {Object.entries(BLUEPRINT_TIERS).map(([key, tier]) => {
                          const hasEnoughBlueprints = blueprintCount >= tier.required;
                          const tierPricing = {
                            Common: 5, Champion: 15, Rare: 35, Elite: 75, Legendary: 125
                          };
                          const nftPrice = tierPricing[tier.name as keyof typeof tierPricing];
                          
                          return (
                            <div key={key} className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={tier.name} 
                                id={`seasonal-tier-${key}`}
                                disabled={!hasEnoughBlueprints}
                              />
                              <Label 
                                htmlFor={`seasonal-tier-${key}`}
                                className={`flex-1 cursor-pointer ${!hasEnoughBlueprints ? 'opacity-50' : ''}`}
                              >
                                <div className="flex items-center justify-between p-2 border rounded border-gray-600 hover:border-holobots-accent/50">
                                  <div className="flex items-center gap-2">
                                    <Badge className={`${getTierColor(tier.name)} text-white text-xs`}>
                                      {tier.name}
                                    </Badge>
                                    <span className="text-xs text-white">
                                      Level {tier.startLevel} ({tier.required} pieces)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-green-400 text-xs">
                                      <DollarSign className="h-3 w-3" />
                                      {nftPrice} NFT
                                    </div>
                                    {!hasEnoughBlueprints && (
                                      <span className="text-red-400 text-xs">
                                        Need {tier.required - blueprintCount} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </div>
                    
                    <Button 
                      onClick={async () => {
                        if (!selectedTier) return;
                        
                        try {
                          setIsRedeeming(true);
                          
                          // Create rental in database (90-day expiry)
                          const rentalExpiry = new Date();
                          rentalExpiry.setDate(rentalExpiry.getDate() + 90);
                          
                          const rentalHolobot = {
                            id: `rental_${holobotKey}_${Date.now()}`,
                            holobotKey,
                            name: holobotName,
                            tier: selectedTier,
                            level: BLUEPRINT_TIERS[selectedTier.toLowerCase() as keyof typeof BLUEPRINT_TIERS]?.startLevel || 1,
                            experience: 0,
                            seasonId: 'season1',
                            createdAt: new Date().toISOString(),
                            expiresAt: rentalExpiry.toISOString(),
                            isExpired: false,
                            canConvert: true
                          };
                          
                          // Update user's blueprint count and add rental
                          const tierRequired = BLUEPRINT_TIERS[selectedTier.toLowerCase() as keyof typeof BLUEPRINT_TIERS]?.required || 0;
                          const currentBlueprints = user.blueprints || {};
                          const updatedBlueprints = {
                            ...currentBlueprints,
                            [holobotKey]: Math.max(0, (currentBlueprints[holobotKey] || 0) - tierRequired)
                          };
                          
                          const currentRentals = user.rental_holobots || [];
                          const updatedRentals = [...currentRentals, rentalHolobot];
                          
                          await updateUser({
                            blueprints: updatedBlueprints,
                            rental_holobots: updatedRentals
                          });
                          
                          setSelectedTier(null);
                          
                          toast({
                            title: `🎉 ${selectedTier} Rental Created!`,
                            description: `You now have a 90-day ${selectedTier} ${holobotName} rental! Convert to NFT before it expires.`,
                          });
                          
                        } catch (error) {
                          console.error("Error creating rental:", error);
                          toast({
                            title: "Rental Creation Failed",
                            description: "There was an error creating your rental. Please try again.",
                            variant: "destructive"
                          });
                        } finally {
                          setIsRedeeming(false);
                        }
                      }}
                      disabled={!selectedTier || isRedeeming}
                      className="w-full py-1 h-8 text-sm bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isRedeeming ? (
                        "Creating Rental..."
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Create 90-Day Rental
                        </span>
                      )}
                    </Button>

                    <Alert className="bg-blue-50/10 border-blue-400/30">
                      <Star className="h-4 w-4" />
                      <AlertTitle className="text-blue-400">Rental Benefits</AlertTitle>
                      <AlertDescription className="text-blue-300 text-xs space-y-1">
                        <div>• Use in battles and quests for 90 days</div>
                        <div>• Convert to permanent NFT anytime</div>
                        <div>• Discounts available for HOLOS holders</div>
                        <div>• Full trading rights after conversion</div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </TabsContent>

              {/* NEW: My Rentals Tab */}
              <TabsContent value="rentals" className="space-y-3">
                {user?.rental_holobots?.filter(r => r.holobotKey === holobotKey && !r.isExpired).length === 0 ? (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>No Active Rentals</AlertTitle>
                    <AlertDescription>
                      You don't have any active {holobotName} rentals. Create one in the "Create Rental" tab!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {user?.rental_holobots?.filter(r => r.holobotKey === holobotKey && !r.isExpired).map((rental) => {
                      const expiryDate = new Date(rental.expiresAt);
                      const now = new Date();
                      const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                      const isExpiring = daysLeft <= 7;
                      const progressPercent = Math.max(0, Math.min(100, (daysLeft / 90) * 100));
                      
                      const tierPricing = {
                        Common: 5, Champion: 15, Rare: 35, Elite: 75, Legendary: 125
                      };
                      const nftPrice = tierPricing[rental.tier as keyof typeof tierPricing];
                      
                      return (
                        <div key={rental.id} className={`border rounded-lg p-3 ${isExpiring ? 'border-orange-400/50 bg-orange-50/5' : 'border-gray-600 bg-gray-800/20'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getTierColor(rental.tier)} text-white text-xs`}>
                                {rental.tier}
                              </Badge>
                              <span className="text-white font-medium">Level {rental.level} {rental.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-white">
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                              </div>
                              {isExpiring && daysLeft > 0 && (
                                <div className="text-xs text-orange-400">⚠️ Expiring soon!</div>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Rental Period</span>
                              <span>{Math.max(0, daysLeft)} days remaining</span>
                            </div>
                            <Progress 
                              value={progressPercent} 
                              className={`h-2 ${isExpiring ? 'bg-orange-100' : 'bg-gray-600'}`}
                            />
                          </div>
                          
                          {/* Convert to NFT button */}
                          {daysLeft > 0 && (
                            <Button
                              onClick={() => {
                                setSelectedRental(rental);
                                setPaymentModalOpen(true);
                              }}
                              disabled={isWeb3Converting}
                              size="sm"
                              className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                            >
                              <span className="flex items-center gap-1">
                                {isWeb3Converting && selectedRental?.id === rental.id ? (
                                  <>
                                    <Clock className="h-3 w-3 animate-spin" />
                                    Converting...
                                  </>
                                ) : (
                                  <>
                                    <Wallet className="h-3 w-3" />
                                    Convert to NFT (from ${nftPrice})
                                  </>
                                )}
                              </span>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Payment Method Modal */}
      {selectedRental && (
        <PaymentMethodModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedRental(null);
          }}
          onConfirm={async (paymentMethod) => {
            setPaymentModalOpen(false);
            
            const success = await convertRentalToNFT({
              rentalId: selectedRental.id,
              tier: selectedRental.tier,
              paymentMethod,
              holobotData: `${selectedRental.holobotKey}-${selectedRental.tier}-${Date.now()}`
            });
            
            if (success) {
              // Mark rental as converted in database
              const updatedRentals = user?.rental_holobots?.map(r => 
                r.id === selectedRental.id ? { ...r, isExpired: true } : r
              );
              
              // Add a new permanent holobot
              const newHolobot = {
                name: selectedRental.name,
                level: selectedRental.level,
                experience: selectedRental.experience,
                nextLevelExp: 100 * Math.pow(selectedRental.level, 2),
                boostedAttributes: {},
                rank: selectedRental.tier,
                attributePoints: getAttributePointsForTier(selectedRental.tier)
              };
              
              const updatedHolobots = [...(user?.holobots || []), newHolobot];
              
              await updateUser({
                rental_holobots: updatedRentals,
                holobots: updatedHolobots
              });

              toast({
                title: "NFT Minted!",
                description: `Your ${selectedRental.name} is now a permanent NFT!`,
              });
            }
          }}
          tier={selectedRental.tier}
          isConverting={isWeb3Converting}
        />
      )}
    </div>
  );
};

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
