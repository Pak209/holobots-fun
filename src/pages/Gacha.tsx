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

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "items") {
      setActiveTab("items");
    }
  }, [searchParams]);

  const isDailyPullAvailable = 
    !user || !user.lastEnergyRefresh || 
    (user.holobots.length > 0 && 
     (!user.lastEnergyRefresh || 
      new Date(user.lastEnergyRefresh).getTime() + (DAILY_COOLDOWN_HOURS * 60 * 60 * 1000) < Date.now()));

  useEffect(() => {
    const updateCooldown = () => {
      if (!user || !user.lastEnergyRefresh) {
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

    if (isPaidPull) {
      const cost = amount === 1 ? SINGLE_PULL_COST : MULTI_PULL_COST;
      updateUser({ holosTokens: user.holosTokens - cost });
    } else {
      updateUser({ lastEnergyRefresh: new Date().toISOString() });
    }

    setTimeout(() => {
      setPulls(newPulls);
      setIsAnimating(false);
      
      handleItemsFromPulls(newPulls);
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

    updateUser({ gachaTickets: (user.gachaTickets || 0) - amount });

    setTimeout(() => {
      setPulls(newPulls);
      setIsAnimating(false);
      
      handleItemsFromPulls(newPulls);

      toast({
        title: "Tickets Used",
        description: `You've used ${amount} Gacha Ticket${amount > 1 ? 's' : ''} and received items!`,
      });
    }, 1000);
  };

  const handleItemsFromPulls = (newPulls: GachaItem[]) => {
    const itemCounts = {
      "energy-refill": 0,
      "exp-booster": 0,
      "rank-skip": 0,
      "arena-pass": 0,
      "gacha-ticket": 0
    };
    
    newPulls.forEach(pull => {
      if (pull.name === "Daily Energy Refill") itemCounts["energy-refill"]++;
      if (pull.name === "Exp Battle Booster") itemCounts["exp-booster"]++;
      if (pull.name === "Rank Skip") itemCounts["rank-skip"]++;
    });
    
    updateUser({
      energy_refills: (user.energy_refills || 0) + itemCounts["energy-refill"],
      exp_boosters: (user.exp_boosters || 0) + itemCounts["exp-booster"],
      rank_skips: (user.rank_skips || 0) + itemCounts["rank-skip"]
    });
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
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    <span className="text-holobots-accent">Tickets: {user.gachaTickets}</span>
                  </div>
                </div>
                <div className="bg-holobots-card dark:bg-holobots-dark-card p-2 rounded-lg shadow-neon-border">
                  <span className="text-holobots-accent">Holos: {user.holosTokens}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
                <Button
                  onClick={() => pullGacha(1, false)}
                  disabled={isAnimating || !isDailyPullAvailable}
                  className="w-full sm:w-auto max-w-xs bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
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
                  className="w-full sm:w-auto max-w-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  size="lg"
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  Use Ticket ({user.gachaTickets || 0})
                </Button>
                
                <Button 
                  onClick={() => useGachaTicket(10)}
                  disabled={isAnimating || (user.gachaTickets || 0) < 10}
                  className="w-full sm:w-auto max-w-xs bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
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
                className="w-5/12 bg-holobots-accent hover:bg-holobots-hover text-white"
              >
                <Package className="mr-1 h-4 w-4" />
                1x Pull (50)
              </Button>
              
              <Button
                onClick={() => pullGacha(10)}
                disabled={isAnimating || user.holosTokens < MULTI_PULL_COST}
                className="w-5/12 bg-holobots-accent hover:bg-holobots-hover text-white"
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
