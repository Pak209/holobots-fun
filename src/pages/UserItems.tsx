
import { NavigationMenu } from "@/components/NavigationMenu";
import { ItemCard } from "@/components/items/ItemCard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function UserItems() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock data for visual appearance (this would come from user profile in reality)
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
    }
  ];

  const handleUseItem = (type: string, name: string) => {
    toast({
      title: `Used ${name}`,
      description: `You have used one ${name}. Effects applied!`,
    });
  };

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8 text-holobots-text dark:text-holobots-dark-text bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent">
          Your Items
        </h1>
        
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
