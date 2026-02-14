import { NavigationMenu } from "@/components/NavigationMenu";
import { ItemCard } from "@/components/items/ItemCard";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { useHolobotPartsStore } from "@/stores/holobotPartsStore";
import { PartsInventoryDialog } from "@/components/items/PartsInventoryDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function UserItems() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { inventory } = useHolobotPartsStore();
  const [isPartsDialogOpen, setIsPartsDialogOpen] = useState(false);
  
  // Mock data for visual appearance (this would come from user profile in reality)
  const items = [
    {
      type: "holobot-parts" as const,
      name: "Holobot Parts",
      description: "Collected parts that can be equipped to enhance your Holobots",
      quantity: inventory.length
    },
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

  const handleUseItem = (type: string, name: string) => {
    if (type === "holobot-parts") {
      setIsPartsDialogOpen(true);
      return;
    }
    
    toast({
      title: `Used ${name}`,
      description: `You have used one ${name}. Effects applied!`,
    });
  };

  const getActionLabel = (type: string) => {
    if (type === "holobot-parts") return "View Parts";
    return "Use Item";
  };

  // Get item icon paths
  const getItemIcon = (itemType: string) => {
    switch(itemType) {
      case 'arena-pass':
        return '/src/assets/icons/ArenaPass.jpeg';
      case 'gacha-ticket':
        return '/src/assets/icons/GachaTicket.jpeg';
      case 'energy-refill':
        return '/src/assets/icons/EnergyRefill.jpeg';
      case 'exp-booster':
        return '/src/assets/icons/EXPboost.jpeg';
      case 'rank-skip':
        return '/src/assets/icons/RankSkip.jpeg';
      case 'holobot-parts':
        return '/src/assets/icons/CorePart.png'; // Use a part image as icon
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {items.map((item, index) => {
            const iconPath = getItemIcon(item.type);

            return (
              <div 
                key={index} 
                className="relative bg-gradient-to-r from-gray-900 via-black to-transparent border-4 border-[#F5C400] shadow-[0_0_15px_rgba(245,196,0,0.3)] hover:shadow-[0_0_25px_rgba(245,196,0,0.5)] transition-all"
                style={{
                  clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
                }}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Icon */}
                  {iconPath && (
                    <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-black/50 border-2 border-[#F5C400]/50 p-2" style={{
                      clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                    }}>
                      <img 
                        src={iconPath} 
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider mb-1">
                      {item.name}
                    </h3>
                    <div className="h-1 w-full bg-gray-700 mb-2" style={{
                      clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)'
                    }}></div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Quantity and Action */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-black/70 border-2 border-cyan-400 px-4 py-2" style={{
                      clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                    }}>
                      <span className="text-xs text-gray-400">QTY:</span>
                      <span className="text-2xl sm:text-3xl font-black text-white">x{item.quantity}</span>
                    </div>
                    <Button 
                      className="bg-[#F5C400] hover:bg-[#D4A400] text-black font-black uppercase tracking-widest text-sm px-6 py-2 border-2 border-black shadow-[0_0_10px_rgba(245,196,0,0.5)] transition-all"
                      style={{
                        clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                      }}
                      onClick={() => handleUseItem(item.type, item.name)}
                      disabled={item.quantity <= 0 && item.type !== "holobot-parts"}
                    >
                      {getActionLabel(item.type)}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Parts Inventory Dialog */}
      <PartsInventoryDialog 
        open={isPartsDialogOpen}
        onOpenChange={setIsPartsDialogOpen}
      />
    </div>
  );
}
