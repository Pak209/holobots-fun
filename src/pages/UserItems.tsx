
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { ItemCard } from "@/components/items/ItemCard";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default function UserItems() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [activatingBooster, setActivatingBooster] = useState(false);
  
  // Collection of all possible items
  const items = [
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
    },
    {
      type: "boss-quest-pass" as const,
      name: "Boss Quest Pass",
      description: "Challenge bosses without spending energy",
      quantity: user?.boss_quest_passes || 0
    }
  ];

  const handleUseItem = (type: string, name: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to use items.",
        variant: "destructive"
      });
      return;
    }
    
    switch (type) {
      case "arena-pass":
        if ((user.arena_passes || 0) > 0) {
          updateUser({ arena_passes: (user.arena_passes || 0) - 1 });
          toast({
            title: `Used ${name}`,
            description: "Arena pass activated. Your next arena battle will be free!",
          });
        }
        break;
        
      case "energy-refill":
        if ((user.energy_refills || 0) > 0) {
          updateUser({ 
            energy_refills: (user.energy_refills || 0) - 1,
            dailyEnergy: user.maxDailyEnergy
          });
          toast({
            title: `Used ${name}`,
            description: "Your daily energy has been fully restored!",
          });
        }
        break;
        
      case "exp-booster":
        if ((user.exp_boosters || 0) > 0) {
          setActivatingBooster(true);
          
          // Simulate activation delay
          setTimeout(() => {
            updateUser({ exp_boosters: (user.exp_boosters || 0) - 1 });
            setActivatingBooster(false);
            
            toast({
              title: `EXP Booster Activated!`,
              description: "Your Holobots will gain double experience for the next 24 hours!",
            });
          }, 1000);
        }
        break;
        
      case "rank-skip":
        if ((user.rank_skips || 0) > 0) {
          const newLevel = (user.level || 1) + 1;
          updateUser({ 
            rank_skips: (user.rank_skips || 0) - 1,
            level: newLevel
          });
          toast({
            title: `Rank Skip Used!`,
            description: `You've advanced to level ${newLevel}!`,
          });
        }
        break;
        
      case "boss-quest-pass":
        if ((user.boss_quest_passes || 0) > 0) {
          updateUser({ boss_quest_passes: (user.boss_quest_passes || 0) - 1 });
          toast({
            title: `Boss Quest Pass Activated`,
            description: "Your next boss quest will not require energy!",
          });
        }
        break;
        
      default:
        toast({
          title: `Used ${name}`,
          description: `You have used one ${name}. Effects applied!`,
        });
    }
  };

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8 text-holobots-text dark:text-holobots-dark-text bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent">
          Your Items
        </h1>
        
        {/* Active Boosters Section */}
        <div className="mb-8 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-500/30">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-green-400" />
            Active Boosters
          </h2>
          
          <div className="space-y-2">
            {activatingBooster ? (
              <div className="flex items-center gap-2 p-2 bg-green-900/20 backdrop-blur-sm rounded-md border border-green-500/30">
                <Badge className="bg-green-500/80 text-white animate-pulse">
                  ACTIVATING
                </Badge>
                <span className="text-green-300">EXP Battle Booster (24h)</span>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400">
                No active boosters. Use items to activate their effects!
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <ItemCard
              key={index}
              name={item.name}
              description={item.description}
              quantity={item.quantity}
              type={item.type}
              onClick={() => handleUseItem(item.type, item.name)}
              actionLabel="Use Item"
              disabled={item.quantity <= 0}
              isLoading={item.type === "exp-booster" && activatingBooster}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
