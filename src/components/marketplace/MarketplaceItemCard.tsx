
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MarketplaceItemCardProps {
  name: string;
  description: string;
  rarity: "common" | "rare" | "extremely-rare";
  price: number;
  seller: string;
  quantity?: number;
  onBuy?: () => void;
}

export const MarketplaceItemCard = ({
  name,
  description,
  rarity,
  price,
  seller,
  quantity = 1,
  onBuy
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

  return (
    <div className="p-6 rounded-lg bg-holobots-card dark:bg-holobots-dark-card border border-holobots-accent shadow-neon-border transition-all duration-300 hover:shadow-neon-blue">
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
      
      <div className="flex justify-between items-center pt-3 border-t border-holobots-border dark:border-holobots-dark-border">
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
