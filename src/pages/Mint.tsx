
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { HOLOBOT_STATS } from "@/types/holobot";
import { HolobotCard } from "@/components/HolobotCard";

export default function Mint() {
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user already has holobots, redirect to dashboard
    if (user?.holobots && Array.isArray(user.holobots) && user.holobots.length > 0) {
      navigate('/dashboard');
    }
    // If user is not logged in, redirect to auth page
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  console.log("Mint page - Current user:", user);

  // Starter holobots available for minting
  const starterHolobots = ['alpha', 'beta', 'gamma'];

  const handleSelectHolobot = (holobotKey: string) => {
    setSelectedHolobot(holobotKey);
  };

  const handleMintHolobot = async () => {
    if (!selectedHolobot) {
      toast({
        title: "Selection Required",
        description: "Please select a Holobot to mint",
        variant: "destructive"
      });
      return;
    }

    setIsMinting(true);
    
    try {
      // Create the user's first holobot
      const baseStats = HOLOBOT_STATS[selectedHolobot.toLowerCase()];
      
      // Create new holobot object
      const newHolobot = {
        name: baseStats.name,
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        boostedAttributes: {}
      };
      
      // User gets their first holobot for free and some starter tokens
      await updateUser({
        holobots: [newHolobot],
        holosTokens: 500
      });
      
      toast({
        title: "Holobot Minted!",
        description: `${baseStats.name} has joined your team! You've also received 500 Holos tokens to start your journey.`,
      });
      
      // Navigate to the dashboard after successful minting
      navigate('/dashboard');
    } catch (error) {
      console.error("Error minting holobot:", error);
      toast({
        title: "Minting Error",
        description: "There was an error minting your Holobot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-holobots-accent mb-2">Choose Your First Holobot</h1>
          <p className="text-holobots-text dark:text-holobots-dark-text">
            Welcome to Holobots! Select your starter Holobot to begin your journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {starterHolobots.map((holobotKey) => {
            const holobot = HOLOBOT_STATS[holobotKey];
            const isSelected = selectedHolobot === holobotKey;
            
            return (
              <div 
                key={holobotKey}
                className={`cursor-pointer transition-all transform hover:scale-105 ${
                  isSelected ? 'ring-4 ring-holobots-accent scale-105' : ''
                }`}
                onClick={() => handleSelectHolobot(holobotKey)}
              >
                <div className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg overflow-hidden shadow-lg p-4">
                  <h3 className="text-xl font-bold text-center text-holobots-accent mb-4">
                    {holobot.name}
                  </h3>
                  
                  <div className="flex justify-center mb-4">
                    <HolobotCard 
                      stats={{
                        ...holobot,
                        name: holobot.name.toUpperCase(),
                      }} 
                      variant="blue" 
                    />
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <p>HP: {holobot.maxHealth}</p>
                    <p>Attack: {holobot.attack}</p>
                    <p>Defense: {holobot.defense}</p>
                    <p>Speed: {holobot.speed}</p>
                    <p className="text-sky-400 text-xs my-2">
                      Special: {holobot.specialMove}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={handleMintHolobot}
            disabled={!selectedHolobot || isMinting}
            className="bg-holobots-accent hover:bg-holobots-hover text-black font-bold py-2 px-8 text-lg"
          >
            {isMinting ? "Minting..." : "Mint Your Holobot"}
          </Button>
        </div>
      </div>
    </div>
  );
}
