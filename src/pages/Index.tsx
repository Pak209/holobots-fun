
import { NavigationMenu } from "@/components/NavigationMenu";
import { BattleScene } from "@/components/BattleScene";
import { HOLOBOT_STATS } from "@/types/holobot";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Ticket, Gem } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [currentRound, setCurrentRound] = useState(1);
  const [victories, setVictories] = useState(0);
  const maxRounds = 3;
  const { toast } = useToast();

  // Define opponents for each round
  const roundOpponents = {
    1: 'kuma',
    2: 'shadow',
    3: 'era'
  };

  const distributeRewards = async () => {
    try {
      // Calculate rewards based on victories
      const holosTokens = victories * 100;
      const gachaTickets = Math.floor(victories / 2); // 1 ticket per 2 victories
      const blueprintPieces = victories; // 1 piece per victory

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // First get current tokens
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('holos_tokens, gacha_tickets')
        .eq('id', user.id)
        .single();

      // Then update with new total
      const { error } = await supabase
        .from('profiles')
        .update({
          holos_tokens: (currentProfile?.holos_tokens || 0) + holosTokens,
          gacha_tickets: (currentProfile?.gacha_tickets || 0) + gachaTickets
        })
        .eq('id', user.id);

      if (error) throw error;

      // Show rewards notification
      toast({
        title: "Arena Rewards!",
        description: (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Gem className="w-4 h-4 text-purple-500" />
              <span>{holosTokens} Holos Tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-yellow-500" />
              <span>{gachaTickets} Gacha Tickets</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-blue-500" />
              <span>{blueprintPieces} Blueprint Pieces</span>
            </div>
          </div>
        ),
        duration: 5000,
      });
    } catch (error) {
      console.error("Error distributing rewards:", error);
      toast({
        title: "Error",
        description: "Failed to distribute rewards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBattleEnd = (result: 'victory' | 'defeat') => {
    if (result === 'victory') {
      setVictories(prev => prev + 1);
      if (currentRound < maxRounds) {
        setCurrentRound(prev => prev + 1);
      } else {
        // All rounds completed, distribute rewards
        distributeRewards();
      }
    }
  };

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background text-holobots-text dark:text-holobots-dark-text">
      <NavigationMenu />
      <div className="container mx-auto p-4 pt-16">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-holobots-card p-2 rounded-lg border border-holobots-border">
              <span className="text-sm font-bold">Round</span>
              <div className="text-2xl font-bold text-holobots-accent">{currentRound}/{maxRounds}</div>
            </div>
            <div className="bg-holobots-card p-2 rounded-lg border border-holobots-border">
              <span className="text-sm font-bold">Victories</span>
              <div className="text-2xl font-bold text-green-500">{victories}</div>
            </div>
          </div>
          <div className="text-xl font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent">
            ARENA MODE
          </div>
        </div>
        
        <BattleScene 
          leftHolobot="ace"
          rightHolobot={roundOpponents[currentRound as keyof typeof roundOpponents]}
          isCpuBattle={true}
          cpuLevel={currentRound}
          onBattleEnd={handleBattleEnd}
        />
      </div>
    </div>
  );
};

export default Index;
