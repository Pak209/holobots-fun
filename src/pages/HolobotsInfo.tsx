
import { useAuth } from "@/contexts/AuthContext";
import { HOLOBOT_STATS } from "@/types/holobot";
import { HolobotInfoCard } from "@/components/holobots/HolobotInfoCard";
import { BlueprintInventory } from "@/components/holobots/BlueprintInventory";
import { useMintHolobot } from "@/hooks/use-mint-holobot";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const HolobotsInfo = () => {
  const { user, updateUser } = useAuth();
  const { isMinting, justMinted, handleMintHolobot } = useMintHolobot();
  const { toast } = useToast();
  
  // Helper function to find user's holobot by name
  const findUserHolobot = (name: string) => {
    return user?.holobots.find(h => h.name.toLowerCase() === name.toLowerCase());
  };

  // Add test blueprint pieces for the user
  useEffect(() => {
    const addTestBlueprintPieces = async () => {
      if (user && updateUser) {
        // Only add the test pieces if they don't already have any
        const currentPieces = user.blueprintPieces?.ace || 0;
        if (currentPieces < 100) {
          const updatedBlueprintPieces = {
            ...(user.blueprintPieces || {}),
            ace: 100
          };
          
          await updateUser({ blueprintPieces: updatedBlueprintPieces });
          
          toast({
            title: "Blueprint Pieces Added",
            description: "100 Ace blueprint pieces have been added to your inventory for testing.",
          });
        }
      }
    };
    
    addTestBlueprintPieces();
  }, [user?.id]); // Only run once when user is loaded

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background text-holobots-text dark:text-holobots-dark-text p-4">
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-center mb-8 text-holobots-accent">
          HOLOBOTS INFO
        </h1>
        
        {/* Blueprint Inventory Section */}
        <BlueprintInventory />
        
        <div className="grid grid-cols-1 gap-6">
          {Object.entries(HOLOBOT_STATS).map(([key, holobot]) => {
            const userHolobot = findUserHolobot(holobot.name);
            
            return (
              <HolobotInfoCard 
                key={key}
                holobotKey={key}
                holobot={holobot}
                userHolobot={userHolobot}
                userTokens={user?.holosTokens || 0}
                isMinting={isMinting === holobot.name}
                justMinted={justMinted === holobot.name}
                onMint={handleMintHolobot}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HolobotsInfo;
