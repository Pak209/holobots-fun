import { useState } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "./ui/use-toast";
import { HOLOBOT_STATS } from "@/types/holobot";
import { Dumbbell, Swords } from "lucide-react";

const TRAINING_TYPES = {
  light: { cost: 5, boost: 1 },
  heavy: { cost: 10, boost: 2 },
  extreme: { cost: 15, boost: 3 }
};

const CPU_DIFFICULTIES = {
  easy: { cost: 10, level: 1, expReward: 50 },
  medium: { cost: 20, level: 5, expReward: 100 },
  hard: { cost: 30, level: 10, expReward: 200 }
};

interface TrainingGridProps {
  onBattleStart: (config: { holobot: string; difficulty: string; cpuLevel: number }) => void;
}

export const TrainingGrid = ({ onBattleStart }: TrainingGridProps) => {
  const [selectedHolobot, setSelectedHolobot] = useState("");
  const [selectedAttribute, setAttribute] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showBattleTraining, setShowBattleTraining] = useState(false);

  const handleTrain = (type: keyof typeof TRAINING_TYPES) => {
    if (!selectedHolobot) {
      toast({
        title: "Error",
        description: "Please select a Holobot to train",
        variant: "destructive"
      });
      return;
    }
    
    const training = TRAINING_TYPES[type];
    toast({
      title: "Training Complete",
      description: `+${training.boost} ${selectedAttribute} boost applied!`,
    });
  };

  const handleBattleTraining = (difficulty: keyof typeof CPU_DIFFICULTIES) => {
    if (!selectedHolobot) {
      toast({
        title: "Error",
        description: "Please select a Holobot to battle",
        variant: "destructive"
      });
      return;
    }

    const battle = CPU_DIFFICULTIES[difficulty];
    onBattleStart({
      holobot: selectedHolobot,
      difficulty,
      cpuLevel: battle.level
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setShowBattleTraining(false)}
          className={`${!showBattleTraining ? 'bg-holobots-accent text-white' : ''}`}
        >
          <Dumbbell className="mr-2" /> Attribute Training
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowBattleTraining(true)}
          className={`${showBattleTraining ? 'bg-holobots-accent text-white' : ''}`}
        >
          <Swords className="mr-2" /> Battle Training
        </Button>
      </div>

      {!showBattleTraining ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(TRAINING_TYPES).map(([type, config]) => (
            <div 
              key={type} 
              className="glass-morphism p-6 rounded-lg border border-holobots-accent/20 hover:border-holobots-accent/40 transition-all"
            >
              <h2 className="text-xl font-bold text-center mb-4 text-holobots-accent capitalize">{type} Training</h2>
              <p className="text-red-400 text-center mb-2">Cost: {config.cost} Energy</p>
              <p className="text-green-400 text-center mb-4">Boost: +{config.boost} Attribute</p>
              
              <Select onValueChange={setSelectedHolobot}>
                <SelectTrigger className="mb-3 bg-black/20">
                  <SelectValue placeholder="Select Holobot" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HOLOBOT_STATS).map(([key, holobot]) => (
                    <SelectItem key={key} value={key.toLowerCase()}>
                      {holobot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setAttribute}>
                <SelectTrigger className="mb-4 bg-black/20">
                  <SelectValue placeholder="Select Attribute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attack">Attack</SelectItem>
                  <SelectItem value="defense">Defense</SelectItem>
                  <SelectItem value="speed">Speed</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                className="w-full bg-holobots-accent hover:bg-holobots-hover text-white transition-colors"
                onClick={() => handleTrain(type as keyof typeof TRAINING_TYPES)}
              >
                Train
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(CPU_DIFFICULTIES).map(([difficulty, config]) => (
            <div 
              key={difficulty} 
              className="glass-morphism p-6 rounded-lg border border-holobots-accent/20 hover:border-holobots-accent/40 transition-all"
            >
              <h2 className="text-xl font-bold text-center mb-4 text-holobots-accent capitalize">{difficulty} Battle</h2>
              <p className="text-red-400 text-center mb-2">Cost: {config.cost} Energy</p>
              <p className="text-green-400 text-center mb-4">EXP Reward: {config.expReward}</p>
              <p className="text-blue-400 text-center mb-4">CPU Level: {config.level}</p>
              
              <Select onValueChange={setSelectedHolobot}>
                <SelectTrigger className="mb-4 bg-black/20">
                  <SelectValue placeholder="Select Holobot" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HOLOBOT_STATS).map(([key, holobot]) => (
                    <SelectItem key={key} value={key.toLowerCase()}>
                      {holobot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                className="w-full bg-holobots-accent hover:bg-holobots-hover text-white transition-colors"
                onClick={() => handleBattleTraining(difficulty as keyof typeof CPU_DIFFICULTIES)}
              >
                Start Battle Training
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
