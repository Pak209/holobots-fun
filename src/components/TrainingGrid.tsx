import { useState } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "./ui/use-toast";
import { HOLOBOT_STATS } from "@/types/holobot";

const TRAINING_TYPES = {
  light: { cost: 5, boost: 1 },
  heavy: { cost: 10, boost: 2 },
  extreme: { cost: 15, boost: 3 }
};

export const TrainingGrid = () => {
  const [selectedHolobot, setSelectedHolobot] = useState("");
  const [selectedAttribute, setAttribute] = useState("");

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(TRAINING_TYPES).map(([type, config]) => (
        <div key={type} className="bg-black/20 p-6 rounded-lg border-2 border-retro-accent">
          <h2 className="text-xl font-bold text-center mb-4 text-retro-accent capitalize">{type} Training</h2>
          <p className="text-red-400 text-center mb-2">Cost: {config.cost} Energy</p>
          <p className="text-green-400 text-center mb-4">Boost: +{config.boost} Attribute</p>
          
          <Select onValueChange={setSelectedHolobot}>
            <SelectTrigger className="mb-3">
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
            <SelectTrigger className="mb-4">
              <SelectValue placeholder="Select Attribute" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="attack">Attack</SelectItem>
              <SelectItem value="defense">Defense</SelectItem>
              <SelectItem value="speed">Speed</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            className="w-full bg-retro-accent hover:bg-retro-accent/80"
            onClick={() => handleTrain(type as keyof typeof TRAINING_TYPES)}
          >
            Train
          </Button>
        </div>
      ))}
    </div>
  );
};