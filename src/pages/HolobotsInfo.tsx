
import { useAuth } from "@/contexts/auth";
import { HOLOBOT_STATS } from "@/types/holobot";
import { HolobotInfoCard } from "@/components/holobots/HolobotInfoCard";
import { BlueprintSection } from "@/components/holobots/BlueprintSection";
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

  // Apply one-time legendary bonus for Kurai
  useEffect(() => {
    if (user && user.holobots && user.holobots.length > 0) {
      const kurai = user.holobots.find(h => h.name.toLowerCase() === "kurai");
      
      if (kurai && kurai.rank === "Legendary" && !kurai.receivedLegendaryBonus) {
        // Apply one-time 40 attribute point bonus
        const updatedHolobots = user.holobots.map(holobot => {
          if (holobot.name.toLowerCase() === "kurai") {
            return {
              ...holobot,
              attributePoints: (holobot.attributePoints || 0) + 40,
              receivedLegendaryBonus: true
            };
          }
          return holobot;
        });
        
        // Update user profile with new holobots data
        updateUser({ holobots: updatedHolobots })
          .then(() => {
            toast({
              title: "Legendary Bonus Applied!",
              description: "Kurai received 40 attribute points as a Legendary rank bonus.",
            });
          })
          .catch(err => {
            console.error("Failed to apply legendary bonus:", err);
          });
      }
    }
  }, [user, updateUser, toast]);

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background text-holobots-text dark:text-holobots-dark-text p-4">
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-center mb-8 text-holobots-accent">
          HOLOBOTS INFO
        </h1>
        
        <div className="grid grid-cols-1 gap-6">
          {Object.entries(HOLOBOT_STATS).map(([key, holobot]) => {
            const userHolobot = findUserHolobot(holobot.name);
            
            return (
              <div key={key} className="space-y-4">
                <HolobotInfoCard 
                  holobotKey={key}
                  holobot={holobot}
                  userHolobot={userHolobot}
                  userTokens={user?.holosTokens || 0}
                  isMinting={isMinting === holobot.name}
                  justMinted={justMinted === holobot.name}
                  onMint={handleMintHolobot}
                />
                
                {/* Add Blueprint Section */}
                <BlueprintSection 
                  holobotKey={key}
                  holobotName={holobot.name}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HolobotsInfo;
