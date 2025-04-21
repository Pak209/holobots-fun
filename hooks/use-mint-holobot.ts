import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { HOLOBOT_STATS } from '@/types/holobot';

export const useMintHolobot = () => {
  const { user, updateUser } = useAuthStore();
  const [isMinting, setIsMinting] = useState<string | null>(null);
  const [justMinted, setJustMinted] = useState<string | null>(null);
  
  const handleMintHolobot = async (holobotName: string) => {
    if (!user) return;
    
    const mintCost = 500; // Cost to mint a holobot
    
    // Check if user has enough tokens
    if ((user.holosTokens || 0) < mintCost) {
      console.error('Not enough tokens to mint holobot');
      return;
    }
    
    // Check if user already owns this holobot
    const alreadyOwned = user.holobots?.some(h => 
      h.name.toLowerCase() === holobotName.toLowerCase()
    );
    
    if (alreadyOwned) {
      console.error('User already owns this holobot');
      return;
    }
    
    try {
      setIsMinting(holobotName);
      
      // Get holobot stats from constants
      const holobotKey = Object.keys(HOLOBOT_STATS).find(key => 
        HOLOBOT_STATS[key].name.toLowerCase() === holobotName.toLowerCase()
      );
      
      if (!holobotKey) {
        throw new Error('Holobot not found');
      }
      
      const holobotStats = HOLOBOT_STATS[holobotKey];
      
      // Create new holobot object
      const newHolobot = {
        id: Date.now().toString(),
        name: holobotStats.name,
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        rank: 'Rookie',
        attributePoints: 0,
        boostedAttributes: {},
        // Add other necessary properties
        energy: 100,
        maxEnergy: 100,
        syncPoints: 0,
        dailySyncQuota: 5000,
        dailySyncUsed: 0,
        hackMeter: 0,
        maxHackMeter: 100,
        attributes: {
          strength: holobotStats.attack,
          agility: holobotStats.speed,
          intelligence: holobotStats.intelligence || 0,
          durability: holobotStats.defense
        },
        stats: holobotStats,
        image: holobotKey === 'ace' 
          ? 'https://i.imgur.com/JGkzwKX.png' 
          : `https://source.unsplash.com/random/200x200?robot-${holobotKey}`,
        streak: {
          type: 'win',
          count: 0
        }
      };
      
      // Update user's holobots and tokens
      const updatedHolobots = [...(user.holobots || []), newHolobot];
      const updatedTokens = (user.holosTokens || 0) - mintCost;
      
      await updateUser({
        holobots: updatedHolobots,
        holosTokens: updatedTokens
      });
      
      setJustMinted(holobotName);
      
      // Reset justMinted after 3 seconds
      setTimeout(() => {
        setJustMinted(null);
      }, 3000);
    } catch (error) {
      console.error('Error minting holobot:', error);
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