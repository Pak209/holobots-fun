import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { NavigationMenu } from "@/components/NavigationMenu";
import { supabase } from "@/integrations/supabase/client";

export default function Mint() {
  const [userTokens, setUserTokens] = useState(0);
  const [mintedType, setMintedType] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    // Fetch user's tokens
    const fetchUserTokens = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch from the users table instead of profiles
          const { data, error } = await supabase
            .from('users')
            .select('tokens')
            .eq('wallet_address', user.id)
            .single();

          if (error) {
            console.error("Error fetching tokens:", error);
            return;
          }

          if (data) {
            setUserTokens(data.tokens || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching user tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTokens();
  }, []);

  const handleMint = async (type: string) => {
    try {
      setMinting(true);
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to mint a Holobot",
          variant: "destructive",
        });
        return;
      }
      
      // Update user tokens
      const { error: updateError } = await supabase
        .from('users')
        .update({ tokens: userTokens - 100 })
        .eq('wallet_address', user.id);
      
      if (updateError) {
        console.error("Error updating tokens:", updateError);
        return;
      }
      
      // Add holobot to user's collection
      const { error: holobotError } = await supabase
        .from('holobots')
        .insert({
          name: type,
          owner_id: parseInt(user.id, 36) % 1000000, // Generate a numeric ID from the UUID
          level: 1,
          attributes: {
            attack: Math.floor(Math.random() * 10) + 1,
            defense: Math.floor(Math.random() * 10) + 1,
            speed: Math.floor(Math.random() * 10) + 1,
            health: Math.floor(Math.random() * 10) + 1,
          }
        });
      
      if (holobotError) {
        console.error("Error creating holobot:", holobotError);
        return;
      }
      
      // Update UI
      setUserTokens(prev => prev - 100);
      setMintedType(type);
      
      toast({
        title: "Holobot Minted!",
        description: `Your ${type} Holobot has been minted successfully.`,
      });
      
      // Show success animation
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error("Error minting holobot:", error);
      toast({
        title: "Error",
        description: "There was an error minting your Holobot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background">
      <NavigationMenu />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center text-holobots-text dark:text-holobots-dark-text mb-8">
          Mint Your First Holobot
        </h1>

        {loading ? (
          <p className="text-center text-holobots-text dark:text-holobots-dark-text">
            Loading...
          </p>
        ) : (
          <>
            <div className="flex justify-center items-center mb-4">
              <p className="text-holobots-text dark:text-holobots-dark-text mr-2">
                Your Holos Tokens:
              </p>
              <div className="bg-holobots-card dark:bg-holobots-dark-card p-2 rounded-lg shadow-neon-border">
                <span className="text-holobots-accent">{userTokens}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {["Ace", "Kuma", "Shadow"].map((type) => (
                <div
                  key={type}
                  className="bg-holobots-card dark:bg-holobots-dark-card p-4 rounded-lg border border-holobots-border dark:border-holobots-dark-border shadow-neon-border"
                >
                  <h2 className="text-xl font-semibold text-holobots-text dark:text-holobots-dark-text mb-2">
                    {type}
                  </h2>
                  <p className="text-holobots-text/80 dark:text-holobots-dark-text/80 mb-4">
                    Mint a {type} Holobot for 100 Holos Tokens.
                  </p>
                  <Button
                    onClick={() => handleMint(type)}
                    disabled={userTokens < 100 || minting}
                    className="w-full bg-holobots-accent hover:bg-holobots-hover text-white"
                  >
                    {minting ? "Minting..." : "Mint Holobot"}
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        {showAnimation && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-50">
            <div className="bg-holobots-card dark:bg-holobots-dark-card p-8 rounded-lg shadow-lg text-center">
              <Sparkles className="mx-auto h-12 w-12 text-green-500 mb-4 animate-ping" />
              <h2 className="text-2xl font-bold text-holobots-text dark:text-holobots-dark-text mb-2">
                Minting Successful!
              </h2>
              <p className="text-holobots-text/80 dark:text-holobots-dark-text/80">
                Your {mintedType} Holobot has been successfully minted.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
