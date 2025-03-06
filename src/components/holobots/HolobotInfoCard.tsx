
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
    <div className={`flex flex-col sm:flex-row gap-4 ${isOwned ? 'bg-holobots-card/90' : 'bg-holobots-card/30'} dark:bg-holobots-dark-card p-4 rounded-lg border border-holobots-border dark:border-holobots-dark-border shadow-neon transition-all duration-300`}>
      <div className="flex sm:flex-row gap-4 w-full items-stretch">
        {/* Stats Panel - With increased min-height */}
        <div className="flex-1 flex flex-col justify-between max-w-[180px] sm:max-w-[180px] bg-black/30 p-2 rounded-lg border border-holobots-accent self-start min-h-[320px]">
          <div>
            <div className="flex justify-between items-start mb-1.5">
              <h2 className="text-lg font-bold text-holobots-accent drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] border border-transparent">
                {holobot.name}
              </h2>
              {isOwned && !isJustMinted && (
                <div className="px-1 py-0.5 bg-green-500/20 border border-green-500 rounded text-[9px]">
                  OWNED
                </div>
              )}
              {isJustMinted && (
                <div className="px-1 py-0.5 bg-blue-500/20 border border-blue-500 rounded text-[9px] animate-pulse">
                  NEW
                </div>
              )}
            </div>
            
            {isOwned && (
              <div className="mb-1.5 space-y-0.5">
                <div className="flex justify-between items-center text-xs">
                  <span>LV {level}</span>
                  <span>{currentXp}/{nextLevelXp}</span>
                </div>
                <Progress value={xpProgress} className="h-1" />
                <div className="text-[9px] text-right text-holobots-accent">
                  Rank: {getRank(level)}
                </div>
              </div>
            )}
            
            <div className="space-y-0.5 font-mono text-xs">
              <p>HP: {holobot.maxHealth}</p>
              <p>Attack: {holobot.attack}</p>
              <p>Defense: {holobot.defense}</p>
              <p>Speed: {holobot.speed}</p>
              <p className="text-sky-400 text-[10px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Special: {holobot.specialMove}
              </p>
            </div>
          </div>
          
          <div className="mt-1.5 pt-1 border-t border-holobots-border dark:border-holobots-dark-border">
            {!isOwned && !isJustMinted && (
              <Button 
                onClick={() => onMint(holobot.name)}
                disabled={isMinting === holobot.name || userTokens < 100}
                className="w-full py-0 h-6 text-xs bg-holobots-accent hover:bg-holobots-accent/80 text-black font-semibold"
              >
                {isMinting === holobot.name ? (
                  "Minting..."
                ) : (
                  <>
                    <Plus size={10} className="mr-0.5" />
                    Mint Holobot
                    <Coins size={10} className="ml-0.5 mr-0.5" />
                    <span>100</span>
                  </>
                )}
              </Button>
            )}
            
            {isJustMinted && (
              <div className="w-full p-1 bg-green-500/20 border border-green-500 rounded text-center">
                <span className="text-green-400 text-[9px] font-semibold">Minting Successful!</span>
              </div>
            )}
            
            {/* Attribute Boost Section - Only show for owned holobots with compact layout */}
            {isOwned && (
              <div>
                <h3 className="text-[9px] font-bold mb-0.5 text-holobots-accent">
                  Available Boosts
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  <button className="px-1 py-0.5 text-[8px] bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                    +1 ATK
                  </button>
                  <button className="px-1 py-0.5 text-[8px] bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                    +1 DEF
                  </button>
                  <button className="px-1 py-0.5 text-[8px] bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                    +1 SPD
                  </button>
                  <button className="px-1 py-0.5 text-[8px] bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                    +10 HP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* TCG Card - With wrapper to prevent overflow */}
        <div className="flex-1 flex justify-center items-center overflow-hidden">
          <div className="transform scale-100 origin-center">
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
    </div>
  );
}
