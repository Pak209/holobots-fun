import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { HOLOBOT_STATS } from "@/types/holobot";
import { HolobotCard } from "@/components/HolobotCard";
import { Shield, Zap, Gift } from "lucide-react";

export default function Mint() {
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is not logged in, redirect to auth page
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Starter holobots available for selection
  const starterHolobots = ['ace', 'shadow', 'kuma'].filter(key => HOLOBOT_STATS[key]);

  const handleSelectHolobot = (holobotKey: string) => {
    setSelectedHolobot(holobotKey);
  };

  const handleConfirmHolobot = async () => {
    console.log('🎮 Confirm button clicked!');
    console.log('🎯 Selected Holobot:', selectedHolobot);
    
    // Validation checks
    if (!selectedHolobot) {
      console.error('❌ No Holobot selected');
      toast({
        title: "Selection Required",
        description: "Please select a Holobot to continue",
        variant: "destructive"
      });
      return;
    }

    if (!HOLOBOT_STATS[selectedHolobot]) {
      toast({
        title: "Invalid Selection",
        description: "The selected Holobot is not available",
        variant: "destructive"
      });
      return;
    }

    setIsConfirming(true);
    
    try {
      const baseStats = HOLOBOT_STATS[selectedHolobot];
      console.log("Creating in-game Holobot:", baseStats.name);

      toast({
        title: "Creating Your Holobot...",
        description: `Preparing ${baseStats.name} for battle!`,
      });

      // Create the Holobot with in-game data only
      const newHolobot = {
        name: baseStats.name,
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        boostedAttributes: {},
      };
      
      console.log("Saving Holobot to your account");
      
      // Get current user state
      const currentHolobots = user?.holobots || [];
      const currentInventory = user?.inventory || { common: 0, rare: 0, legendary: 0 };
      
      // Update with starter rewards
      const updateData = {
        holobots: [...currentHolobots, newHolobot],
        gachaTickets: Math.max((user?.gachaTickets || 0) + 10, 10),
        arena_passes: Math.max((user?.arena_passes || 0) + 5, 5),
        inventory: {
          ...currentInventory,
          common: (currentInventory.common || 0) + 5
        }
      };
      
      // Save to Firebase/Firestore
      await updateUser(updateData);
      
      console.log("Holobot created successfully");
      
      toast({
        title: "🎉 Holobot Ready!",
        description: `${baseStats.name} has joined your team! Let's battle!`,
      });
      
      // Navigate to the dashboard to start playing
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error("Error creating holobot:", error);
      
      toast({
        title: "Error",
        description: error.message || "There was an error creating your Holobot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConfirming(false);
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
          {/* TCG Card Container */}
          <div className="flex-shrink-0 relative z-10 w-[150px] sm:w-[180px] mx-auto">
            <HolobotCard 
              stats={{
                ...holobot,
                name: holobot.name.toUpperCase(),
              }} 
              variant="blue" 
            />
          </div>

          {/* Combat info section */}
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#33C3F0] mb-3">Choose Your Genesis Holobot</h1>
          <p className="text-white text-base">
            Select your starter Holobot and begin your journey
          </p>
          
          {/* Starter Bonus */}
          <div className="mt-6 p-3 bg-[#33C3F0]/10 rounded-lg border border-[#33C3F0]/30">
            <div className="flex items-center justify-center gap-2 text-sm text-[#33C3F0]">
              <Gift className="w-4 h-4" />
              <span className="font-medium">Includes 5 Boosters + 10 Gacha Tickets + 5 Arena Passes</span>
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
            onClick={handleConfirmHolobot}
            disabled={!selectedHolobot || isConfirming}
            className={`
              bg-[#33C3F0] hover:bg-[#0FA0CE] text-black font-bold py-3 px-8 text-lg
              ${isConfirming ? 'cursor-not-allowed opacity-70' : ''}
              w-[280px] sm:w-auto
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label="Confirm Holobot Selection"
          >
            {isConfirming ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
                <span>Creating...</span>
              </div>
            ) : (
              <>Confirm Holobot</>
            )}
          </Button>
        </div>
        
        <div className="mt-8 text-center text-white text-sm max-w-xl mx-auto px-4">
          <p className="mb-4 text-gray-300">
            Start your adventure with your first Holobot <span className="text-[#33C3F0] font-bold">completely free</span>
          </p>
          
          <div className="space-y-2 text-xs text-gray-400">
            <p>Battle, train, and upgrade your team as you progress</p>
            <p>Unlock more Holobots through quests and battles</p>
          </div>
        </div>
      </div>
    </div>
  );
}
