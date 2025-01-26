import { Button } from "./ui/button";
import { Rocket, Zap } from "lucide-react";
import { HolobotStats } from "@/types/holobot";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface BattleControlsProps {
  onStartBattle: () => void;
  onHypeUp: () => void;
  onHack: (type: 'attack' | 'speed' | 'heal') => void;
  isBattleStarted: boolean;
  hackGauge: number;
}

export const BattleControls = ({
  onStartBattle,
  onHypeUp,
  onHack,
  isBattleStarted,
  hackGauge
}: BattleControlsProps) => {
  return (
    <div className="flex gap-1.5">
      <Button 
        variant="outline"
        className="bg-purple-600 hover:bg-purple-700 text-white border-none text-xs"
        size="sm"
        onClick={onStartBattle}
        disabled={isBattleStarted}
      >
        Start Battle
      </Button>
      <Button 
        variant="outline"
        className="bg-yellow-500 hover:bg-yellow-600 text-white border-none text-xs"
        size="sm"
        onClick={onHypeUp}
        disabled={!isBattleStarted}
      >
        <Rocket className="w-3 h-3 md:w-4 md:h-4" /> Hype
      </Button>
      <Select onValueChange={(value) => onHack(value as 'attack' | 'speed' | 'heal')} disabled={hackGauge < 100 || !isBattleStarted}>
        <SelectTrigger className="h-9 bg-red-500 hover:bg-red-600 text-white border-none text-xs">
          <Zap className="w-3 h-3 md:w-4 md:h-4" /> Hack
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="attack">Boost Attack</SelectItem>
          <SelectItem value="speed">Boost Speed</SelectItem>
          <SelectItem value="heal">Heal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};