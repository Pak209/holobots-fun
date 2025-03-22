import { useAuth } from "@/contexts/auth";
import { HOLOBOT_STATS } from "@/types/holobot";
import { HolobotInfoCard } from "@/components/holobots/HolobotInfoCard";
import { BlueprintSection } from "@/components/holobots/BlueprintSection";
import { useMintHolobot } from "@/hooks/use-mint-holobot";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { calculateExperience } from "@/utils/battleUtils";

const HolobotsInfo = () => {
  const { user, updateUser } = useAuth();
  const { isMinting, justMinted, handleMintHolobot } = useMintHolobot();
  const { toast } = useToast();
  
  // Helper function to find user's holobot by name
  const findUserHolobot = (name: string) => {
    return user?.holobots.find(h => h.name.toLowerCase() === name.toLowerCase());
  };

  // Fix for Kurai level reset issue
  useEffect(() => {
    if (user && user.holobots && user.holobots.length > 0) {
      const kurai = user.holobots.find(h => h.name.toLowerCase() === "kurai");
      
      // Check if Kurai exists but is not at the right level
      if (kurai && kurai.level < 41) {
        // Found Kurai with incorrect level - restore to level 41
        const updatedHolobots = user.holobots.map(holobot => {
          if (holobot.name.toLowerCase() === "kurai") {
            // Calculate XP needed for level 41
            const level41XP = calculateExperience(41);
            
            // Preserve attribute boosts if they exist
            const boostedAttributes = holobot.boostedAttributes || {};
            
            return {
              ...holobot,
              level: 41,
              experience: level41XP,
              nextLevelExp: calculateExperience(42),
              rank: "Legendary",
              // Keep the boosted attributes from the current instance
              boostedAttributes,
              // Restore attribute points if they were reset
              attributePoints: Math.max(holobot.attributePoints || 0, 40)
            };
          }
          return holobot;
        });
        
        // Update user profile with restored Kurai data
        updateUser({ holobots: updatedHolobots })
          .then(() => {
            toast({
              title: "Kurai Restored!",
              description: "Kurai has been restored to level 41 Legendary rank.",
            });
          })
          .catch(err => {
            console.error("Failed to restore Kurai:", err);
            toast({
              title: "Error",
              description: "Failed to restore Kurai. Please try again.",
              variant: "destructive"
            });
          });
      }
    }
  }, [user, updateUser, toast]);

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
