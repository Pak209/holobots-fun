
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserHolobot } from "@/types/user";
import { HOLOBOT_STATS } from "@/types/holobot";

export interface MintTier {
  level: number;
  piecesRequired: number;
  rankName: string;
}

export const MINT_TIERS: Record<string, MintTier> = {
  common: { level: 1, piecesRequired: 5, rankName: "Common" },
  champion: { level: 11, piecesRequired: 10, rankName: "Champion" },
  rare: { level: 21, piecesRequired: 25, rankName: "Rare" },
  elite: { level: 31, piecesRequired: 50, rankName: "Elite" },
  legendary: { level: 41, piecesRequired: 100, rankName: "Legendary" }
};

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

  // Handle minting a new holobot
  const handleMintHolobot = async (holobotName: string, tier: string = "common") => {
    if (!user) return;
    
    const selectedTier = MINT_TIERS[tier];
    if (!selectedTier) {
      toast({
        title: "Invalid Tier",
        description: "The selected tier is not valid.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if user has enough blueprint pieces
    const blueprintKey = holobotName.toLowerCase();
    const userPieces = user.blueprintPieces?.[blueprintKey] || 0;
    
    if (userPieces < selectedTier.piecesRequired) {
      toast({
        title: "Insufficient Blueprint Pieces",
        description: `You need ${selectedTier.piecesRequired} ${holobotName} blueprint pieces to mint this tier.`,
        variant: "destructive"
      });
      return;
    }
    
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
        level: selectedTier.level,
        experience: 0,
        nextLevelExp: 100,
        boostedAttributes: {}
      };
      
      // Add to user's holobots and deduct tokens and blueprint pieces
      const updatedHolobots = [...user.holobots, newHolobot];
      const updatedHolosTokens = user.holosTokens - 100;
      
      // Update blueprint pieces
      const updatedBlueprintPieces = { ...(user.blueprintPieces || {}) };
      updatedBlueprintPieces[blueprintKey] = userPieces - selectedTier.piecesRequired;
      
      await updateUser({
        holobots: updatedHolobots,
        holosTokens: updatedHolosTokens,
        blueprintPieces: updatedBlueprintPieces
      });
      
      // Set justMinted to display immediate feedback
      setJustMinted(holobotName);
      
      toast({
        title: `${selectedTier.rankName} Holobot Minted!`,
        description: `Level ${selectedTier.level} ${holobotName} has been added to your collection.`,
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
