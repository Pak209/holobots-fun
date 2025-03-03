
import { useState, useEffect } from "react";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Package, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

export default function Gacha() {
  const [holos, setHolos] = useState(0);
  const [gachaTickets, setGachaTickets] = useState(0);
  const [pulls, setPulls] = useState<GachaItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch user's holos and gacha tickets
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('users')
            .select('tokens')
            .eq('wallet_address', user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            return;
          }

          if (data) {
            setHolos(data.tokens || 0);
            // Initialize gacha tickets to 0 since the column doesn't exist yet
            setGachaTickets(0);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const pullGacha = (amount: number) => {
    const cost = amount === 1 ? SINGLE_PULL_COST : MULTI_PULL_COST;
    
    if (holos < cost) {
      toast({
        title: "Insufficient Holos",
        description: `You need ${cost} Holos tokens to perform this pull.`,
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

    setHolos(prev => prev - cost);
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
      <NavigationMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="relative">
          <img 
            src="/public/lovable-uploads/dbbb9702-9979-48e3-96d9-574fbbf4ec3f.png" 
            alt="Gacha Machine" 
            className="mx-auto mb-8 w-96 h-auto"
          />
          
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="bg-holobots-card dark:bg-holobots-dark-card p-2 rounded-lg shadow-neon-border">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-yellow-500" />
                <span className="text-holobots-accent">Tickets: {gachaTickets}</span>
              </div>
            </div>
            <div className="bg-holobots-card dark:bg-holobots-dark-card p-2 rounded-lg shadow-neon-border">
              <span className="text-holobots-accent">Holos: {holos}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => pullGacha(1)}
            disabled={isAnimating || holos < SINGLE_PULL_COST}
            className="bg-holobots-accent hover:bg-holobots-hover text-white"
          >
            <Package className="mr-2 h-4 w-4" />
            Single Pull (50 Holos)
          </Button>
          
          <Button
            onClick={() => pullGacha(10)}
            disabled={isAnimating || holos < MULTI_PULL_COST}
            className="bg-holobots-accent hover:bg-holobots-hover text-white"
          >
            <Package className="mr-2 h-4 w-4" />
            10x Pull (500 Holos)
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
