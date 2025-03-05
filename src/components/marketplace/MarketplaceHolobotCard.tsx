
import { useState } from 'react';
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS, getRank, HolobotStats } from "@/types/holobot";
import { Button } from "@/components/ui/button";
import { Coins, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarketplaceSellerInfo } from "@/components/marketplace/MarketplaceSellerInfo";

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
  return (
    <div className="flex flex-col gap-4 bg-holobots-card/90 dark:bg-holobots-dark-card p-4 rounded-lg border border-holobots-border dark:border-holobots-dark-border shadow-neon transition-all duration-300">
      {/* Main content - now side by side */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Stats Panel */}
        <div className="flex-none flex flex-col justify-between w-full sm:w-[220px] bg-black/30 p-3 rounded-lg border border-holobots-border self-start">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold text-holobots-accent">
                {holobotStats.name}
              </h2>
              <Badge className="text-xs py-0 h-5 bg-holobots-accent text-black">
                LV{holobotStats.level}
              </Badge>
            </div>
            
            <div className="text-xs font-semibold text-right mb-2">
              {getRank(holobotStats.level)}
            </div>
            
            <div className="space-y-1 font-mono text-sm">
              <p>HP: {holobotStats.maxHealth}</p>
              <p>Attack: {holobotStats.attack}</p>
              <p>Defense: {holobotStats.defense}</p>
              <p>Speed: {holobotStats.speed}</p>
              <p className="text-holobots-accent text-xs">Special: {holobotStats.specialMove}</p>
            </div>
          </div>
        </div>
        
        {/* TCG Card - now side by side with stats panel */}
        <div className="flex-1 flex justify-center items-center">
          <HolobotCard 
            stats={{
              ...holobotStats,
              name: holobotStats.name.toUpperCase(),
            }} 
            variant="blue" 
          />
        </div>
      </div>
      
      {/* Seller Info and Buy Button */}
      <MarketplaceSellerInfo 
        seller={seller}
        price={price}
        onBuy={onBuy}
        forSale={forSale}
      />
    </div>
  );
};
