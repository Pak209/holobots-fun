
import { NavigationMenu } from "@/components/NavigationMenu";
import { BattleScene } from "@/components/BattleScene";
import { HOLOBOT_STATS } from "@/types/holobot";
import { useState } from "react";

const Index = () => {
  const [currentRound, setCurrentRound] = useState(1);
  const [victories, setVictories] = useState(0);
  const maxRounds = 3;

  // Define opponents for each round
  const roundOpponents = {
    1: 'kuma',
    2: 'shadow',
    3: 'era'
  };

  const handleBattleEnd = (result: 'victory' | 'defeat') => {
    if (result === 'victory') {
      setVictories(prev => prev + 1);
      if (currentRound < maxRounds) {
        setCurrentRound(prev => prev + 1);
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
