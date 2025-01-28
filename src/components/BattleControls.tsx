import { Button } from "./ui/button";
import { Rocket, Zap } from "lucide-react";
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
        className="bg-holobots-accent hover:bg-holobots-hover text-white border-none text-xs shadow-neon-blue animate-pulse"
        size="sm"
        onClick={onStartBattle}
        disabled={isBattleStarted}
      >
        Start Battle
      </Button>
      <Button 
        variant="outline"
        className="bg-yellow-400 hover:bg-yellow-500 text-white border-none text-xs shadow-neon"
        size="sm"
        onClick={onHypeUp}
        disabled={!isBattleStarted}
      >
        <Rocket className="w-3 h-3 md:w-4 md:h-4" /> Hype
      </Button>
      <Select onValueChange={(value) => onHack(value as 'attack' | 'speed' | 'heal')} disabled={hackGauge < 100 || !isBattleStarted}>
        <SelectTrigger className="h-9 bg-red-500 hover:bg-red-600 text-white border-none text-xs shadow-neon">
          <Zap className="w-3 h-3 md:w-4 md:h-4" /> Hack ({Math.floor(hackGauge)}%)
        </SelectTrigger>
        <SelectContent className="bg-holobots-card border-holobots-border">
          <SelectItem value="attack" className="text-holobots-text hover:bg-holobots-accent hover:text-white">Boost Attack</SelectItem>
          <SelectItem value="speed" className="text-holobots-text hover:bg-holobots-accent hover:text-white">Boost Speed</SelectItem>
          <SelectItem value="heal" className="text-holobots-text hover:bg-holobots-accent hover:text-white">Heal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};