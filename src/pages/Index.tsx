
import { BattleScene } from "@/components/BattleScene";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Ticket, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [currentRound, setCurrentRound] = useState(1);
  const [victories, setVictories] = useState(0);
  const [hasEntryFee, setHasEntryFee] = useState(false);
  const maxRounds = 3;
  const entryFee = 50;
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const roundOpponents = {
    1: { name: 'kuma', level: 1, stats: { attack: 1.0, defense: 1.0, speed: 1.0 } },
    2: { name: 'shadow', level: 2, stats: { attack: 1.2, defense: 1.1, speed: 1.2 } },
    3: { name: 'era', level: 3, stats: { attack: 1.3, defense: 1.3, speed: 1.3 } }
  };

  const payEntryFee = async () => {
    try {
      // Use the updateUser method from AuthContext to update the user's tokens
      if (user && user.holosTokens >= entryFee) {
        await updateUser({
          holosTokens: user.holosTokens - entryFee
        });
        setHasEntryFee(true);
        
        toast({
          title: "Entry Fee Paid",
          description: `${entryFee} Holos tokens deducted. Good luck in the arena!`,
        });
      } else {
        toast({
          title: "Insufficient Tokens",
          description: "You don't have enough Holos tokens for the entry fee.",
          variant: "destructive"
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
      if (!user) return;
      
      const baseReward = 100;
      const holosTokens = victories * baseReward * currentRound;
      const gachaTickets = Math.floor(victories / 2);
      const blueprintPieces = victories * currentRound;

      // Update the user's tokens using the AuthContext
      await updateUser({
        holosTokens: user.holosTokens + holosTokens,
        gachaTickets: user.gachaTickets + gachaTickets
      });
      
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

  if (!hasEntryFee) {
    return (
      <div className="px-4 py-5">
        <Card className="border border-holobots-border bg-[#1A1F2C]">
          <CardHeader>
            <CardTitle className="text-center text-xl text-white">Arena Entry</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-[#8E9196] mb-2">Entry fee: {entryFee} Holos tokens</p>
            <p className="text-[#8E9196] mb-4">Your balance: {user?.holosTokens || 0} Holos</p>
            <Button 
              onClick={payEntryFee}
              disabled={!user || user.holosTokens < entryFee}
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
