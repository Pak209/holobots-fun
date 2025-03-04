
import { useState } from "react";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS, getRank } from "@/types/holobot";
import { Button } from "@/components/ui/button";
import { Coins, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UserHolobot } from "@/types/user";

interface HolobotInfoCardProps {
  holobotKey: string;
  holobot: typeof HOLOBOT_STATS[keyof typeof HOLOBOT_STATS];
  userHolobot: UserHolobot | undefined;
  userTokens: number;
  isMinting: string | null;
  justMinted: string | null;
  onMint: (holobotName: string) => void;
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
  const isOwned = !!userHolobot;
  const isJustMinted = justMinted === holobot.name;
  const level = userHolobot?.level || holobot.level;
  const currentXp = userHolobot?.experience || 0;
  const nextLevelXp = userHolobot?.nextLevelExp || 100;
  
  const calculateProgress = (current: number, total: number) => {
    return Math.min(100, Math.floor((current / total) * 100));
  };
  
  const xpProgress = calculateProgress(currentXp, nextLevelXp);

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${isOwned ? 'bg-holobots-card/90' : 'bg-holobots-card/30'} dark:bg-holobots-dark-card p-4 rounded-lg border border-holobots-border dark:border-holobots-dark-border shadow-neon`}>
      <div className="flex sm:flex-row gap-4 w-full">
        {/* Stats Panel - Reduced width */}
        <div className="flex-1 max-w-[250px] sm:max-w-[220px] bg-black/30 p-3 rounded-lg border border-holobots-accent self-start">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-bold text-holobots-accent">
              {holobot.name}
            </h2>
            {isOwned && !isJustMinted && (
              <div className="px-2 py-0.5 bg-green-500/20 border border-green-500 rounded text-xs">
                OWNED
              </div>
            )}
            {isJustMinted && (
              <div className="px-2 py-0.5 bg-blue-500/20 border border-blue-500 rounded text-xs animate-pulse">
                JUST MINTED
              </div>
            )}
          </div>
          
          {isOwned && (
            <div className="mb-3 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span>Level {level}</span>
                <span>{currentXp}/{nextLevelXp} XP</span>
              </div>
              <Progress value={xpProgress} className="h-1.5" />
              <div className="text-xs text-right text-holobots-accent">
                Rank: {getRank(level)}
              </div>
            </div>
          )}
          
          <div className="space-y-1 font-mono text-sm">
            <p>HP: {holobot.maxHealth}</p>
            <p>Attack: {holobot.attack}</p>
            <p>Defense: {holobot.defense}</p>
            <p>Speed: {holobot.speed}</p>
            <p className="text-holobots-accent text-xs">Special: {holobot.specialMove}</p>
            
            {!isOwned && !isJustMinted && (
              <Button 
                onClick={() => onMint(holobot.name)}
                disabled={isMinting === holobot.name || userTokens < 100}
                className="w-full mt-2 py-1 h-auto text-sm bg-holobots-accent hover:bg-holobots-accent/80 text-black font-semibold"
              >
                {isMinting === holobot.name ? (
                  "Minting..."
                ) : (
                  <>
                    <Plus size={14} className="mr-1" />
                    Mint Holobot
                    <Coins size={14} className="ml-1 mr-0.5" />
                    <span>100</span>
                  </>
                )}
              </Button>
            )}
            
            {isJustMinted && (
              <div className="w-full mt-2 p-1.5 bg-green-500/20 border border-green-500 rounded text-center">
                <span className="text-green-400 text-xs font-semibold">Minting Successful!</span>
              </div>
            )}
          </div>
          
          {/* Attribute Boost Section - Only show for owned holobots */}
          {isOwned && (
            <div className="mt-3 pt-2 border-t border-holobots-border dark:border-holobots-dark-border">
              <h3 className="text-xs font-bold mb-1.5 text-holobots-accent">
                Available Boosts
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                <button className="px-1.5 py-0.5 text-xs bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                  +1 ATK
                </button>
                <button className="px-1.5 py-0.5 text-xs bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                  +1 DEF
                </button>
                <button className="px-1.5 py-0.5 text-xs bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                  +1 SPD
                </button>
                <button className="px-1.5 py-0.5 text-xs bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                  +10 HP
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* TCG Card - Positioned to the right of attributes */}
        <div className="flex-1 flex justify-center items-start">
          <HolobotCard 
            stats={{
              ...holobot,
              level: isOwned ? level : holobot.level,
              experience: isOwned ? currentXp : undefined,
              nextLevelExp: isOwned ? nextLevelXp : undefined,
              name: holobot.name.toUpperCase(),
            }} 
            variant={isOwned ? "blue" : "red"} 
          />
        </div>
      </div>
    </div>
  );
};
