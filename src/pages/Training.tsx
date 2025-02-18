
import { NavigationMenu } from "@/components/NavigationMenu";
import { TrainingGrid } from "@/components/TrainingGrid";
import { BattleScene } from "@/components/BattleScene";
import { useState } from "react";

const Training = () => {
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleConfig, setBattleConfig] = useState<{
    holobot: string;
    difficulty: string;
    cpuLevel: number;
  } | null>(null);

  const handleEndBattle = () => {
    setBattleStarted(false);
    setBattleConfig(null);
  };

  return (
    <div className="min-h-screen bg-holobots-background text-white">
      <NavigationMenu />
      <div className="container mx-auto p-4">
        <h1 className="text-center text-4xl font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent my-8">
          HOLOBOT TRAINING
        </h1>
        {battleStarted && battleConfig ? (
          <BattleScene 
            leftHolobot={battleConfig.holobot}
            rightHolobot="kuma"
            isCpuBattle={true}
            cpuLevel={battleConfig.cpuLevel}
            onBattleEnd={handleEndBattle}
          />
        ) : (
          <TrainingGrid onBattleStart={(config) => {
            setBattleConfig(config);
            setBattleStarted(true);
          }} />
        )}
      </div>
    </div>
  );
};

export default Training;
