
import { NavigationMenu } from "@/components/NavigationMenu";

interface Item {
  name: string;
  rarity: "common" | "rare" | "extremely-rare";
  description: string;
  quantity: number;
}

export default function UserItems() {
  // Mock data - in a real app this would come from your backend
  const items: Item[] = [
    {
      name: "Daily Energy Refill",
      rarity: "common",
      description: "Restores your daily energy to full",
      quantity: 5
    },
    {
      name: "Exp Battle Booster",
      rarity: "rare",
      description: "Doubles experience gained from battles",
      quantity: 2
    },
    {
      name: "Temporary Attribute Boost",
      rarity: "rare",
      description: "Temporarily boosts your attributes",
      quantity: 3
    },
    {
      name: "Rank Skip",
      rarity: "extremely-rare",
      description: "Skip to the next rank instantly",
      quantity: 1
    }
  ];

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
      <nav className="w-full p-4 flex justify-between items-center z-50 bg-background/80 backdrop-blur-sm">
        <div className="text-2xl font-bold italic tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-holobots-accent to-holobots-hover">
          HOLOBOTS
        </div>
      </nav>
      <NavigationMenu />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold italic mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-holobots-accent to-holobots-hover">
          Your Items
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-holobots-card dark:bg-holobots-dark-card
                border border-holobots-border dark:border-holobots-dark-border
                shadow-neon-border transition-all duration-300 hover:shadow-neon-blue"
            >
              <h3 className={`text-lg font-bold mb-2 ${getRarityColor(item.rarity)}`}>
                {item.name}
              </h3>
              <p className="text-sm text-holobots-text dark:text-holobots-dark-text mb-4">
                {item.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-holobots-text dark:text-holobots-dark-text capitalize">
                  {item.rarity}
                </span>
                <span className="text-holobots-accent dark:text-holobots-dark-accent font-bold">
                  x{item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
