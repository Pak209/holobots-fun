
import { getHolobotImagePath } from "@/utils/holobotImageUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BlueprintCardProps {
  holobotName: string;
  tier: number;
  quantity?: number;
  price?: number;
  originalPrice?: number;
  forSale?: boolean;
  onClick?: () => void;
  discounted?: boolean;
}

export const BlueprintCard = ({
  holobotName,
  tier,
  quantity = 0,
  price,
  originalPrice,
  forSale = false,
  onClick,
  discounted = false
}: BlueprintCardProps) => {
  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return "border-blue-500 bg-blue-950/30";
      case 2:
        return "border-purple-500 bg-purple-950/30";
      case 3:
        return "border-yellow-500 bg-yellow-950/30";
      default:
        return "border-gray-500 bg-gray-950/30";
    }
  };
  
  const getTierName = (tier: number) => {
    switch (tier) {
      case 1:
        return "Basic";
      case 2:
        return "Advanced";
      case 3:
        return "Premium";
      default:
        return "Unknown";
    }
  };
  
  return (
    <div className={`rounded-lg border p-4 relative overflow-hidden ${getTierColor(tier)} ${
      discounted ? 'shadow-neon-yellow' : 'hover:shadow-neon hover:border-holobots-accent/50'
    } transition-all`}>
      {/* Sale tag for discounted items */}
      {discounted && (
        <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg font-bold rotate-12 transform translate-x-1 -translate-y-1 shadow-xl">
          SALE!
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-holobots-dark-background overflow-hidden border-2 border-holobots-accent mb-2">
          <img 
            src={getHolobotImagePath(holobotName.toLowerCase())}
            alt={holobotName}
            className="w-full h-full object-contain"
          />
        </div>
        
        <h3 className="font-bold text-white">{holobotName}</h3>
        
        <Badge className="mt-2 mb-1" variant="outline">
          {getTierName(tier)} Blueprint
        </Badge>
        
        {!forSale && quantity > 0 && (
          <span className="text-xs text-holobots-accent">Qty: {quantity}</span>
        )}
        
        {forSale && (
          <div className="mt-2 w-full text-center">
            {discounted && originalPrice ? (
              <>
                <span className="block text-xs text-gray-400 line-through">{originalPrice} HOLOS</span>
                <span className="block text-sm font-semibold text-yellow-400">{price} HOLOS</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-yellow-400">{price} HOLOS</span>
            )}
            
            <Button 
              className="mt-2 w-full text-xs bg-holobots-accent hover:bg-holobots-hover text-black"
              size="sm"
              onClick={onClick}
            >
              Buy Blueprint
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
