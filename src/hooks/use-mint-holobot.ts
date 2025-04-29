
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { UserHolobot } from "@/types/user";
import { HOLOBOT_STATS } from "@/types/holobot";

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
  const handleMintHolobot = async (holobotName: string) => {
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
      const newHolobot: UserHolobot = {
        name: baseStats.name,
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        boostedAttributes: {}
      };
      
      // Add to user's holobots and deduct tokens
      const updatedHolobots = [...user.holobots, newHolobot];
      const updatedHolosTokens = user.holosTokens - 100;
      
      await updateUser({
        holobots: updatedHolobots,
        holosTokens: updatedHolosTokens
      });
      
      // Set justMinted to display immediate feedback
      setJustMinted(holobotName);
      
      toast({
        title: "Holobot Minted!",
        description: `${holobotName} has been added to your collection.`,
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
