import { BattleScene } from "@/components/BattleScene";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Ticket, Gem, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ItemCard } from "@/components/items/ItemCard";
import { ArenaPrebattleMenu } from "@/components/arena/ArenaPrebattleMenu";
import { generateArenaOpponent } from "@/utils/battleUtils";

const Index = () => {
  const [currentRound, setCurrentRound] = useState(1);
  const [victories, setVictories] = useState(0);
  const [hasEntryFee, setHasEntryFee] = useState(false);
  const [selectedHolobot, setSelectedHolobot] = useState("ace"); // Default holobot
  const [currentOpponent, setCurrentOpponent] = useState(generateArenaOpponent(1));
  const maxRounds = 3;
  const entryFee = 50;
  const { toast } = useToast();
  const { user, updateUser } = useAuth();

  // Generate a new opponent when the round changes
  useEffect(() => {
    let newOpponent;
    do {
      newOpponent = generateArenaOpponent(currentRound);
    } while (newOpponent.name === currentOpponent.name);
    
    setCurrentOpponent(newOpponent);
  }, [currentRound, currentOpponent.name]);

  const payEntryFee = async () => {
    try {
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

  const useArenaPass = async () => {
    try {
      if (user && user.arena_passes > 0) {
        await updateUser({
          arena_passes: user.arena_passes - 1
        });
        setHasEntryFee(true);
        
        toast({
          title: "Arena Pass Used",
          description: "You've used 1 Arena Pass. Good luck in the arena!",
        });
      } else {
        toast({
          title: "No Arena Passes",
          description: "You don't have any Arena Passes. Try using HOLOS tokens instead.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error using arena pass:", error);
      toast({
        title: "Error",
        description: "Failed to use Arena Pass. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleHolobotSelect = (holobotKey: string) => {
    console.log("Selected holobot:", holobotKey);
    setSelectedHolobot(holobotKey);
  };

  const handleEntryFeeMethod = async (method: 'tokens' | 'pass') => {
    if (method === 'tokens') {
      await payEntryFee();
    } else {
      await useArenaPass();
    }
  };

  const distributeRewards = async () => {
    try {
      if (!user) return;
      
      const baseReward = 100;
      const holosTokens = victories * baseReward * currentRound;
      const gachaTickets = Math.floor(victories / 2);
      const blueprintPieces = victories * currentRound;
      const arenaPass = Math.random() > 0.7 ? 1 : 0; // 30% chance to get arena pass as reward

      const updates: any = {
        holosTokens: user.holosTokens + holosTokens,
        gachaTickets: user.gachaTickets + gachaTickets
      };
      
      if (arenaPass > 0) {
        updates.arena_passes = (user.arena_passes || 0) + arenaPass;
      }
      
      await updateUser(updates);
      
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
            {arenaPass > 0 && (
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                <span>{arenaPass} Arena Pass</span>
              </div>
            )}
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
        setCurrentOpponent(generateArenaOpponent(1));
      }
    } else {
      setCurrentRound(1);
      setVictories(0);
      setHasEntryFee(false);
      setCurrentOpponent(generateArenaOpponent(1));
    }
  };

  if (!hasEntryFee) {
    return (
      <div className="px-4 py-5">
        <ArenaPrebattleMenu 
          onHolobotSelect={handleHolobotSelect}
          onEntryFeeMethod={handleEntryFeeMethod}
          entryFee={entryFee}
        />
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
              {currentOpponent.level}
            </div>
          </div>
        </div>
      </div>
      
      <BattleScene 
        leftHolobot={selectedHolobot}
        rightHolobot={currentOpponent.name}
        isCpuBattle={true}
        cpuLevel={currentOpponent.level}
        onBattleEnd={handleBattleEnd}
      />
    </div>
  );
};

export default Index;
