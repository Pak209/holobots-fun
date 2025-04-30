
import { HolobotCard } from "@/components/HolobotCard";
import { getRank, HolobotStats } from "@/types/holobot";
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
  holobotStats,
  price,
  seller,
  onBuy,
  forSale = true,
}: MarketplaceHolobotCardProps) => {
  return (
    <div className="flex flex-col gap-4 bg-holobots-card/90 dark:bg-holobots-dark-card p-4 rounded-lg border border-holobots-border dark:border-holobots-dark-border shadow-neon transition-all duration-300">
      {/* Main content - side by side layout for both mobile and desktop */}
      <div className="flex flex-row gap-4 w-full">
        {/* Stats Panel */}
        <div className="flex-1 flex flex-col justify-between bg-black/30 p-3 rounded-lg border border-holobots-border h-full">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold text-holobots-accent drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] text-shadow">
                {holobotStats.name}
              </h2>
              <Badge className="text-xs py-0 h-5 bg-holobots-accent text-black">
                LV{holobotStats.level || 1}
              </Badge>
            </div>
            
            <div className="text-xs font-semibold text-right mb-2">
              {getRank(holobotStats.level || 1)}
            </div>
            
            <div className="space-y-1 font-mono text-sm">
              <p>HP: {holobotStats.maxHealth || 0}</p>
              <p>Attack: {holobotStats.attack || 0}</p>
              <p>Defense: {holobotStats.defense || 0}</p>
              <p>Speed: {holobotStats.speed || 0}</p>
              <p className="text-holobots-accent text-xs drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] text-shadow">Special: {holobotStats.specialMove}</p>
            </div>
          </div>
        </div>
        
        {/* TCG Card - side by side with stats panel */}
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
