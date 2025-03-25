
import { useState } from "react";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS, getRank } from "@/types/holobot";
import { Button } from "@/components/ui/button";
import { Coins, Plus, Crown, Zap, ArrowUpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UserHolobot } from "@/types/user";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface HolobotInfoCardProps {
  holobotKey: string;
  holobot: typeof HOLOBOT_STATS[keyof typeof HOLOBOT_STATS];
  userHolobot: UserHolobot | undefined;
  userTokens: number;
  isMinting: boolean;
  justMinted: boolean;
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
  const level = userHolobot?.level || holobot.level;
  const currentXp = userHolobot?.experience || 0;
  const nextLevelXp = userHolobot?.nextLevelExp || 100;
  const holobotRank = userHolobot?.rank || "Common";
  const attributePoints = userHolobot?.attributePoints || 0;
  
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [showRankSkipDialog, setShowRankSkipDialog] = useState(false);
  
  const calculateProgress = (current: number, total: number) => {
    return Math.min(100, Math.floor((current / total) * 100));
  };
  
  const xpProgress = calculateProgress(currentXp, nextLevelXp);

  // Get background color based on rank
  const getRankColor = (rank: string) => {
    switch(rank) {
      case "Legendary": return "bg-orange-600/20 border-orange-500 text-orange-400";
      case "Elite": return "bg-yellow-600/20 border-yellow-500 text-yellow-400";
      case "Rare": return "bg-purple-600/20 border-purple-500 text-purple-400";
      case "Champion": return "bg-green-600/20 border-green-500 text-green-400";
      case "Common":
      default: return "bg-blue-600/20 border-blue-500 text-blue-400";
    }
  };

  const handleBoostAttribute = async (attribute: 'attack' | 'defense' | 'speed' | 'health') => {
    if (!isOwned || !user) return;
    
    try {
      // Check if user has holobots array
      if (!user.holobots || !Array.isArray(user.holobots)) {
        throw new Error("User holobots data is not available");
      }
      
      // Check if user has attribute points to spend
      const targetHolobot = user.holobots.find(h => h.name.toLowerCase() === holobot.name.toLowerCase());
      if (!targetHolobot || !(targetHolobot.attributePoints && targetHolobot.attributePoints > 0)) {
        toast({
          title: "No Attribute Points",
          description: "You don't have any attribute points to spend.",
          variant: "destructive"
        });
        return;
      }
      
      // Find the holobot to update
      const updatedHolobots = user.holobots.map(h => {
        if (h.name.toLowerCase() === holobot.name.toLowerCase()) {
          // Initialize boostedAttributes if it doesn't exist
          const boostedAttributes = h.boostedAttributes || {};
          
          // Update the specific attribute
          if (attribute === 'health') {
            boostedAttributes.health = (boostedAttributes.health || 0) + 10;
          } else {
            boostedAttributes[attribute] = (boostedAttributes[attribute] || 0) + 1;
          }
          
          return {
            ...h,
            boostedAttributes,
            attributePoints: (h.attributePoints || 0) - 1
          };
        }
        return h;
      });
      
      // Update the user profile
      await updateUser({ holobots: updatedHolobots });
      
      toast({
        title: "Attribute Boosted",
        description: `Increased ${attribute} for ${holobot.name}`,
      });
    } catch (error) {
      console.error("Error boosting attribute:", error);
      toast({
        title: "Error",
        description: "Failed to boost attribute",
        variant: "destructive"
      });
    }
  };

  // Handle Rank Skip for this holobot
  const handleRankSkip = async () => {
    if (!isOwned || !user || (user.rank_skips || 0) <= 0) {
      toast({
        title: "Cannot Use Rank Skip",
        description: user && (user.rank_skips || 0) <= 0 
          ? "You don't have any Rank Skips available" 
          : "Error accessing holobot data",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get current rank
      const currentRank = holobotRank || 'Bronze';
      let newRank = '';
      
      // Determine new rank
      switch (currentRank) {
        case 'Bronze':
          newRank = 'Silver';
          break;
        case 'Silver':
          newRank = 'Gold';
          break;
        case 'Gold':
          newRank = 'Platinum';
          break;
        case 'Platinum':
          newRank = 'Diamond';
          break;
        case 'Diamond':
          newRank = 'Master';
          break;
        case 'Master':
          newRank = 'Grandmaster';
          break;
        case 'Grandmaster':
          newRank = 'Legendary';
          break;
        case 'Legendary':
          toast({
            title: "Maximum Rank",
            description: `${holobot.name} is already at Legendary rank!`,
            variant: "destructive"
          });
          return;
        default:
          newRank = 'Silver';
      }
      
      // Update the holobot with new rank
      const updatedHolobots = user.holobots.map(h => {
        if (h.name.toLowerCase() === holobot.name.toLowerCase()) {
          return {
            ...h,
            rank: newRank
          };
        }
        return h;
      });
      
      // Update user profile
      await updateUser({
        rank_skips: (user.rank_skips || 0) - 1,
        holobots: updatedHolobots
      });
      
      toast({
        title: `Rank Skip Used!`,
        description: `${holobot.name} has advanced to ${newRank} rank!`,
      });
      
      setShowRankSkipDialog(false);
    } catch (error) {
      console.error("Error using rank skip:", error);
      toast({
        title: "Error",
        description: "Failed to apply rank skip",
        variant: "destructive"
      });
    }
  };

  // Check if user has rank skips available
  const hasRankSkips = user && (user.rank_skips || 0) > 0;

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${isOwned ? 'bg-holobots-card/90' : 'bg-holobots-card/30'} dark:bg-holobots-dark-card p-3 sm:p-4 rounded-lg border border-holobots-border dark:border-holobots-dark-border shadow-neon transition-all duration-300`}>
      <div className="flex sm:flex-row gap-3 sm:gap-4 w-full items-stretch">
        {/* Stats Panel - With reduced width on mobile */}
        <div className="flex-none flex flex-col justify-between w-[120px] sm:w-[180px] bg-black/30 p-2 rounded-lg border border-holobots-accent self-start min-h-[320px]">
          <div>
            <div className="flex justify-between items-start mb-1.5">
              <h2 className="text-lg font-bold text-holobots-accent drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] border border-transparent">
                {holobot.name}
              </h2>
              {isOwned && !justMinted && (
                <div className="px-1 py-0.5 bg-green-500/20 border border-green-500 rounded text-[9px]">
                  OWNED
                </div>
              )}
              {justMinted && (
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
                <div className="flex justify-between text-[9px]">
                  <span className="text-right text-holobots-accent">
                    Rank: {getRank(level)}
                  </span>
                  {userHolobot?.rank && (
                    <Badge className={`text-[8px] py-0 px-1 h-4 ${getRankColor(holobotRank)}`}>
                      <Crown className="h-2 w-2 mr-0.5" /> {holobotRank}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-0.5 font-mono text-xs">
              <p>HP: {holobot.maxHealth} {userHolobot?.boostedAttributes?.health ? `+${userHolobot.boostedAttributes.health}` : ''}</p>
              <p>Attack: {holobot.attack} {userHolobot?.boostedAttributes?.attack ? `+${userHolobot.boostedAttributes.attack}` : ''}</p>
              <p>Defense: {holobot.defense} {userHolobot?.boostedAttributes?.defense ? `+${userHolobot.boostedAttributes.defense}` : ''}</p>
              <p>Speed: {holobot.speed} {userHolobot?.boostedAttributes?.speed ? `+${userHolobot.boostedAttributes.speed}` : ''}</p>
              <p className="text-sky-400 text-[10px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Special: {holobot.specialMove}
              </p>
            </div>
          </div>
          
          <div className="mt-1.5 pt-1 border-t border-holobots-border dark:border-holobots-dark-border">
            {!isOwned && !justMinted && (
              <Button 
                onClick={() => onMint(holobot.name)}
                disabled={isMinting || userTokens < 100}
                className="w-full py-0 h-6 text-xs bg-holobots-accent hover:bg-holobots-accent/80 text-black font-semibold"
              >
                {isMinting ? (
                  "Minting..."
                ) : (
                  <>
                    <Plus size={10} className="mr-0.5" />
                    Mint
                    <Coins size={10} className="ml-0.5 mr-0.5" />
                    <span>100</span>
                  </>
                )}
              </Button>
            )}
            
            {justMinted && (
              <div className="w-full p-1 bg-green-500/20 border border-green-500 rounded text-center">
                <span className="text-green-400 text-[9px] font-semibold">Minting Successful!</span>
              </div>
            )}
            
            {/* Attribute Boost Section - Only show for owned holobots with compact layout */}
            {isOwned && (
              <div className="space-y-2">
                <div>
                  <h3 className="text-[9px] font-bold mb-0.5 text-holobots-accent flex items-center justify-between">
                    <span>Available Boosts</span>
                    <Badge variant="outline" className="bg-blue-500/20 border-blue-500 text-blue-400 text-[8px] py-0 px-1 h-4 flex items-center">
                      <Zap className="h-2 w-2 mr-0.5" /> {attributePoints}
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-2 gap-1">
                    <button 
                      className={`px-1 py-0.5 text-[8px] ${attributePoints > 0 ? 'bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover' : 'bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed'} rounded transition-colors`}
                      onClick={() => handleBoostAttribute('attack')}
                      disabled={attributePoints === 0}
                    >
                      +1 ATK
                    </button>
                    <button 
                      className={`px-1 py-0.5 text-[8px] ${attributePoints > 0 ? 'bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover' : 'bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed'} rounded transition-colors`}
                      onClick={() => handleBoostAttribute('defense')}
                      disabled={attributePoints === 0}
                    >
                      +1 DEF
                    </button>
                    <button 
                      className={`px-1 py-0.5 text-[8px] ${attributePoints > 0 ? 'bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover' : 'bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed'} rounded transition-colors`}
                      onClick={() => handleBoostAttribute('speed')}
                      disabled={attributePoints === 0}
                    >
                      +1 SPD
                    </button>
                    <button 
                      className={`px-1 py-0.5 text-[8px] ${attributePoints > 0 ? 'bg-holobots-background dark:bg-holobots-dark-background border border-holobots-accent hover:bg-holobots-hover dark:hover:bg-holobots-dark-hover' : 'bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed'} rounded transition-colors`}
                      onClick={() => handleBoostAttribute('health')}
                      disabled={attributePoints === 0}
                    >
                      +10 HP
                    </button>
                  </div>
                </div>

                {/* Rank Skip Button */}
                <div>
                  <h3 className="text-[9px] font-bold mb-0.5 text-holobots-accent flex items-center justify-between">
                    <span>Rank Skip</span>
                    <Badge variant="outline" className="bg-red-500/20 border-red-500 text-red-400 text-[8px] py-0 px-1 h-4 flex items-center">
                      <ArrowUpCircle className="h-2 w-2 mr-0.5" /> {user?.rank_skips || 0}
                    </Badge>
                  </h3>
                  <button 
                    className={`w-full px-1 py-1 text-[9px] flex items-center justify-center gap-1 ${hasRankSkips ? 'bg-red-900/20 border border-red-500/50 hover:bg-red-800/30 text-red-300' : 'bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed'} rounded transition-colors`}
                    onClick={() => setShowRankSkipDialog(true)}
                    disabled={!hasRankSkips || holobotRank === 'Legendary'}
                  >
                    <ArrowUpCircle className="h-3 w-3" />
                    {holobotRank === 'Legendary' ? 'MAX RANK' : 'SKIP TO NEXT RANK'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* TCG Card - With preserved width on mobile */}
        <div className="flex-1 flex justify-center items-center">
          <div className="transform scale-100 origin-center w-[150px] sm:w-auto">
            <HolobotCard 
              stats={{
                ...holobot,
                level: isOwned ? level : holobot.level,
                experience: isOwned ? currentXp : undefined,
                nextLevelExp: isOwned ? nextLevelXp : undefined,
                name: holobot.name.toUpperCase(),
                // Apply boosted attributes if owned
                attack: holobot.attack + (userHolobot?.boostedAttributes?.attack || 0),
                defense: holobot.defense + (userHolobot?.boostedAttributes?.defense || 0),
                speed: holobot.speed + (userHolobot?.boostedAttributes?.speed || 0),
                maxHealth: holobot.maxHealth + (userHolobot?.boostedAttributes?.health || 0),
              }} 
              variant={isOwned ? "blue" : "red"} 
            />
          </div>
        </div>
      </div>

      {/* Rank Skip Confirmation Dialog */}
      <Dialog open={showRankSkipDialog} onOpenChange={setShowRankSkipDialog}>
        <DialogContent className="bg-gray-900 border-holobots-accent text-white">
          <DialogHeader>
            <DialogTitle>Confirm Rank Skip</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to upgrade {holobot.name}'s rank?
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4 p-4 bg-black/30 rounded-lg border border-holobots-accent/30">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-holobots-accent/50">
                <img 
                  src={`/src/assets/holobots/${holobotKey}.png`}
                  alt={holobot.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold">{holobot.name}</h3>
                <p className="text-xs text-gray-400">Level {level}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-black/30 p-2 rounded-md">
              <div className="flex items-center">
                <Badge className={`mr-2 ${getRankColor(holobotRank)}`}>
                  <Crown className="h-3 w-3 mr-1" /> {holobotRank}
                </Badge>
                <span className="text-white">Current Rank</span>
              </div>
              <ArrowUpCircle className="h-5 w-5 text-red-400 mx-2" />
              <div className="flex items-center">
                <Badge className={`mr-2 ${getRankColor(
                  holobotRank === 'Bronze' ? 'Silver' :
                  holobotRank === 'Silver' ? 'Gold' :
                  holobotRank === 'Gold' ? 'Platinum' :
                  holobotRank === 'Platinum' ? 'Diamond' :
                  holobotRank === 'Diamond' ? 'Master' :
                  holobotRank === 'Master' ? 'Grandmaster' :
                  holobotRank === 'Grandmaster' ? 'Legendary' : 'Legendary'
                )}`}>
                  <Crown className="h-3 w-3 mr-1" /> {
                    holobotRank === 'Bronze' ? 'Silver' :
                    holobotRank === 'Silver' ? 'Gold' :
                    holobotRank === 'Gold' ? 'Platinum' :
                    holobotRank === 'Platinum' ? 'Diamond' :
                    holobotRank === 'Diamond' ? 'Master' :
                    holobotRank === 'Master' ? 'Grandmaster' :
                    holobotRank === 'Grandmaster' ? 'Legendary' : 'Legendary'
                  }
                </Badge>
                <span className="text-white">New Rank</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => setShowRankSkipDialog(false)}
              className="border border-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRankSkip}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Apply Rank Skip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
