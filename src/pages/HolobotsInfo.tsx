import { useAuth } from "@/contexts/auth";
import { HOLOBOT_STATS } from "@/types/holobot";
import { HolobotInfoCard } from "@/components/holobots/HolobotInfoCard";
import { BlueprintSection } from "@/components/holobots/BlueprintSection";
import { LevelUpModal } from "@/components/holobots/LevelUpModal";
import { useMintHolobot } from "@/hooks/use-mint-holobot";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { calculateExperience } from "@/utils/battleUtils";
import { useHolobotPartsStore } from "@/stores/holobotPartsStore";

const HolobotsInfo = () => {
  const { user, updateUser } = useAuth();
  const { isMinting, justMinted, handleMintHolobot } = useMintHolobot();
  const { toast } = useToast();
  const { loadPartsFromUser, loadEquippedPartsFromUser } = useHolobotPartsStore();
  
  // Level-up modal state
  const [levelUpHolobot, setLevelUpHolobot] = useState<{
    name: string;
    level: number;
    availablePoints: number;
    boostedAttributes: any;
  } | null>(null);
  
  // Track which holobots have been processed for level-up to prevent modal reopening
  const processedLevelUpsRef = useRef<Set<string>>(new Set());

  // Load user parts when user data is available
  useEffect(() => {
    if (user?.parts) {
      loadPartsFromUser(user.parts);
    }
    if (user?.equippedParts) {
      loadEquippedPartsFromUser(user.equippedParts);
    }
  }, [user?.parts, user?.equippedParts, loadPartsFromUser, loadEquippedPartsFromUser]);
  
  // Helper function to find user's holobot by name
  const findUserHolobot = (name: string) => {
    return user?.holobots.find(h => h.name.toLowerCase() === name.toLowerCase());
  };

  // Global fix for any inconsistent holobot data
  useEffect(() => {
    if (user && user.holobots && user.holobots.length > 0) {
      let needsUpdate = false;
      let updatedHolobots = [...user.holobots];
      
      // FIX: Ensure all holobots have experience and nextLevelExp fields
      updatedHolobots = updatedHolobots.map(holobot => {
        const currentLevel = holobot.level || 1;
        const currentExp = holobot.experience;
        const nextExp = holobot.nextLevelExp;
        
        // Initialize missing fields
        if (currentExp === undefined || nextExp === undefined) {
          console.log(`[Fix] Initializing experience fields for ${holobot.name}`);
          needsUpdate = true;
          return {
            ...holobot,
            experience: currentExp || 0,
            nextLevelExp: nextExp || calculateExperience(currentLevel + 1),
            level: currentLevel,
            boostedAttributes: holobot.boostedAttributes || {},
            attributePoints: holobot.attributePoints || 0
          };
        }
        
        return holobot;
      });
      
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
      
      // Check for any holobots missing attributePoints property
      updatedHolobots = updatedHolobots.map(holobot => {
        if (holobot.attributePoints === undefined) {
          needsUpdate = true;
          // Add attribute points based on level (1 per level)
          return {
            ...holobot,
            attributePoints: holobot.level || 1,
            boostedAttributes: holobot.boostedAttributes || {}
          };
        }
        
        // Ensure holobot has boostedAttributes property
        if (!holobot.boostedAttributes) {
          needsUpdate = true;
          return {
            ...holobot,
            boostedAttributes: {}
          };
        }
        
        return holobot;
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
  
  // Auto-level-up check: Level up any holobot that has enough EXP
  useEffect(() => {
    if (!user?.holobots || user.holobots.length === 0) {
      console.log('[Auto-Level] No holobots found');
      return;
    }
    
    console.log('[Auto-Level] Checking holobots:', user.holobots.map(h => ({
      name: h.name,
      level: h.level,
      exp: h.experience,
      nextLevelExp: h.nextLevelExp
    })));
    
    let needsLevelUp = false;
    let updatedHolobots = [...user.holobots];
    let leveledUpNames: string[] = [];
    let newLevelUps: string[] = [];
    
    updatedHolobots = updatedHolobots.map(holobot => {
      const currentExp = holobot.experience || 0;
      const currentLevel = holobot.level || 1;
      const requiredExp = holobot.nextLevelExp || calculateExperience(currentLevel + 1);
      
      console.log(`[Auto-Level] ${holobot.name}: ${currentExp}/${requiredExp} (Level ${currentLevel})`);
      
      // Create a unique key for this holobot at this level
      const levelKey = `${holobot.name}-${currentLevel}`;
      
      // Check if holobot needs to level up AND hasn't been processed yet
      if (currentExp >= requiredExp && !processedLevelUpsRef.current.has(levelKey)) {
        console.log(`[Auto-Level] ${holobot.name} NEEDS LEVEL UP! ${currentExp} >= ${requiredExp}`);
        needsLevelUp = true;
        let newLevel = currentLevel;
        let levelsGained = 0;
        
        // Level up until EXP is below next level requirement
        while (currentExp >= calculateExperience(newLevel + 1)) {
          newLevel++;
          levelsGained++;
        }
        
        if (levelsGained > 0) {
          leveledUpNames.push(holobot.name);
          newLevelUps.push(`${holobot.name}-${newLevel}`);
          console.log(`[Level Up] ${holobot.name}: Level ${currentLevel} → ${newLevel} (+${levelsGained} levels)`);
          
          // Mark this level-up as processed
          processedLevelUpsRef.current.add(levelKey);
          
          return {
            ...holobot,
            level: newLevel,
            nextLevelExp: calculateExperience(newLevel + 1),
            attributePoints: (holobot.attributePoints || 0) + levelsGained,
            boostedAttributes: holobot.boostedAttributes || {}
          };
        }
      } else if (currentExp >= requiredExp) {
        console.log(`[Auto-Level] ${holobot.name} already processed for level ${currentLevel}`);
      }
      
      return holobot;
    });
    
    // Update user profile if any holobot leveled up
    if (needsLevelUp && newLevelUps.length > 0) {
      updateUser({ holobots: updatedHolobots })
        .then(() => {
          // Show level-up modal for the first holobot with available points (only if not already showing)
          if (!levelUpHolobot) {
            const holobotWithPoints = updatedHolobots.find(h => (h.attributePoints || 0) > 0);
            if (holobotWithPoints) {
              setLevelUpHolobot({
                name: holobotWithPoints.name,
                level: holobotWithPoints.level,
                availablePoints: holobotWithPoints.attributePoints || 0,
                boostedAttributes: holobotWithPoints.boostedAttributes || {}
              });
            }
          }
          
          toast({
            title: "Level Up!",
            description: `${leveledUpNames.join(', ')} leveled up! Choose stats to upgrade.`,
          });
        })
        .catch(err => {
          console.error("Failed to level up holobot:", err);
        });
    }
  }, [user?.holobots, updateUser, toast, levelUpHolobot]);
  
  // Handle stat upgrade from level-up modal
  const handleStatUpgrade = async (stat: 'attack' | 'defense' | 'speed' | 'health') => {
    if (!levelUpHolobot || !user?.holobots) return;
    
    const updatedHolobots = user.holobots.map(holobot => {
      if (holobot.name === levelUpHolobot.name) {
        const currentBoosts = holobot.boostedAttributes || {};
        const newBoosts = {
          ...currentBoosts,
          [stat]: (currentBoosts[stat] || 0) + 1
        };
        
        return {
          ...holobot,
          attributePoints: Math.max(0, (holobot.attributePoints || 0) - 1),
          boostedAttributes: newBoosts
        };
      }
      return holobot;
    });
    
    await updateUser({ holobots: updatedHolobots });
    
    // Update modal state
    const updatedHolobot = updatedHolobots.find(h => h.name === levelUpHolobot.name);
    if (updatedHolobot) {
      if ((updatedHolobot.attributePoints || 0) > 0) {
        setLevelUpHolobot({
          name: updatedHolobot.name,
          level: updatedHolobot.level,
          availablePoints: updatedHolobot.attributePoints || 0,
          boostedAttributes: updatedHolobot.boostedAttributes || {}
        });
      } else {
        setLevelUpHolobot(null);
      }
    }
    
    toast({
      title: "Stat Upgraded!",
      description: `${levelUpHolobot.name}'s ${stat} increased by +1`,
    });
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-[#F9FAFB] p-4">
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#33C3F0]">
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
      
      {/* Level-Up Modal */}
      {levelUpHolobot && (
        <LevelUpModal
          isOpen={true}
          holobotName={levelUpHolobot.name}
          currentLevel={levelUpHolobot.level}
          availablePoints={levelUpHolobot.availablePoints}
          currentBoosts={levelUpHolobot.boostedAttributes}
          onUpgrade={handleStatUpgrade}
          onClose={() => setLevelUpHolobot(null)}
        />
      )}
    </div>
  );
};

export default HolobotsInfo;
