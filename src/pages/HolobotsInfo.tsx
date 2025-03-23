
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

  // Global fix for any inconsistent holobot data
  useEffect(() => {
    if (user && user.holobots && user.holobots.length > 0) {
      let needsUpdate = false;
      let updatedHolobots = [...user.holobots];
      
      // Fix for Kurai level reset issue
      const kurai = user.holobots.find(h => h.name.toLowerCase() === "kurai");
      if (kurai && kurai.level < 41) {
        console.log("Found Kurai with incorrect level:", kurai.level);
        needsUpdate = true;
        
        updatedHolobots = updatedHolobots.map(holobot => {
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
      }
      
      // Check for any holobots missing attributePoints property or valid rank property
      updatedHolobots = updatedHolobots.map(holobot => {
        let modified = false;
        const newHolobot = { ...holobot };
        
        // Fix missing attributePoints
        if (newHolobot.attributePoints === undefined) {
          needsUpdate = true;
          modified = true;
          newHolobot.attributePoints = newHolobot.level || 1;
        }
        
        // Ensure holobot has boostedAttributes property
        if (!newHolobot.boostedAttributes) {
          needsUpdate = true;
          modified = true;
          newHolobot.boostedAttributes = {};
        }
        
        // Fix improper rank values - ensure they match our system
        const validRanks = ["Rookie", "Starter", "Champion", "Rare", "Elite", "Legendary"];
        if (!newHolobot.rank || !validRanks.includes(newHolobot.rank)) {
          needsUpdate = true;
          modified = true;
          
          // Determine correct rank based on level
          const level = newHolobot.level || 1;
          if (level >= 41) newHolobot.rank = "Legendary";
          else if (level >= 31) newHolobot.rank = "Elite";
          else if (level >= 21) newHolobot.rank = "Rare";
          else if (level >= 11) newHolobot.rank = "Champion";
          else if (level >= 2) newHolobot.rank = "Starter";
          else newHolobot.rank = "Rookie";
        }
        
        return modified ? newHolobot : holobot;
      });
      
      // Update user profile with consistent holobot data if needed
      if (needsUpdate) {
        console.log("Updating holobots to ensure consistency:", updatedHolobots);
        updateUser({ holobots: updatedHolobots })
          .then(() => {
            toast({
              title: "Holobots Updated",
              description: "Your holobots data has been synchronized across the game.",
            });
          })
          .catch(err => {
            console.error("Failed to update holobots:", err);
            toast({
              title: "Error",
              description: "Failed to update holobots data. Please try again.",
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
