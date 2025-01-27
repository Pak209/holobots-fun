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
        className="bg-cyberpunk-primary hover:bg-cyberpunk-primary/80 text-cyberpunk-dark border-none text-xs shadow-neon"
        size="sm"
        onClick={onStartBattle}
        disabled={isBattleStarted}
      >
        Start Battle
      </Button>
      <Button 
        variant="outline"
        className="bg-cyberpunk-accent hover:bg-cyberpunk-accent/80 text-cyberpunk-dark border-none text-xs shadow-neon-gold"
        size="sm"
        onClick={onHypeUp}
        disabled={!isBattleStarted}
      >
        <Rocket className="w-3 h-3 md:w-4 md:h-4" /> Hype
      </Button>
      <Select onValueChange={(value) => onHack(value as 'attack' | 'speed' | 'heal')} disabled={hackGauge < 100 || !isBattleStarted}>
        <SelectTrigger className="h-9 bg-cyberpunk-secondary hover:bg-cyberpunk-secondary/80 text-cyberpunk-dark border-none text-xs shadow-neon-cyan">
          <Zap className="w-3 h-3 md:w-4 md:h-4" /> Hack
        </SelectTrigger>
        <SelectContent className="bg-cyberpunk-card border-cyberpunk-border">
          <SelectItem value="attack" className="text-cyberpunk-light hover:bg-cyberpunk-dark">Boost Attack</SelectItem>
          <SelectItem value="speed" className="text-cyberpunk-light hover:bg-cyberpunk-dark">Boost Speed</SelectItem>
          <SelectItem value="heal" className="text-cyberpunk-light hover:bg-cyberpunk-dark">Heal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};