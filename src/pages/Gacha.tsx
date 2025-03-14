
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Package, Ticket, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { ItemCard } from "@/components/items/ItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface GachaItem {
  name: string;
  rarity: "common" | "rare" | "extremely-rare";
  chance: number;
  type: "energy-refill" | "exp-booster" | "rank-skip" | "arena-pass" | "gacha-ticket" | "attribute-boost";
  attribute?: "attack" | "defense" | "speed" | "health"; // For attribute boosts
}

const ITEMS: GachaItem[] = [
  { name: "Daily Energy Refill", rarity: "common", chance: 0.50, type: "energy-refill" },
  { name: "Exp Battle Booster", rarity: "rare", chance: 0.10, type: "exp-booster" },
  { name: "Attack Boost", rarity: "rare", chance: 0.15, type: "attribute-boost", attribute: "attack" },
  { name: "Defense Boost", rarity: "rare", chance: 0.15, type: "attribute-boost", attribute: "defense" },
  { name: "Speed Boost", rarity: "rare", chance: 0.075, type: "attribute-boost", attribute: "speed" },
  { name: "Rank Skip", rarity: "extremely-rare", chance: 0.025, type: "rank-skip" }
];

const SINGLE_PULL_COST = 50;
const MULTI_PULL_COST = 500;
const DAILY_COOLDOWN_HOURS = 24;

export default function Gacha() {
  const { user, updateUser } = useAuth();
  const [pulls, setPulls] = useState<GachaItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeUntilNextDailyPull, setTimeUntilNextDailyPull] = useState<string | null>(null);
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [isUsingItem, setIsUsingItem] = useState(false);
  const { toast } = useToast();

  const isDailyPullAvailable = 
    !user?.lastEnergyRefresh || 
    (user?.holobots?.length > 0 && 
     new Date(user.lastEnergyRefresh).getTime() + (DAILY_COOLDOWN_HOURS * 60 * 60 * 1000) < Date.now());

  useEffect(() => {
    const updateCooldown = () => {
      if (!user?.lastEnergyRefresh) {
        setTimeUntilNextDailyPull(null);
        setCooldownProgress(100);
        return;
      }

      const lastPullTime = new Date(user.lastEnergyRefresh).getTime();
      const nextAvailableTime = lastPullTime + (DAILY_COOLDOWN_HOURS * 60 * 60 * 1000);
      const now = Date.now();
      
      if (now >= nextAvailableTime) {
        setTimeUntilNextDailyPull(null);
        setCooldownProgress(100);
      } else {
        setTimeUntilNextDailyPull(formatDistanceToNow(nextAvailableTime, { addSuffix: true }));
        
        const totalDuration = DAILY_COOLDOWN_HOURS * 60 * 60 * 1000;
        const elapsed = now - lastPullTime;
        const progressPercent = Math.min(Math.floor((elapsed / totalDuration) * 100), 100);
        setCooldownProgress(progressPercent);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 60000);
    
    return () => clearInterval(interval);
  }, [user?.lastEnergyRefresh]);

  const pullGacha = async (amount: number, isPaidPull: boolean = true) => {
    if (isPaidPull) {
      const cost = amount === 1 ? SINGLE_PULL_COST : MULTI_PULL_COST;
      
      if (!user || user.holosTokens < cost) {
        toast({
          title: "Insufficient Holos",
          description: `You need ${cost} Holos tokens to perform this pull.`,
          variant: "destructive"
        });
        return;
      }
      
      // Deduct tokens BEFORE the pull
      try {
        await updateUser({ holosTokens: user.holosTokens - cost });
      } catch (error) {
        console.error("Error deducting tokens:", error);
        toast({
          title: "Error",
          description: "Failed to deduct tokens. Please try again.",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!isDailyPullAvailable) {
        if (user?.holobots?.length === 0) {
          toast({
            title: "Mint a Holobot First",
            description: "You need to mint at least one Holobot to use the daily free pull.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Daily Pull Not Available",
            description: `Your next free pull will be available ${timeUntilNextDailyPull}.`,
            variant: "destructive"
          });
        }
        return;
      }
      
      // Update the last energy refresh time to now for daily pull
      try {
        await updateUser({ lastEnergyRefresh: new Date().toISOString() });
      } catch (error) {
        console.error("Error updating last energy refresh:", error);
        toast({
          title: "Error",
          description: "Failed to use daily pull. Please try again.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsAnimating(true);
    const newPulls: GachaItem[] = [];

    for (let i = 0; i < amount; i++) {
      const rand = Math.random();
      let cumulative = 0;
      
      for (const item of ITEMS) {
        cumulative += item.chance;
        if (rand <= cumulative) {
          newPulls.push(item);
          break;
        }
      }
    }

    setTimeout(() => {
      setPulls(newPulls);
      setIsAnimating(false);
      
      // Update user's items based on pulls
      handleItemsFromPulls(newPulls);
    }, 1000);
  };

  const handleItemsFromPulls = async (newPulls: GachaItem[]) => {
    if (!user) return;
    
    // Count occurrences of each item type
    const itemCounts = {
      "energy-refill": 0,
      "exp-booster": 0,
      "rank-skip": 0,
      "arena-pass": 0,
      "gacha-ticket": 0
    };
    
    // Track attribute boosts to apply
    const attributeBoosts: Record<string, number> = {};
    let hasAttributeBoosts = false;
    
    newPulls.forEach(pull => {
      if (pull.type === "attribute-boost" && pull.attribute) {
        hasAttributeBoosts = true;
        attributeBoosts[pull.attribute] = (attributeBoosts[pull.attribute] || 0) + 1;
      } else if (pull.type in itemCounts) {
        itemCounts[pull.type as keyof typeof itemCounts]++;
      }
    });
    
    try {
      // Update user's inventory with regular items
      const updates: Partial<any> = {
        energy_refills: (user.energy_refills || 0) + itemCounts["energy-refill"],
        exp_boosters: (user.exp_boosters || 0) + itemCounts["exp-booster"],
        rank_skips: (user.rank_skips || 0) + itemCounts["rank-skip"]
      };
      
      // If we have attribute boosts, we need to apply them to the active Holobot
      if (hasAttributeBoosts && user.holobots && user.holobots.length > 0) {
        // Get the first (active) Holobot
        const activeHolobot = user.holobots[0];
        const boostedAttributes = activeHolobot.boostedAttributes || {};
        
        // Apply attribute boosts
        Object.entries(attributeBoosts).forEach(([attribute, count]) => {
          boostedAttributes[attribute] = (boostedAttributes[attribute] || 0) + count;
        });
        
        // Update the Holobot with the new boosted attributes
        const updatedHolobots = [...user.holobots];
        updatedHolobots[0] = {
          ...activeHolobot,
          boostedAttributes
        };
        
        updates.holobots = updatedHolobots;
        
        // Show toast for attribute boosts
        toast({
          title: "Attribute Boost Applied",
          description: `Your active Holobot received attribute boosts!`,
        });
      }
      
      // Update user profile with all changes
      await updateUser(updates);
    } catch (error) {
      console.error("Error updating user inventory:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory with received items.",
        variant: "destructive"
      });
    }
  };

  const handleUseItem = async (type: string) => {
    setIsUsingItem(true);
    
    try {
      switch (type) {
        case "arena-pass":
          if ((user.arena_passes || 0) <= 0) {
            toast({
              title: "No Arena Passes",
              description: "You don't have any Arena Passes to use.",
              variant: "destructive"
            });
            return;
          }
          
          await updateUser({ 
            arena_passes: (user.arena_passes || 0) - 1 
          });
          
          toast({
            title: "Arena Pass Used",
            description: "You can now enter one arena battle without spending HOLOS tokens.",
          });
          break;
          
        case "gacha-ticket":
          if ((user.gachaTickets || 0) <= 0) {
            toast({
              title: "No Gacha Tickets",
              description: "You don't have any Gacha Tickets to use.",
              variant: "destructive"
            });
            return;
          }
          
          await updateUser({ 
            gachaTickets: user.gachaTickets - 1 
          });
          
          // Perform a special ticket pull
          const specialPull: GachaItem[] = [];
          const rand = Math.random();
          let cumulative = 0;
          
          for (const item of ITEMS) {
            cumulative += item.chance;
            if (rand <= cumulative) {
              specialPull.push(item);
              break;
            }
          }
          
          setPulls(specialPull);
          handleItemsFromPulls(specialPull);
          
          toast({
            title: "Gacha Ticket Used",
            description: "You received a special item from your ticket!",
          });
          break;
          
        case "energy-refill":
          if ((user.energy_refills || 0) <= 0) {
            toast({
              title: "No Energy Refills",
              description: "You don't have any Energy Refills to use.",
              variant: "destructive"
            });
            return;
          }
          
          await updateUser({ 
            energy_refills: (user.energy_refills || 0) - 1,
            dailyEnergy: user.maxDailyEnergy
          });
          
          toast({
            title: "Energy Refilled",
            description: "Your daily energy has been restored to full!",
          });
          break;
          
        case "exp-booster":
          if ((user.exp_boosters || 0) <= 0) {
            toast({
              title: "No EXP Boosters",
              description: "You don't have any EXP Boosters to use.",
              variant: "destructive"
            });
            return;
          }
          
          await updateUser({ 
            exp_boosters: (user.exp_boosters || 0) - 1
          });
          
          toast({
            title: "EXP Booster Active",
            description: "Double experience for all battles for the next 24 hours!",
          });
          break;
          
        case "rank-skip":
          if ((user.rank_skips || 0) <= 0) {
            toast({
              title: "No Rank Skips",
              description: "You don't have any Rank Skips to use.",
              variant: "destructive"
            });
            return;
          }
          
          await updateUser({ 
            rank_skips: (user.rank_skips || 0) - 1
          });
          
          toast({
            title: "Rank Skipped",
            description: "You've advanced to the next rank!",
          });
          break;
          
        default:
          toast({
            title: "Unknown Item",
            description: "This item cannot be used right now.",
            variant: "destructive"
          });
      }
    } catch (error) {
      console.error("Error using item:", error);
      toast({
        title: "Error",
        description: "Failed to use the item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUsingItem(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400";
      case "rare":
        return "text-purple-400";
      case "extremely-rare":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  // User items to display
  const userItems = [
    {
      type: "arena-pass" as const,
      name: "Arena Pass",
      description: "Grants entry to one arena battle without costing HOLOS tokens",
      quantity: user?.arena_passes || 0
    },
    {
      type: "gacha-ticket" as const,
      name: "Gacha Ticket",
      description: "Can be used for one pull in the Gacha system",
      quantity: user?.gachaTickets || 0
    },
    {
      type: "energy-refill" as const,
      name: "Daily Energy Refill",
      description: "Instantly restores your daily energy to full",
      quantity: user?.energy_refills || 0
    },
    {
      type: "exp-booster" as const,
      name: "EXP Battle Booster",
      description: "Doubles experience gained from battles for 24 hours",
      quantity: user?.exp_boosters || 0
    },
    {
      type: "rank-skip" as const,
      name: "Rank Skip",
      description: "Skip to the next rank instantly",
      quantity: user?.rank_skips || 0
    }
  ];

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background">
      <div className="container mx-auto px-4 py-8 pt-16">
        <Tabs defaultValue="gacha" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="gacha">Gacha Machine</TabsTrigger>
            <TabsTrigger value="items">Your Items</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gacha" className="space-y-4">
            <div className="relative">
              <img 
                src="/lovable-uploads/dbbb9702-9979-48e3-96d9-574fbbf4ec3f.png" 
                alt="Gacha Machine" 
                className="mx-auto mb-8 w-96 h-auto"
              />
              
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="bg-holobots-card dark:bg-holobots-dark-card p-2 rounded-lg shadow-neon-border">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-yellow-500" />
                    <span className="text-holobots-accent">Tickets: {user?.gachaTickets || 0}</span>
                  </div>
                </div>
                <div className="bg-holobots-card dark:bg-holobots-dark-card p-2 rounded-lg shadow-neon-border">
                  <span className="text-holobots-accent">Holos: {user?.holosTokens || 0}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-col items-center gap-2 mb-2">
                <Button
                  onClick={() => pullGacha(1, false)}
                  disabled={isAnimating || !isDailyPullAvailable || !user}
                  className={`w-full max-w-xs ${
                    isDailyPullAvailable 
                      ? "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white" 
                      : "bg-gray-500 text-gray-300 cursor-not-allowed"
                  }`}
                  size="lg"
                >
                  {isDailyPullAvailable ? (
                    <>
                      <Package className="mr-2 h-5 w-5" />
                      Daily Free Pull
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-5 w-5" />
                      {timeUntilNextDailyPull || "Loading..."}
                    </>
                  )}
                </Button>
                
                {!isDailyPullAvailable && (
                  <div className="w-full max-w-xs">
                    <Progress value={cooldownProgress} className="h-2" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              <Button
                onClick={() => pullGacha(1)}
                disabled={isAnimating || !user || (user && user.holosTokens < SINGLE_PULL_COST)}
                className="w-5/12 bg-holobots-accent hover:bg-holobots-hover text-white"
              >
                <Package className="mr-1 h-4 w-4" />
                1x Pull ({SINGLE_PULL_COST})
              </Button>
              
              <Button
                onClick={() => pullGacha(10)}
                disabled={isAnimating || !user || (user && user.holosTokens < MULTI_PULL_COST)}
                className="w-5/12 bg-holobots-accent hover:bg-holobots-hover text-white"
              >
                <Package className="mr-1 h-4 w-4" />
                10x Pull ({MULTI_PULL_COST})
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pulls.map((item, index) => (
                <div
                  key={index}
                  className={`
                    p-4 rounded-lg bg-holobots-card dark:bg-holobots-dark-card
                    border border-holobots-border dark:border-holobots-dark-border
                    shadow-neon-border transition-all duration-300
                    ${isAnimating ? 'animate-pulse' : ''}
                  `}
                >
                  <h3 className={`text-lg font-bold ${getRarityColor(item.rarity)}`}>
                    {item.name}
                  </h3>
                  <p className="text-sm text-holobots-text dark:text-holobots-dark-text capitalize">
                    {item.rarity}
                  </p>
                  {item.type === "attribute-boost" && item.attribute && (
                    <p className="text-xs text-holobots-accent mt-1">
                      Boosts {item.attribute} for your active Holobot
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="items">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4 text-holobots-text dark:text-holobots-dark-text">
                Your Items
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Use your items to gain advantages in battles, restore energy, or gain rewards.
              </p>
              <Separator className="mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userItems.map((item, index) => (
                  <ItemCard
                    key={index}
                    name={item.name}
                    description={item.description}
                    quantity={item.quantity}
                    type={item.type}
                    onClick={() => handleUseItem(item.type)}
                    actionLabel="Use Item"
                    disabled={item.quantity <= 0}
                    isLoading={isUsingItem}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
