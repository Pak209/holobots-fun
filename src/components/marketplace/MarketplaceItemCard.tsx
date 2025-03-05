
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemImage } from "@/components/items/ItemImage";

interface MarketplaceItemCardProps {
  name: string;
  description: string;
  rarity: "common" | "rare" | "extremely-rare";
  price: number;
  seller: string;
  quantity?: number;
  onBuy?: () => void;
  type?: "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip";
}

export const MarketplaceItemCard = ({
  name,
  description,
  rarity,
  price,
  seller,
  quantity = 1,
  onBuy,
  type = "energy-refill"
}: MarketplaceItemCardProps) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400 border-gray-400";
      case "rare":
        return "text-purple-400 border-purple-400";
      case "extremely-rare":
        return "text-yellow-400 border-yellow-400";
      default:
        return "text-gray-400 border-gray-400";
    }
  };

  // Map item name to type if not provided
  const determineType = (): "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip" => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("arena") || nameLower.includes("pass")) return "arena-pass";
    if (nameLower.includes("gacha") || nameLower.includes("ticket")) return "gacha-ticket";
    if (nameLower.includes("energy") || nameLower.includes("refill")) return "energy-refill";
    if (nameLower.includes("exp") || nameLower.includes("booster")) return "exp-booster";
    if (nameLower.includes("rank") || nameLower.includes("skip")) return "rank-skip";
    return type;
  };

  const itemType = determineType();

  return (
    <div className="p-6 rounded-lg bg-holobots-card dark:bg-holobots-dark-card border border-holobots-accent shadow-neon-border transition-all duration-300 hover:shadow-neon-blue">
      <div className="flex gap-4">
        {/* Item Image */}
        <ItemImage type={itemType} size="xl" />
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className={`text-lg font-bold ${getRarityColor(rarity)}`}>
              {name}
            </h3>
            <Badge className={`${getRarityColor(rarity)} bg-transparent capitalize`}>
              {rarity}
            </Badge>
          </div>
          
          <p className="text-sm text-holobots-text dark:text-holobots-dark-text mb-4">
            {description}
          </p>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">Seller: {seller}</span>
            <span className="text-holobots-accent dark:text-holobots-dark-accent font-bold">
              {quantity > 1 ? `x${quantity}` : ''}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-holobots-border dark:border-holobots-dark-border mt-3">
        <span className="font-semibold text-yellow-400">{price} HOLOS</span>
        <Button 
          size="sm" 
          onClick={onBuy}
          className="bg-holobots-accent hover:bg-holobots-accent/80 text-black"
        >
          <ShoppingCart className="mr-1 h-3.5 w-3.5" />
          Buy
        </Button>
      </div>
    </div>
  );
};
