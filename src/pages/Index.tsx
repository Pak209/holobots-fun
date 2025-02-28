
import { BattleScene } from "@/components/BattleScene";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Ticket, Gem } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('holos_tokens')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserHolos(profile.holos_tokens || 100);
        }
        
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
      // For the demo, just deduct the entry fee directly
      setUserHolos(prev => prev - entryFee);
      setHasEntryFee(true);
      
      toast({
        title: "Entry Fee Paid",
        description: `${entryFee} Holos tokens deducted. Good luck in the arena!`,
      });
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

      // For the demo, just add rewards directly
      setUserHolos(prev => prev + holosTokens);
      
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
    return <div className="flex justify-center items-center h-[80vh]">Loading...</div>;
  }

  if (!hasEntryFee) {
    return (
      <div className="px-4 py-5">
        <Card className="border border-holobots-border bg-[#1A1F2C]">
          <CardHeader>
            <CardTitle className="text-center text-xl text-white">Arena Entry</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-[#8E9196] mb-2">Entry fee: {entryFee} Holos tokens</p>
            <p className="text-[#8E9196] mb-4">Your balance: {userHolos} Holos</p>
            <Button 
              onClick={payEntryFee}
              disabled={userHolos < entryFee}
              className="w-full bg-holobots-accent hover:bg-holobots-hover text-white"
            >
              Pay Entry Fee
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-2 py-3">
      <div className="mb-4 bg-[#1A1F2C] rounded-lg p-3">
        <div className="text-center mb-2 text-lg font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent">
          ARENA MODE
        </div>
        <div className="flex justify-between items-center mb-2">
          <div className="bg-black/30 px-3 py-1 rounded-lg">
            <span className="text-xs text-[#8E9196]">Round</span>
            <div className="text-md font-bold text-holobots-accent">{currentRound}/{maxRounds}</div>
          </div>
          <div className="bg-black/30 px-3 py-1 rounded-lg">
            <span className="text-xs text-[#8E9196]">Victories</span>
            <div className="text-md font-bold text-green-500">{victories}</div>
          </div>
          <div className="bg-black/30 px-3 py-1 rounded-lg">
            <span className="text-xs text-[#8E9196]">Opponent Level</span>
            <div className="text-md font-bold text-yellow-500">
              {roundOpponents[currentRound as keyof typeof roundOpponents].level}
            </div>
          </div>
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
  );
};

export default Index;
