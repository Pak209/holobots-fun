
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserHolobot } from "@/types/user";
import { HOLOBOT_STATS, BLUEPRINT_TIERS } from "@/types/holobot";

export const useMintHolobot = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isMinting, setIsMinting] = useState<string | null>(null);
  const [justMinted, setJustMinted] = useState<string | null>(null);

  // Clear the justMinted state after a delay
  useEffect(() => {
    if (justMinted) {
      const timer = setTimeout(() => {
        setJustMinted(null);
      }, 3000); // Clear after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [justMinted]);

  // Handle minting a new holobot, optionally with a specific level from blueprint
  const handleMintHolobot = async (holobotName: string, level?: number) => {
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
      const holobotKey = holobotName.toLowerCase();
      
      const newHolobot: UserHolobot = {
        name: baseStats.name,
        level: level || 1, // Use provided level or default to 1
        experience: 0,
        nextLevelExp: level ? Math.floor(100 * Math.pow(level, 2)) : 100, // Scale next level experience
        boostedAttributes: {}
      };
      
      // Calculate blueprint pieces needed if level is provided
      let blueprintPiecesConsumed = 0;
      if (level) {
        // Find which tier this level corresponds to
        const tier = Object.values(BLUEPRINT_TIERS).find(t => t.level === level);
        if (tier) {
          blueprintPiecesConsumed = tier.pieces;
        }
      }
      
      // Add to user's holobots and deduct tokens and blueprint pieces if used
      const updatedHolobots = [...user.holobots, newHolobot];
      const updatedHolosTokens = user.holosTokens - 100;
      
      // Update blueprint pieces if any were used
      let updatedBlueprintPieces = { ...(user.blueprintPieces || {}) };
      if (blueprintPiecesConsumed > 0) {
        updatedBlueprintPieces[holobotKey] = Math.max(0, (updatedBlueprintPieces[holobotKey] || 0) - blueprintPiecesConsumed);
      }
      
      await updateUser({
        holobots: updatedHolobots,
        holosTokens: updatedHolosTokens,
        blueprintPieces: updatedBlueprintPieces
      });
      
      // Set justMinted to display immediate feedback
      setJustMinted(holobotName);
      
      toast({
        title: "Holobot Minted!",
        description: level ? 
          `Level ${level} ${holobotName} has been added to your collection using blueprints.` : 
          `${holobotName} has been added to your collection.`,
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

  return {
    isMinting,
    justMinted,
    handleMintHolobot
  };
};
