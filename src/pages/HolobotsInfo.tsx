
import { useState } from "react";
import { NavigationMenu } from "@/components/NavigationMenu";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS, getRank } from "@/types/holobot";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Coins, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserHolobot } from "@/types/user";

const HolobotsInfo = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isMinting, setIsMinting] = useState<string | null>(null);
  
  // Helper function to find user's holobot by name
  const findUserHolobot = (name: string) => {
    return user?.holobots.find(h => h.name.toLowerCase() === name.toLowerCase());
  };
  
  // Calculate XP progress percentage
  const calculateProgress = (current: number, total: number) => {
    return Math.min(100, Math.floor((current / total) * 100));
  };

  // Handle minting a new holobot
  const handleMintHolobot = async (holobotName: string) => {
    if (!user) return;
    
    // Check if user has enough tokens
    if (user.holosTokens < 100) {
      toast({
        title: "Insufficient Holos",
        description: "You need 100 Holos tokens to mint this Holobot.",
        variant: "destructive"
      });
      return;
    }

    setIsMinting(holobotName);
    
    try {
      // Create a new holobot
      const baseStats = HOLOBOT_STATS[holobotName.toLowerCase()];
      const newHolobot: UserHolobot = {
        name: baseStats.name,
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        boostedAttributes: {}
      };
      
      // Add to user's holobots and deduct tokens
      const updatedHolobots = [...user.holobots, newHolobot];
      const updatedHolosTokens = user.holosTokens - 100;
      
      await updateUser({
        holobots: updatedHolobots,
        holosTokens: updatedHolosTokens
      });
      
      toast({
        title: "Holobot Minted!",
        description: `${holobotName} has been added to your collection.`,
      });
    } catch (error) {
      toast({
        title: "Error Minting Holobot",
        description: "An error occurred while minting the holobot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsMinting(null);
    }
  };

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background text-holobots-text dark:text-holobots-dark-text p-4">
      <NavigationMenu />
      
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-center mb-8 text-holobots-accent">
          HOLOBOTS INFO
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(HOLOBOT_STATS).map(([key, holobot]) => {
            const userHolobot = findUserHolobot(holobot.name);
            const isOwned = !!userHolobot;
            const level = userHolobot?.level || holobot.level;
            const currentXp = userHolobot?.experience || 0;
            const nextLevelXp = userHolobot?.nextLevelExp || 100;
            const xpProgress = calculateProgress(currentXp, nextLevelXp);
            
            return (
              <div key={key} className={`flex flex-col md:flex-row gap-4 ${isOwned ? 'bg-holobots-card/90' : 'bg-holobots-card/30'} dark:bg-holobots-dark-card p-4 rounded-lg border border-holobots-border dark:border-holobots-dark-border shadow-neon`}>
                {/* Stats Panel */}
                <div className="flex-1 bg-black/30 p-4 rounded-lg border border-holobots-accent">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-holobots-accent">
                      {holobot.name}
                    </h2>
                    {isOwned && (
                      <div className="px-2 py-1 bg-green-500/20 border border-green-500 rounded text-xs">
                        OWNED
                      </div>
                    )}
                  </div>
                  
                  {isOwned && (
                    <div className="mb-4 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span>Level {level}</span>
                        <span>{currentXp}/{nextLevelXp} XP</span>
                      </div>
                      <Progress value={xpProgress} className="h-2" />
                      <div className="text-xs text-right text-holobots-accent">
                        Rank: {getRank(level)}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 font-mono">
                    <p>HP: {holobot.maxHealth}</p>
                    <p>Attack: {holobot.attack}</p>
                    <p>Defense: {holobot.defense}</p>
                    <p>Speed: {holobot.speed}</p>
                    <p className="text-holobots-accent">Special: {holobot.specialMove}</p>
                    
                    {!isOwned && (
                      <Button 
                        onClick={() => handleMintHolobot(holobot.name)}
                        disabled={isMinting === holobot.name || (user?.holosTokens || 0) < 100}
                        className="w-full mt-4 bg-holobots-accent hover:bg-holobots-accent/80 text-black font-semibold"
                      >
                        {isMinting === holobot.name ? (
                          "Minting..."
                        ) : (
                          <>
                            <Plus size={16} />
                            Mint Holobot
                            <Coins size={16} />
                            <span>100</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {/* Attribute Boost Section - Only show for owned holobots */}
                  {isOwned && (
                    <div className="mt-4 pt-4 border-t border-holobots-border dark:border-holobots-dark-border">
                      <h3 className="text-sm font-bold mb-2 text-holobots-accent">
                        Available Boosts
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="px-2 py-1 text-xs bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                          +1 ATK
                        </button>
                        <button className="px-2 py-1 text-xs bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                          +1 DEF
                        </button>
                        <button className="px-2 py-1 text-xs bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                          +1 SPD
                        </button>
                        <button className="px-2 py-1 text-xs bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent rounded hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover transition-colors">
                          +10 HP
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* TCG Card */}
                <div className="flex-1 flex justify-center items-start">
                  <HolobotCard 
                    stats={{
                      ...holobot,
                      level: isOwned ? level : holobot.level,
                      experience: isOwned ? currentXp : undefined,
                      nextLevelExp: isOwned ? nextLevelXp : undefined,
                    }} 
                    variant={isOwned ? "blue" : "red"} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HolobotsInfo;
