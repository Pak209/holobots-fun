import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { HOLOBOT_STATS } from "@/types/holobot";
import { HolobotCard } from "@/components/HolobotCard";
import { FileCode2, Coins, Shield, Zap, Gift, Trophy, Ticket } from "lucide-react";

export default function Mint() {
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user already has holobots, redirect to dashboard
    if (user?.holobots && Array.isArray(user.holobots) && user.holobots.length > 0) {
      navigate('/dashboard');
    }
    // If user is not logged in, redirect to auth page
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  console.log("Mint page - Current user:", user);

  // Starter holobots available for minting - ensure they exist in HOLOBOT_STATS
  const starterHolobots = ['ace', 'shadow', 'kuma'].filter(key => HOLOBOT_STATS[key]);

  const handleSelectHolobot = (holobotKey: string) => {
    setSelectedHolobot(holobotKey);
  };

  const handleMintHolobot = async () => {
    if (!selectedHolobot) {
      toast({
        title: "Selection Required",
        description: "Please select a Holobot to mint",
        variant: "destructive"
      });
      return;
    }

    if (!HOLOBOT_STATS[selectedHolobot]) {
      toast({
        title: "Invalid Selection",
        description: "The selected Holobot is not available for minting",
        variant: "destructive"
      });
      return;
    }

    setIsMinting(true);
    
    try {
      // Create the user's first holobot
      const baseStats = HOLOBOT_STATS[selectedHolobot];
      
      // Create new holobot object
      const newHolobot = {
        name: baseStats.name,
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        boostedAttributes: {}
      };
      
      console.log("Minting Genesis Holobot with reward package");
      console.log("Current user state before mint:", {
        holobots: user?.holobots?.length || 0,
        gachaTickets: user?.gachaTickets || 0,
        arena_passes: user?.arena_passes || 0
      });
      
      // Ensure we have the current user state
      const currentHolobots = user?.holobots || [];
      const currentInventory = user?.inventory || { common: 0, rare: 0, legendary: 0 };
      
      const updateData = {
        holobots: [...currentHolobots, newHolobot], // Add to existing holobots instead of replacing
        gachaTickets: Math.max((user?.gachaTickets || 0) + 10, 10), // Ensure at least 10 tickets
        arena_passes: Math.max((user?.arena_passes || 0) + 5, 5), // Ensure at least 5 passes
        inventory: {
          ...currentInventory,
          common: (currentInventory.common || 0) + 5 // Add 5 Common Boosters
        }
      };
      
      console.log("Updating user with data:", updateData);
      
      // Single atomic update with all changes
      await updateUser(updateData);
      
      console.log("Genesis mint completed successfully");
      
      toast({
        title: "Genesis Holobot Minted!",
        description: `${baseStats.name} has joined your team! You've received the Genesis reward package to start your Web3 journey.`,
      });
      
      // Navigate to the dashboard after successful minting
      navigate('/dashboard');
    } catch (error) {
      console.error("Error minting holobot:", error);
      toast({
        title: "Minting Error",
        description: "There was an error minting your Holobot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsMinting(false);
    }
  };

  const renderHolobotCard = (holobotKey: string) => {
    // Check if this holobot exists in our stats
    if (!HOLOBOT_STATS[holobotKey]) {
      console.error(`Missing holobot stats for: ${holobotKey}`);
      return null;
    }
    
    const holobot = HOLOBOT_STATS[holobotKey];
    const isSelected = selectedHolobot === holobotKey;
    
    return (
      <div 
        key={holobotKey}
        onClick={() => handleSelectHolobot(holobotKey)}
        className={`
          relative cursor-pointer transition-all duration-300 transform 
          hover:scale-105 ${isSelected ? 'scale-105' : ''}
          bg-black/30 rounded-lg p-4 sm:p-6 border-2
          ${isSelected ? 'border-[#33C3F0]' : 'border-gray-600/30'}
          shadow-[0_0_10px_rgba(51,195,240,0.1)]
          hover:shadow-[0_0_15px_rgba(51,195,240,0.2)]
          overflow-hidden
        `}
      >
        <div className="relative flex flex-col items-center gap-3">
          {/* TCG Card Container - Preserve size on mobile */}
          <div className="flex-shrink-0 relative z-10 w-[150px] sm:w-[180px] mx-auto">
            <HolobotCard 
              stats={{
                ...holobot,
                name: holobot.name.toUpperCase(),
              }} 
              variant="blue" 
            />
          </div>

          {/* Simplified info section - Just combat style and special move with narrow width on mobile */}
          <div className="w-full mt-2 sm:mt-4 space-y-2 sm:space-y-3 text-[#33C3F0] text-xs sm:text-sm max-w-[120px] sm:max-w-full mx-auto">
            <div className="flex items-center justify-between border-b border-[#33C3F0]/30 pb-1 sm:pb-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="text-gray-300 font-medium">Style</span>
              </div>
              <span className="text-[#33C3F0] font-bold">
                {holobotKey === 'ace' ? 'Balanced' : 
                 holobotKey === 'kuma' ? 'Aggressive' : 
                 holobotKey === 'shadow' ? 'Defensive' : 'Standard'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="text-gray-300 font-medium">Special</span>
              </div>
              <span className="text-[#33C3F0] font-bold">{holobot.specialMove}</span>
            </div>

            {holobot.abilityDescription && (
              <div className="text-[10px] sm:text-xs text-gray-400 italic mt-1 sm:mt-2 border-t border-holobots-accent/20 pt-1 sm:pt-2">
                "{holobot.abilityDescription}"
              </div>
            )}
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute -inset-0.5 border-2 border-[#33C3F0] rounded-lg animate-pulse pointer-events-none" />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#33C3F0] mb-2">Choose Your Genesis Holobot</h1>
          <p className="text-white text-sm sm:text-base">
            Welcome to Holobots Web3! Select your Genesis Holobot to begin your blockchain journey.
          </p>
          
          {/* Genesis Reward Package Display */}
          <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-black/30 rounded-lg border border-[#33C3F0]/30 shadow-[0_0_10px_rgba(51,195,240,0.2)]">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-[#33C3F0]" />
              <span className="text-[#33C3F0] font-bold text-sm sm:text-base">Genesis Reward Package</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center justify-center gap-2 p-2 bg-[#1A1F2C]/70 rounded-md border border-gray-600/30">
                <div className="w-3 h-3 bg-gray-400 rounded shadow-sm"></div>
                <span className="text-white font-medium">5 Common Boosters</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-2 bg-[#1A1F2C]/70 rounded-md border border-gray-600/30">
                <Ticket className="w-3 h-3 text-pink-400" />
                <span className="text-white font-medium">10 Gacha Tickets</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-2 bg-[#1A1F2C]/70 rounded-md border border-gray-600/30">
                <Trophy className="w-3 h-3 text-yellow-400" />
                <span className="text-white font-medium">5 Arena Passes</span>
              </div>
            </div>
          </div>
        </div>
        
        {starterHolobots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-8 mb-5 sm:mb-8">
            {starterHolobots.map((holobotKey) => renderHolobotCard(holobotKey))}
          </div>
        ) : (
          <div className="text-center p-6 sm:p-8 bg-red-500/20 rounded-lg mb-6 sm:mb-8">
            <p className="text-red-500">No starter Holobots available. Please contact support.</p>
          </div>
        )}
        
        <div className="flex justify-center">
          <Button
            onClick={handleMintHolobot}
            disabled={!selectedHolobot || isMinting}
            className={`
              bg-[#33C3F0] hover:bg-[#0FA0CE] text-black font-bold py-1.5 sm:py-2 px-6 sm:px-8 text-base sm:text-lg
              ${isMinting ? 'cursor-not-allowed opacity-70' : ''}
              w-[200px] sm:w-auto mx-auto
            `}
            aria-label="Mint Holobot"
          >
            {isMinting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-black dark:border-gray-900 border-t-transparent rounded-full"></div>
                <span>Minting...</span>
              </div>
            ) : (
              <>Mint Your Holobot</>
            )}
          </Button>
        </div>
        
        <div className="mt-6 sm:mt-10 text-center text-white text-xs sm:text-sm max-w-[280px] sm:max-w-full mx-auto">
          <p>You'll be able to unlock additional Holobots and earn HOLOS tokens as you progress through the game!</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <FileCode2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
            <span>Collect blueprints and resources from quests and battles</span>
          </div>
          <div className="flex items-center justify-center mt-3 sm:mt-4 gap-1 sm:gap-2">
            <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
            <span className="text-[10px] sm:text-xs text-gray-300">
              Earn HOLOS tokens in-game which auto-wrap and stake on the blockchain
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
