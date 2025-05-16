import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Package, Ticket, Clock, Plus } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { ItemCard } from "@/components/items/ItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "react-router-dom";
import { BLUEPRINT_TIERS } from "@/components/holobots/BlueprintSection";
import type { UserHolobot } from "@/types/user";
import { HolobotSelectModal } from "@/components/items/HolobotSelectModal";

interface GachaItem {
  name: string;
  rarity: "common" | "rare" | "extremely-rare";
  chance: number;
}

const ITEMS: GachaItem[] = [
  { name: "Daily Energy Refill", rarity: "common", chance: 0.597 },
  { name: "Exp Battle Booster", rarity: "rare", chance: 0.1015 },
  { name: "Temporary Attribute Boost", rarity: "rare", chance: 0.1015 },
  { name: "Rank Skip", rarity: "extremely-rare", chance: 0.002 }
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
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "gacha");

  // State for Holobot selection modal
  const [isHolobotSelectModalOpen, setIsHolobotSelectModalOpen] = useState(false);
  const [eligibleHolobotsForRankSkip, setEligibleHolobotsForRankSkip] = useState<UserHolobot[]>([]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "items") {
      setActiveTab("items");
    }
  }, [searchParams]);

  const isDailyPullAvailable = 
    !user.lastEnergyRefresh || 
    (user.holobots.length > 0 && 
     (!user.lastEnergyRefresh || 
      new Date(user.lastEnergyRefresh).getTime() + (DAILY_COOLDOWN_HOURS * 60 * 60 * 1000) < Date.now()));

  useEffect(() => {
    const updateCooldown = () => {
      if (!user.lastEnergyRefresh) {
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
  }, [user.lastEnergyRefresh]);

  const pullGacha = (amount: number, isPaidPull: boolean = true) => {
    if (isPaidPull) {
      const cost = amount === 1 ? SINGLE_PULL_COST : MULTI_PULL_COST;
      if (user.holosTokens < cost) {
        toast({
          title: "Insufficient Holos",
          description: `You need ${cost} Holos tokens to perform this pull.`,
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!isDailyPullAvailable) {
        if (user.holobots.length === 0) {
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
      const updatesForUser: Partial<typeof user> = {};

      if (isPaidPull) {
        const cost = amount === 1 ? SINGLE_PULL_COST : MULTI_PULL_COST;
        updatesForUser.holosTokens = (user.holosTokens || 0) - cost;
      } else {
        updatesForUser.lastEnergyRefresh = new Date().toISOString();
      }

      const itemCounts = {
        "energy-refill": 0,
        "exp-booster": 0,
        "rank-skip": 0,
      };
      newPulls.forEach(pull => {
        if (pull.name === "Daily Energy Refill") itemCounts["energy-refill"]++;
        if (pull.name === "Exp Battle Booster") itemCounts["exp-booster"]++;
        if (pull.name === "Rank Skip") itemCounts["rank-skip"]++;
      });

      updatesForUser.energy_refills = (user.energy_refills || 0) + itemCounts["energy-refill"];
      updatesForUser.exp_boosters = (user.exp_boosters || 0) + itemCounts["exp-booster"];
      updatesForUser.rank_skips = (user.rank_skips || 0) + itemCounts["rank-skip"];
      
      updateUser(updatesForUser);

      setPulls(newPulls);
      setIsAnimating(false);
    }, 1000);
  };

  const useGachaTicket = (amount: number = 1) => {
    if ((user.gachaTickets || 0) < amount) {
      toast({
        title: "Not Enough Gacha Tickets",
        description: `You need ${amount} Gacha Tickets to use this option.`,
        variant: "destructive"
      });
      return;
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
      const updatesForUser: Partial<typeof user> = {};
      updatesForUser.gachaTickets = (user.gachaTickets || 0) - amount;

      const itemCounts = {
        "energy-refill": 0,
        "exp-booster": 0,
        "rank-skip": 0,
      };
      newPulls.forEach(pull => {
        if (pull.name === "Daily Energy Refill") itemCounts["energy-refill"]++;
        if (pull.name === "Exp Battle Booster") itemCounts["exp-booster"]++;
        if (pull.name === "Rank Skip") itemCounts["rank-skip"]++;
      });

      updatesForUser.energy_refills = (user.energy_refills || 0) + itemCounts["energy-refill"];
      updatesForUser.exp_boosters = (user.exp_boosters || 0) + itemCounts["exp-booster"];
      updatesForUser.rank_skips = (user.rank_skips || 0) + itemCounts["rank-skip"];
      
      updateUser(updatesForUser);

      setPulls(newPulls);
      setIsAnimating(false);
      
      toast({
        title: "Tickets Used",
        description: `You've used ${amount} Gacha Ticket${amount > 1 ? 's' : ''} and received items!`,
      });
    }, 1000);
  };

  // Helper function to get attribute points for a tier (replicated from BlueprintSection.tsx or should be imported)
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

  const handleRankSkipConfirm = async (selectedHolobotName: string) => {
    if (!user || (user.rank_skips || 0) <= 0) {
      toast({
        title: "Error",
        description: "No Rank Skips available or user data missing.",
        variant: "destructive"
      });
      setIsUsingItem(false);
      return;
    }

    const targetHolobot = user.holobots?.find(h => h.name === selectedHolobotName);

    if (!targetHolobot) {
      toast({
        title: "Error",
        description: "Selected Holobot not found.",
        variant: "destructive"
      });
      setIsUsingItem(false);
      return;
    }

    const currentRank = targetHolobot.rank || "Common";
    const currentRankIndex = TIER_ORDER.indexOf(currentRank);

    if (currentRankIndex === -1 || currentRankIndex >= TIER_ORDER.length - 1) {
      toast({
        title: "Max Rank",
        description: `${selectedHolobotName} is already at the highest rank or an unknown rank.`,
        variant: "destructive"
      });
      setIsUsingItem(false);
      return;
    }

    const nextRankName = TIER_ORDER[currentRankIndex + 1];
    const nextTierInfo = Object.values(BLUEPRINT_TIERS).find(tier => tier.name === nextRankName);

    if (!nextTierInfo) {
      toast({
        title: "Error",
        description: "Could not determine next rank information.",
        variant: "destructive"
      });
      setIsUsingItem(false);
      return;
    }

    const attributePointsToAdd = getAttributePointsForTier(nextRankName);

    const updatedHolobots = user.holobots.map((h: UserHolobot) => {
      if (h.name === selectedHolobotName) {
        return {
          ...h,
          rank: nextRankName,
          level: nextTierInfo.startLevel,
          experience: 0,
          nextLevelExp: 100, 
          attributePoints: (h.attributePoints || 0) + attributePointsToAdd,
        };
      }
      return h;
    });

    try {
      await updateUser({
        rank_skips: (user.rank_skips || 0) - 1,
        holobots: updatedHolobots,
      });

      toast({
        title: "Rank Skipped!",
        description: `${selectedHolobotName} has advanced to ${nextRankName} rank (Level ${nextTierInfo.startLevel})!`,
      });
    } catch (error) {
      console.error("Error using rank skip:", error);
      toast({
        title: "Error",
        description: "Failed to use the Rank Skip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUsingItem(false);
      setIsHolobotSelectModalOpen(false);
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
            setIsUsingItem(false); // Added to ensure isLoading state is reset
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
            setIsUsingItem(false); // Added to ensure isLoading state is reset
            return;
          }
          
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
          
          const updatesForUser: Partial<typeof user> = {};
          updatesForUser.gachaTickets = (user.gachaTickets || 0) - 1;

          const itemCounts = {
            "energy-refill": 0,
            "exp-booster": 0,
            "rank-skip": 0,
          };
          specialPull.forEach(pull => {
            if (pull.name === "Daily Energy Refill") itemCounts["energy-refill"]++;
            if (pull.name === "Exp Battle Booster") itemCounts["exp-booster"]++;
            if (pull.name === "Rank Skip") itemCounts["rank-skip"]++;
          });
    
          updatesForUser.energy_refills = (user.energy_refills || 0) + itemCounts["energy-refill"];
          updatesForUser.exp_boosters = (user.exp_boosters || 0) + itemCounts["exp-booster"];
          updatesForUser.rank_skips = (user.rank_skips || 0) + itemCounts["rank-skip"];

          await updateUser(updatesForUser);
          
          setPulls(specialPull);
          
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
            setIsUsingItem(false); // Added to ensure isLoading state is reset
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
            setIsUsingItem(false); // Added to ensure isLoading state is reset
            return;
          }
          
          await updateUser({ 
            exp_boosters: (user.exp_boosters || 0) - 1 
            // Note: Actual EXP boost effect would be handled elsewhere, e.g., by setting a flag on the user object
            // that persists for 24h and is checked during battle reward calculation.
            // This updateUser call only decrements the booster count.
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
            setIsUsingItem(false); // Reset if no skips available
            return;
          }
          
          const eligibleBots = user.holobots?.filter(
            (h: UserHolobot) => (h.rank || "Common") !== "Legendary"
          ) || [];

          if (eligibleBots.length === 0) {
            toast({
              title: "No Eligible Holobot",
              description: "All your Holobots are at max rank or you have no Holobots to upgrade.",
              variant: "destructive"
            });
            setIsUsingItem(false);
            return;
          }

          setEligibleHolobotsForRankSkip(eligibleBots);
          setIsHolobotSelectModalOpen(true);
          // setIsUsingItem(false) will be handled by the modal's close or confirm action for rank-skip.
          return; // Return here to prevent falling through to the finally block immediately
          
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
      // For rank-skip, setIsUsingItem(false) is handled in handleRankSkipConfirm or modal close.
      // For other items, or if rank-skip path doesn't open modal (e.g. no eligible bots), set to false.
      if (type !== "rank-skip" || !isHolobotSelectModalOpen) { // Check if modal was opened for rank-skip
          setIsUsingItem(false);
      }
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
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2 font-orbitron italic animate-pulse">
            GACHA SYSTEM
          </h1>
          <p className="text-gray-400 text-sm mx-auto max-w-md">
            Spend HOLOS tokens for a chance to win powerful items and boosts
          </p>
        </div>

        <Tabs 
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={setActiveTab}
          className="mx-auto max-w-3xl"
        >
          <TabsList className="grid w-full grid-cols-2 bg-[#121620] border border-holobots-border">
            <TabsTrigger 
              value="gacha" 
              className={`${activeTab === 'gacha' ? 'bg-cyan-400/20 text-white' : 'text-gray-400'} font-orbitron`}
            >
              <Package className="w-4 h-4 mr-2" />
              Gacha Pull
            </TabsTrigger>
            <TabsTrigger 
              value="items" 
              className={`${activeTab === 'items' ? 'bg-cyan-400/20 text-white' : 'text-gray-400'} font-orbitron`}
            >
              <Ticket className="w-4 h-4 mr-2" />
              My Items
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="gacha" className="space-y-4">
            <div className="relative">
              <img 
                src="/lovable-uploads/dbbb9702-9979-48e3-96d9-574fbbf4ec3f.png" 
                alt="Gacha Machine" 
                className="mx-auto mb-8 w-96 h-auto"
              />
              
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="bg-[#1A1F2C] border border-holobots-border p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-yellow-500" />
                    <span className="text-cyan-400">Tickets: {user.gachaTickets}</span>
                  </div>
                </div>
                <div className="bg-[#1A1F2C] border border-holobots-border p-2 rounded-lg">
                  <span className="text-cyan-400">Holos: {user.holosTokens}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
                <Button
                  onClick={() => pullGacha(1, false)}
                  disabled={isAnimating || !isDailyPullAvailable}
                  className="w-full sm:w-auto max-w-xs bg-[#1A1F2C] border border-cyan-500 hover:bg-cyan-900/20 text-white"
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
                      {timeUntilNextDailyPull}
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={() => useGachaTicket(1)}
                  disabled={isAnimating || (user.gachaTickets || 0) <= 0}
                  className="w-full sm:w-auto max-w-xs bg-[#1A1F2C] border border-cyan-500 hover:bg-cyan-900/20 text-white"
                  size="lg"
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  Use Ticket ({user.gachaTickets || 0})
                </Button>
                
                <Button 
                  onClick={() => useGachaTicket(10)}
                  disabled={isAnimating || (user.gachaTickets || 0) < 10}
                  className="w-full sm:w-auto max-w-xs bg-[#1A1F2C] border border-cyan-500 hover:bg-cyan-900/20 text-white"
                  size="lg"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  <Ticket className="mr-1 h-4 w-4" />
                  10x Tickets
                </Button>
              </div>
              
              {!isDailyPullAvailable && (
                <div className="w-full max-w-xs mx-auto">
                  <Progress value={cooldownProgress} className="h-2" />
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2 mb-8">
              <Button
                onClick={() => pullGacha(1)}
                disabled={isAnimating || user.holosTokens < SINGLE_PULL_COST}
                className="w-5/12 bg-red-500 hover:bg-red-600 text-white"
              >
                <Package className="mr-1 h-4 w-4" />
                1x Pull (50)
              </Button>
              
              <Button
                onClick={() => pullGacha(10)}
                disabled={isAnimating || user.holosTokens < MULTI_PULL_COST}
                className="w-5/12 bg-red-500 hover:bg-red-600 text-white"
              >
                <Package className="mr-1 h-4 w-4" />
                10x Pull (500)
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pulls.map((item, index) => (
                <div
                  key={index}
                  className={`
                    p-4 rounded-lg bg-[#1A1F2C] border border-holobots-border
                    shadow-lg transition-all duration-300
                    ${isAnimating ? 'animate-pulse' : ''}
                  `}
                >
                  <h3 className={`text-lg font-bold ${getRarityColor(item.rarity)}`}>
                    {item.name}
                  </h3>
                  <p className="text-sm text-white capitalize">
                    {item.rarity}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="items">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400 font-orbitron italic">
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
      
      <HolobotSelectModal
        isOpen={isHolobotSelectModalOpen}
        holobots={eligibleHolobotsForRankSkip}
        onConfirm={(selectedHolobotName) => {
          setIsUsingItem(true); 
          handleRankSkipConfirm(selectedHolobotName);
        }}
        onClose={() => {
          setIsHolobotSelectModalOpen(false);
          setIsUsingItem(false);
        }}
        isLoading={isUsingItem}
      />
    </div>
  );
}
