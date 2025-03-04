
import { useState } from 'react';
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS, getRank, HolobotStats } from "@/types/holobot";
import { Button } from "@/components/ui/button";
import { Coins, ShoppingCart, ChevronUp, ChevronDown } from "lucide-react";
import { UserHolobot } from "@/types/user";
import { Badge } from "@/components/ui/badge";

interface MarketplaceHolobotCardProps {
  holobotKey: string;
  holobotStats: HolobotStats;
  price: number;
  seller: string;
  onBuy?: () => void;
  forSale: boolean;
}

export const MarketplaceHolobotCard = ({
  holobotKey,
  holobotStats,
  price,
  seller,
  onBuy,
  forSale = true,
}: MarketplaceHolobotCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className={`flex flex-col md:flex-row gap-4 bg-holobots-card/90 dark:bg-holobots-dark-card p-4 rounded-lg border ${forSale ? 'border-holobots-accent' : 'border-holobots-border dark:border-holobots-dark-border'} shadow-neon transition-all duration-300 ${isExpanded ? 'md:h-auto' : 'md:h-64 overflow-hidden'}`}>
      {/* TCG Card */}
      <div className="flex-1 flex justify-center items-start">
        <HolobotCard 
          stats={{
            ...holobotStats,
            name: holobotStats.name.toUpperCase(),
          }} 
          variant="blue" 
        />
      </div>
      
      {/* Stats Panel */}
      <div className="flex-1 flex flex-col justify-between bg-black/30 p-4 rounded-lg border border-holobots-border">
        <div>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-holobots-accent">
              {holobotStats.name}
            </h2>
            <Badge className="bg-holobots-accent text-black">
              LEVEL {holobotStats.level}
            </Badge>
          </div>
          
          <div className="text-sm font-semibold text-right mb-2">
            {getRank(holobotStats.level)}
          </div>
          
          <div className="space-y-2 font-mono text-sm">
            <p>HP: {holobotStats.maxHealth}</p>
            <p>Attack: {holobotStats.attack}</p>
            <p>Defense: {holobotStats.defense}</p>
            <p>Speed: {holobotStats.speed}</p>
            <p className="text-holobots-accent">Special: {holobotStats.specialMove}</p>
          </div>
          
          <div className="mt-4 text-sm">
            <p className="text-muted-foreground">Seller: <span className="text-foreground">{seller}</span></p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-holobots-border">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-yellow-400 flex items-center">
              <Coins className="mr-1 h-5 w-5" />
              {price} HOLOS
            </div>
            
            {forSale && (
              <Button 
                onClick={onBuy}
                className="bg-holobots-accent hover:bg-holobots-accent/80 text-black"
              >
                <ShoppingCart className="mr-1 h-4 w-4" />
                Buy Now
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Expand/Collapse Button (Mobile only) */}
      <Button
        variant="ghost"
        className="md:hidden mt-2 text-xs"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-4 w-4 mr-1" /> Show Less
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-1" /> Show More
          </>
        )}
      </Button>
    </div>
  );
};
