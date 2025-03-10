import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Package, Ticket, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";

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
  const { toast } = useToast();

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

    if (isPaidPull) {
      const cost = amount === 1 ? SINGLE_PULL_COST : MULTI_PULL_COST;
      updateUser({ holosTokens: user.holosTokens - cost });
    } else {
      updateUser({ lastEnergyRefresh: new Date().toISOString() });
    }

    setTimeout(() => {
      setPulls(newPulls);
      setIsAnimating(false);
    }, 1000);
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

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background">
      <div className="container mx-auto px-4 py-8 pt-16">
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
          <div className="flex flex-col items-center gap-2 mb-2">
            <Button
              onClick={() => pullGacha(1, false)}
              disabled={isAnimating || !isDailyPullAvailable}
              className="w-full max-w-xs bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
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
      </div>
    </div>
  );
}
