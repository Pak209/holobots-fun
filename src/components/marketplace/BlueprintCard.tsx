
import { useState } from 'react';
import { getHolobotImagePath } from "@/utils/holobotImageUtils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BlueprintCardProps {
  holobotName: string;
  tier: number;
  quantity?: number;
  price?: number;
  forSale?: boolean;
  onClick?: () => void;
}

export const BlueprintCard = ({ 
  holobotName, 
  tier, 
  quantity = 1,
  price,
  forSale = false,
  onClick 
}: BlueprintCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Normalize holobot name for image path
  const normalizedName = holobotName.toUpperCase();
  const imagePath = getHolobotImagePath(normalizedName);
  
  // Determine background color based on tier
  const getTierColor = () => {
    switch(tier) {
      case 3: return "from-yellow-500 to-yellow-700";
      case 2: return "from-purple-500 to-purple-700";
      case 1:
      default: return "from-blue-500 to-blue-700";
    }
  };

  return (
    <div 
      className={cn(
        "w-32 h-48 relative rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300",
        isHovered ? "scale-105 shadow-xl" : "shadow-md",
        forSale ? "border-2 border-holobots-accent" : "border border-holobots-border"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Blueprint frame with gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getTierColor()} opacity-80`}></div>
      
      {/* Blueprint image */}
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <div className="w-full h-2/3 flex items-center justify-center overflow-hidden">
          <img 
            src={imagePath} 
            alt={`${holobotName} blueprint`} 
            className="w-3/4 h-3/4 object-contain opacity-50 mix-blend-overlay"
          />
        </div>
      </div>
      
      {/* Blueprint info */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm">
        <h3 className="text-xs font-bold text-white truncate">{normalizedName} BLUEPRINT</h3>
        <div className="flex justify-between items-center mt-1">
          <Badge variant="outline" className="text-[10px] bg-black/30 text-white">
            Tier {tier}
          </Badge>
          {quantity > 1 && (
            <span className="text-[10px] text-white">x{quantity}</span>
          )}
        </div>
        
        {forSale && price && (
          <div className="mt-1 text-xs font-bold text-yellow-400 flex items-center justify-end">
            {price} HOLOS
          </div>
        )}
      </div>
      
      {/* Sale indicator */}
      {forSale && (
        <div className="absolute top-1 right-1 bg-holobots-accent text-black text-[8px] px-1 rounded">
          FOR SALE
        </div>
      )}
    </div>
  );
};
