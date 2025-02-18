import { NavigationMenu } from "@/components/NavigationMenu";
import { BattleScene } from "@/components/BattleScene";
import { HOLOBOT_STATS } from "@/types/holobot";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Ticket, Gem } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [currentRound, setCurrentRound] = useState(1);
  const [victories, setVictories] = useState(0);
  const [userHolos, setUserHolos] = useState(0);
  const [hasEntryFee, setHasEntryFee] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const maxRounds = 3;
  const entryFee = 50;
  const { toast } = useToast();
  const navigate = useNavigate();

  const roundOpponents = {
    1: { name: 'kuma', level: 1, stats: { attack: 1.0, defense: 1.0, speed: 1.0 } },
    2: { name: 'shadow', level: 2, stats: { attack: 1.2, defense: 1.1, speed: 1.2 } },
    3: { name: 'era', level: 3, stats: { attack: 1.3, defense: 1.3, speed: 1.3 } }
  };

  useEffect(() => {
    const fetchUserData = async () => {
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

        if (!profile || profile.holos_tokens === null) {
          navigate('/mint');
          return;
        }

        setUserHolos(profile.holos_tokens);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const payEntryFee = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      if (userHolos < entryFee) {
        toast({
          title: "Insufficient Holos",
          description: `You need ${entryFee} Holos tokens to enter the arena.`,
          variant: "destructive"
        });
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .update({ holos_tokens: userHolos - entryFee })
        .eq('id', user.id)
        .select()
        .single();

      if (data) {
        setUserHolos(data.holos_tokens);
        setHasEntryFee(true);
        toast({
          title: "Entry Fee Paid",
          description: `${entryFee} Holos tokens deducted. Good luck in the arena!`,
        });
      }
    } catch (error) {
      console.error("Error paying entry fee:", error);
      toast({
        title: "Error",
        description: "Failed to process entry fee. Please try again.",
        variant: "destructive"
      });
    }
  };

  const distributeRewards = async () => {
    try {
      const baseReward = 100;
      const holosTokens = victories * baseReward * currentRound;
      const gachaTickets = Math.floor(victories / 2);
      const blueprintPieces = victories * currentRound;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from('profiles')
        .select('holos_tokens')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            holos_tokens: data.holos_tokens + holosTokens,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

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
      }
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
        distributeRewards();
        setCurrentRound(1);
        setVictories(0);
        setHasEntryFee(false);
      }
    } else {
      setCurrentRound(1);
      setVictories(0);
      setHasEntryFee(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!hasEntryFee) {
    return (
      <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background text-holobots-text dark:text-holobots-dark-text">
        <NavigationMenu />
        <div className="container mx-auto p-4 pt-16 flex flex-col items-center justify-center">
          <div className="bg-holobots-card p-6 rounded-lg border border-holobots-border text-center">
            <h2 className="text-2xl font-bold mb-4">Arena Entry</h2>
            <p className="mb-4">Entry fee: {entryFee} Holos tokens</p>
            <p className="mb-4">Your balance: {userHolos} Holos</p>
            <Button 
              onClick={payEntryFee}
              disabled={userHolos < entryFee}
              className="bg-holobots-accent hover:bg-holobots-hover text-white"
            >
              Pay Entry Fee
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="bg-holobots-card p-2 rounded-lg border border-holobots-border">
              <span className="text-sm font-bold">Opponent Level</span>
              <div className="text-2xl font-bold text-yellow-500">
                {roundOpponents[currentRound as keyof typeof roundOpponents].level}
              </div>
            </div>
          </div>
          <div className="text-xl font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent">
            ARENA MODE
          </div>
        </div>
        
        <BattleScene 
          leftHolobot="ace"
          rightHolobot={roundOpponents[currentRound as keyof typeof roundOpponents].name}
          isCpuBattle={true}
          cpuLevel={roundOpponents[currentRound as keyof typeof roundOpponents].level}
          onBattleEnd={handleBattleEnd}
        />
      </div>
    </div>
  );
};

export default Index;
