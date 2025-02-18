
import { useState, useEffect } from "react";
import { NavigationMenu } from "@/components/NavigationMenu";
import { HolobotCard } from "@/components/HolobotCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { HOLOBOT_STATS } from "@/types/holobot";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const STARTER_HOLOBOTS = ['ace', 'kuma', 'shadow'];
const INITIAL_HOLOS = 500;

export default function Mint() {
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [hasMinted, setHasMinted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkMintStatus();
  }, []);

  const checkMintStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('holos_tokens')
        .eq('id', user.id)
        .single();

      if (profile && profile.holos_tokens !== null) {
        setHasMinted(true);
        navigate('/');
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error checking mint status:", error);
      setIsLoading(false);
    }
  };

  const handleMint = async () => {
    if (!selectedHolobot) {
      toast({
        title: "Selection Required",
        description: "Please select a Holobot to mint.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Update profile with initial Holos
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          holos_tokens: INITIAL_HOLOS
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create Holobot entry
      const { error: holobotError } = await supabase
        .from('holobots')
        .insert({
          name: selectedHolobot,
          owner_id: user.id,
          level: 1,
          experience: 0,
          next_level_exp: 100,
          health: HOLOBOT_STATS[selectedHolobot].maxHealth,
          attack: HOLOBOT_STATS[selectedHolobot].attack,
          defense: HOLOBOT_STATS[selectedHolobot].defense,
          speed: HOLOBOT_STATS[selectedHolobot].speed
        });

      if (holobotError) throw holobotError;

      // Save to local storage
      localStorage.setItem('selectedHolobot', selectedHolobot);
      localStorage.setItem('holosTokens', INITIAL_HOLOS.toString());

      toast({
        title: "Mint Successful!",
        description: `You've received your ${selectedHolobot.toUpperCase()} and ${INITIAL_HOLOS} Holos Tokens!`,
      });

      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error("Error minting Holobot:", error);
      toast({
        title: "Mint Failed",
        description: "There was an error minting your Holobot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background">
        <NavigationMenu />
        <div className="container mx-auto p-4 pt-16 text-center">
          Loading...
        </div>
      </div>
    );
  }

  if (hasMinted) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background">
      <NavigationMenu />
      <div className="container mx-auto p-4 pt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-holobots 
            bg-gradient-to-r from-holobots-accent to-holobots-hover 
            bg-clip-text text-transparent">
            Choose Your First Holobot
          </h1>
          <p className="text-holobots-text dark:text-holobots-dark-text">
            Select your starter Holobot and receive {INITIAL_HOLOS} Holos Tokens!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-8">
          {STARTER_HOLOBOTS.map((holobot) => (
            <div
              key={holobot}
              className={`cursor-pointer transition-transform duration-200 transform 
                ${selectedHolobot === holobot ? 'scale-110' : 'hover:scale-105'}`}
              onClick={() => setSelectedHolobot(holobot)}
            >
              <div className={`p-4 rounded-lg ${
                selectedHolobot === holobot 
                  ? 'ring-4 ring-holobots-accent' 
                  : ''
              }`}>
                <HolobotCard 
                  stats={HOLOBOT_STATS[holobot]} 
                  variant={selectedHolobot === holobot ? "blue" : undefined}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={handleMint}
            disabled={!selectedHolobot || isLoading}
            className="bg-holobots-accent hover:bg-holobots-hover text-white px-8 py-4 text-lg"
          >
            {isLoading ? "Minting..." : "Mint Your Holobot"}
          </Button>
        </div>
      </div>
    </div>
  );
}
