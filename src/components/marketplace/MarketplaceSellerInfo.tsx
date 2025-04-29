
import { Button } from "@/components/ui/button";
import { Coins, ShoppingCart } from "lucide-react";

interface MarketplaceSellerInfoProps {
  seller: string;
  price: number;
  onBuy?: () => void;
  forSale: boolean;
}

export const MarketplaceSellerInfo = ({
  seller,
  price,
  onBuy,
  forSale = true
}: MarketplaceSellerInfoProps) => {
  return (
    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-holobots-border">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Seller:</span>
        <span className="text-sm font-medium">{seller}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-lg font-bold text-yellow-400 flex items-center">
          <Coins className="mr-1 h-4 w-4" />
          {price}
        </div>
        
        {forSale && (
          <Button 
            onClick={onBuy}
            size="sm"
            className="h-7 bg-holobots-accent hover:bg-holobots-accent/80 text-black"
          >
            <ShoppingCart className="mr-1 h-3 w-3" />
            Buy
          </Button>
        )}
      </div>
    </div>
  );
};
