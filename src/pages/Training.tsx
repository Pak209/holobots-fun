
import { TrainingGrid } from "@/components/TrainingGrid";
import { BattleScene } from "@/components/BattleScene";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
    <div className="px-3 py-4">
      <h1 className="text-center text-2xl font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent mb-4">
        HOLOBOT TRAINING
      </h1>
      
      {battleStarted && battleConfig ? (
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-3"
            onClick={handleEndBattle}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Training
          </Button>
          
          <BattleScene 
            leftHolobot={battleConfig.holobot}
            rightHolobot="kuma"
            isCpuBattle={true}
            cpuLevel={battleConfig.cpuLevel}
            onBattleEnd={handleEndBattle}
          />
        </div>
      ) : (
        <TrainingGrid onBattleStart={(config) => {
          setBattleConfig(config);
          setBattleStarted(true);
        }} />
      )}
    </div>
  );
};

export default Training;
