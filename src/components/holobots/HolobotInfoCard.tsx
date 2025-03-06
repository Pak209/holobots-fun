
import { useState } from "react";
import { Shield, Zap } from "lucide-react";
import { HolobotStats } from "@/types/holobot";
import { HolobotCard } from "@/components/HolobotCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface HolobotInfoCardProps {
  holobotKey: string;
  holobot: HolobotStats;
  userHolobot?: any;
  userTokens: number;
  isMinting: boolean;
  justMinted: string | null;
  onMint: (holobotKey: string) => void;
}

export const HolobotInfoCard = ({
  holobotKey,
  holobot,
  userHolobot,
  userTokens,
  isMinting,
  justMinted,
  onMint
}: HolobotInfoCardProps) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasHolobot = !!userHolobot;
  const mintPrice = 1000;
  const canAfford = userTokens >= mintPrice;
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleMint = () => {
    if (hasHolobot) {
      toast({
        title: "Already Owned",
        description: `You already have ${holobot.name} in your collection`,
        variant: "destructive"
      });
      return;
    }
    
    if (!canAfford) {
      toast({
        title: "Insufficient Tokens",
        description: `You need ${mintPrice} Holos tokens to mint this Holobot`,
        variant: "destructive"
      });
      return;
    }
    
    onMint(holobotKey);
  };

  return (
    <div 
      className={`relative overflow-hidden bg-holobots-card dark:bg-holobots-dark-card rounded-lg border-2 ${
        hasHolobot ? 'border-green-500/70' : 'border-holobots-accent/20'
      } shadow-[0_0_10px_rgba(34,211,238,0.1)] transition-all duration-300`}
    >
      <div className="flex flex-col md:flex-row p-3 md:p-4 items-center">
        {/* Card container - fixed width on mobile */}
        <div className="flex-shrink-0 w-[150px] md:w-[180px] mx-auto md:mx-0 mb-3 md:mb-0">
          <HolobotCard 
            stats={{
              ...holobot,
              name: holobot.name.toUpperCase(),
            }} 
            variant={hasHolobot ? "blue" : "red"} 
          />
        </div>
        
        {/* Info section - reduced width on mobile */}
        <div className="flex-1 flex flex-col max-w-full md:ml-4 space-y-2 w-full md:w-auto">
          <div className="text-xl font-bold text-holobots-accent text-center md:text-left mb-1">
            {holobot.name.toUpperCase()}
          </div>
          
          {/* Combat style and special move section - narrower on mobile */}
          <div className="w-full max-w-[200px] md:max-w-none mx-auto md:mx-0 space-y-2 text-holobots-accent">
            <div className="flex items-center justify-between border-b border-holobots-accent/30 pb-1">
              <div className="flex items-center gap-1 md:gap-2">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                <span className="text-gray-300 font-medium text-xs md:text-sm">Combat Style</span>
              </div>
              <span className="text-holobots-accent font-bold text-xs md:text-sm">
                {holobotKey === 'ace' ? 'Balanced' : 
                 holobotKey === 'kuma' ? 'Aggressive' : 
                 holobotKey === 'shadow' ? 'Defensive' : 'Standard'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 md:gap-2">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                <span className="text-gray-300 font-medium text-xs md:text-sm">Special Move</span>
              </div>
              <span className="text-holobots-accent font-bold text-xs md:text-sm">{holobot.specialMove}</span>
            </div>

            {holobot.abilityDescription && (
              <div className="text-xs text-gray-400 italic mt-1 border-t border-holobots-accent/20 pt-1">
                "{holobot.abilityDescription}"
              </div>
            )}
          </div>
        </div>
        
        {/* Mint button section - reduced width on mobile */}
        <div className="mt-3 md:mt-0 md:ml-4 flex-shrink-0 w-[180px] md:w-auto mx-auto">
          {hasHolobot ? (
            <div className="bg-green-900/30 text-green-400 px-4 py-2 rounded text-sm font-medium flex items-center justify-center">
              <span className="mr-1">✓</span> In Collection (Level {userHolobot.level})
            </div>
          ) : (
            <Button
              onClick={handleMint}
              disabled={isMinting || !canAfford || justMinted === holobotKey}
              className={`
                w-full md:w-auto bg-holobots-accent hover:bg-holobots-hover text-black font-bold py-2 px-4
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300
                ${isMinting ? 'animate-pulse' : ''}
              `}
            >
              {isMinting && justMinted === holobotKey ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                  <span>Minting...</span>
                </div>
              ) : justMinted === holobotKey ? (
                <>Minted!</>
              ) : (
                <>Mint for {mintPrice} Tokens</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
